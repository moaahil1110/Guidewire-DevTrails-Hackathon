import json
from datetime import datetime, timezone

import httpx
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.config import settings
from app.models import Claim, ClaimStatus, CoverageTier, DisruptionType, Policy, PolicyStatus, User


TIER_CONFIG = {
    CoverageTier.basic: {
        "base_premium": 29.0,
        "max_weekly_payout": 300.0,
        "weather_only": True,
        "social_disruption_cover": False,
        "extended_hours": False,
    },
    CoverageTier.shield: {
        "base_premium": 49.0,
        "max_weekly_payout": 600.0,
        "weather_only": False,
        "social_disruption_cover": True,
        "extended_hours": False,
    },
    CoverageTier.max: {
        "base_premium": 79.0,
        "max_weekly_payout": 1000.0,
        "weather_only": False,
        "social_disruption_cover": True,
        "extended_hours": True,
    },
}


def calculate_quote(user: User, tier: CoverageTier, forecast_risk_multiplier: float | None = None) -> dict:
    config = TIER_CONFIG[tier]
    zone_risk_multiplier = 1 + ((user.risk_score - 30) / 100)
    forecast_multiplier = forecast_risk_multiplier or 1.0
    premium = round(config["base_premium"] * zone_risk_multiplier * forecast_multiplier, 2)
    return {
        "tier": tier,
        "base_premium": config["base_premium"],
        "premium": premium,
        "max_weekly_payout": config["max_weekly_payout"],
        "weather_only": config["weather_only"],
        "social_disruption_cover": config["social_disruption_cover"],
        "extended_hours": config["extended_hours"],
        "forecast_risk_multiplier": forecast_multiplier,
        "zone_risk_multiplier": round(zone_risk_multiplier, 2),
        "recommended": tier == CoverageTier.shield,
    }


def get_active_policy(user: User, db: Session) -> Policy:
    policy = (
        db.query(Policy)
        .filter(Policy.user_id == user.id, Policy.status == PolicyStatus.active)
        .order_by(Policy.created_at.desc())
        .first()
    )
    if not policy:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active policy found for this user. Purchase a policy first.",
        )
    return policy


async def fetch_weather_snapshot(lat: float, lon: float, force_mock: bool = False) -> tuple[dict, str]:
    if force_mock or not settings.openweathermap_api_key:
        return (
            {
                "lat": lat,
                "lon": lon,
                "temp_c": 31.5,
                "feels_like_c": 35.2,
                "rain_mm_last_hour": 82.0,
                "condition": "heavy rain",
                "alert": "red",
            },
            "mock-openweathermap",
        )

    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.get(
            "https://api.openweathermap.org/data/2.5/weather",
            params={"lat": lat, "lon": lon, "appid": settings.openweathermap_api_key, "units": "metric"},
        )
        response.raise_for_status()
        payload = response.json()

    return (
        {
            "lat": lat,
            "lon": lon,
            "temp_c": payload["main"]["temp"],
            "feels_like_c": payload["main"]["feels_like"],
            "rain_mm_last_hour": payload.get("rain", {}).get("1h", 0.0),
            "condition": payload["weather"][0]["description"],
            "alert": "red" if payload.get("rain", {}).get("1h", 0.0) >= 65 else "normal",
        },
        "openweathermap-live",
    )


def evaluate_disruption(snapshot: dict) -> tuple[bool, DisruptionType | None, str]:
    if snapshot.get("rain_mm_last_hour", 0) >= 65:
        return True, DisruptionType.heavy_rain, "Rainfall crossed 65 mm/hr parametric trigger."
    if snapshot.get("temp_c", 0) >= 42 and snapshot.get("feels_like_c", 0) >= 48:
        return True, DisruptionType.extreme_heat, "Extreme heat threshold crossed."
    return False, None, "No configured trigger threshold was crossed."


def create_claim_from_trigger(
    db: Session,
    user: User,
    policy: Policy,
    disruption_type: DisruptionType,
    blocked_hours: float,
    trigger_source: str,
    payload: dict,
) -> Claim:
    payout = min(round(user.avg_hourly_earnings * blocked_hours, 2), policy.max_weekly_payout)
    claim = Claim(
        user_id=user.id,
        policy_id=policy.id,
        disruption_type=disruption_type,
        blocked_hours=blocked_hours,
        payout_amount=payout,
        status=ClaimStatus.paid,
        fraud_score=0.12,
        trigger_source=trigger_source,
        trigger_payload=json.dumps(payload),
        payout_reference=f"UPI-{user.id}-{int(datetime.now(timezone.utc).timestamp())}",
    )
    db.add(claim)
    db.commit()
    db.refresh(claim)
    return claim
