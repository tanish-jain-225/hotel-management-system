# 🍽️ DineEase — Hotel Menu & Order Management System

Unified project documentation and quickstart for the DineEase repository. This README links into the `client` and `server` modules and provides a concise workflow for local development and deployment.

**Contents:** [Client README](client/README.md) • [Server README](server/README.md) • [Setup Guide](docs/SETUP.md)

---

## Overview

DineEase is a full-stack menu and order management system built with React (Vite) on the frontend and Node.js + Express on the backend, persisting data in MongoDB.

This repository contains two main runnable projects:

- `client/` — React SPA (UI, cart, auth)
- `server/` — Express API (menu, cart, orders, admin)

Both subprojects have their own `README.md` files that include details and examples. See the links at the top of this file.

---

## Quick Start (Local)

1. Clone the repository:

```bash
git clone https://github.com/tanish-jain-225/hotel-management-system.git
cd hotel-management-system
```

2. Start the backend (API):

```bash
cd server
npm install
# Copy .env.example → .env and set MONGO_URI and JWT_SECRET
npm run dev
```

3. Start the frontend (UI) in a separate terminal:

```bash
cd client
npm install
# Copy .env.example → .env and set VITE_API_URL_DEV to your backend URL
npm run dev
```

Open the app in your browser at the Vite dev server URL (usually http://localhost:5173).

---

## Environment variables

- `server/.env` (from `server/.env.example`):
  - `MONGO_URI` — MongoDB connection string
  - `PORT` — (optional) server port, defaults to `5000`
  - `JWT_SECRET` — JWT signing secret

- `client/.env` (from `client/.env.example`):
  - `VITE_API_URL_DEV` — backend base URL for development
  - `VITE_API_URL_PROD` — backend base URL for production

Note: Vite only exposes env vars prefixed with `VITE_` to the browser.

---

## Scripts (quick reference)

- Root: none (run subproject scripts)
- `server`: `npm run dev` (development), `npm start` (production)
- `client`: `npm run dev`, `npm run build`, `npm run preview`, `npm run lint`

---

## API Overview

See the full API surface in `server/routes/`. Main groups:

- `/menu` — list, add, remove menu items
- `/cart` — manage user's cart
- `/orders` — create and view orders
- `/admin` — authentication and protected admin actions

For exact request shapes and examples, see the `server/README.md` and inspect `server/routes/`.

---

## Deployment

This repo is configured for Vercel deployments. Each project contains a `vercel.json` for platform settings.

- Frontend: set `VITE_API_URL_PROD` in Vercel dashboard for the client deployment.
- Backend: set `MONGO_URI`, `JWT_SECRET`, and any other secrets in the server deployment environment.

---

## Contributing

If you'd like to contribute, please:

1. Open an issue describing the change or bug.
2. Create a feature branch, add tests where appropriate, and open a pull request.

---

## Useful Links

- Client README: [client/README.md](client/README.md)
- Server README: [server/README.md](server/README.md)
- Full setup: [docs/SETUP.md](docs/SETUP.md)
