"""
Agent 1 — Feedback Extractor & Validator

Rules:
1. Receives the full user feedback.
2. Verifies feedback talks about the chosen campaign aspect.
3. If NOT about the aspect → reject immediately → score 0 (DISCARDED).
4. If in another language → internally translate before evaluating.
5. If < 50 words → mark as "very short" → depth penalty.
6. Passes structurally validated feedback to Agent 2.
"""

from langchain_core.messages import SystemMessage, HumanMessage
from langchain_openai import ChatOpenAI
from config import settings

llm = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0,
    api_key=settings.openai_api_key,
)

SYSTEM_PROMPT = """You are a feedback validation agent. Your job is to analyze user feedback and determine:

1. **Relevance check**: Is the feedback actually about the specified aspect "{aspect_name}" of the product/service "{campaign_title}"?
   - If NOT about the aspect → set is_relevant=false
   
2. **Language**: If the feedback is in a language other than Spanish or English, translate it.

3. **Length**: Count the words. If fewer than 50 words, set is_short=true.

Respond in this EXACT JSON format (no markdown, no extra text):
{{
  "is_relevant": true/false,
  "is_short": true/false,
  "word_count": <number>,
  "translated_text": "<translated text if needed, otherwise original text>",
  "rejection_reason": "<reason if rejected, null otherwise>"
}}
"""


async def run_extractor(
    feedback_text: str,
    aspect_name: str,
    campaign_title: str,
) -> dict:
    """Run Agent 1: Extract and validate feedback."""
    import json

    messages = [
        SystemMessage(
            content=SYSTEM_PROMPT.format(
                aspect_name=aspect_name,
                campaign_title=campaign_title,
            )
        ),
        HumanMessage(content=f"Feedback to evaluate:\n\n{feedback_text}"),
    ]

    response = await llm.ainvoke(messages)
    
    try:
        # Clean up response - remove markdown code blocks if present
        content = response.content.strip()
        if content.startswith("```"):
            content = content.split("\n", 1)[1]
            content = content.rsplit("```", 1)[0]
        result = json.loads(content)
    except json.JSONDecodeError:
        # Fallback: assume it's relevant and process it
        result = {
            "is_relevant": True,
            "is_short": len(feedback_text.split()) < 50,
            "word_count": len(feedback_text.split()),
            "translated_text": feedback_text,
            "rejection_reason": None,
        }

    return result
