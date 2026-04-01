import os
from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from clerk_backend_api import Clerk, AuthenticateRequestOptions

from db.database import get_db
from db.models import User

_clerk = Clerk(bearer_auth=os.environ["CLERK_SECRET_KEY"])


def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
) -> User:
    state = _clerk.authenticate_request(
        request,
        AuthenticateRequestOptions(authorized_parties=["http://localhost:5173"]),
    )

    if not state.is_signed_in:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    clerk_user_id = state.payload.get("sub")
    if not clerk_user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token claims")

    user = db.query(User).filter(User.clerk_user_id == clerk_user_id).first()
    if not user:
        clerk_user = _clerk.users.get(user_id=clerk_user_id)
        primary_email = next(
            (e.email_address for e in (clerk_user.email_addresses or []) if e.id == clerk_user.primary_email_address_id),
            None,
        )
        user = User(
            clerk_user_id=clerk_user_id,
            email=primary_email or "",
            name=f"{clerk_user.first_name or ''} {clerk_user.last_name or ''}".strip() or None,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return user
