import os
import uuid
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Optional

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse

from app.auth import get_current_user, verify_passcode
from app.database import Book, create_tables, get_db

load_dotenv()

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    yield


app = FastAPI(title="Booklist API", lifespan=lifespan)
app.state.limiter = limiter

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": "Rate limit exceeded. Try again later."},
    )


# --------------- Pydantic schemas ---------------


class PasscodeRequest(BaseModel):
    passcode: str


class TokenResponse(BaseModel):
    token: str


class BookCreate(BaseModel):
    title: str
    author: Optional[str] = None
    cover_url: Optional[str] = None
    ol_key: Optional[str] = None


class BookResponse(BaseModel):
    id: uuid.UUID
    title: str
    author: Optional[str] = None
    cover_url: Optional[str] = None
    ol_key: Optional[str] = None
    added_at: datetime

    model_config = {"from_attributes": True}


# --------------- Endpoints ---------------


@app.post("/api/verify", response_model=TokenResponse)
@limiter.limit("10/minute")
def verify(request: Request, body: PasscodeRequest):
    token = verify_passcode(body.passcode)
    return TokenResponse(token=token)


@app.get("/api/books", response_model=list[BookResponse])
def list_books(db: Session = Depends(get_db)):
    books = db.query(Book).order_by(Book.added_at.desc()).all()
    return books


@app.post("/api/books", response_model=BookResponse, status_code=201)
def add_book(
    body: BookCreate,
    db: Session = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    book = Book(
        title=body.title,
        author=body.author,
        cover_url=body.cover_url,
        ol_key=body.ol_key,
    )
    db.add(book)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Book with this ol_key already exists")
    db.refresh(book)
    return book


@app.delete("/api/books/{book_id}", status_code=204)
def delete_book(
    book_id: uuid.UUID,
    db: Session = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    db.delete(book)
    db.commit()
