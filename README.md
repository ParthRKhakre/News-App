# Tez News

Tez News is a full-stack AI-powered fake news detection and verification platform. It combines machine learning, explainable AI, a FastAPI backend, a React frontend, Gemini-assisted analysis, and blockchain-backed proof storage on Ethereum Sepolia.

The app helps users:

- check whether a story is likely `FAKE` or `REAL`
- understand why the system made that prediction
- review a short summary before reading the full article
- save suspicious stories for later
- share verification reports
- store verification proofs on-chain
- verify stored proofs publicly by hash

## Current Status

The project is working locally end to end and is organized for deployment:

- frontend, backend, ML, Gemini, and blockchain are integrated
- Sepolia contract flow is wired
- users and analytics persist through SQLite in the backend
- the frontend includes a redesigned premium UI shell
- prediction, bookmarking, history, sharing, and blockchain pending states are implemented

## Core Features

### Authentication

- JWT-based signup and login
- protected routes for app pages
- persisted local session handling

### News Verification

- inshorts-style feed with full-screen news cards
- manual story submission
- ML prediction with `FAKE` / `REAL` labels
- confidence score and model breakdown
- explainability via keywords and explanation text

### AI Assistance

- Gemini AI assistant layered on top of the core ML result
- AI summary of the story
- suspicious signal detection
- verification guidance
- contradiction / risk summary
- second opinion response

### Blockchain Verification

- stores content hash, result, confidence, and timestamp
- deployed for Ethereum Sepolia usage
- returns transaction hash and block status
- public verification by stored hash

### User Experience

- collapsible sidebar and premium feed card layout
- dark mode
- loading states and toasts
- save-for-later bookmarks
- searchable verification history
- shareable verification report from result modals
- transaction pending / confirmed messaging for blockchain writes

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- Axios
- React Router DOM
- Context API
- Framer Motion
- Recharts

### Backend

- FastAPI
- JWT Authentication
- passlib / bcrypt
- SQLite
- Web3.py

### Machine Learning

- LIAR dataset
- TF-IDF-based ensemble pipeline
- Logistic Regression
- Naive Bayes
- Random Forest
- explainability through important-word extraction

### AI Assistant

- Gemini API

### Blockchain

- Solidity
- Hardhat
- Ethereum Sepolia

## Project Structure

```text
News App/
├── backend/        # FastAPI backend, services, schemas, auth, blockchain bridge
├── blockchain/     # Solidity contract and Hardhat deployment setup
├── frontend/       # React + Vite frontend
├── src/            # Root ML experimentation and pipeline code
├── tests/          # Root ML / pipeline tests
├── DEPLOYMENT_CLOUD.md
├── DEPLOYMENT_SEPOLIA.md
└── README.md
```

## Main API Endpoints

- `GET /health`
- `POST /auth/signup`
- `POST /auth/login`
- `GET /profile`
- `POST /predict`
- `POST /predict-and-store`
- `GET /analytics`
- `GET /verify/{hash}`

## Local Development

### Backend

```powershell
cd "backend"
py -3.13 -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### Frontend

```powershell
cd "frontend"
corepack pnpm dev --host 127.0.0.1 --port 5173
```

Open:

- Frontend: [http://127.0.0.1:5173](http://127.0.0.1:5173)
- Backend docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

## Environment Setup

### Backend

Use [backend/.env.example](C:/Users/parth/Downloads/News%20App/backend/.env.example) and configure:

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

### Frontend

Use [frontend/.env.example](C:/Users/parth/Downloads/News%20App/frontend/.env.example):

```env
VITE_API_URL=http://localhost:8000
```

## Deployment

Recommended deployment path:

- Backend: Railway or Render
- Frontend: Vercel
- Blockchain: Ethereum Sepolia

Useful guides:

- [DEPLOYMENT_SEPOLIA.md](C:/Users/parth/Downloads/News%20App/DEPLOYMENT_SEPOLIA.md)
- [DEPLOYMENT_CLOUD.md](C:/Users/parth/Downloads/News%20App/DEPLOYMENT_CLOUD.md)

## Notes

- Rotate all exposed keys before public deployment
- SQLite is fine for portfolio/demo deployment, but PostgreSQL is the next upgrade for larger production use
- Gemini grounded web search depends on project quota and Google-side access
- ML classification is useful as an early credibility signal, but evidence-grounded verification is the strongest future direction
