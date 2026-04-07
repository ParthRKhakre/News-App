# Fake News Detection - FastAPI Backend

This is the production-ready backend connecting the advanced ML Pipeline with REST API Endpoints. It incorporates predictive machine learning interfaces, early-stage blockchain configuration services, and JWT authentication structures. 

## Run the API
1. Install requirements:
`pip install -r requirements.txt`
2. Start the Uvicorn Server:
`uvicorn app.main:app --reload`
3. Access API docs at `http://localhost:8000/docs`.

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

For production:

- do not use the default `SECRET_KEY`
- mount a persistent disk and point `SQLITE_PATH` to it
- store all secrets only in the provider secret store

## Integration Capabilities
- `/predict` calculates contextual models on text parameters for FAKE vs REAL responses.
- Models are initialized via the Singleton sequence during FastAPI startup (zero-cost on user hit).

## Deployment

For Sepolia rollout and cloud deployment steps, see:

- [DEPLOYMENT_SEPOLIA.md](C:/Users/parth/Downloads/News%20App/DEPLOYMENT_SEPOLIA.md)
