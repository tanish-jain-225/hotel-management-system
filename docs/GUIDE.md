# 🍽️ DineEase — End-to-End Running & Testing Guide

Everything you need to start, run, and manually validate every major flow in DineEase from scratch.

---

## ⚡ Quick End-to-End Terminal Commands

### 💻 Terminal 1 — Backend Server
```powershell
cd server
npm install
npm run dev
```

### 💻 Terminal 2 — Frontend Client
```powershell
cd client
npm install
npm run dev
```

### 🧪 Terminal 3 — Automated Tests & Data Seeding
```powershell
# Run API Unit Tests
cd server
npm test

# Seed Menu Data
cd ../tester
npm install
npm run seed:dry   # Dry run validation
npm run seed       # Insert items into DB
npm run seed:reset # Force clear & re-seed
```

---

## 📋 Prerequisites

| Tool | Min Version | Check Command |
|------|------------|---------------|
| **Node.js** | 18+ | `node -v` |
| **npm** | 9+ | `npm -v` |
| **MongoDB Atlas** (or Local) | Any | Connection URI ready |
| **Git** | Any | `git -v` |

---

## 🚀 Part 1 — Running the App Locally

### Step 1 — Clone & Navigate

```bash
git clone https://github.com/tanish-jain-225/hotel-management-system.git
cd hotel-management-system
```

---

### Step 2 — Configure & Start the Backend (`/server`)

```bash
cd server
npm install
```

Create `server/.env` (copy from `server/.env.example`):

```env
MONGO_URI=your_mongodb_atlas_connection_string
PORT=5000
JWT_SECRET=your_secure_jwt_secret_phrase
NODE_ENV=development
```

Start the dev server:

```bash
npm run dev
```

**Expected Terminal Output:**

```text
Connected to MongoDB
Ensured indexes on cartItems collection
Ensured indexes on customerOrders collection
Seeded default admin credentials successfully.   ← (only on first startup)

🚀 Server running on port 5000
🔗 Local API URL: http://localhost:5000
```

