import json
import re
from typing import Any

import httpx

from app.core.config import settings


def _extract_json_text(payload: dict[str, Any]) -> str | None:
    candidates = payload.get("candidates") or []
    if not candidates:
        return None
    content = candidates[0].get("content") or {}
    parts = content.get("parts") or []
    texts = [part.get("text", "") for part in parts if isinstance(part, dict)]
    joined = "\n".join(text for text in texts if text).strip()
    return joined or None


def _normalize_analysis(data: dict[str, Any]) -> dict[str, Any]:
    def _listify(value: Any) -> list[str]:
        if not value:
            return []
        if isinstance(value, list):
            return [str(item).strip() for item in value if str(item).strip()]
        return [str(value).strip()]

    confidence = data.get("second_opinion_confidence")
    try:
        confidence = None if confidence is None else round(float(confidence), 4)
    except (TypeError, ValueError):
        confidence = None

    label = data.get("second_opinion_label")
    if isinstance(label, str):
        label = label.strip().upper() or None

    return {
        "provider": "gemini",
        "model": settings.GEMINI_MODEL,
        "grounded": bool(data.get("grounded", False)),
        "search_queries": _listify(data.get("search_queries")),
        "sources": data.get("sources") or [],
        "summary": str(data.get("summary", "")).strip(),
        "suspicious_signals": _listify(data.get("suspicious_signals")),
        "verification_guidance": _listify(data.get("verification_guidance")),
        "contradiction_risk": str(data.get("contradiction_risk", "")).strip(),
        "second_opinion_label": label,
        "second_opinion_confidence": confidence,
        "note": str(data.get("note", "")).strip() or None,
    }


def _extract_json_object(raw_text: str) -> dict[str, Any] | None:
    raw_text = raw_text.strip()
    if not raw_text:
        return None

    try:
        return json.loads(raw_text)
    except json.JSONDecodeError:
        pass

    fenced = re.search(r"```json\s*(\{.*?\})\s*```", raw_text, flags=re.DOTALL)
    if fenced:
        try:
            return json.loads(fenced.group(1))
        except json.JSONDecodeError:
            return None

    match = re.search(r"(\{.*\})", raw_text, flags=re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            return None
    return None


def _build_prompt(article_text: str, ml_result: dict[str, Any]) -> str:
    important_words = ", ".join(ml_result.get("important_words") or []) or "None"
    breakdown = ", ".join(
        f"{model}: {label}"
        for model, label in (ml_result.get("model_breakdown") or {}).items()
    ) or "Not available"

    return (
        "You are assisting a fake-news detection platform.\n"
        "You are not the final classifier. Use the provided article text, ML output, and live web evidence "
        "when available to produce a careful assistant analysis. Do not invent external facts. If evidence is missing, say so.\n\n"
        "Return JSON only with these keys:\n"
        "grounded, search_queries, sources, summary, suspicious_signals, verification_guidance, contradiction_risk, "
        "second_opinion_label, second_opinion_confidence, note\n\n"
        "Rules:\n"
        "- grounded: true if Google Search grounding was used, else false\n"
        "- search_queries: array of the search queries you effectively used or would use\n"
        "- sources: array of objects with title and url from grounded web evidence\n"
        "- suspicious_signals: array of 2 to 4 concise strings\n"
        "- verification_guidance: array of 2 to 4 concise strings\n"
        "- contradiction_risk: one short paragraph\n"
        "- second_opinion_label: FAKE, REAL, or UNCERTAIN\n"
        "- second_opinion_confidence: number between 0 and 1\n"
        "- note: short disclaimer about limits of the AI analysis\n\n"
        "Prefer trustworthy reporting or official sources when grounding with web search.\n\n"
        f"ML label: {ml_result.get('label')}\n"
        f"ML confidence: {ml_result.get('confidence')}\n"
        f"ML explanation: {ml_result.get('explanation')}\n"
        f"Important words: {important_words}\n"
        f"Model breakdown: {breakdown}\n\n"
        f"Article text:\n{article_text}"
    )


def _unavailable_analysis(message: str) -> dict[str, Any]:
    return {
        "provider": "gemini",
        "model": settings.GEMINI_MODEL,
        "grounded": False,
        "search_queries": [],
        "sources": [],
        "summary": "Gemini AI analysis is currently unavailable for this request.",
        "suspicious_signals": [],
        "verification_guidance": [],
        "contradiction_risk": "No live Gemini contradiction summary could be generated right now.",
        "second_opinion_label": "UNCERTAIN",
        "second_opinion_confidence": None,
        "note": message,
    }


def _extract_grounding(payload: dict[str, Any]) -> dict[str, Any]:
    candidates = payload.get("candidates") or []
    if not candidates:
        return {"grounded": False, "search_queries": [], "sources": []}

    grounding = candidates[0].get("groundingMetadata") or {}
    queries = grounding.get("webSearchQueries") or []
    sources = []
    for chunk in grounding.get("groundingChunks") or []:
        web = chunk.get("web") if isinstance(chunk, dict) else None
        if not isinstance(web, dict):
            continue
        url = str(web.get("uri", "")).strip()
        title = str(web.get("title", "")).strip() or url
        if not url:
            continue
        candidate = {"title": title, "url": url}
        if candidate not in sources:
            sources.append(candidate)

    return {
        "grounded": bool(queries or sources),
        "search_queries": [str(query).strip() for query in queries if str(query).strip()],
        "sources": sources[:6],
    }


def is_ai_assistant_enabled() -> bool:
    return bool(settings.GEMINI_API_KEY)


def get_ai_assistant_analysis(article_text: str, ml_result: dict[str, Any]) -> dict[str, Any] | None:
    if not is_ai_assistant_enabled():
        return None

    endpoint = (
        f"{settings.GEMINI_API_BASE}/models/{settings.GEMINI_MODEL}:generateContent"
        f"?key={settings.GEMINI_API_KEY}"
    )
    request_payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": _build_prompt(article_text, ml_result),
                    }
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
        },
    }
    if settings.GEMINI_USE_GOOGLE_SEARCH:
        request_payload["tools"] = [{"google_search": {}}]

    try:
        with httpx.Client(timeout=settings.GEMINI_TIMEOUT_SECONDS) as client:
            response = client.post(
                endpoint,
                headers={
                    "Content-Type": "application/json",
                    "X-goog-api-key": settings.GEMINI_API_KEY,
                },
                json=request_payload,
            )
            response.raise_for_status()
    except httpx.HTTPStatusError as exc:
        details = ""
        try:
            payload = exc.response.json()
            details = payload.get("error", {}).get("message", "")
        except Exception:
            details = exc.response.text

        if exc.response.status_code == 429:
            return _unavailable_analysis(
                f"Gemini quota is exhausted for the configured project. {details}".strip()
            )
        if exc.response.status_code in {401, 403}:
            return _unavailable_analysis(
                "Gemini API key is not authorized for this project or billing tier."
            )
        return _unavailable_analysis("Gemini returned an HTTP error while generating analysis.")
    except Exception:
        return _unavailable_analysis("Gemini could not be reached from the backend.")

    response_payload = response.json()
    raw_text = _extract_json_text(response_payload)
    if not raw_text:
        return _unavailable_analysis("Gemini returned an empty response.")

    parsed = _extract_json_object(raw_text)
    if parsed is None:
        return _unavailable_analysis("Gemini returned a non-JSON response.")

    parsed.update(_extract_grounding(response_payload))
    return _normalize_analysis(parsed)
