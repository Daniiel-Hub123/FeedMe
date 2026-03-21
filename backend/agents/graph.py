"""
LangGraph Orchestration — Multi-Agent Feedback Evaluation Pipeline

Executes 4 agents sequentially:
1. Extractor & Validator → validates relevance, translates, checks length
2. Quality Evaluator → scores on 4 criteria (90 pts max)
3. Diversity Classifier → adds bonus (0-10 pts)
4. Final Scorer → calculates total, applies caps, generates justification
"""

from typing import TypedDict, Optional
from agents.agent_extractor import run_extractor
from agents.agent_quality import run_quality_evaluator
from agents.agent_diversity import run_diversity_classifier
from agents.agent_scorer import run_final_scorer


class EvaluationState(TypedDict):
    """State flowing through the agent pipeline."""
    feedback_id: str
    feedback_text: str
    aspect_name: str
    aspect_id: str
    campaign_title: str
    # Agent 1 outputs
    is_relevant: Optional[bool]
    is_short: Optional[bool]
    translated_text: Optional[str]
    # Agent 2 outputs
    depth: Optional[int]
    specificity: Optional[int]
    coherence: Optional[int]
    relevance: Optional[int]
    is_trash: Optional[bool]
    # Agent 3 outputs
    diversity_bonus: Optional[int]
    # Agent 4 outputs
    total_score: Optional[int]
    status: Optional[str]
    justification: Optional[str]


async def evaluate_feedback(
    feedback_id: str,
    feedback_text: str,
    aspect_name: str,
    aspect_id: str,
    campaign_title: str,
) -> dict:
    """
    Run the full 4-agent evaluation pipeline.
    Returns the final scoring result.
    """

    # ── Agent 1: Extractor & Validator ──
    extraction = await run_extractor(
        feedback_text=feedback_text,
        aspect_name=aspect_name,
        campaign_title=campaign_title,
    )

    # If not relevant → immediate discard with score 0
    if not extraction.get("is_relevant", True):
        return {
            "depth": 0,
            "specificity": 0,
            "coherence": 0,
            "relevance": 0,
            "diversity": 0,
            "total_score": 0,
            "status": "DISCARDED",
            "justification": f"Feedback rechazado: no es relevante al aspecto '{aspect_name}'. {extraction.get('rejection_reason', '')}",
        }

    # Use translated text if available
    processed_text = extraction.get("translated_text", feedback_text)
    is_short = extraction.get("is_short", False)

    # ── Agent 2: Quality Evaluator ──
    quality = await run_quality_evaluator(
        feedback_text=processed_text,
        aspect_name=aspect_name,
        campaign_title=campaign_title,
        is_short=is_short,
    )

    is_trash = quality.get("is_trash", False)

    # ── Agent 3: Diversity Classifier ──
    diversity = await run_diversity_classifier(
        aspect_id=aspect_id,
        is_trash=is_trash,
    )

    # ── Agent 4: Final Scorer ──
    result = await run_final_scorer(
        feedback_text=processed_text,
        aspect_name=aspect_name,
        depth=quality["depth"],
        specificity=quality["specificity"],
        coherence=quality["coherence"],
        relevance=quality["relevance"],
        diversity_bonus=diversity["diversity_bonus"],
        is_trash=is_trash,
    )

    return result
