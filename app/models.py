import enum
from datetime import datetime, timedelta, timezone

from sqlalchemy import Boolean, DateTime, Enum, Float, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class CoverageTier(str, enum.Enum):
    basic = "basic"
    shield = "shield"
    max = "max"


class PolicyStatus(str, enum.Enum):
    draft = "draft"
    active = "active"
    expired = "expired"


class ClaimStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    paid = "paid"
    flagged = "flagged"
    rejected = "rejected"


class DisruptionType(str, enum.Enum):
    heavy_rain = "heavy_rain"
    extreme_heat = "extreme_heat"
    flood = "flood"
    curfew = "curfew"
    platform_downtime = "platform_downtime"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    phone_number: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    city: Mapped[str] = mapped_column(String(80), nullable=False)
    zone: Mapped[str] = mapped_column(String(80), nullable=False)
    pincode: Mapped[str] = mapped_column(String(12), nullable=False)
    platform: Mapped[str] = mapped_column(String(40), nullable=False)
    avg_daily_earnings: Mapped[float] = mapped_column(Float, nullable=False)
    avg_hourly_earnings: Mapped[float] = mapped_column(Float, nullable=False)
    risk_score: Mapped[int] = mapped_column(Integer, default=35, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    policies: Mapped[list["Policy"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    claims: Mapped[list["Claim"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class Policy(Base):
    __tablename__ = "policies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    tier: Mapped[CoverageTier] = mapped_column(Enum(CoverageTier), nullable=False)
    weekly_premium: Mapped[float] = mapped_column(Float, nullable=False)
    max_weekly_payout: Mapped[float] = mapped_column(Float, nullable=False)
    weather_only: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    social_disruption_cover: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    extended_hours: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    status: Mapped[PolicyStatus] = mapped_column(Enum(PolicyStatus), default=PolicyStatus.active, nullable=False)
    coverage_start: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    coverage_end: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc) + timedelta(days=7),
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user: Mapped["User"] = relationship(back_populates="policies")
    claims: Mapped[list["Claim"]] = relationship(back_populates="policy")


class Claim(Base):
    __tablename__ = "claims"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    policy_id: Mapped[int] = mapped_column(ForeignKey("policies.id"), nullable=False)
    disruption_type: Mapped[DisruptionType] = mapped_column(Enum(DisruptionType), nullable=False)
    blocked_hours: Mapped[float] = mapped_column(Float, nullable=False)
    payout_amount: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[ClaimStatus] = mapped_column(Enum(ClaimStatus), default=ClaimStatus.approved, nullable=False)
    fraud_score: Mapped[float] = mapped_column(Float, default=0.12, nullable=False)
    trigger_source: Mapped[str] = mapped_column(String(80), nullable=False)
    trigger_payload: Mapped[str] = mapped_column(Text, nullable=False)
    payout_reference: Mapped[str | None] = mapped_column(String(64), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user: Mapped["User"] = relationship(back_populates="claims")
    policy: Mapped["Policy"] = relationship(back_populates="claims")
