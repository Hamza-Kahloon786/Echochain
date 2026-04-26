"""Stripe payment routes for EchoChain subscriptions."""
import os
import logging
from datetime import datetime
from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel
from bson import ObjectId
from app.database import get_db
from app.utils.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()

# ── Stripe init (lazy — only fails if you actually call the endpoint) ──────
def _stripe():
    import stripe as _s
    key = os.getenv("STRIPE_SECRET_KEY", "")
    if not key:
        raise HTTPException(status_code=503, detail="Payment service not configured. Set STRIPE_SECRET_KEY.")
    _s.api_key = key
    return _s


# ── Price-ID map from env ─────────────────────────────────────────────────
def _price_id(plan: str, billing: str) -> str:
    key_map = {
        ("starter", "monthly"): "STRIPE_STARTER_MONTHLY_PRICE_ID",
        ("starter", "yearly"):  "STRIPE_STARTER_YEARLY_PRICE_ID",
        ("pro",     "monthly"): "STRIPE_PRO_MONTHLY_PRICE_ID",
        ("pro",     "yearly"):  "STRIPE_PRO_YEARLY_PRICE_ID",
    }
    env_key = key_map.get((plan.lower(), billing.lower()))
    if not env_key:
        raise HTTPException(status_code=400, detail=f"Unknown plan/billing combination: {plan}/{billing}")
    price_id = os.getenv(env_key, "")
    if not price_id:
        raise HTTPException(status_code=503, detail=f"Price ID not configured for {plan}/{billing}. Set {env_key}.")
    return price_id


# ── Schemas ───────────────────────────────────────────────────────────────
class CheckoutRequest(BaseModel):
    plan:    str  # starter | pro
    billing: str  # monthly | yearly


# ── Routes ────────────────────────────────────────────────────────────────

@router.post("/create-checkout")
async def create_checkout(
    data:    CheckoutRequest,
    user_id: str = Depends(get_current_user),
):
    """Create a Stripe Checkout Session and return its URL."""
    stripe = _stripe()
    price_id = _price_id(data.plan, data.billing)

    db   = get_db()
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")

    try:
        # Re-use existing Stripe customer or create one
        customer_id = user.get("stripe_customer_id")
        if not customer_id:
            customer = stripe.Customer.create(
                email=user["email"],
                name=user.get("company_name", ""),
                metadata={"user_id": user_id},
            )
            customer_id = customer.id
            await db.users.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {"stripe_customer_id": customer_id, "updated_at": datetime.utcnow()}},
            )

        session = stripe.checkout.Session.create(
            customer=customer_id,
            line_items=[{"price": price_id, "quantity": 1}],
            mode="subscription",
            success_url=f"{frontend_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{frontend_url}/pricing",
            metadata={"user_id": user_id, "plan": data.plan, "billing": data.billing},
            subscription_data={"metadata": {"user_id": user_id}},
            allow_promotion_codes=True,
        )
        logger.info(f"Checkout session {session.id} created for user {user_id} ({data.plan}/{data.billing})")
        return {"url": session.url}

    except Exception as e:
        logger.error(f"Stripe checkout error for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to create payment session")


@router.post("/verify-session")
async def verify_session(
    request: Request,
    user_id: str = Depends(get_current_user),
):
    """
    Called by the frontend after Stripe redirects back with ?session_id=...
    Activates the subscription immediately without waiting for a webhook.
    """
    stripe = _stripe()
    body       = await request.json()
    session_id = body.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id is required")

    try:
        session = stripe.checkout.Session.retrieve(session_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid session ID")

    # Ownership check
    if session.get("metadata", {}).get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="Session does not belong to this user")

    if session.get("payment_status") != "paid":
        raise HTTPException(status_code=400, detail="Payment not yet completed")

    plan = session.get("metadata", {}).get("plan", "starter")
    db   = get_db()
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {
            "subscription_plan":   plan,
            "subscription_status": "active",
            "stripe_subscription_id": session.get("subscription"),
            "subscribed_at": datetime.utcnow(),
            "updated_at":    datetime.utcnow(),
        }},
    )
    logger.info(f"Subscription activated: user={user_id} plan={plan}")
    return {"status": "ok", "plan": plan}


@router.post("/webhook")
async def stripe_webhook(request: Request):
    """
    Stripe sends events here. No auth — signature-verified instead.
    Register this URL in your Stripe Dashboard as the webhook endpoint.
    """
    stripe         = _stripe()
    payload        = await request.body()
    sig_header     = request.headers.get("stripe-signature", "")
    webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET", "")

    if not webhook_secret:
        raise HTTPException(status_code=503, detail="Webhook secret not configured")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
    except Exception as e:
        logger.warning(f"Webhook signature verification failed: {e}")
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    db         = get_db()
    event_type = event.get("type", "")
    obj        = event["data"]["object"]

    if event_type == "checkout.session.completed":
        user_id = obj.get("metadata", {}).get("user_id")
        plan    = obj.get("metadata", {}).get("plan", "starter")
        if user_id:
            await db.users.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {
                    "subscription_plan":      plan,
                    "subscription_status":    "active",
                    "stripe_subscription_id": obj.get("subscription"),
                    "subscribed_at":          datetime.utcnow(),
                    "updated_at":             datetime.utcnow(),
                }},
            )
            logger.info(f"[webhook] Activated {plan} for user {user_id}")

    elif event_type == "customer.subscription.deleted":
        sub_id = obj.get("id")
        await db.users.update_one(
            {"stripe_subscription_id": sub_id},
            {"$set": {
                "subscription_plan":   "free",
                "subscription_status": "cancelled",
                "updated_at":          datetime.utcnow(),
            }},
        )
        logger.info(f"[webhook] Subscription {sub_id} cancelled → reverted to free")

    elif event_type == "invoice.payment_failed":
        sub_id = obj.get("subscription")
        if sub_id:
            await db.users.update_one(
                {"stripe_subscription_id": sub_id},
                {"$set": {"subscription_status": "past_due", "updated_at": datetime.utcnow()}},
            )
            logger.warning(f"[webhook] Payment failed for subscription {sub_id}")

    else:
        logger.debug(f"[webhook] Unhandled event: {event_type}")

    return {"status": "ok"}


@router.get("/subscription")
async def get_subscription(user_id: str = Depends(get_current_user)):
    """Return the current user's subscription status."""
    db   = get_db()
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "plan":                   user.get("subscription_plan", "free"),
        "status":                 user.get("subscription_status", "none"),
        "stripe_subscription_id": user.get("stripe_subscription_id"),
        "subscribed_at":          user.get("subscribed_at"),
    }
