# Cloud Deployment Guide

This guide picks up after Sepolia contract deployment and focuses on making the project publicly accessible.

## Current Live Blockchain State

- Network: `Ethereum Sepolia`
- Contract: `0x800D505FdD65cA5c09B9067Fcd22F8F0aEf2b382`
- Deployment metadata: [sepolia.json](C:/Users/parth/Downloads/News%20App/blockchain/deployments/sepolia.json)

Before any public deployment, rotate the exposed deployment wallet private key and Alchemy RPC key, then update:

- [blockchain/.env](C:/Users/parth/Downloads/News%20App/blockchain/.env)
- [backend/.env](C:/Users/parth/Downloads/News%20App/backend/.env)

## 1. Deploy Backend to Render

Render config file:

- [render.yaml](C:/Users/parth/Downloads/News%20App/render.yaml)

### Recommended Render setup

1. Push the repository to GitHub
2. Create a new Render web service
3. Use the repo root and let Render detect [render.yaml](C:/Users/parth/Downloads/News%20App/render.yaml)
4. Set secret env vars in Render:
   - `APP_ENV=production`
   - `SECRET_KEY`
   - `BACKEND_CORS_ORIGINS`
   - `SQLITE_PATH=/opt/render/project/data/tez_news.db`
   - `RPC_URL`
   - `PRIVATE_KEY`
   - `CONTRACT_ADDRESS`
   - `CHAIN_ID=11155111`
   - `GEMINI_API_KEY`
   - `GEMINI_MODEL=gemini-flash-latest`
   - `GEMINI_TIMEOUT_SECONDS=30`
   - `GEMINI_USE_GOOGLE_SEARCH=true`

### Backend CORS for production

Set `BACKEND_CORS_ORIGINS` to your frontend domain, for example:

```env
BACKEND_CORS_ORIGINS=https://your-app.vercel.app,http://localhost:5173,http://127.0.0.1:5173
```

### Backend persistence on Render

The backend now uses SQLite for users and analytics, so attach a persistent disk and set:

```env
SQLITE_PATH=/opt/render/project/data/tez_news.db
```

### Backend health verification

After deploy, confirm:

- `GET https://your-render-domain/health`
- `GET https://your-render-domain/docs`

## 2. Deploy Frontend to Vercel

Frontend config:

- [frontend/vercel.json](C:/Users/parth/Downloads/News%20App/frontend/vercel.json)

### Recommended Vercel setup

1. Import the GitHub repo into Vercel
2. Set the root directory to:
   - `frontend`
3. Set environment variable:
   - `VITE_API_URL=https://your-render-domain`

### Build settings

- Framework: Vite
- Build command: `corepack pnpm build`
- Output directory: `dist`

## 3. Post-Deploy Verification

### Frontend

- signup works
- login works
- feed loads
- dashboard loads
- verify page resolves hashes

### Backend

- `/predict` returns ML output
- `/predict-and-store` returns a live Sepolia transaction hash
- `/verify/{hash}` returns chain-backed data

### Blockchain

Check the returned `txHash` on a Sepolia explorer after each store operation.

## 4. Recommended Immediate Checklist

1. Rotate the exposed wallet and Alchemy key
2. Update [backend/.env](C:/Users/parth/Downloads/News%20App/backend/.env) locally
3. Push the repository to GitHub
4. Deploy backend on Render
5. Deploy frontend on Vercel
6. Run one real `Verify & Store` transaction from the public app
