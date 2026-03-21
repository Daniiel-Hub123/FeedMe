"""
Agent 4 — Final Score Calculator

Rules:
1. Calculates total score: Depth + Specificity + Coherence + Relevance + Diversity Bonus (cap: 100).
2. DISCARD rule: If Score < 25 → DISCARDED (no payment, no ranking, permanently banned from campaign).
3. Generates a natural language justification for the score.
4. Score is FINAL and immutable.
"""

from langchain_core.messages import SystemMessage, HumanMessage
from langchain_openai import ChatOpenAI
from config import settings

llm = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0.3,
    api_key=settings.openai_api_key,
)

JUSTIFICATION_PROMPT = """You are generating a brief justification for a feedback evaluation score.

Feedback text: "{feedback_text}"
Aspect evaluated: "{aspect_name}"

Scores:
- Depth: {depth}/35
- Specificity: {specificity}/25
- Coherence: {coherence}/20
- Relevance: {relevance}/10
- Diversity Bonus: {diversity}/10
- TOTAL: {total}/100
- Status: {status}
{trash_note}

Write a 2-3 sentence justification explaining WHY this feedback received this score.
Be specific about what was good or bad. Write in Spanish.
Do NOT use markdown, just plain text.
"""


async def run_final_scorer(
    feedback_text: str,
    aspect_name: str,
    depth: int,
    specificity: int,
    coherence: int,
    relevance: int,
    diversity_bonus: int,
    is_trash: bool,
) -> dict:
    """Run Agent 4: Calculate final score and generate justification."""

    # 1. Calculate total (cap at 100)
    raw_total = depth + specificity + coherence + relevance + diversity_bonus

    # Apply trash cap: max 24
    if is_trash:
        total = min(raw_total, 24)
    else:
        total = min(raw_total, 100)

    # 2. Determine status
    if total < 25:
        status = "DISCARDED"
    else:
        status = "EVALUATED"

    trash_note = ""
    if is_trash:
        trash_note = "NOTE: This feedback was flagged as 'Feedback Basura' (trash). Maximum score capped at 24."

    # 3. Generate justification
    try:
        messages = [
            HumanMessage(
                content=JUSTIFICATION_PROMPT.format(
                    feedback_text=feedback_text[:500],  # Truncate for token efficiency
                    aspect_name=aspect_name,
                    depth=depth,
                    specificity=specificity,
                    coherence=coherence,
                    relevance=relevance,
                    diversity=diversity_bonus,
                    total=total,
                    status=status,
                    trash_note=trash_note,
                )
            )
        ]
        response = await llm.ainvoke(messages)
        justification = response.content.strip()
    except Exception:
        justification = (
            f"Score total: {total}/100. "
            f"Profundidad: {depth}/35, Especificidad: {specificity}/25, "
            f"Coherencia: {coherence}/20, Relevancia: {relevance}/10, "
            f"Diversidad: {diversity_bonus}/10."
        )

    return {
        "depth": depth,
        "specificity": specificity,
        "coherence": coherence,
        "relevance": relevance,
        "diversity": diversity_bonus,
        "total_score": total,
        "status": status,
        "justification": justification,
        "is_trash": is_trash,
    }
