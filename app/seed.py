from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.auth import get_password_hash
from app.models import CoverageTier, Policy, PolicyStatus, User
from app.services import calculate_quote


def seed_data(db: Session) -> None:
    if db.query(User).first():
        return

    demo_user = User(
        full_name="Ravi Kumar",
        email="ravi@insureit.demo",
        phone_number="9876543210",
        hashed_password=get_password_hash("demo123"),
        city="Bengaluru",
        zone="Indiranagar",
        pincode="560038",
        platform="Zepto",
        avg_daily_earnings=800,
        avg_hourly_earnings=100,
        risk_score=42,
    )
    db.add(demo_user)
    db.flush()

    quote = calculate_quote(demo_user, CoverageTier.shield, 1.1)
    policy = Policy(
        user_id=demo_user.id,
        tier=CoverageTier.shield,
        weekly_premium=quote["premium"],
        max_weekly_payout=quote["max_weekly_payout"],
        weather_only=quote["weather_only"],
        social_disruption_cover=quote["social_disruption_cover"],
        extended_hours=quote["extended_hours"],
        status=PolicyStatus.active,
        coverage_start=datetime.now(timezone.utc),
        coverage_end=datetime.now(timezone.utc) + timedelta(days=7),
    )
    db.add(policy)
    db.commit()
