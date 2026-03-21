import string
import random
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, HTTPException
from decimal import Decimal

from database import db
from schemas import (
    CampaignCreate,
    CampaignResponse,
    CodeGenerateRequest,
    CodeResponse,
    CampaignResults,
)

router = APIRouter()


def generate_alphanumeric_code(length: int = 8) -> str:
    """Generate a random alphanumeric code."""
    chars = string.ascii_uppercase + string.digits
    return "".join(random.choices(chars, k=length))


@router.post("/", response_model=CampaignResponse)
async def create_campaign(data: CampaignCreate):
    """Create a new campaign. The company must have already deposited USDC via MetaMask."""

    # Validate aspects (1-10)
    if len(data.aspects) < 1 or len(data.aspects) > 10:
        raise HTTPException(400, "Aspects must be between 1 and 10")

    # Validate duration (3-90 days)
    if data.duration_days < 3 or data.duration_days > 90:
        raise HTTPException(400, "Duration must be between 3 and 90 days")

    # Calculate total deposit: (tier1 + tier2 + tier3) × number of aspects
    total_per_aspect = data.tier1_amount + data.tier2_amount + data.tier3_amount
    total_deposit = total_per_aspect * len(data.aspects)

    end_date = datetime.now(timezone.utc) + timedelta(days=data.duration_days)

    # Create campaign in DB
    campaign = await db.campaign.create(
        data={
            "title": data.title,
            "description": data.description,
            "creatorWallet": data.creator_wallet,
            "tier1Amount": float(data.tier1_amount),
            "tier2Amount": float(data.tier2_amount),
            "tier3Amount": float(data.tier3_amount),
            "totalDeposit": float(total_deposit),
            "endDate": end_date,
            "txHash": data.tx_hash,
            "aspects": {
                "create": [{"name": aspect.name} for aspect in data.aspects]
            },
        },
        include={"aspects": True},
    )

    return CampaignResponse(
        id=campaign.id,
        title=campaign.title,
        description=campaign.description,
        creator_wallet=campaign.creatorWallet,
        aspects=[{"id": a.id, "name": a.name} for a in campaign.aspects],
        tier1_amount=float(campaign.tier1Amount),
        tier2_amount=float(campaign.tier2Amount),
        tier3_amount=float(campaign.tier3Amount),
        total_deposit=float(campaign.totalDeposit),
        start_date=campaign.startDate,
        end_date=campaign.endDate,
        status=campaign.status,
        tx_hash=campaign.txHash,
        created_at=campaign.createdAt,
    )


@router.get("/{campaign_id}", response_model=CampaignResponse)
async def get_campaign(campaign_id: str):
    """Get campaign details."""
    campaign = await db.campaign.find_unique(
        where={"id": campaign_id},
        include={"aspects": True},
    )
    if not campaign:
        raise HTTPException(404, "Campaign not found")

    return CampaignResponse(
        id=campaign.id,
        title=campaign.title,
        description=campaign.description,
        creator_wallet=campaign.creatorWallet,
        aspects=[{"id": a.id, "name": a.name} for a in campaign.aspects],
        tier1_amount=float(campaign.tier1Amount),
        tier2_amount=float(campaign.tier2Amount),
        tier3_amount=float(campaign.tier3Amount),
        total_deposit=float(campaign.totalDeposit),
        start_date=campaign.startDate,
        end_date=campaign.endDate,
        status=campaign.status,
        tx_hash=campaign.txHash,
        created_at=campaign.createdAt,
    )


@router.get("/")
async def list_campaigns():
    """List all campaigns."""
    campaigns = await db.campaign.find_many(
        include={"aspects": True},
        order={"createdAt": "desc"},
    )
    return [
        CampaignResponse(
            id=c.id,
            title=c.title,
            description=c.description,
            creator_wallet=c.creatorWallet,
            aspects=[{"id": a.id, "name": a.name} for a in c.aspects],
            tier1_amount=float(c.tier1Amount),
            tier2_amount=float(c.tier2Amount),
            tier3_amount=float(c.tier3Amount),
            total_deposit=float(c.totalDeposit),
            start_date=c.startDate,
            end_date=c.endDate,
            status=c.status,
            tx_hash=c.txHash,
            created_at=c.createdAt,
        )
        for c in campaigns
    ]


