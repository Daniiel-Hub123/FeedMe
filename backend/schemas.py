from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from decimal import Decimal
from enum import Enum


# ──────────────── Enums ────────────────

class CampaignStatusEnum(str, Enum):
    ACTIVE = "ACTIVE"
    CLOSED = "CLOSED"
    FINALIZED = "FINALIZED"
    EMERGENCY = "EMERGENCY"


class FeedbackStatusEnum(str, Enum):
    PENDING = "PENDING"
    EVALUATED = "EVALUATED"
    DISCARDED = "DISCARDED"


# ──────────────── Campaign Schemas ────────────────

class AspectCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)


class CampaignCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = ""
    creator_wallet: str = Field(..., pattern=r"^0x[a-fA-F0-9]{40}$")
    aspects: List[AspectCreate] = Field(..., min_length=1, max_length=10)
    tier1_amount: Decimal = Field(..., gt=0)
    tier2_amount: Decimal = Field(..., gt=0)
    tier3_amount: Decimal = Field(..., gt=0)
    duration_days: int = Field(..., ge=3, le=90)
    tx_hash: Optional[str] = None


class CampaignResponse(BaseModel):
    id: str
    title: str
    description: str
    creator_wallet: str
    aspects: list
    tier1_amount: float
    tier2_amount: float
    tier3_amount: float
    total_deposit: float
    start_date: datetime
    end_date: datetime
    status: str
    tx_hash: Optional[str]
    created_at: datetime


# ──────────────── Code Schemas ────────────────

class CodeGenerateRequest(BaseModel):
    quantity: int = Field(..., ge=1, le=1000)


class CodeResponse(BaseModel):
    id: str
    code: str
    used: bool
    created_at: datetime


# ──────────────── Feedback Schemas ────────────────

class FeedbackSubmit(BaseModel):
    wallet: str = Field(..., pattern=r"^0x[a-fA-F0-9]{40}$")
    campaign_id: str
    aspect_id: str
    code: str
    text: str = Field(..., min_length=1)


class FeedbackResponse(BaseModel):
    id: str
    wallet: str
    campaign_id: str
    aspect_id: str
    text: str
    depth: int
    specificity: int
    coherence: int
    relevance: int
    diversity: int
    total_score: int
    status: str
    justification: Optional[str]
    timestamp: datetime


# ──────────────── Results Schemas ────────────────

class WinnerInfo(BaseModel):
    wallet: str
    amount: float
    aspect: str
    score: int


class CampaignResults(BaseModel):
    campaign_id: str
    winners: List[WinnerInfo]
    refund_to_company: float
    total_deposit: float
    status: str
