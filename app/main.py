from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.auth import create_access_token, get_current_user, get_password_hash, verify_password
from app.config import settings
from app.database import Base, SessionLocal, engine, get_db
from app.models import Claim, Policy, PolicyStatus, User
from app.schemas import (
    ClaimResponse,
    LoginRequest,
    PolicyCreateRequest,
    PolicyResponse,
    PremiumQuoteRequest,
    PremiumQuoteResponse,
    RegisterRequest,
    SimulationTriggerRequest,
    Token,
    TriggerEvaluationResponse,
    UserResponse,
    WeatherTriggerRequest,
)
from app.seed import seed_data
from app.services import (
    calculate_quote,
    create_claim_from_trigger,
    evaluate_disruption,
    fetch_weather_snapshot,
    get_active_policy,
)


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
    yield


app = FastAPI(title=settings.app_name, version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "app": settings.app_name,
        "status": "ok",
        "docs": "/docs",
        "demo_user": {"email": "ravi@insureit.demo", "password": "demo123"},
    }


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/auth/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter((User.email == payload.email) | (User.phone_number == payload.phone_number)).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with email or phone already exists.")

    avg_hourly = round(payload.avg_daily_earnings / 8, 2)
    user = User(
        full_name=payload.full_name,
        email=payload.email,
        phone_number=payload.phone_number,
        hashed_password=get_password_hash(payload.password),
        city=payload.city,
        zone=payload.zone,
        pincode=payload.pincode,
        platform=payload.platform,
        avg_daily_earnings=payload.avg_daily_earnings,
        avg_hourly_earnings=avg_hourly,
        risk_score=38 if payload.platform.lower() == "zepto" else 35,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return Token(access_token=create_access_token(user.email))


@app.post("/auth/login", response_model=Token)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    return Token(access_token=create_access_token(user.email))


@app.get("/auth/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@app.post("/premium/quote", response_model=PremiumQuoteResponse)
def premium_quote(
    payload: PremiumQuoteRequest,
    current_user: User = Depends(get_current_user),
):
    return calculate_quote(current_user, payload.tier, payload.forecast_risk_multiplier)


@app.post("/policy/purchase", response_model=PolicyResponse, status_code=status.HTTP_201_CREATED)
def purchase_policy(
    payload: PolicyCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    active_policy = db.query(Policy).filter(Policy.user_id == current_user.id, Policy.status == PolicyStatus.active).first()
    if active_policy:
        return active_policy

    quote = calculate_quote(current_user, payload.tier, 1.0)
    policy = Policy(
        user_id=current_user.id,
        tier=payload.tier,
        weekly_premium=quote["premium"],
        max_weekly_payout=quote["max_weekly_payout"],
        weather_only=quote["weather_only"],
        social_disruption_cover=quote["social_disruption_cover"],
        extended_hours=quote["extended_hours"],
        status=PolicyStatus.active,
    )
    db.add(policy)
    db.commit()
    db.refresh(policy)
    return policy


@app.get("/policy/active", response_model=PolicyResponse)
def active_policy(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_active_policy(current_user, db)


@app.get("/claims", response_model=list[ClaimResponse])
def list_claims(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Claim).filter(Claim.user_id == current_user.id).order_by(Claim.created_at.desc()).all()


@app.post("/claims/simulate-trigger", response_model=TriggerEvaluationResponse)
def simulate_trigger(
    payload: SimulationTriggerRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    policy = get_active_policy(current_user, db)
    claim = create_claim_from_trigger(
        db=db,
        user=current_user,
        policy=policy,
        disruption_type=payload.disruption_type,
        blocked_hours=payload.blocked_hours,
        trigger_source=payload.trigger_source,
        payload={"manual": True, "disruption_type": payload.disruption_type, "blocked_hours": payload.blocked_hours},
    )
    return TriggerEvaluationResponse(
        triggered=True,
        disruption_type=payload.disruption_type,
        reason="Manual trigger created for the demo flow.",
        source=payload.trigger_source,
        claim=claim,
        weather_snapshot={},
    )


@app.post("/weather/check-trigger", response_model=TriggerEvaluationResponse)
async def weather_trigger(
    payload: WeatherTriggerRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    policy = get_active_policy(current_user, db)
    snapshot, source = await fetch_weather_snapshot(payload.lat, payload.lon, payload.force_mock)
    triggered, disruption_type, reason = evaluate_disruption(snapshot)

    claim = None
    if triggered and disruption_type:
        claim = create_claim_from_trigger(
            db=db,
            user=current_user,
            policy=policy,
            disruption_type=disruption_type,
            blocked_hours=payload.blocked_hours,
            trigger_source=source,
            payload=snapshot,
        )

    return TriggerEvaluationResponse(
        triggered=triggered,
        disruption_type=disruption_type,
        reason=reason,
        source=source,
        claim=claim,
        weather_snapshot=snapshot,
    )
