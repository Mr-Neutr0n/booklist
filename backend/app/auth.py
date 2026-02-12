import os
from datetime import datetime, timedelta, timezone

import jwt
from dotenv import load_dotenv
from fastapi import Header, HTTPException

load_dotenv()

BOOKLIST_PASSCODE = os.getenv("BOOKLIST_PASSCODE")
JWT_SECRET = os.getenv("JWT_SECRET")
ALGORITHM = "HS256"
TOKEN_EXPIRY_HOURS = 24


def verify_passcode(passcode: str) -> str:
    """Check passcode against env var and return a signed JWT token."""
    if passcode != BOOKLIST_PASSCODE:
        raise HTTPException(status_code=401, detail="Invalid passcode")

    payload = {
        "sub": "booklist_user",
        "exp": datetime.now(timezone.utc) + timedelta(hours=TOKEN_EXPIRY_HOURS),
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=ALGORITHM)
    return token


def get_current_user(authorization: str = Header(...)):
    """FastAPI dependency that validates a JWT Bearer token."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.removeprefix("Bearer ")

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
