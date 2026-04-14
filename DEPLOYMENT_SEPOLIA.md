# Sepolia Deployment Guide

This project is already working locally. The next step is to make it a real DApp by moving the blockchain layer to Ethereum Sepolia and then pointing the backend and frontend to the live services.

## Phase 1: Deploy the Smart Contract to Sepolia

### 1. Get Sepolia infrastructure

- Create an RPC endpoint from Alchemy or Infura
- Create a wallet dedicated to deployment
- Fund that wallet with Sepolia ETH from a faucet

### 2. Configure blockchain env

Copy:

- [blockchain/.env.example](C:/Users/parth/Downloads/News%20App/blockchain/.env.example)

to:

- `blockchain/.env`

Then set:

- `PRIVATE_KEY=your_deployer_wallet_private_key`
- `SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/...` or Alchemy equivalent
- `RPC_URL=` optional shared fallback

### 3. Install and deploy

From [blockchain](C:/Users/parth/Downloads/News%20App/blockchain):

```powershell
corepack pnpm install
corepack pnpm compile
corepack pnpm deploy:sepolia
```

### 4. Save deployment output

After deployment, copy the address from:

- [blockchain/deployments/sepolia.json](C:/Users/parth/Downloads/News%20App/blockchain/deployments)

You will use that contract address in the backend.

## Phase 2: Point the Backend to Sepolia

### 1. Configure backend env

Copy:

- [backend/.env.example](C:/Users/parth/Downloads/News%20App/backend/.env.example)

to:

- `backend/.env`

Set at minimum:

- `SECRET_KEY=strong_random_secret`
- `RPC_URL=your_sepolia_rpc_url`
- `PRIVATE_KEY=your_deployer_wallet_private_key`
- `CONTRACT_ADDRESS=your_deployed_sepolia_contract`
- `CHAIN_ID=11155111`
- `BACKEND_CORS_ORIGINS=https://your-frontend-domain.vercel.app`

Optional:

- `BLOCKCHAIN_ARTIFACT_PATH=` only if you move the contract artifact

### 2. Install backend deps

From [backend](C:/Users/parth/Downloads/News%20App/backend):

```powershell
py -3.13 -m pip install -r requirements.txt
```

### 3. Start and verify

```powershell
py -3.13 -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Then verify:

- `GET /health`
- `POST /auth/signup`
- `POST /predict`
- `POST /predict-and-store`
- `GET /verify/{hash}`

When `RPC_URL`, `PRIVATE_KEY`, and `CONTRACT_ADDRESS` are set correctly, `/predict-and-store` will stop using the local fallback and will write to Sepolia.

## Phase 3: Deploy the Backend Publicly

Recommended first option:

- Render
- Railway

Set these environment variables in the provider dashboard:

- `SECRET_KEY`
- `BACKEND_CORS_ORIGINS`
- `RPC_URL`
- `PRIVATE_KEY`
- `CONTRACT_ADDRESS`
- `CHAIN_ID=11155111`

Suggested start command:

```powershell
py -3.13 -m uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Important:

- never commit `.env`
- use a dedicated deployment wallet
- keep `PRIVATE_KEY` only in the hosting provider secret store

## Phase 4: Deploy the Frontend Publicly

Recommended host:

- Vercel

Copy:

- [frontend/.env.example](C:/Users/parth/Downloads/News%20App/frontend/.env.example)

to:

- `frontend/.env`

For production set:

- `VITE_API_URL=https://your-backend-domain`

Then deploy [frontend](C:/Users/parth/Downloads/News%20App/frontend) to Vercel and add:

- `VITE_API_URL`

as a Vercel environment variable.

## Phase 5: Post-Deployment Verification Checklist

### Blockchain

- contract is deployed on Sepolia
- contract address is saved
- `GET /verify/{hash}` returns live chain data

### Backend

- health endpoint is public
- auth works from the frontend domain
- `/predict-and-store` returns a real transaction hash

### Frontend

- signup and login work
- verify and verify-and-store work
- dashboard loads
- public verify page can fetch a stored hash

## Recommended Immediate Next Action

1. Fill `blockchain/.env`
2. Run `corepack pnpm deploy:sepolia`
3. Put the resulting address into `backend/.env`
4. Start the backend and test `/predict-and-store`

That is the smallest path from local demo to live Sepolia DApp behavior.

## Next Guide

After Sepolia is working locally, continue with:

- [DEPLOYMENT_CLOUD.md](C:/Users/parth/Downloads/News%20App/DEPLOYMENT_CLOUD.md)
