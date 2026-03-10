# 🍽️ DineEase - Hotel Menu Order App

<div align="center">

![DineEase Logo](./client/public/8575289.png)

**A modern, full-stack hotel menu and order management system built with React, Node.js, Express, and MongoDB.**

[![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

[Features](#-features) • [Tech Stack](#-tech-stack) • [Architecture](#-architecture) • [Installation](#-installation-and-setup) • [Usage](#-usage) • [API Documentation](#-api-documentation) • [Deployment](#-deployment)

</div>

---

## 📖 Overview

**DineEase** is a comprehensive hotel menu and order management system that streamlines the entire ordering process from browsing to payment. It provides an intuitive interface for customers to explore menu items, manage their cart, and place orders with automatic GST calculations. The robust admin panel enables restaurant staff to manage menu items, track orders in real-time, and maintain secure access through credential management.

### 🎯 Key Highlights

- **Session-Based Cart Management**: Persistent cart across page refreshes using browser local storage
- **Real-Time Order Tracking**: Instant updates for both customers and admin
- **Automated GST Calculation**: Built-in 5% GST calculation on all orders
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop devices
- **Secure Admin Panel**: Server-side authentication with protected routes
- **Search & Filter**: Advanced menu filtering by section and search functionality
- **Order Serial Numbers**: Automatic serial numbering for easy order tracking
- **Modular Architecture**: Clean separation of concerns on both frontend and backend

---

## ✨ Features

### 👥 **Customer Features**

- **🍕 Menu Browsing**
  - View categorized menu items with cuisine type, price, and description
  - High-quality food images for each item
  - Filter menu by sections (Starters, Main Course, Desserts, Beverages, etc.)
  - Search functionality to quickly find dishes

- **🛒 Cart Management**
  - Add multiple items to cart with quantity tracking
  - Automatic grouping of duplicate items
  - Remove items from cart individually
  - Clear entire cart with one click
  - Persistent cart using session IDs (survives page refresh)
  - Real-time cart count display in navbar

- **📦 Order Placement**
  - Customer information collection (Name, Contact, Address)
  - Automatic subtotal calculation
  - 5% GST calculation and display
  - Grand total with itemized breakdown
  - Multiple payment options (Cash on Counter, UPI, Credit/Debit Card)
  - Order confirmation with success messages
  - Cart auto-clears after successful order placement

### 🔐 **Admin Features**

- **🔑 Secure Login System**
  - Server-side credential verification (credentials never sent to client)
  - Session-based authentication using React Context + localStorage
  - Auto-redirect for unauthorized access
  - Flash messages for login feedback

- **📋 Menu Management**
  - **Add New Items**: Add menu items with details (name, cuisine, section, price, image URL, description)
  - **Delete Items**: Remove items from the menu
  - **Duplicate Check**: Prevents adding items with duplicate names
  - **Search & Filter**: Search and filter admin menu view by section
  - **Case Insensitive**: All entries automatically lowercased for consistency
  - **Real-time Updates**: Instant UI updates without page refresh

- **📊 Order Management**
  - View all customer orders in chronological order (newest first)
  - Detailed order information including:
    - Serial number for easy reference
    - Customer name, contact, and address
    - Itemized list with quantities and prices
    - Order date and time
    - Payment method
    - Grand total with GST breakdown
  - **Mark as Done**: Complete orders with confirmation dialog
  - Auto-remove completed orders from the list

- **🔧 Credential Management**
  - Change admin username and password securely
  - Previous credential verification required (server-side)
  - Instant validation and feedback
  - Auto-redirect to login after credential update

---

## 🛠️ Tech Stack

### **Frontend**

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 19.0.0 | UI library for building interactive components |
| **React Router DOM** | 7.3.0 | Client-side routing and navigation |
| **Tailwind CSS** | 4.0.14 | Utility-first CSS framework for styling |
| **Vite** | 6.2.0 | Fast build tool and development server |
| **Font Awesome** | Latest | Icon library for UI elements |

### **Backend**

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | 18+ | JavaScript runtime environment |
| **Express.js** | 4.21.2 | Web application framework |
| **MongoDB** | 6.14.2 | NoSQL database driver |
| **CORS** | 2.8.5 | Cross-Origin Resource Sharing middleware |
| **dotenv** | 16.4.7 | Environment variable management |
| **Helmet** | 8.1.0 | Security headers middleware |

### **Database Collections**

| Collection | Purpose |
|-----------|---------|
| **menuItems** | Stores all menu items with details |
| **orders** | Session-based cart items (temporary) |
| **customerOrders** | Confirmed customer orders with full details |
| **adminCredentials** | Admin login credentials (single document) |

---

## 🏗️ Architecture

### **Backend — Modular Express**

The backend follows a modular route-based architecture with clear separation of concerns:

- **Entry Point** (`index.js`) — Middleware setup and route mounting
- **Config** (`config/database.js`) — MongoDB connection management with `connectToDatabase()`, `getCollection()`, and `closeConnection()`
- **Routes** — Each domain has its own route file mounted at a dedicated path:
  - `/menu` → `routes/menuRoutes.js`
  - `/cart` → `routes/cartRoutes.js`
  - `/orders` → `routes/orderRoutes.js`
  - `/admin` → `routes/adminRoutes.js`
- **Middleware** (`middleware/errorHandler.js`) — Global error handler

### **Frontend — Service Layer + Context**

The frontend uses a centralized API service layer and React Context for shared state:

- **Services** (`services/api.js`) — Centralized API layer with `menuApi`, `cartApi`, `orderApi`, `adminApi` objects
- **Services** (`services/helper.js`) — Environment-aware API URL resolution (dev vs prod)
- **Context** (`context/AuthContext.jsx`) — `AuthProvider` + `useAuth()` hook for login/logout state
- **Utils** (`utils/session.js`) — Session ID generation and persistence
- **Components** — Reusable `FlashMessage` component shared across all views

### **Client-Side Routes**

| Path | Component | Description |
|------|-----------|-------------|
| `/` | Menu | Customer menu browsing |
| `/cart` | Cart | Shopping cart and checkout |
| `/login` | Login | Admin authentication |
| `/admin` | Admin | Menu management (protected) |
| `/all-orders` | AllOrders | Order management (protected) |
| `/change-credentials` | ChangeCredentials | Update admin login (protected) |

---

## 📦 Installation and Setup

### **Prerequisites**

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (Local installation or MongoDB Atlas account) - [Get Started](https://www.mongodb.com/)
- **Git** - [Download](https://git-scm.com/)

### **Step-by-Step Setup**

#### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/hotel-management-system.git
cd hotel-management-system
```

#### 2️⃣ Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file from example
copy .env.example .env    # Windows
# OR
cp .env.example .env      # macOS/Linux
```

Edit the `.env` file:
```bash
MONGO_URI="your-mongodb-connection-string-here"
PORT=5000
```

**MongoDB Setup:**
- Create a database named `hotelMenu`
- The following collections will be created automatically:
  - `menuItems`
  - `orders`
  - `customerOrders`
  - `adminCredentials`
- **Important**: Add an initial admin credential document in the `adminCredentials` collection:
  ```json
  {
    "username": "admin",
    "password": "admin123"
  }
  ```

#### 3️⃣ Frontend Setup

```bash
# Open a new terminal and navigate to client directory
cd client

# Install dependencies
npm install

# Create .env file from example
copy .env.example .env    # Windows
# OR
cp .env.example .env      # macOS/Linux
```

Edit the `.env` file:
```bash
VITE_API_URL_DEV="http://localhost:5000"
VITE_API_URL_PROD="https://your-deployed-backend.vercel.app"
```

> The app automatically picks the correct URL based on the environment (`development` or `production`).

#### 4️⃣ Run the Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
# Server runs on http://localhost:5000 with file watching
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
# Client runs on http://localhost:5173
```

#### 5️⃣ Access the Application

- **Customer Interface**: http://localhost:5173
- **Admin Login**: http://localhost:5173/login
  - Default credentials: `admin` / `admin123` (or as set in database)

---

## 🚀 Usage

### **For Customers**

1. **Browse Menu** — Navigate to the home page, use search bar or filter by section, click "Order" to add items to cart
2. **Manage Cart** — Click cart icon in navbar, review items and prices, remove unwanted items
3. **Place Order** — Fill in customer details, review order summary with GST, select payment method, click "Confirm Order"

### **For Admin**

1. **Login** — Navigate to `/login` and enter admin credentials
2. **Manage Menu** — Add items with details (name, cuisine, section, price, image URL, description) or delete existing items
3. **View Orders** — Navigate to `/all-orders`, view order details, click "Done" to complete orders
4. **Change Credentials** — Navigate to `/change-credentials`, verify previous credentials, set new ones

---

## 📡 API Documentation

### **Base URL**
```
Local:      http://localhost:5000
Production: https://your-backend.vercel.app
```

### **Menu Endpoints** (`/menu`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/menu` | Get all menu items |
| `POST` | `/menu` | Add a new menu item |
| `POST` | `/menu/check` | Check if a menu item name exists |
| `DELETE` | `/menu/:id` | Delete a menu item by ID |

#### Add Menu Item
```http
POST /menu
Content-Type: application/json

{
  "name": "Chicken Biryani",
  "cuisine": "Indian",
  "section": "Main Course",
  "price": 250,
  "image": "https://image-url.com/biryani.jpg",
  "info": "Delicious chicken biryani with aromatic spices"
}
```

#### Check Menu Item Existence
```http
POST /menu/check
Content-Type: application/json

{
  "name": "Chicken Biryani"
}
```
**Response**: `{ "exists": true/false }`

#### Delete Menu Item
```http
DELETE /menu/60d5ec49f1b2c8b1f8e4e1a1
```

---

### **Cart Endpoints** (`/cart`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/cart` | Add item to cart |
| `GET` | `/cart?sessionId=...` | Get cart items for a session |
| `DELETE` | `/cart/clear` | Clear all cart items for a session |
| `DELETE` | `/cart/:id` | Remove a specific cart item |

#### Add Item to Cart
```http
POST /cart
Content-Type: application/json

{
  "sessionId": "session_1234567890_abc123",
  "name": "Chicken Biryani",
  "price": 250,
  "quantity": 2,
  "image": "https://image-url.com/biryani.jpg",
  "cuisine": "Indian",
  "section": "Main Course"
}
```

#### Clear Cart
```http
DELETE /cart/clear
Content-Type: application/json

{
  "sessionId": "session_1234567890_abc123"
}
```

---

### **Order Endpoints** (`/orders`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/orders` | Place a new order |
| `GET` | `/orders` | Get all orders (admin) |
| `GET` | `/orders?sessionId=...` | Get orders for a session (customer) |
| `DELETE` | `/orders/:id` | Mark order as completed |

#### Place Order
```http
POST /orders
Content-Type: application/json

{
  "sessionId": "session_1234567890_abc123",
  "name": "John Doe",
  "contact": "9876543210",
  "address": "123 Main Street, City",
  "paymentMethod": "Cash on Counter",
  "items": [
    {
      "name": "Chicken Biryani",
      "quantity": 2,
      "price": 250,
      "totalPrice": 500
    }
  ],
  "subtotal": 500,
  "gstAmount": 25,
  "grandTotal": 525
}
```

---

### **Admin Endpoints** (`/admin`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/admin/login` | Verify admin credentials (server-side) |
| `PUT` | `/admin/credentials` | Update admin credentials |

#### Admin Login
```http
POST /admin/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```
**Response (success)**: `{ "message": "Login successful" }`
**Response (fail)**: `401 { "message": "Invalid username or password" }`

#### Update Admin Credentials
```http
PUT /admin/credentials
Content-Type: application/json

{
  "prevUsername": "admin",
  "prevPassword": "admin123",
  "newUsername": "newadmin",
  "newPassword": "newpassword123"
}
```

---

## 🌐 Deployment

### **Deploy to Vercel**

#### Backend Deployment

1. Navigate to server directory
2. The `vercel.json` is already configured:
```json
{
  "version": 2,
  "builds": [{ "src": "index.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "/index.js" }]
}
```
3. Deploy:
```bash
cd server
vercel --prod
```
4. Add environment variables in Vercel dashboard:
   - `MONGO_URI`: Your MongoDB connection string

#### Frontend Deployment

1. Navigate to client directory
2. Set the production API URL in `.env`:
```bash
VITE_API_URL_PROD="https://your-backend.vercel.app"
```
3. The `vercel.json` is already configured:
```json
{
  "version": 2,
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```
4. Deploy:
```bash
cd client
vercel --prod
```

### **Environment Variables Summary**

**Backend (`server/.env`)**
```bash
MONGO_URI="your-mongodb-connection-string-here"
PORT=5000
```

**Frontend (`client/.env`)**
```bash
VITE_API_URL_DEV="http://localhost:5000"
VITE_API_URL_PROD="https://your-backend.vercel.app"
```

---

## 📁 Project Structure

```
hotel-management-system/
├── client/                              # Frontend React application
│   ├── public/
│   │   └── 8575289.png                 # Logo image
│   ├── src/
│   │   ├── components/
│   │   │   ├── Admin.jsx               # Admin panel — menu management
│   │   │   ├── AllOrders.jsx           # Admin — order management
│   │   │   ├── Cart.jsx               # Shopping cart and checkout
│   │   │   ├── ChangeCredentials.jsx   # Admin — credential update
│   │   │   ├── FlashMessage.jsx        # Reusable notification component
│   │   │   ├── Footer.jsx             # Footer
│   │   │   ├── Login.jsx              # Admin login
│   │   │   ├── Menu.jsx               # Customer menu browsing
│   │   │   └── Navbar.jsx             # Navigation bar with cart count
│   │   ├── context/
│   │   │   └── AuthContext.jsx         # Auth state (login/logout/isAuthenticated)
│   │   ├── services/
│   │   │   ├── api.js                  # Centralized API layer
│   │   │   └── helper.js              # Environment-aware API URL
│   │   ├── utils/
│   │   │   └── session.js             # Session ID management
│   │   ├── App.jsx                     # Root component with routes
│   │   ├── main.jsx                    # React entry point
│   │   ├── App.css                     # Global styles
│   │   └── index.css                   # Tailwind imports
│   ├── .env.example                    # Environment variables template
│   ├── package.json                    # Frontend dependencies
│   ├── vite.config.js                  # Vite configuration
│   ├── tailwind.config.js              # Tailwind CSS configuration
│   └── vercel.json                     # Vercel deployment config
│
├── server/                              # Backend Node.js application
│   ├── config/
│   │   └── database.js                 # MongoDB connection management
│   ├── middleware/
│   │   └── errorHandler.js             # Global error handler
│   ├── routes/
│   │   ├── adminRoutes.js              # /admin — login & credentials
│   │   ├── cartRoutes.js               # /cart — cart operations
│   │   ├── menuRoutes.js               # /menu — menu CRUD
│   │   └── orderRoutes.js              # /orders — order management
│   ├── index.js                        # Express entry point
│   ├── .env.example                    # Environment variables template
│   ├── package.json                    # Backend dependencies
│   └── vercel.json                     # Vercel deployment config
│
└── Readme.md                            # Project documentation
```

---

## 🔒 Security Features

- ✅ **Server-side authentication** — Admin credentials verified on server, never exposed to client
- ✅ **Helmet.js** — Security headers (XSS protection, content policy, etc.)
- ✅ **CORS** — Configured Cross-Origin Resource Sharing
- ✅ **Input validation** — Server-side validation on all endpoints
- ✅ **Global error handler** — Centralized error handling middleware
- ✅ **Environment variables** — Sensitive data kept out of source code
- ✅ **Session-based cart** — Isolated cart per browser session
- ✅ **Graceful shutdown** — Clean MongoDB disconnection on server stop