> ✅ **Verification**: Open [http://localhost:5000/](http://localhost:5000/) in a browser — it should return `{"status":"Server is healthy"}`.

---

### Step 3 — Configure & Start the Frontend (`/client`)

Open a **new terminal tab/window**:

```bash
cd client
npm install
```

Create `client/.env` (copy from `client/.env.example`):

```env
VITE_API_URL_DEV=http://localhost:5000
VITE_API_URL_PROD=https://your-deployed-backend.vercel.app
```

Start the client dev server:

```bash
npm run dev
```

**Expected Terminal Output:**

```text
  VITE v6.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

> ✅ **Verification**: Open [http://localhost:5173/](http://localhost:5173/) in your browser — the DineEase customer menu page will load.

---

### Step 4 — Seed Menu Data (`/tester`)

If your database is empty, seed menu items using the standalone tester script:

```bash
cd tester
npm install
# Ensure tester/.env has MONGO_URI set
npm run seed:dry              # Validate seed data format (no database writes)
npm run seed                  # Insert menu items into database
```

> ✅ **Verification**: Refresh [http://localhost:5173/](http://localhost:5173/) — dishes grouped by section will appear.

---

## 🧪 Part 2 — Running Automated Tests

### Backend Unit Tests (Vitest + Supertest)

Executes all API route tests against an in-memory database mock:

```bash
cd server
npm test
```

**Expected Output:**

```text
 ✓ tests/api.test.js (XX)
   ✓ GET / returns healthy status
   ✓ GET /menu returns menu items
   ✓ POST /menu creates new item (admin)
   ✓ POST /cart adds item to cart
   ✓ POST /orders places customer order
   ✓ PUT /orders/:id/status updates status
   ✓ POST /admin/login authenticates admin

 Test Files  1 passed (1)
      Tests  XX passed (XX)
```

---

## 🔍 Part 3 — Manual End-to-End Flow Validation

Follow these steps to manually test every user journey in the application.

---

### 🛒 Flow 1 — Customer Order & Auto Cart Clearing

1. Open [http://localhost:5173/](http://localhost:5173/).
2. Observe **Menu** loading — Tailwind shimmer skeleton cards appear briefly before dishes load.
3. Click **Add to Cart** on any item — verify toast notification: `"Item added to cart!"`.
4. Click the **Cart** icon in the header.
5. On the Cart page:
   - Adjust quantities using **+** and **−** controls.
   - Verify Subtotal and **GST** calculate dynamically.
   - Fill in **Name**, **Contact** (min 7 digits), and **Address**.
   - Choose a **Payment Method** (Cash / Card / UPI).
   - Click **Place Order**.
6. **Receipt Modal** pops up with serial number, item summary, tax breakdown, and total.
7. Click **Track Order** to navigate to `/my-orders` — your order will show with status **Placed**.
8. Click back to **Cart** — verify the cart has been **automatically cleared on the server**.

---

### 🔄 Flow 2 — Real-Time Order Polling & Tab Visibility

1. Open [http://localhost:5173/my-orders](http://localhost:5173/my-orders) in Browser Tab A.
2. Open [http://localhost:5173/admin](http://localhost:5173/admin) in Browser Tab B.
3. In Tab B (Admin), update your order's status from **Placed → Preparing**.
4. Switch to Tab A — within 10 seconds, the status badge updates automatically to **Preparing**.
5. Switch to a completely different browser tab for 20 seconds, then switch back to Tab A — notice polling automatically pauses while hidden and fires immediately on tab focus.

---

### 👨‍💼 Flow 3 — Admin Kitchen & Order Management

1. Navigate to [http://localhost:5173/login](http://localhost:5173/login).
2. Log in with credentials:
   - **Username**: `admin`
   - **Password**: `123456` *(or your updated password)*
3. On the Admin Dashboard, click **All Orders**.
4. Advance orders through their lifecycle:
   - **Placed** ➔ **Preparing** ➔ **Ready** ➔ **Completed**.
5. When marked **Completed**, active orders move to the **History** tab.

---

### 🍽️ Flow 4 — Menu CRUD Operations

1. On the Admin Dashboard, click **Add Menu Item**.
2. Fill in dish name, price, section, cuisine, image URL, and description.
3. Click **Save** — verify item appears on the customer menu page immediately.
4. Toggle an item's availability to **Out of Stock** — verify the customer menu displays a red `"Out of Stock"` badge and disables ordering.
5. Delete a test menu item — verify it is removed from the menu.

---

### ⚙️ Flow 5 — Dynamic GST Rate Configuration

1. In the Admin Dashboard, navigate to **Settings / GST Rate**.
2. Change the GST rate (e.g., set from `5%` to `12%`) and save.
3. Go to the Customer Cart — verify tax is now calculated at `12%`.

---

### 🔐 Flow 6 — Admin Credential Management & Rate Limiting

1. Go to [http://localhost:5173/login](http://localhost:5173/login) and click **Reset Credentials?**.
2. Enter current password and new password to update bcrypt hash in database.
3. Verify rate limiting protection: Attempting 10+ invalid logins in 15 minutes triggers `429 Too Many Requests`.

---

### 📦 Flow 7 — Seeder Reset & Re-seeding

To reset the database menu back to initial state at any time:

```bash
cd tester
npm run seed:reset
```

Refresh [http://localhost:5173/](http://localhost:5173/) to confirm default menu restoration.

---

## 🛠️ Troubleshooting Matrix

| Issue | Cause | Fix |
|-------|-------|-----|
| Blank menu on client | Incorrect `MONGO_URI` or empty `menuItems` collection | Verify `server/.env` and run `npm run seed` in `/tester` |
| `401 Unauthorized` on Admin | Missing or invalid JWT token | Re-login at `/login` to generate a fresh JWT cookie/token |
| `429 Too Many Requests` | Hit rate limiter | Wait 15 minutes or set `NODE_ENV=development` |
| CORS errors in browser | Mismatched API URLs | Ensure `VITE_API_URL_DEV` points to `http://localhost:5000` |
| Seeder skips records | Menu collection is not empty | Run `npm run seed:reset` to clear and reseed |

---

## 📁 Key File Index

| Component | Path |
|-----------|------|
| Server Application Entry | [server/index.js](file:///d:/_Deployed_Projects_Vercel/hotel-management-system/server/index.js) |
| Database Connection & Indexes | [server/config/database.js](file:///d:/_Deployed_Projects_Vercel/hotel-management-system/server/config/database.js) |
| Order Handlers & Validation | [server/routes/orderRoutes.js](file:///d:/_Deployed_Projects_Vercel/hotel-management-system/server/routes/orderRoutes.js) |
| Customer Menu & Skeleton | [client/src/components/Menu.jsx](file:///d:/_Deployed_Projects_Vercel/hotel-management-system/client/src/components/Menu.jsx) |
| Cart & Checkout Modal | [client/src/components/Cart.jsx](file:///d:/_Deployed_Projects_Vercel/hotel-management-system/client/src/components/Cart.jsx) |
| Customer Order Tracking | [client/src/components/MyOrders.jsx](file:///d:/_Deployed_Projects_Vercel/hotel-management-system/client/src/components/MyOrders.jsx) |
| Admin Kitchen Orders | [client/src/components/AllOrders.jsx](file:///d:/_Deployed_Projects_Vercel/hotel-management-system/client/src/components/AllOrders.jsx) |
| Menu Seeder Script | [tester/menuSeeder.js](file:///d:/_Deployed_Projects_Vercel/hotel-management-system/tester/menuSeeder.js) |
