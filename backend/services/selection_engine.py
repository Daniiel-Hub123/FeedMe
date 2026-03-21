"""
Selection Engine — Campaign Close & Winner Calculation

Triggered when a campaign reaches its end date:
1. Extract feedbacks with score >= 25 per aspect
2. Rank: highest score first, earliest timestamp breaks ties
3. Select Top 3 per aspect
4. Redistribute: if < 3 winners, surplus goes to existing winners
5. Desert aspect: 0 valid participants → full refund to company
6. Build payload JSON for smart contract
"""

from decimal import Decimal
from database import db


async def process_campaign_close(campaign_id: str) -> dict:
    """
    Process campaign closure and calculate winners + refunds.
    Returns the payload for the smart contract.
    """

    campaign = await db.campaign.find_unique(
        where={"id": campaign_id},
        include={
            "aspects": True,
            "feedbacks": {
                "orderBy": [{"totalScore": "desc"}, {"timestamp": "asc"}],
            },
        },
    )

    if not campaign:
        raise ValueError(f"Campaign {campaign_id} not found")

    tier1 = float(campaign.tier1Amount)
    tier2 = float(campaign.tier2Amount)
    tier3 = float(campaign.tier3Amount)
    tiers = [tier1, tier2, tier3]
    total_per_aspect = tier1 + tier2 + tier3

    winners = []
    total_refund = 0.0

    for aspect in campaign.aspects:
        # Get valid feedbacks for this aspect (score >= 25, status = EVALUATED)
        aspect_feedbacks = [
            f
            for f in campaign.feedbacks
            if f.aspectId == aspect.id
            and f.status == "EVALUATED"
            and f.totalScore >= 25
        ]

        num_valid = len(aspect_feedbacks)

        if num_valid == 0:
            # ── Desert Aspect: full refund ──
            total_refund += total_per_aspect

        elif num_valid == 1:
            # ── 1 winner: gets entire pool (tier1 + tier2 + tier3) ──
            winners.append({
                "wallet": aspect_feedbacks[0].wallet,
                "amount": total_per_aspect,
                "aspect": aspect.name,
                "score": aspect_feedbacks[0].totalScore,
            })

        elif num_valid == 2:
            # ── 2 winners: tier1 to #1, tier2+tier3 to #2 ──
            # Actually: #1 gets tier1 + tier3 (surplus), #2 gets tier2
            winners.append({
                "wallet": aspect_feedbacks[0].wallet,
                "amount": tier1 + tier3,  # #1 gets Tier1 + surplus Tier3
                "aspect": aspect.name,
                "score": aspect_feedbacks[0].totalScore,
            })
            winners.append({
                "wallet": aspect_feedbacks[1].wallet,
                "amount": tier2,
                "aspect": aspect.name,
                "score": aspect_feedbacks[1].totalScore,
            })

        else:
            # ── 3+ winners: standard distribution ──
            for i, tier_amount in enumerate(tiers):
                if i < len(aspect_feedbacks):
                    winners.append({
                        "wallet": aspect_feedbacks[i].wallet,
                        "amount": tier_amount,
                        "aspect": aspect.name,
                        "score": aspect_feedbacks[i].totalScore,
                    })

    # Build payload
    payload = {
        "campaign_id": campaign_id,
        "winners": winners,
        "refund_to_company": total_refund,
        "total_deposit": float(campaign.totalDeposit),
    }

    # Verify math: sum(winner amounts) + refund must equal total deposit
    total_paid = sum(w["amount"] for w in winners) + total_refund
    assert abs(total_paid - float(campaign.totalDeposit)) < 0.01, (
        f"MATH ERROR: total_paid={total_paid} != total_deposit={campaign.totalDeposit}"
    )

    return payload
