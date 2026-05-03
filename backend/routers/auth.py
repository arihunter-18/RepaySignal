from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter()


class RegisterBody(BaseModel):
    name: str
    email: str
    password: str
    role: str
    student_id: Optional[str] = None


class LoginBody(BaseModel):
    email: str
    password: str
    role: str


@router.post("/register")
def register(body: RegisterBody):
    # Bypass authentication - accept any credentials
    return {
        "token": "bypass",
        "user": {
            "id": "1",
            "name": body.name or "User",
            "email": body.email or "user@example.com",
            "role": body.role,
            "student_id": body.student_id,
        },
    }


@router.post("/login")
def login(body: LoginBody):
    # Bypass authentication - accept any credentials
    return {
        "token": "bypass",
        "user": {
            "id": "1",
            "name": body.email.split("@")[0] or "User",
            "email": body.email,
            "role": body.role,
            "student_id": None,
        },
    }


@router.get("/me")
def me():
    # Bypass - return dummy user
    return {
        "id": "1",
        "name": "User",
        "email": "user@example.com",
        "role": "admin",
        "student_id": None,
    }


@router.post("/logout")
def logout():
    return {"message": "Logged out successfully"}