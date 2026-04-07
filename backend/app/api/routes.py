from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_current_user
from app.core.security import create_access_token
from app.schemas.request import PredictRequest, PredictStoreRequest, UserCreate, UserLogin
from app.schemas.response import (
    AnalyticsResponse,
    HealthResponse,
    PredictResponse,
    PredictStoreResponse,
    ProfileResponse,
    Token,
    VerifyRecordResponse,
)
from app.services.analytics_service import analytics_service
from app.services.ai_agent_service import get_ai_assistant_analysis
from app.services.blockchain_service import get_result, store_result
from app.services.ml_service import get_prediction
from app.services.user_service import user_store
from app.utils.hashing import generate_text_hash


router = APIRouter()


@router.get("/health", response_model=HealthResponse, tags=["system"])
def health_check() -> HealthResponse:
    return HealthResponse(status="ok")


@router.get("/profile", response_model=ProfileResponse, tags=["auth"])
def profile(current_user: dict = Depends(get_current_user)) -> ProfileResponse:
    return ProfileResponse(
        username=current_user["username"],
        role=current_user["role"],
        history=[],
    )


@router.get("/analytics", response_model=AnalyticsResponse, tags=["analytics"])
def analytics(current_user: dict = Depends(get_current_user)) -> AnalyticsResponse:
    return AnalyticsResponse(**analytics_service.get_summary())


@router.get("/verify/{text_hash}", response_model=VerifyRecordResponse, tags=["blockchain"])
def verify_hash(text_hash: str) -> VerifyRecordResponse:
    record = get_result(text_hash)
    if record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Verification record not found.",
        )
    return VerifyRecordResponse(**record)


@router.post("/predict", response_model=PredictResponse, tags=["prediction"])
def predict_news(payload: PredictRequest) -> PredictResponse:
    result = get_prediction(
        text=payload.text,
        subject=payload.subject,
        context=payload.context,
        speaker=payload.speaker,
        party_affiliation=payload.party_affiliation,
        job_title=payload.job_title,
        state_info=payload.state_info,
    )
    if not result.get("error"):
        result["ai_analysis"] = get_ai_assistant_analysis(payload.text, result)
        analytics_service.record_prediction(result)
    return PredictResponse(**result)


@router.post(
    "/predict-and-store",
    response_model=PredictStoreResponse,
    tags=["prediction"],
)
def predict_and_store(
    payload: PredictStoreRequest,
    current_user: dict = Depends(get_current_user),
) -> PredictStoreResponse:
    result = get_prediction(
        text=payload.text,
        subject=payload.subject,
        context=payload.context,
        speaker=payload.speaker,
        party_affiliation=payload.party_affiliation,
        job_title=payload.job_title,
        state_info=payload.state_info,
    )
    if result.get("error"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["error"],
        )
    result["ai_analysis"] = get_ai_assistant_analysis(payload.text, result)
    analytics_service.record_prediction(result)

    text_hash = generate_text_hash(payload.text)
    chain_result = store_result(text_hash, result["label"], result["confidence"])

    return PredictStoreResponse(
        **result,
        hash=text_hash,
        txHash=chain_result["txHash"],
        blockNumber=chain_result.get("blockNumber"),
    )


@router.post("/auth/signup", response_model=Token, tags=["auth"])
def signup(payload: UserCreate) -> Token:
    try:
        user = user_store.create_user(
            username=payload.username,
            password=payload.password,
            role=payload.role or "user",
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    token = create_access_token(subject=user.username, role=user.role)
    return Token(access_token=token, token_type="bearer")


@router.post("/auth/login", response_model=Token, tags=["auth"])
def login(payload: UserLogin) -> Token:
    user = user_store.authenticate(payload.username, payload.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password.",
        )

    token = create_access_token(subject=user.username, role=user.role)
    return Token(access_token=token, token_type="bearer")
