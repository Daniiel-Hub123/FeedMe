from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException

from database import db
from schemas import FeedbackSubmit, FeedbackResponse
from agents.graph import evaluate_feedback

router = APIRouter()


@router.post("/", response_model=FeedbackResponse)
async def submit_feedback(data: FeedbackSubmit):
    """Submit feedback for a campaign. Validates code and unique wallet participation."""

    # 1. Validate campaign exists and is active
    campaign = await db.campaign.find_unique(
        where={"id": data.campaign_id},
        include={"aspects": True},
    )
    if not campaign:
        raise HTTPException(404, "Campaign not found")
    if campaign.status != "ACTIVE":
        raise HTTPException(400, "Campaign is not active")
    if datetime.now(timezone.utc) > campaign.endDate.replace(tzinfo=timezone.utc):
        raise HTTPException(400, "Campaign has ended")

    # 2. Validate aspect exists in this campaign
    aspect = next((a for a in campaign.aspects if a.id == data.aspect_id), None)
    if not aspect:
        raise HTTPException(400, "Invalid aspect for this campaign")

    # 3. Validate code: exists, belongs to this campaign, and is not used
    code = await db.code.find_unique(where={"code": data.code})
    if not code:
        raise HTTPException(400, "Invalid code")
    if code.campaignId != data.campaign_id:
        raise HTTPException(400, "Code does not belong to this campaign")
    if code.used:
        raise HTTPException(400, "Code already used")

    # 4. Validate unique wallet per campaign
    existing_feedback = await db.feedback.find_first(
        where={
            "wallet": data.wallet,
            "campaignId": data.campaign_id,
        }
    )
    if existing_feedback:
        raise HTTPException(
            400, "This wallet has already submitted feedback for this campaign"
        )

    # 5. Create feedback (PENDING status)
    feedback = await db.feedback.create(
        data={
            "wallet": data.wallet,
            "aspectId": data.aspect_id,
            "campaignId": data.campaign_id,
            "codeUsed": data.code,
            "text": data.text,
            "timestamp": datetime.now(timezone.utc),
        }
    )

    # 6. Burn the code (mark as used)
    await db.code.update(
        where={"code": data.code},
        data={"used": True, "usedBy": data.wallet},
    )

    # 7. Run the multi-agent evaluation pipeline
    try:
        result = await evaluate_feedback(
            feedback_id=feedback.id,
            feedback_text=data.text,
            aspect_name=aspect.name,
            aspect_id=aspect.id,
            campaign_title=campaign.title,
        )

        # 8. Update feedback with scores
        updated = await db.feedback.update(
            where={"id": feedback.id},
            data={
                "depth": result["depth"],
                "specificity": result["specificity"],
                "coherence": result["coherence"],
                "relevance": result["relevance"],
                "diversity": result["diversity"],
                "totalScore": result["total_score"],
                "status": result["status"],
                "justification": result["justification"],
            },
        )

        return FeedbackResponse(
            id=updated.id,
            wallet=updated.wallet,
            campaign_id=updated.campaignId,
            aspect_id=updated.aspectId,
            text=updated.text,
            depth=updated.depth,
            specificity=updated.specificity,
            coherence=updated.coherence,
            relevance=updated.relevance,
            diversity=updated.diversity,
            total_score=updated.totalScore,
            status=updated.status,
            justification=updated.justification,
            timestamp=updated.timestamp,
        )
    except Exception as e:
        # If agent evaluation fails, keep the feedback but mark as pending
        print(f"Agent evaluation error: {e}")
        return FeedbackResponse(
            id=feedback.id,
            wallet=feedback.wallet,
            campaign_id=feedback.campaignId,
            aspect_id=feedback.aspectId,
            text=feedback.text,
            depth=0,
            specificity=0,
            coherence=0,
            relevance=0,
            diversity=0,
            total_score=0,
            status="PENDING",
            justification=f"Evaluation pending: {str(e)}",
            timestamp=feedback.timestamp,
        )


@router.get("/{feedback_id}", response_model=FeedbackResponse)
async def get_feedback(feedback_id: str):
    """Get feedback details and score."""
    feedback = await db.feedback.find_unique(where={"id": feedback_id})
    if not feedback:
        raise HTTPException(404, "Feedback not found")

    return FeedbackResponse(
        id=feedback.id,
        wallet=feedback.wallet,
        campaign_id=feedback.campaignId,
        aspect_id=feedback.aspectId,
        text=feedback.text,
        depth=feedback.depth,
        specificity=feedback.specificity,
        coherence=feedback.coherence,
        relevance=feedback.relevance,
        diversity=feedback.diversity,
        total_score=feedback.totalScore,
        status=feedback.status,
        justification=feedback.justification,
        timestamp=feedback.timestamp,
    )
