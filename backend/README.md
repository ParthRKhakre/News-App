# Tez News Backend

FastAPI backend for Tez News. It handles authentication, prediction, Gemini-assisted analysis, analytics, and blockchain verification.

## Responsibilities

- JWT-based auth
- user persistence via SQLite
- ML prediction requests
- Gemini assistant integration
- analytics aggregation
- blockchain write and verification bridge
- public verification lookup by hash

## Run Locally

```powershell
pip install -r requirements.txt
py -3.13 -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

API docs:

- [http://localhost:8000/docs](http://localhost:8000/docs)

## Environment

Copy [backend/.env.example](C:/Users/parth/Downloads/News%20App/backend/.env.example) to `.env` and configure:

- `APP_ENV`
- `SECRET_KEY`
- `BACKEND_CORS_ORIGINS`
- `SQLITE_PATH`
- `RPC_URL`
- `PRIVATE_KEY`
- `CONTRACT_ADDRESS`
- `CHAIN_ID`
- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `GEMINI_TIMEOUT_SECONDS`
- `GEMINI_USE_GOOGLE_SEARCH`

## Key Endpoints

- `GET /health`
- `POST /auth/signup`
- `POST /auth/login`
- `GET /profile`
- `POST /predict`
- `POST /predict-and-store`
- `GET /analytics`
- `GET /verify/{hash}`

## Notes

- `/predict-and-store` returns the transaction hash immediately; block confirmation can still be pending
- Gemini analysis depends on your configured project quota and access
- production startup enforces a non-default `SECRET_KEY`

## Deployment

See:

- [DEPLOYMENT_SEPOLIA.md](C:/Users/parth/Downloads/News%20App/DEPLOYMENT_SEPOLIA.md)
- [DEPLOYMENT_CLOUD.md](C:/Users/parth/Downloads/News%20App/DEPLOYMENT_CLOUD.md)
