import logging
import os
import shutil
import tempfile
from datetime import datetime
from decimal import Decimal

from dotenv import load_dotenv
load_dotenv()

import amulet
from fastapi import Depends, FastAPI, Form, HTTPException, Request, UploadFile
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session

from auth import get_current_user
from db.database import get_db
from db.models import ApiUsage, PlanType, SubscriptionStatus, User
from formatter import format_for_llm
from llm_client import analyze_redstone
from world_handler import extract_world, flood_fill_redstone

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger("redstoneai.app")

app = FastAPI(title="RedstoneAI")
templates = Jinja2Templates(directory="templates")

FREE_MONTHLY_LIMIT = 20

_DIMENSION_MAP = {
    "overworld": "minecraft:overworld",
    "nether": "minecraft:the_nether",
    "end": "minecraft:the_end",
}


@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/me/usage")
def get_usage(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    period_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    usage = db.query(ApiUsage).filter(
        ApiUsage.user_id == current_user.id,
        ApiUsage.period_start == period_start,
    ).first()
    count = usage.call_count if usage else 0
    log.info("usage_check call_count=%d", count)
    return {"call_count": count}


@app.post("/analyze")
async def analyze(
    world_zip: UploadFile,
    x: int = Form(...),
    y: int = Form(...),
    z: int = Form(...),
    dimension: str = Form("overworld"),
    user_context: str = Form(""),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    dimension_key = _DIMENSION_MAP.get(dimension)
    if dimension_key is None:
        raise HTTPException(status_code=400, detail=f"Unknown dimension: {dimension!r}")

    log.info("analyze_start coords=(%d,%d,%d) dimension=%s", x, y, z, dimension)

    # Enforce monthly limit for free users
    sub = current_user.subscription
    is_pro = (
        sub is not None
        and sub.plan == PlanType.premium
        and sub.status == SubscriptionStatus.active
    )
    log.info("plan_check is_pro=%s", is_pro)
    if not is_pro:
        period_start_check = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        current_usage = db.query(ApiUsage).filter(
            ApiUsage.user_id == current_user.id,
            ApiUsage.period_start == period_start_check,
        ).first()
        current_count = current_usage.call_count if current_usage else 0
        log.info("limit_check call_count=%d limit=%d", current_count, FREE_MONTHLY_LIMIT)
        if current_count >= FREE_MONTHLY_LIMIT:
            log.warning("limit_exceeded call_count=%d", current_count)
            raise HTTPException(
                status_code=429,
                detail=f"Monthly limit of {FREE_MONTHLY_LIMIT} analyses reached. Upgrade to Pro for unlimited access.",
            )

    tmp_dir = tempfile.mkdtemp(prefix="redstoneai_")
    try:
        # Save upload
        zip_path = os.path.join(tmp_dir, "world.zip")
        content = await world_zip.read()
        with open(zip_path, "wb") as f:
            f.write(content)

        # Extract world
        try:
            world_root = extract_world(zip_path, os.path.join(tmp_dir, "world"))
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

        # Load level and flood-fill
        level = amulet.load_level(world_root)
        try:
            blocks = flood_fill_redstone(level, dimension_key, x, y, z)
        finally:
            level.close()

        if not blocks:
            raise HTTPException(
                status_code=400,
                detail=f"No redstone block found at ({x},{y},{z}) in {dimension}, "
                "or the block is not a recognized redstone component.",
            )

        log.info("flood_fill_done blocks_found=%d", len(blocks))

        formatted = format_for_llm(blocks, user_context, dimension_key, x, y, z)
        log.info("llm_request_start")
        analysis, input_tokens, output_tokens = analyze_redstone(formatted)

        # Claude Haiku 4.5 pricing: $0.80/M input, $4.00/M output
        cost = Decimal(str((input_tokens * 0.80 + output_tokens * 4.00) / 1_000_000))
        log.info("llm_request_done input_tokens=%d output_tokens=%d cost_usd=%.6f", input_tokens, output_tokens, cost)

        period_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        usage = db.query(ApiUsage).filter(
            ApiUsage.user_id == current_user.id,
            ApiUsage.period_start == period_start,
        ).first()
        if usage:
            usage.call_count += 1
            usage.input_tokens += input_tokens
            usage.output_tokens += output_tokens
            usage.cost_usd += cost
        else:
            usage = ApiUsage(
                user_id=current_user.id,
                period_start=period_start,
                call_count=1,
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                cost_usd=cost,
            )
            db.add(usage)
        db.commit()
        log.info("analyze_complete call_count=%d", usage.call_count)

        return {"status": "ok", "blocks_found": len(blocks), "analysis": analysis, "call_count": usage.call_count}

    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)
