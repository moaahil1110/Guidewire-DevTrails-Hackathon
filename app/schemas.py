from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models import ClaimStatus, CoverageTier, DisruptionType, PolicyStatus


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    phone_number: str
    password: str = Field(min_length=6)
    city: str
    zone: str
    pincode: str
    platform: str
    avg_daily_earnings: float = Field(gt=0)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: EmailStr
    phone_number: str
    city: str
    zone: str
    pincode: str
    platform: str
    avg_daily_earnings: float
    avg_hourly_earnings: float
    risk_score: int
    created_at: datetime


class PremiumQuoteRequest(BaseModel):
    tier: CoverageTier
    forecast_risk_multiplier: float | None = Field(default=None, ge=0.8, le=1.6)


class PremiumQuoteResponse(BaseModel):
    tier: CoverageTier
    base_premium: float
    premium: float
    max_weekly_payout: float
    weather_only: bool
    social_disruption_cover: bool
    extended_hours: bool
    forecast_risk_multiplier: float
    zone_risk_multiplier: float
    recommended: bool


class PolicyCreateRequest(BaseModel):
    tier: CoverageTier


class PolicyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tier: CoverageTier
    weekly_premium: float
    max_weekly_payout: float
    weather_only: bool
    social_disruption_cover: bool
    extended_hours: bool
    status: PolicyStatus
    coverage_start: datetime
    coverage_end: datetime
    created_at: datetime


class WeatherTriggerRequest(BaseModel):
    lat: float
    lon: float
    blocked_hours: float = Field(default=3, gt=0, le=12)
    force_mock: bool = False


class SimulationTriggerRequest(BaseModel):
    disruption_type: DisruptionType
    blocked_hours: float = Field(default=3, gt=0, le=12)
    trigger_source: str = "manual-demo"


class ClaimResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    policy_id: int
    disruption_type: DisruptionType
    blocked_hours: float
    payout_amount: float
    status: ClaimStatus
    fraud_score: float
    trigger_source: str
    payout_reference: str | None
    created_at: datetime


class TriggerEvaluationResponse(BaseModel):
    triggered: bool
    disruption_type: DisruptionType | None = None
    reason: str
    source: str
    claim: ClaimResponse | None = None
    weather_snapshot: dict
