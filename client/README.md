# Hotel Menu Order App — Client

This folder contains the frontend for the Hotel Menu Order App built with React and Vite.

## Overview
- Single-page React app using Vite for development and build.
- Uses Tailwind and Framer Motion for UI and animations.
- Communicates with the backend API via environment-configured base URLs.

## Prerequisites
- Node.js 18+ and npm (or compatible Node manager)

## Environment
Copy `.env.example` to `.env` and set the API URLs:

- `VITE_API_URL_DEV` — backend base URL used during local development
- `VITE_API_URL_PROD` — backend base URL for production builds (deployed site)

Example (`.env`):

VITE_API_URL_DEV="http://localhost:5000"
VITE_API_URL_PROD="https://your-production-backend.example.com"

Note: Vite only exposes env vars prefixed with `VITE_` to the client.

## Install
From the `client` directory:

```bash
npm install
```

## Run
- Development server (hot reload):

```bash
npm run dev
```

- Build for production:

```bash
npm run build
```

- Preview production build locally:

```bash
npm run preview
```

## Available NPM Scripts
- `dev` — runs the Vite dev server
- `build` — builds a production bundle with Vite
- `preview` — locally serves the production build
- `lint` — run ESLint across the project

## Key Files & Structure
- `index.html` — single-page HTML entry
- `src/main.jsx` — React app bootstrap
- `src/App.jsx` — top-level app component
- `src/index.css` / `src/App.css` — global and app styles
- `src/components/` — UI components (e.g. `Menu.jsx`, `Cart.jsx`, `Login.jsx`, `Admin.jsx`, etc.)
- `src/context/AuthContext.jsx` — authentication context and provider
- `src/services/api.js` — API helper configured with `VITE_API_URL_*`
- `src/services/helper.js` — additional helpers used by UI
- `src/utils/session.js` — session helpers

## Local Full-Stack Development
1. Start the backend server (from the `server` directory):

```bash
cd server
npm run dev
```

2. Start the frontend (from the `client` directory):

```bash
cd client
npm run dev
```

The frontend will use `VITE_API_URL_DEV` to contact the backend.

## Deployment (Vercel)
- The project includes `vercel.json` files for both client and server.
- Set the `VITE_API_URL_PROD` and backend environment variables in Vercel's dashboard for the respective deployments.
- Build the client (`npm run build`) and deploy the static output, or let Vercel handle build and publish automatically.

## Notes
- ESLint and TypeScript type definitions are included for improved DX (no strict TS compilation enforced).
- If you change env variable names, update `src/services/api.js` accordingly.
