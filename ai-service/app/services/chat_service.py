"""
AI farmer assistant.

Per the spec (§12, §K, §28): the LLM here explains/adapts in
farmer-friendly language — it does not independently decide agricultural
actions. The system prompt instructs it to ground answers in the
structured farm context Node provides (soil/weather/crop/disease data
already computed by the app's own rules/ML in earlier phases), never
invent pesticide dosages or fabricate data not given to it, state
uncertainty plainly, and point to a local expert for serious cases.

Uses Hugging Face Inference Providers (the modern hosted-inference path,
requires HF_API_TOKEN) rather than a locally-run LLM: unlike Phase 8's
vision model, a small CPU-run open LLM would very likely produce poor
quality in Hindi/Marathi/Gujarati, which this feature explicitly needs.

Per-language model routing (live-verified against real Hindi/Marathi/
Gujarati questions, not assumed):
- No single free-tier model was reliably good across all three Indic
  languages. Qwen2.5-7B-Instruct gave good Hindi but consistently
  incoherent Marathi (off-topic, repetitive). google/gemma-2-9b-it gave
  excellent Hindi and good Marathi, but its Gujarati output was broken
  (stray non-Gujarati tokens mixed in). So each language is routed to
  whichever model tested well for it, rather than picking one default
  and accepting degraded quality for two of the four languages.
- English was NOT live-verified (HF's free Inference Providers credit
  was exhausted mid-testing -> 402 Payment Required on both models) and
  defaults to the Hindi/Marathi model as the closest verified proxy;
  re-verify once quota is available.
- Chosen models are not gated and were reachable via the free tier
  short of the credit limit; no local fallback exists here (see the
  module docstring above for why).
"""

import logging
from dataclasses import dataclass

from app.config import get_settings

logger = logging.getLogger(__name__)

LANGUAGE_NAMES = {
    "en": "English",
    "hi": "Hindi (हिन्दी)",
    "mr": "Marathi (मराठी)",
    "gu": "Gujarati (ગુજરાતી)",
}

# See module docstring: per-language routing based on live quality testing,
# not a single default. "en" is untested (quota ran out) and provisionally
# shares the hi/mr model as the best available proxy.
MODEL_BY_LANGUAGE = {
    "en": "google/gemma-2-9b-it",
    "hi": "google/gemma-2-9b-it",
    "mr": "google/gemma-2-9b-it",
    "gu": "Qwen/Qwen2.5-7B-Instruct",
}

SYSTEM_PROMPT_TEMPLATE = """You are a helpful, friendly assistant for small and marginal farmers in India.

Rules you must always follow:
- Respond in {language_name}, using simple, everyday words a farmer would use — avoid technical jargon.
- Keep answers short and practical (a few sentences, or a short list of steps).
- Ground your answer in the farm context given below when it's relevant to the question. Do not contradict it.
- Never invent specific pesticide or fertilizer dosages/quantities — if asked, give general guidance and recommend consulting a local agriculture expert or the product label for exact amounts.
- Never state a specific market price unless it is given to you in the context.
- If you are not confident about something, say so plainly instead of guessing.
- For serious or urgent-sounding problems (rapid crop death, suspected serious disease outbreak), recommend the farmer consult a local agriculture expert.

Farm context (may be partial or empty if not available):
{context}
"""


class ChatUnavailableError(Exception):
    """Raised when the hosted LLM can't be reached (missing token, network, quota, etc.)."""


@dataclass
class ChatMessage:
    role: str  # "user" | "assistant"
    content: str


@dataclass
class ChatReply:
    answer: str
    modelVersion: str


CHAT_TIMEOUT_SECONDS = 45


def _client_and_model(language: str):
    settings = get_settings()
    if not settings.hf_api_token:
        raise ChatUnavailableError("HF_API_TOKEN is not configured")

    from huggingface_hub import InferenceClient

    model_id = MODEL_BY_LANGUAGE.get(language, settings.chat_model_id)
    return InferenceClient(api_key=settings.hf_api_token, timeout=CHAT_TIMEOUT_SECONDS), model_id


def get_reply(
    question: str,
    language: str,
    context: str,
    history: list[ChatMessage],
) -> ChatReply:
    client, model_id = _client_and_model(language)

    language_name = LANGUAGE_NAMES.get(language, "English")
    system_prompt = SYSTEM_PROMPT_TEMPLATE.format(
        language_name=language_name,
        context=context.strip() if context.strip() else "(no farm context available)",
    )

    messages = [{"role": "system", "content": system_prompt}]
    for msg in history:
        messages.append({"role": msg.role, "content": msg.content})
    messages.append({"role": "user", "content": question})

    try:
        completion = client.chat.completions.create(
            model=model_id,
            messages=messages,
            max_tokens=500,
            temperature=0.4,
        )
    except Exception as exc:
        logger.warning("Chat LLM call failed (model=%s, language=%s): %s", model_id, language, exc)
        raise ChatUnavailableError(f"LLM call failed: {exc}") from exc

    answer = completion.choices[0].message.content
    return ChatReply(answer=answer, modelVersion=model_id)
