import sys
import os

# Clean import path generation:
# ML model code inside `backend/ml_models/src` depends on `src.something` being in the python path.
ml_models_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../ml_models'))
if ml_models_path not in sys.path:
    # Prepend to path to ensure we hit the ml_models directory first
    sys.path.insert(0, ml_models_path)

# Now standard ML file imports succeed without modifying any code inside them!
from src.inference import server, predict

# We also ensure the Singleton server knows the exact absolute path to its required pickled items
absolute_model_dir = os.path.join(ml_models_path, 'model_pipeline')
server.model_dir = absolute_model_dir


def _build_explanation(label: str, important_words: list[str]) -> str:
    if not important_words:
        return (
            "The model relied on its overall language and context patterns to reach this result."
        )

    joined_keywords = ", ".join(important_words[:3])
    if label == "FAKE":
        return (
            f"This article leans FAKE because the language pattern around {joined_keywords} "
            "looks sensational or weakly grounded in verifiable evidence."
        )
    return (
        f"This article leans REAL because the language pattern around {joined_keywords} "
        "looks more consistent with grounded and verifiable reporting."
    )

def build_model_input(
    text: str,
    subject: str | None = None,
    context: str | None = None,
    speaker: str | None = None,
    party_affiliation: str | None = None,
    job_title: str | None = None,
    state_info: str | None = None,
) -> str:
    """
    Build an inference string that matches the richer LIAR-style training text
    when optional metadata is available, while remaining backward compatible
    with plain free-form article text.
    """
    text = text or ""
    extras = []
    if subject:
        extras.append(f"[SUBJECT] {subject}")
    if context:
        extras.append(f"[CONTEXT] {context}")
    if speaker:
        extras.append(f"[SPEAKER] {speaker}")
    if party_affiliation:
        extras.append(f"[PARTY] {party_affiliation}")
    if job_title:
        extras.append(f"[ROLE] {job_title}")
    if state_info:
        extras.append(f"[STATE] {state_info}")
    return " ".join([text.strip(), *extras]).strip()

def load_ml_models():
    """Trigger the singleton model loading to avoid cold starts."""
    server.load_models()

def get_prediction(
    text: str,
    subject: str | None = None,
    context: str | None = None,
    speaker: str | None = None,
    party_affiliation: str | None = None,
    job_title: str | None = None,
    state_info: str | None = None,
) -> dict:
    """Pass user text straight through the ML predictor"""
    try:
        if not text or len(text.strip()) == 0:
            return {"label": "FAKE", "confidence": 0.0, "error": "Text cannot be empty"}

        model_input = build_model_input(
            text=text,
            subject=subject,
            context=context,
            speaker=speaker,
            party_affiliation=party_affiliation,
            job_title=job_title,
            state_info=state_info,
        )
        result = predict(model_input)
        result["important_words"] = result.get("important_words") or []
        result["explanation"] = _build_explanation(
            result.get("label", "UNKNOWN"),
            result["important_words"],
        )
        return result
    except Exception as e:
        return {"label": "ERROR", "confidence": 0.0, "error": str(e)}
