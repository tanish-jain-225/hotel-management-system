# 🍽️ DineEase — Hotel Menu & Order Management System

DineEase is a production-ready, full-stack hotel menu and order management system structured as a clean monorepo. It features a responsive customer ordering Single Page Application (SPA), a detailed administrative dashboard, a robust Node.js + Express backend, MongoDB persistence, and an independent validator seeder tool.

---

## 📂 Repository Structure & Layout

```text
├── client/                 # React SPA (Vite, Tailwind, Framer Motion)
│   ├── src/
│   │   ├── components/     # UI Components (Menu, Cart, Admin, MyOrders, Navbar, etc.)
│   │   ├── context/        # React Context Providers (AuthContext)
│   │   ├── services/       # Client-side API request handler (api.js, helper.js)
│   │   └── utils/          # Client utilities (Session tracking)
│   ├── index.html          # HTML entry point (contains Google Fonts loader)
│   ├── vite.config.js      # Build configurations and dev server proxies
│   └── package.json        # Frontend scripts and dependency versions
│
├── server/                 # REST API Server (Node.js, Express, MongoDB driver)
│   ├── config/             # Database connection pools, seeding, & migrations
│   ├── middleware/         # Custom Express Middlewares (JWT Auth, Global Error Handler)
│   ├── routes/             # REST endpoints (Menu, Cart, Orders, Admin Settings)
│   ├── index.js            # Express application bootstrapping & CORS configuration
│   └── vercel.json         # Vercel Serverless Function compilation & routing
│
├── tester/                 # Database Seeder Tool
│   ├── menuSeeder.js       # Script to parse, validate, and populate MongoDB menu
│   └── package.json        # Seeder dependencies and scripts
│
└── docs/                   # Documentation resources
    ├── SETUP.md            # Step-by-step developer setup guide
    └── VIDEO_DEMO.md       # Onboarding script and presentation helper
```

---

## ✨ Design Optimizations & Core Features

### 🧑‍🍳 Customer Experience
*   **Live Menu Browsing:** Category filter tabs ("All", "Starters", "Chinese", etc.) and real-time query search.
*   **Session-scoped Cart:** Uses a generated persistent `sessionId` stored in `localStorage`. Items are stored in MongoDB. The client groups individual items, offering fluid quantity controls.
*   **Dynamic Order Checkout:** Includes active checkout forms with validation. Standardizes phone numbers to strip spacing/hyphens and guarantees $\ge 7$ digits.
*   **GST Calculation:** Live settings-driven GST computation injected before placing the order.
*   **Live Order Tracking:** Customers can review active and completed orders placed within their active session.

### 👑 Admin Experience & Dashboard
*   **JWT Protected Routes:** Authentication uses JWT tokens. Secure administrative logins hash credentials using `bcryptjs` (default credentials: `admin` / `123456`).
*   **Menu Management (CRUD):** Adds new dishes, updates availability status, edits descriptions, prices, categories, and deletes entries.
*   **Kitchen Order Board:** Real-time feedback monitor. Orders progress from `Placed` ➔ `Preparing` ➔ `Ready` ➔ `Completed` (Served).
*   **Revenue Analytics:** Dashboard tracking total active order count, daily served meals, and total daily gross revenue.
*   **System Settings Configuration:** Direct modification of GST percentage stored dynamically in database settings.

### ⚡ Performance & Defensive UI Engineering
*   **Oscillator Audio Chimes (Web Audio API):** New kitchen orders trigger an audible alert using the browser's hardware oscillator to synthesize a chime (playing `C5` and `E5` notes). This removes static asset loads and prevents network requests.
*   **Visibility-Aware Polling:** Dashboard feeds poll the backend every 10 seconds for real-time states. To save battery, memory, and database connection pools, polling is completely paused whenever the browser tab is unfocused or minimized (`document.hidden` tracking).
*   **Defensive Rendering Engine:** The React app features structural checks (`Array.isArray` guards) prior to executing memoized operations (`useMemo` cascades, `.filter()`, `.forEach()`, and `.sort()`). This makes the interface crash-resistant if backend responses ever return non-array objects during connectivity drops.

