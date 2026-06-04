# 🍽️ DineEase - Premium Hotel Menu & Order Management System

<div align="center">

**A sophisticated, full-stack restaurant management platform built with React, Node.js, and MongoDB.**

[![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-Animations-ff69b4?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation--setup) • [API Guide](#-api-endpoints) • [Deployment](#-deployment)

</div>

---

## 📖 Overview

**DineEase** is a production-grade menu and order management system designed for modern culinary businesses. It combines a **premium glassmorphic user interface** with a robust administrative backend, providing a seamless workflow from browsing the menu to order fulfillment.

### 🎯 Key Highlights

- **Modern Light Theme**: A professional, clean design system using `slate-50` and `blue-600`.
- **Fluid UI**: 60fps animations powered by Framer Motion and Lucide icons.
- **Smart Logistics**: Automated GST (5%) calculations, subtotaling, and chronological serial numbering for orders.
- **Responsive Architecture**: Fully optimized for mobile, tablet, and desktop environments.

---

## ✨ Features

### 👥 **Customer Interface**
- **🍕 Interactive Menu**: Browse items with high-quality images, category filtering, and real-time search.
- **🛒 Persistent Cart**: Manage selections with automatic item grouping and session persistence.
- **📦 Seamless Checkout**: Simple form for customer details with instant subtotal and GST breakdown.
- **💳 Multi-Payment Support**: Visual options for Pay on Counter, UPI, and Card.

### 🔐 **Administrative Control**
- **📊 Active Order Tracking**: Real-time dashboard for managing orders. Mark them as completed with one click.
- **🛠️ Menu CRUD**: Full control over menu items including name, cuisine, price, and descriptions.
- **⚙️ Secure Auth System**: Production-grade bcrypt credential hashing and verification.
- **🕵️ Debug Mode**: Server-side logs for monitoring credential verification and system health.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 19, Vite, Framer Motion, Lucide Icons, React Hot Toast, Tailwind CSS 4 |
| **Backend** | Node.js, Express.js, JSON Web Tokens (JWT), Helmet.js, CORS |
| **Database** | MongoDB (Native Driver) |
| **Environment** | Dotenv for Secure Config Management |

---

## 🏗️ Folder Structure

```text
hotel-management-system/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/    # UI Components (Menu, Cart, Admin, etc.)
│   │   ├── context/       # Auth & State Management
│   │   ├── services/      # Centralized API Interface
│   │   └── utils/         # Helpers & Session Management
├── server/                 # Node.js Backend
│   ├── config/            # Database Connection Logic
│   ├── middleware/        # JWT Authentication Guard
│   ├── routes/            # Modular API Endpoints (Admin, Orders, Menu)
│   └── index.js           # Server Entry Point
└── docs/                   # Extended Setup Documentation
```

---

## 📦 Installation & Setup

1. **Clone the Repo**:
   ```bash
   git clone https://github.com/tanish-jain-225/hotel-management-system.git
   ```

2. **Backend Setup**:
   ```bash
   cd server
   npm install
   # Create .env based on .env.example
   npm run dev
   ```

3. **Frontend Setup**:
   ```bash
   cd client
   npm install
   # Create .env based on .env.example
   npm run dev
   ```

For detailed configuration, see the [Full Setup Guide](./docs/SETUP.md).

---

## 📡 API Endpoints

### **Admin** (`/admin`)
- `POST /login`: Secure bcrypt-verified login. Returns JWT.
- `PUT /credentials`: Update admin username/password (requires previous password verification).

### **Menu** (`/menu`)
- `GET /`: Retrieve all items.
- `POST /`: Add a new item (Protected).
- `DELETE /:id`: Delete an item (Protected).

---

## 🌐 Deployment

Optimized for **Vercel**. Both `client/` and `server/` contain `vercel.json` configurations.
- Ensure `VITE_API_URL_PROD` is set in your Vercel Frontend environment.
- Ensure `MONGO_URI` and `JWT_SECRET` are set in your Vercel Backend environment.

---

<div align="center">
Built with ❤️ for High-End Hospitality
</div>
