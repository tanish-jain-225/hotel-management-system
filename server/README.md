# DineEase — Server

This directory contains the backend API for the DineEase hotel/restaurant management system.

## Overview
- Minimal Express.js API providing menu, cart, orders, and admin endpoints.
- Uses MongoDB for persistence and JWT for authentication.
- Designed to run locally and on Vercel (the app export is used for serverless deployments).

## Prerequisites
- Node.js 18+ and npm
- A MongoDB database (Atlas or self-hosted)

## Environment
Copy `.env.example` to `.env` and set these values:

- `MONGO_URI` — MongoDB connection string
- `PORT` — Port to run the server locally (defaults to `5000`)
- `JWT_SECRET` — Secret used to sign JSON Web Tokens

Example (.env):

MONGO_URI="your-mongodb-connection-string-here"
PORT=5000
JWT_SECRET="your-secret-key-here"

## Install

From the `server` directory:

```bash
npm install
```

## Run

- Development (auto-restart with file changes):

```bash
npm run dev
```

- Production:

```bash
npm start
```

The server listens on the `PORT` environment variable or `5000` by default.

## Health Check

GET `/` — returns `{ status: "Server is healthy" }`.

## Main Routes
- `/menu` — menu-related endpoints
- `/cart` — cart operations
- `/orders` — create / view orders
- `/admin` — protected admin operations

(See the `routes/` directory for full route handlers.)

## Project Structure
- `index.js` — app entry (exports `app` for serverless platforms)
- `config/` — database connection (`database.js`)
- `routes/` — route handlers (`menuRoutes.js`, `cartRoutes.js`, `orderRoutes.js`, `adminRoutes.js`)
- `middleware/` — `authMiddleware.js` and `errorHandler.js`

## Deployment
- For Vercel serverless deployments the exported `app` from `index.js` is used directly; ensure environment variables are configured in your deployment settings.

## Notes
- The app uses `helmet`, `cors`, and `express.json()` middleware by default.
- On shutdown (SIGINT) the server attempts to close the MongoDB connection gracefully.