---

## 💾 Database Schema & Collection Layout

The system uses a single MongoDB database named `hotelMenu` consisting of the following collections:

### 1. `menuItems`
Holds the menu catalog.
```json
{
  "_id": "ObjectId",
  "name": "Paneer Tikka",
  "cuisine": "North Indian",
  "section": "Starters",
  "price": 249.00,
  "image": "https://images.unsplash.com/...",
  "info": "Char-grilled paneer cubes marinated in spices...",
  "available": true
}
```

### 2. `cartItems`
Stores temporary shopping baskets. Configured with a MongoDB TTL Index (`expireAfterSeconds: 86400`) to automatically purge abandoned baskets after 24 hours.
```json
{
  "_id": "ObjectId",
  "sessionId": "session_1746887498674_ttq6sghal",
  "name": "Paneer Tikka",
  "price": 249.00,
  "quantity": 2,
  "image": "https://...",
  "cuisine": "North Indian",
  "section": "Starters",
  "createdAt": "ISODate"
}
```

### 3. `customerOrders`
Stores finalized kitchen orders. Includes a unique, incrementing sequential serial number.
```json
{
  "_id": "ObjectId",
  "serialNumber": 12,
  "sessionId": "session_1746887498674_ttq6sghal",
  "customer": {
    "name": "John Doe",
    "contact": "9876543210",
    "address": "Table 5"
  },
  "items": [
    {
      "name": "Paneer Tikka",
      "price": 249.00,
      "quantity": 2,
      "image": "https://...",
      "cuisine": "North Indian",
      "section": "Starters",
      "totalPrice": 498.00
    }
  ],
  "paymentMethod": "Cash",
  "subtotal": 498.00,
  "gstAmount": 24.90,
  "grandTotal": 522.90,
  "orderDate": "ISODate",
  "status": "Placed",
  "completedAt": "ISODate (only if status is Completed)"
}
```

