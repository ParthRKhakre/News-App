# Tez News Frontend

React + Vite frontend for the Fake News Detection platform.

## Run locally

1. Install dependencies:
   `npm install`
2. Start the dev server:
   `npm run dev`
3. Build for production:
   `npm run build`

## Environment

Copy [frontend/.env.example](C:/Users/parth/Downloads/News%20App/frontend/.env.example) to `.env` with:

`VITE_API_URL=http://localhost:8000`

## Features

- JWT auth with protected routes
- Inshorts-style scroll-snapping feed
- Prediction and blockchain verification modals
- Profile history and local prediction caching
- Mobile-first Tailwind UI

## Deployment

For production rollout with a Sepolia-backed backend, see:

- [DEPLOYMENT_SEPOLIA.md](C:/Users/parth/Downloads/News%20App/DEPLOYMENT_SEPOLIA.md)
