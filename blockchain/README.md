# News Verification Blockchain Module

Minimal Hardhat project for storing fake-news verification proofs on-chain.

## Contract

- [NewsVerification.sol](C:/Users/parth/Downloads/News%20App/blockchain/contracts/NewsVerification.sol)
- Stores only a content hash, result label, confidence score, and timestamp
- Avoids loops and full-text storage for lower gas usage

## Setup

1. Copy [blockchain/.env.example](C:/Users/parth/Downloads/News%20App/blockchain/.env.example) to `.env`
2. Install dependencies:
   `corepack pnpm install`
3. Compile:
   `corepack pnpm compile`
4. Deploy to Sepolia:
   `corepack pnpm deploy:sepolia`
5. Deploy to Mumbai:
   `corepack pnpm deploy:mumbai`

## Deployment Output

After deployment, the script writes:

- contract address
- ABI

to `deployments/<network>.json`.

## Recommended Network

Use `Sepolia` first for live rollout.

## Backend Integration

The FastAPI backend reads:

- `RPC_URL`
- `PRIVATE_KEY`
- `CONTRACT_ADDRESS`
- `CHAIN_ID`

If those variables are missing, the backend falls back to a local development mock so the API remains usable before deployment.

## Full Rollout Guide

See:

- [DEPLOYMENT_SEPOLIA.md](C:/Users/parth/Downloads/News%20App/DEPLOYMENT_SEPOLIA.md)