### 4. `adminCredentials`
Stores administrative identities.
```json
{
  "_id": "ObjectId",
  "username": "admin",
  "password": "bcrypt_hashed_password_string",
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

### 5. `systemSettings`
Key-value store for global variables.
```json
{
  "_id": "system_settings",
  "gstRate": 5
}
```

### 6. `counters`
Sequence document to generate incremental transaction IDs.
```json
{
  "_id": "orderSerialNumber",
  "seq": 12
}
```

---

## 📡 API Endpoints Reference

### 🍽️ Menu Endpoints
*   `GET /menu` — Returns an array of all menu items.
*   `POST /menu` *(Admin Only)* — Inserts a new dish. Returns the added item with generated ObjectId.
*   `POST /menu/check` — Payload: `{ "name": "Dish Name" }`. Checks for existing duplicate menu names. Returns `{ "exists": true|false }`.
*   `PUT /menu/:id` *(Admin Only)* — Updates availability, price, name, or metadata.
*   `DELETE /menu/:id` *(Admin Only)* — Deletes an item from the collection.

### 🛒 Cart Endpoints
*   `GET /cart?sessionId=...` — Returns the list of cart items matching the customer's session ID.
*   `POST /cart` — Payload: `{ "sessionId": "...", "name": "...", "quantity": 1 }`. Increases or decreases quantity. Purges the item if quantity drops to 0.
*   `DELETE /cart/clear` — Payload: `{ "sessionId": "..." }`. Empties the cart.
*   `DELETE /cart/:id` — Payload: `{ "sessionId": "..." }`. Deletes a specific cart record.

### 📦 Order Endpoints
*   `POST /orders` — Places a finalized kitchen order. Performs validation of items against live prices, updates the order serial number, inserts order, and triggers automatic cart clearance for the session.
*   `GET /orders` — Route handles two scopes:
    *   **Admin View:** *(JWT Protected)* Returns active orders (or completed orders if query param `?status=Completed` is supplied).
    *   **Customer View:** Returns active orders matching `?sessionId=...`.
*   `PUT /orders/:id/status` *(Admin Only)* — Payload: `{ "status": "Placed|Preparing|Ready|Completed" }`. Updates progress. Automatically timestamps `completedAt` when marking as `Completed`.

### 👤 Admin Configuration Endpoints
*   `POST /admin/login` — Payload: `{ "username": "...", "password": "..." }`. Validates credentials and returns a secure JWT token.
*   `PUT /admin/credentials` *(Admin Only)* — Updates credentials. Salting/hashing is performed before writing to database.
*   `GET /admin/settings` — Public endpoint to allow cart to retrieve live `gstRate`.
*   `PUT /admin/settings` *(Admin Only)* — Updates global settings. Validates percentage range (0-100%).
*   `GET /admin/analytics` *(Admin Only)* — Aggregates current dashboard metrics: active counts, completed totals, and daily revenue metrics.

---

## 🚦 Local Startup Checklist

### Step 1: Database Setup
Ensure you have a MongoDB cluster running. Create the databases and obtain your connection string (`MONGO_URI`).

### Step 2: Configure and Start Server API
Navigate to the server directory, install node modules, configure the local environment file, and start the development server:
```bash
cd server
npm install
# Create local server/.env and fill values
npm run dev
```
**Server Environment Variables (`server/.env`):**
```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net
PORT=5000
JWT_SECRET=your_secure_authentication_jwt_secret_key
```

### Step 3: Configure and Start Client App
Open a separate terminal window, install frontend modules, and run the Vite compiler:
```bash
cd client
npm install
# Create local client/.env and fill values
npm run dev
```
**Client Environment Variables (`client/.env`):**
```env
VITE_API_URL_DEV=http://localhost:5000
VITE_API_URL_PROD=https://your-production-backend.vercel.app
```

### Step 4: Run Seeder Tool (Optional)
Configure `tester/.env` and execute the seeder command:
```bash
cd tester
npm install
# Dry-run seeder validation
npm run seed:dry
# Seed database
npm run seed
# Force re-seed (Reset database)
npm run seed:reset
```

---

## 🌐 Production & Vercel Deployment

DineEase is configured for deployment on **Vercel** with a zero-config-friendly monorepo setup:

### Vercel Server Function Building
Because the Node.js API uses an Express app with entry point `index.js` at the root folder level rather than `/api`, Vercel must be instructed to run the engine as a serverless instance. The configuration is handled in [**`server/vercel.json`**](file:///d:/_Deployed_Projects_Vercel/hotel-management-system/server/vercel.json):
```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "index.js"
    }
  ]
}
```
*   This forces Vercel to compile `index.js` as a Serverless Node Function.
*   All routes are forwarded to the Express app.
*   **CORS Negotiation:** The Express app handles CORS preflight validation dynamically using client origins matching local or production deployment patterns.

---

## 🛠️ Troubleshooting & Support

*   **Failed preflight checks / CORS block errors on Vercel:**
    Make sure your `vercel.json` routing configuration is intact. Do not combine legacy `headers` and `rewrites` arrays at the root of `vercel.json`, as this bypasses Vercel's zero-config function builders and results in `405 (Method Not Allowed)`. Always route using the unified `routes` configuration or rely entirely on Express `cors` middleware inside your function builder script.
*   **Blank menus / page crashes:**
    Open the browser developer tools and check the console. If connection failures occur, verify that your backend server is running and database URI credentials match.
*   **Empty items returning on client state hooks:**
    The client-side API engine is equipped with fallback handlers. If responses are parsed incorrectly (due to connection failures returning HTML error pages instead of JSON arrays), the client maps the fallback value to `[]` to prevent component layout crashes. Check network status to see if backend responses return HTML error messages.
*   **Authentication token sync across tabs:**
    DineEase listens to browser storage synchronization events. Logouts performed in one window will automatically sign out and wipe authorization records across all open tabs.
