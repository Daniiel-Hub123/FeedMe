"""
Agent 2 — Quality Evaluator

Evaluates 4 quality criteria (max 90 pts total):
- Depth (35 pts): 0-10 (no development), 11-20 (superficial), 21-28 (real context), 29-35 (complete analysis)
- Specificity (25 pts): 0-8 (generalities), 9-16 (some details), 17-22 (concrete data), 23-25 (numbers, comparisons)
- Coherence (20 pts): 0-5 (inconsistent), 6-12 (small inconsistencies), 13-17 (structured), 18-20 (perfectly clear)
- Relevance (10 pts): 0 (off-topic), 5 (partial deviation), 8 (mostly relevant), 10 (100% on aspect)

CRITICAL RULE - TRASH DETECTION:
If depth < 10 AND specificity < 8:
  → Max possible score capped at 24/100
  → Label: "Feedback Basura" (Trash Feedback)
"""

from langchain_core.messages import SystemMessage, HumanMessage
from langchain_openai import ChatOpenAI
from config import settings

llm = ChatOpenAI(
    model="gpt-4o",
    temperature=0,
    api_key=settings.openai_api_key,
)

SYSTEM_PROMPT = """You are a strict feedback quality evaluator. You must score the feedback on these 4 criteria:

**ASPECT being evaluated:** "{aspect_name}"
**Campaign:** "{campaign_title}"
**Is short feedback (< 50 words):** {is_short}

## Scoring Rubric

### Depth (0-35 points):
- 0-10: One-liner with no development
- 11-20: Superficial commentary
- 21-28: Real context and meaningful observations
- 29-35: Complete analysis with actionable insights

### Specificity (0-25 points):
- 0-8: Vague generalities
- 9-16: Some concrete details
- 17-22: Concrete data, examples
- 23-25: Numbers, comparisons, measurable data

### Coherence (0-20 points):
- 0-5: Inconsistent or contradictory
- 6-12: Small inconsistencies
- 13-17: Well structured
- 18-20: Perfectly clear and logical

### Relevance (0-10 points):
- 0: Completely off-topic
- 5: Partial deviation from aspect
- 8: Mostly relevant
- 10: 100% about the specified aspect

**IMPORTANT:** If the feedback was marked as "short" (< 50 words), apply a penalty to the depth score.
**BE STRICT.** Do not give high scores to generic or low-effort feedback.

Respond in this EXACT JSON format (no markdown, no extra text):
{{
  "depth": <0-35>,
  "specificity": <0-25>,
  "coherence": <0-20>,
  "relevance": <0-10>,
  "is_trash": <true if depth < 10 AND specificity < 8, false otherwise>,
  "quality_notes": "<brief explanation of scores>"
}}
"""


async def run_quality_evaluator(
    feedback_text: str,
    aspect_name: str,
    campaign_title: str,
    is_short: bool,
) -> dict:
    """Run Agent 2: Evaluate feedback quality on 4 criteria."""
    import json

    messages = [
        SystemMessage(
            content=SYSTEM_PROMPT.format(
                aspect_name=aspect_name,
                campaign_title=campaign_title,
                is_short=str(is_short),
            )
        ),
        HumanMessage(content=f"Feedback to evaluate:\n\n{feedback_text}"),
    ]

    response = await llm.ainvoke(messages)

    try:
        content = response.content.strip()
        if content.startswith("```"):
            content = content.split("\n", 1)[1]
            content = content.rsplit("```", 1)[0]
        result = json.loads(content)
    except json.JSONDecodeError:
        result = {
            "depth": 15,
            "specificity": 10,
            "coherence": 10,
            "relevance": 5,
            "is_trash": False,
            "quality_notes": "Could not parse evaluator response, using defaults.",
        }

    # Enforce trash detection rule
    if result["depth"] < 10 and result["specificity"] < 8:
        result["is_trash"] = True

    # Clamp values to valid ranges
    result["depth"] = max(0, min(35, result["depth"]))
    result["specificity"] = max(0, min(25, result["specificity"]))
    result["coherence"] = max(0, min(20, result["coherence"]))
    result["relevance"] = max(0, min(10, result["relevance"]))

    return result
