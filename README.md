# 🍽️ DineEase — Hotel Menu & Order Management System

DineEase is a full-stack hotel menu and order management monorepo built with React + Vite on the client, Node.js + Express on the server, MongoDB for persistence and a standalone seeder.

**Docs:** [Client README](client/README.md) • [Server README](server/README.md) • [Setup Guide](docs/SETUP.md) • [Video Demo Script](docs/VIDEO_DEMO.md) • [Tester README](tester/README.md)

## What’s In This Repo

- `client/` - React SPA for customer browsing, cart, checkout, order tracking and admin UI.
- `server/` - Express API for menu, cart, orders, admin auth and settings.
- `tester/` - Standalone menu seeder that populates `menuItems` without depending on server internals.
- `docs/` - Setup guide and demo script for onboarding or presentation.

## Core Features

### Customer Experience
- Browse a categorized live menu.
- Search by dish name and filter by section.
- Add items to cart, then adjust quantity with plus/minus controls.
- Review cart totals with GST calculation.
- Place an order and view a receipt modal.
- Track orders from the same session in My Orders.

### Admin Experience
- Log in with protected admin credentials.
- Add, edit, search and delete menu items.
- View and manage customer orders.
- Update GST/settings from the admin side.
- Secure access using JWT-based authentication.

### Seeder / Developer Tooling
- Seed menu data independently from `tester/menuSeeder.js`.
- Seed only when `menuItems` is empty, or force reseed with `--reset`.
- Validate seed data with `npm run build` in `tester/`.

## Architecture Overview

- **Client:** React 19 + Vite + Tailwind + Framer Motion.
- **Server:** Express 4 + MongoDB native driver + bcryptjs + JWT.
- **Database:** MongoDB database named `hotelMenu`.
- **Collections:** `adminCredentials`, `menuItems`, `orders`, `customerOrders`, `systemSettings`.
- **Cart model:** The backend currently stores one document per cart unit; the UI groups duplicate items and shows quantity controls.

## Quick Start

### 1. Backend

```bash
cd server
npm install
npm run dev
```

Create `server/.env` from `server/.env.example` and set:

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_secure_secret
```

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

Create `client/.env` from `client/.env.example` and set:

```env
VITE_API_URL_DEV=http://localhost:5000
VITE_API_URL_PROD=https://your-production-backend.example.com
```

### 3. Seeder

```bash
cd tester
npm install
npm run build
npm run seed:dry
npm run seed
```

The seeder uses `tester/.env` and expects `MONGO_URI` to be defined there.

## Available Scripts

### Root
- No root scripts. Run scripts from the relevant subfolder.

### Client
- `npm run dev` - start Vite dev server
- `npm run build` - production build
- `npm run preview` - preview production build
- `npm run lint` - lint the frontend

### Server
- `npm run dev` - run the API with watch mode
- `npm start` - run the API in production mode

### Tester
- `npm run dev` - run the seeder
- `npm run build` - dry-run validation of the seeder
- `npm run seed` - seed menu items if the collection is empty
- `npm run seed:reset` - clear and reseed menu items
- `npm run seed:dry` - validate without writing to the database

## Folder Structure

```text
client/
  src/
    components/   # Menu, Cart, Admin, Login, Navbar, etc.
    context/      # Auth context
    services/     # API wrapper and helper
    utils/        # session helpers
server/
  config/         # MongoDB connection and collection names
  middleware/     # auth and error handling
  routes/         # menu, cart, order, admin routes
tester/
  menuSeeder.js   # standalone menu seed script
  package.json    # tester scripts and deps
docs/
  SETUP.md
  VIDEO_DEMO.md
```

## Data Model

### `menuItems`
Each menu document uses the schema below:

```json
{
  "name": "Veg Manchurian",
  "cuisine": "Indo-Chinese",
  "section": "Chinese",
  "price": 259,
  "image": "https://...",
  "info": "Crispy vegetable balls served in a savoury manchurian sauce."
}
```

### `customerOrders`
Orders store session-scoped customer data, grouped items, totals, GST, payment method and order status.

### `adminCredentials`
Stores the admin username and bcrypt-hashed password.

### `systemSettings`
Stores global settings such as GST rate.

## API Overview

See the route handlers in [server/routes](server/routes) for the full request/response behavior.

- `GET /menu` - list menu items
- `POST /menu` - add menu item (admin only)
- `PUT /menu/:id` - update menu item (admin only)
- `DELETE /menu/:id` - delete menu item (admin only)
- `POST /menu/check` - check if a dish name already exists
- `POST /cart` - add item to cart
- `GET /cart?sessionId=...` - fetch cart items for a session
- `DELETE /cart/:id` - remove one cart item
- `DELETE /cart/clear` - clear a session cart
- `POST /orders` - place order
- `GET /orders` - admin view of all orders, or session view with `sessionId`
- `DELETE /orders/:id` - mark order as completed
- `POST /admin/login` - admin login
- `PUT /admin/credentials` - update admin credentials
- `GET /admin/settings` - fetch GST/settings
- `PUT /admin/settings` - update GST/settings

## Deployment

The repo is Vercel-friendly and contains deployment configuration in both the client and server folders.

- Set backend secrets in the server deployment environment.
- Set `VITE_API_URL_PROD` for the client deployment.
- Keep `MONGO_URI` and `JWT_SECRET` out of source control.

## Demo / Presentation

If you need to present the project, use [docs/VIDEO_DEMO.md](docs/VIDEO_DEMO.md) for a 3-minute narration plus user flow.

## Troubleshooting

- **Blank menu or failed requests** - check `VITE_API_URL_DEV`, `MONGO_URI` and whether the server is running.
- **401 errors on admin routes** - confirm the JWT token is present and `JWT_SECRET` matches the server environment.
- **Seeder skips records** - `tester/menuSeeder.js` only seeds when `menuItems` is empty unless you run `npm run seed:reset`.
- **Cart quantity changes look duplicated** - the backend stores one cart document per unit and the UI groups them into a single row with quantity controls.

## Contributing

1. Open an issue or describe the change.
2. Make the smallest focused update.
3. Validate the affected subproject with its local script.
4. Open a pull request.

## Useful Links

- [client/README.md](client/README.md)
- [server/README.md](server/README.md)
- [tester/README.md](tester/README.md)
- [docs/SETUP.md](docs/SETUP.md)
- [docs/VIDEO_DEMO.md](docs/VIDEO_DEMO.md)
