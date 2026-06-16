"""
Creates or resets the admin account in MongoDB.
Run from the backend/ directory:  python create_admin.py
"""
import asyncio
import os
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from app.utils.auth import hash_password
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL   = os.getenv("MONGODB_URL",   "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "chain_scope_ai")

ADMIN_EMAIL    = "admin@chainscopeai.co.uk"
ADMIN_PASSWORD = "Admin@1234"

async def create_admin():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]

    existing = await db.users.find_one({"email": ADMIN_EMAIL})
    if existing:
        # Reset password and ensure role/status are correct
        await db.users.update_one(
            {"email": ADMIN_EMAIL},
            {"$set": {
                "password": hash_password(ADMIN_PASSWORD),
                "role":   "admin",
                "status": "active",
            }}
        )
        print(f"Admin account already existed — password reset and role confirmed.")
    else:
        await db.users.insert_one({
            "email":           ADMIN_EMAIL,
            "password":        hash_password(ADMIN_PASSWORD),
            "company_name":    "Chainscope AI Ltd",
            "full_name":       "Platform Admin",
            "company_phone":   "+44 7448 781708",
            "company_address": "Worcester, United Kingdom",
            "role":            "admin",
            "status":          "active",
            "created_at":      datetime.utcnow(),
        })
        print(f"Admin account created.")

    print("\n" + "="*45)
    print("  ADMIN CREDENTIALS")
    print("="*45)
    print(f"  Email    : {ADMIN_EMAIL}")
    print(f"  Password : {ADMIN_PASSWORD}")
    print(f"  Panel URL: http://localhost:5173/admin")
    print("="*45)

    client.close()

if __name__ == "__main__":
    asyncio.run(create_admin())
