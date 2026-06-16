"""Authentication routes."""
import os
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from app.database import get_db
from app.models.schemas import UserCreate, UserLogin, Token, UserResponse, RegisterResponse
from app.utils.auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter()


@router.post("/register", response_model=RegisterResponse)
async def register(user: UserCreate):
    db = get_db()
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    admin_email = os.getenv("ADMIN_EMAIL", "").strip().lower()
    is_admin = bool(admin_email) and user.email.strip().lower() == admin_email

    user_doc = {
        "email": user.email,
        "password": hash_password(user.password),
        "company_name": user.company_name,
        "full_name": user.full_name,
        "company_phone": user.company_phone,
        "company_address": user.company_address,
        "status": "active" if is_admin else "pending",
        "role": "admin" if is_admin else "user",
        "created_at": datetime.utcnow(),
    }
    result = await db.users.insert_one(user_doc)

    if is_admin:
        token = create_access_token({"sub": str(result.inserted_id)})
        return {
            "message": "Admin account created and activated.",
            "email": user.email,
            "access_token": token,
            "is_admin": True,
        }

    return {
        "message": "Account created. Your account is pending approval from the administrator. You will be able to log in once approved.",
        "email": user.email,
        "access_token": None,
        "is_admin": False,
    }


@router.post("/login", response_model=Token)
async def login(user: UserLogin):
    db = get_db()
    db_user = await db.users.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    status = db_user.get("status", "active")
    if status == "pending":
        raise HTTPException(
            status_code=403,
            detail="Your account is pending admin approval. You will be notified once access is granted.",
        )
    if status == "inactive":
        raise HTTPException(
            status_code=403,
            detail="Your account has been deactivated. Please contact info@chainscopeai.co.uk for assistance.",
        )

    token = create_access_token({"sub": str(db_user["_id"])})
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
async def get_me(user_id: str = Depends(get_current_user)):
    db = get_db()
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "company_name": user.get("company_name", ""),
        "full_name": user.get("full_name", ""),
        "status": user.get("status", "active"),
        "role": user.get("role", "user"),
    }
