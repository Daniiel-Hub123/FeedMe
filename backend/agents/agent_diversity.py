"""
Agent 3 — Diversity Classifier

Rules:
1. Queries DB for the current count of valid feedbacks for the chosen aspect.
2. Assigns a diversity bonus:
   - 0 previous valid: +10 pts
   - 1-5 previous: +8 pts
   - 6-15 previous: +5 pts
   - 16-30 previous: +2 pts
   - 30+ previous: +0 pts
3. Updates the aspect's validFeedbacks counter +1 ONLY IF the feedback passed
   trash detection (depth >= 10 OR specificity >= 8).
"""

from database import db


def calculate_diversity_bonus(valid_count: int) -> int:
    """Calculate diversity bonus based on existing valid feedback count."""
    if valid_count == 0:
        return 10
    elif valid_count <= 5:
        return 8
    elif valid_count <= 15:
        return 5
    elif valid_count <= 30:
        return 2
    else:
        return 0


async def run_diversity_classifier(
    aspect_id: str,
    is_trash: bool,
) -> dict:
    """Run Agent 3: Calculate diversity bonus and update counter."""

    # 1. Get current valid feedback count for this aspect
    aspect = await db.aspect.find_unique(where={"id": aspect_id})
    if not aspect:
        return {"diversity_bonus": 0, "valid_count_before": 0}

    valid_count = aspect.validFeedbacks

    # 2. Calculate bonus
    bonus = calculate_diversity_bonus(valid_count)

    # 3. Update counter only if feedback is NOT trash
    if not is_trash:
        await db.aspect.update(
            where={"id": aspect_id},
            data={"validFeedbacks": valid_count + 1},
        )

    return {
        "diversity_bonus": bonus,
        "valid_count_before": valid_count,
    }
