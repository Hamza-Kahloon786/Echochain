"""Admin routes — user management and platform stats."""
from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from typing import List
from app.database import get_db
from app.models.schemas import AdminUserResponse, AdminStats, UserStatusUpdate, UserRoleUpdate
from app.utils.auth import get_current_admin

router = APIRouter()


def _fmt_user(u: dict) -> dict:
    return {
        "id": str(u["_id"]),
        "email": u.get("email", ""),
        "full_name": u.get("full_name", ""),
        "company_name": u.get("company_name", ""),
        "company_phone": u.get("company_phone", ""),
        "company_address": u.get("company_address", ""),
        "status": u.get("status", "active"),
        "role": u.get("role", "user"),
        "created_at": u.get("created_at"),
    }


@router.get("/stats", response_model=AdminStats)
async def get_stats(_: str = Depends(get_current_admin)):
    db = get_db()
    total    = await db.users.count_documents({})
    pending  = await db.users.count_documents({"status": "pending"})
    active   = await db.users.count_documents({"status": "active"})
    inactive = await db.users.count_documents({"status": "inactive"})
    admins   = await db.users.count_documents({"role": "admin"})
    return {
        "total_users": total,
        "pending_users": pending,
        "active_users": active,
        "inactive_users": inactive,
        "admin_users": admins,
    }


@router.get("/users", response_model=List[AdminUserResponse])
async def list_users(_: str = Depends(get_current_admin)):
    db = get_db()
    users = await db.users.find({}).sort("created_at", -1).to_list(length=1000)
    return [_fmt_user(u) for u in users]


@router.get("/users/{user_id}", response_model=AdminUserResponse)
async def get_user(user_id: str, _: str = Depends(get_current_admin)):
    db = get_db()
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return _fmt_user(user)


@router.patch("/users/{user_id}/status")
async def update_user_status(user_id: str, body: UserStatusUpdate, admin_id: str = Depends(get_current_admin)):
    if body.status not in ("active", "inactive", "pending"):
        raise HTTPException(status_code=400, detail="Status must be active, inactive, or pending")
    if user_id == admin_id:
        raise HTTPException(status_code=400, detail="You cannot change your own status")
    db = get_db()
    result = await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"status": body.status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": f"User status updated to {body.status}"}


@router.patch("/users/{user_id}/role")
async def update_user_role(user_id: str, body: UserRoleUpdate, admin_id: str = Depends(get_current_admin)):
    if body.role not in ("admin", "user"):
        raise HTTPException(status_code=400, detail="Role must be admin or user")
    if user_id == admin_id:
        raise HTTPException(status_code=400, detail="You cannot change your own role")
    db = get_db()
    result = await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"role": body.role}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": f"User role updated to {body.role}"}


@router.delete("/users/{user_id}")
async def delete_user(user_id: str, admin_id: str = Depends(get_current_admin)):
    if user_id == admin_id:
        raise HTTPException(status_code=400, detail="You cannot delete your own account")
    db = get_db()
    result = await db.users.delete_one({"_id": ObjectId(user_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted"}
