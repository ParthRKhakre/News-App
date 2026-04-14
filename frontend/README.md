# Tez News Frontend

React + Vite frontend for the Tez News fake news detection platform.

## Features

- JWT auth flow with protected routes
- premium feed UI with collapsible sidebar
- inshorts-style card browsing
- result modal with:
  - news summary
  - ML prediction
  - Gemini analysis
  - share report action
  - save for later
- blockchain modal with pending / confirmed transaction state
- searchable verification history
- saved items view
- dark mode

## Run Locally

```powershell
corepack pnpm install
corepack pnpm dev --host 127.0.0.1 --port 5173
```

Build:

```powershell
corepack pnpm build
```

## Environment

Copy [frontend/.env.example](C:/Users/parth/Downloads/News%20App/frontend/.env.example) to `.env`:

```env
VITE_API_URL=http://localhost:8000
```

## Notes

- Gemini keys are not needed in the frontend
- blockchain interactions are mediated through the backend
- bookmarks, prediction cache, and session-facing history are stored client-side in the current UX layer

## Deployment

Recommended:

- Frontend: Vercel
- Backend: Railway or Render

Deployment references:

- [DEPLOYMENT_CLOUD.md](C:/Users/parth/Downloads/News%20App/DEPLOYMENT_CLOUD.md)
- [DEPLOYMENT_SEPOLIA.md](C:/Users/parth/Downloads/News%20App/DEPLOYMENT_SEPOLIA.md)
