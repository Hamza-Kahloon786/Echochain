"""Authentication routes."""
from fastapi import APIRouter, HTTPException
from app.database import get_db
from app.models.schemas import UserCreate, UserLogin, Token, UserResponse
from app.utils.auth import hash_password, verify_password, create_access_token

router = APIRouter()


@router.post("/register", response_model=Token)
async def register(user: UserCreate):
    db = get_db()
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_doc = {
        "email": user.email,
        "password": hash_password(user.password),
        "company_name": user.company_name,
    }
    result = await db.users.insert_one(user_doc)
    token = create_access_token({"sub": str(result.inserted_id)})
    return {"access_token": token, "token_type": "bearer"}


@router.post("/login", response_model=Token)
async def login(user: UserLogin):
    db = get_db()
    db_user = await db.users.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": str(db_user["_id"])})
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
async def get_me(user_id: str = None):
    from app.utils.auth import get_current_user
    from fastapi import Depends
    db = get_db()
    from bson import ObjectId
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"id": str(user["_id"]), "email": user["email"], "company_name": user["company_name"]}
