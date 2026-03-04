import os
import shutil
import tempfile

import amulet
from fastapi import FastAPI, Form, HTTPException, Request, UploadFile
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

from formatter import format_for_llm
from llm_client import analyze_redstone
from world_handler import extract_world, flood_fill_redstone

app = FastAPI(title="RedstoneAI")
templates = Jinja2Templates(directory="templates")

_DIMENSION_MAP = {
    "overworld": "minecraft:overworld",
    "nether": "minecraft:the_nether",
    "end": "minecraft:the_end",
}


@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/analyze")
async def analyze(
    world_zip: UploadFile,
    x: int = Form(...),
    y: int = Form(...),
    z: int = Form(...),
    dimension: str = Form("overworld"),
    user_context: str = Form(""),
):
    dimension_key = _DIMENSION_MAP.get(dimension)
    if dimension_key is None:
        raise HTTPException(status_code=400, detail=f"Unknown dimension: {dimension!r}")

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

        formatted = format_for_llm(blocks, user_context, dimension_key, x, y, z)
        analysis = analyze_redstone(formatted)

        return {"status": "ok", "blocks_found": len(blocks), "analysis": analysis}

    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)