@router.post("/{campaign_id}/codes", response_model=list[CodeResponse])
async def generate_codes(campaign_id: str, data: CodeGenerateRequest):
    """Generate alphanumeric codes for a campaign."""
    campaign = await db.campaign.find_unique(where={"id": campaign_id})
    if not campaign:
        raise HTTPException(404, "Campaign not found")

    codes = []
    for _ in range(data.quantity):
        # Generate unique code
        while True:
            code_str = generate_alphanumeric_code()
            existing = await db.code.find_unique(where={"code": code_str})
            if not existing:
                break

        code = await db.code.create(
            data={
                "code": code_str,
                "campaignId": campaign_id,
            }
        )
        codes.append(
            CodeResponse(
                id=code.id,
                code=code.code,
                used=code.used,
                created_at=code.createdAt,
            )
        )

    return codes


@router.get("/{campaign_id}/codes", response_model=list[CodeResponse])
async def list_codes(campaign_id: str):
    """List all codes for a campaign (company view)."""
    codes = await db.code.find_many(
        where={"campaignId": campaign_id},
        order={"createdAt": "desc"},
    )
    return [
        CodeResponse(id=c.id, code=c.code, used=c.used, created_at=c.createdAt)
        for c in codes
    ]


@router.get("/{campaign_id}/results")
async def get_results(campaign_id: str):
    """Get campaign results after completion."""
    campaign = await db.campaign.find_unique(
        where={"id": campaign_id},
        include={
            "aspects": True,
            "feedbacks": {"orderBy": [{"totalScore": "desc"}, {"timestamp": "asc"}]},
        },
    )
    if not campaign:
        raise HTTPException(404, "Campaign not found")

    # Build results per aspect
    results = {}
    for aspect in campaign.aspects:
        aspect_feedbacks = [
            f
            for f in campaign.feedbacks
            if f.aspectId == aspect.id and f.status == "EVALUATED" and f.totalScore >= 25
        ]
        results[aspect.name] = {
            "aspect_id": aspect.id,
            "aspect_name": aspect.name,
            "total_participants": len(
                [f for f in campaign.feedbacks if f.aspectId == aspect.id]
            ),
            "valid_participants": len(aspect_feedbacks),
            "top3": [
                {
                    "wallet": f.wallet,
                    "score": f.totalScore,
                    "justification": f.justification,
                }
                for f in aspect_feedbacks[:3]
            ],
        }

    return {
        "campaign_id": campaign.id,
        "title": campaign.title,
        "status": campaign.status,
        "total_deposit": float(campaign.totalDeposit),
        "results_by_aspect": results,
    }


@router.post("/{campaign_id}/finalize")
async def finalize_campaign(campaign_id: str):
    """
    Manually finalize a campaign: close it, calculate winners, distribute prizes.
    In production, the scheduler does this automatically when campaigns expire.
    """
    from services.selection_engine import process_campaign_close

    campaign = await db.campaign.find_unique(
        where={"id": campaign_id},
        include={"aspects": True},
    )
    if not campaign:
        raise HTTPException(404, "Campaign not found")
    if campaign.status not in ("ACTIVE", "CLOSED"):
        raise HTTPException(400, f"Campaign already {campaign.status}")

    # 1. Mark as CLOSED
    await db.campaign.update(
        where={"id": campaign_id},
        data={"status": "CLOSED"},
    )

    # 2. Run selection engine → calculate winners
    payload = await process_campaign_close(campaign_id)

    # 3. Try on-chain distribution (only if campaign was deposited on-chain)
    tx_hash = None
    blockchain_note = "Simulado (sin depósito on-chain)"
    try:
        from services.blockchain_service import distribute_payments
        tx_hash = await distribute_payments(payload)
        blockchain_note = f"TX on-chain: {tx_hash}"
    except Exception as e:
        blockchain_note = f"Simulado: {str(e)[:100]}"

    # 4. Mark as FINALIZED
    await db.campaign.update(
        where={"id": campaign_id},
        data={
            "status": "FINALIZED",
            "txHash": tx_hash,
        },
    )

    # 5. Build response
    medals = ["🥇 Tier 1", "🥈 Tier 2", "🥉 Tier 3"]
    winners_display = []
    for i, w in enumerate(payload["winners"]):
        winners_display.append({
            "tier": medals[i] if i < 3 else f"#{i+1}",
            "wallet": w["wallet"],
            "amount_usdc": w["amount"],
            "score": w["score"],
            "aspect": w["aspect"],
        })

    return {
        "campaign_id": campaign_id,
        "title": campaign.title,
        "status": "FINALIZED",
        "total_deposit": payload["total_deposit"],
        "winners": winners_display,
        "refund_to_company": payload["refund_to_company"],
        "blockchain": blockchain_note,
    }
