import os
from pathlib import Path

from dotenv import load_dotenv


load_dotenv(Path(__file__).resolve().parents[2] / ".env", override=True)
DEFAULT_SECRET_KEY = "b398df90-a39c-4903-a447-3807d4b0f9f3_development_key"

class Settings:
    PROJECT_NAME: str = "Tez News API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = ""
    APP_ENV: str = os.getenv("APP_ENV", "development").lower()
    BACKEND_CORS_ORIGINS: list[str] = [
        origin.strip()
        for origin in os.getenv(
            "BACKEND_CORS_ORIGINS",
            "http://localhost,http://127.0.0.1,http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173",
        ).split(",")
        if origin.strip()
    ]
    
    # JWT Config
    SECRET_KEY: str = os.getenv("SECRET_KEY", DEFAULT_SECRET_KEY)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    SQLITE_PATH: str = os.getenv(
        "SQLITE_PATH",
        str(Path(__file__).resolve().parents[2] / "data" / "tez_news.db"),
    )
    BLOCKCHAIN_RPC_URL: str = os.getenv("RPC_URL", "")
    BLOCKCHAIN_PRIVATE_KEY: str = os.getenv("PRIVATE_KEY", "")
    BLOCKCHAIN_CONTRACT_ADDRESS: str = os.getenv("CONTRACT_ADDRESS", "")
    BLOCKCHAIN_CHAIN_ID: int = int(os.getenv("CHAIN_ID", "11155111"))
    BLOCKCHAIN_ARTIFACT_PATH: str = os.getenv(
        "BLOCKCHAIN_ARTIFACT_PATH",
        os.path.abspath(
            os.path.join(
                os.path.dirname(__file__),
                "../../../blockchain/artifacts/contracts/NewsVerification.sol/NewsVerification.json",
            )
        ),
    )
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
    GEMINI_API_BASE: str = os.getenv(
        "GEMINI_API_BASE",
        "https://generativelanguage.googleapis.com/v1beta",
    )
    GEMINI_TIMEOUT_SECONDS: float = float(os.getenv("GEMINI_TIMEOUT_SECONDS", "12"))
    GEMINI_USE_GOOGLE_SEARCH: bool = os.getenv("GEMINI_USE_GOOGLE_SEARCH", "true").lower() == "true"

    def validate_for_runtime(self) -> None:
        if self.APP_ENV == "production" and self.SECRET_KEY == DEFAULT_SECRET_KEY:
            raise ValueError("SECRET_KEY must be set to a strong unique value in production.")

settings = Settings()
