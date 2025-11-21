# 🍽️ DineEase - Hotel Menu Order App

<div align="center">

![DineEase Logo](./client/public/8575289.png)

**A modern, full-stack hotel menu and order management system built with React, Node.js, Express, and MongoDB.**

[![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation-and-setup) • [Usage](#-usage) • [API Documentation](#-api-documentation) • [Deployment](#-deployment)

</div>

---

## 📖 Overview

**DineEase** is a comprehensive hotel menu and order management system that streamlines the entire ordering process from browsing to payment. It provides an intuitive interface for customers to explore menu items, manage their cart, and place orders with automatic GST calculations. The robust admin panel enables restaurant staff to manage menu items, track orders in real-time, and maintain secure access through credential management.

### 🎯 Key Highlights

- **Session-Based Cart Management**: Persistent cart across page refreshes using browser local storage
- **Real-Time Order Tracking**: Instant updates for both customers and admin
- **Automated GST Calculation**: Built-in 5% GST calculation on all orders
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop devices
- **Secure Admin Panel**: Protected routes with authentication and credential management
- **Search & Filter**: Advanced menu filtering by section and search functionality
- **Order Serial Numbers**: Automatic serial numbering for easy order tracking

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
  - Username and password authentication
  - Credentials stored securely in MongoDB
  - Session-based authentication using localStorage
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
  - Previous credential verification required
  - Instant validation and feedback
  - Auto-redirect to login after credential update
  - Flash messages for success/error states

### 🔄 **Real-Time Features**

- Instantaneous UI updates on all CRUD operations
- Flash card notifications for user actions
- Loading states during data fetching
- Error handling with user-friendly messages
- Automatic cart count synchronization

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
| **MongoDB** | 6.14.2 | NoSQL database for data storage |
| **CORS** | 2.8.5 | Cross-Origin Resource Sharing middleware |
| **dotenv** | 16.4.7 | Environment variable management |
| **Helmet** | 8.1.0 | Security middleware for Express |

### **Database Collections**

1. **menuItems** - Stores all menu items with details
2. **orders** - Session-based cart items (temporary)
3. **customerOrders** - Confirmed customer orders with full details
4. **adminCredentials** - Admin login credentials (single document)

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

# Edit .env file and add your MongoDB connection string
# MONGO_URI="your-mongo-string"
```

**MongoDB Setup:**
- Create a database named `hotelMenu`
- The following collections will be created automatically:
  - `menuItems`
  - `orders`
  - `customerOrders`
  - `adminCredentials`
- **Important**: Add an initial admin credential document manually:
  ```javascript
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

# Edit .env file and set API URL
# For local development:
# VITE_API_URL="http://localhost:5000"
# For production:
# VITE_API_URL="https://your-backend-url.vercel.app"
```

#### 4️⃣ Run the Application

**Terminal 1 - Backend:**
```bash
cd server
node index.js
# Server will run on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
# Client will run on http://localhost:5173
```

#### 5️⃣ Access the Application

- **Customer Interface**: http://localhost:5173
- **Admin Login**: http://localhost:5173/login
  - Default credentials: `admin` / `admin123` (or as set in database)

---

## 🚀 Usage

### **For Customers**

1. **Browse Menu**
   - Navigate to the home page
   - Use search bar to find specific dishes
   - Filter by section using dropdown
   - Click "Order" to add items to cart

2. **Manage Cart**
   - Click cart icon in navbar to view cart
   - Review items, quantities, and prices
   - Remove unwanted items
   - See subtotal, GST, and grand total

3. **Place Order**
   - Fill in customer details (Name, Contact, Address)
   - Review order summary
   - Select payment method
   - Click "Confirm Order"
   - Cart clears automatically after successful order

### **For Admin**

1. **Login**
   - Navigate to `/login`
   - Enter admin credentials
   - Access admin panel

2. **Manage Menu**
   - **Add Items**: Fill form with item details and submit
   - **Delete Items**: Click delete button on any menu item
   - **Search/Filter**: Use search and section filter to find items

3. **View Orders**
   - Navigate to "All Orders" from admin panel
   - View order details including customer info
   - Click "Done" to complete and remove orders

4. **Change Credentials**
   - Navigate to "Change Credentials"
   - Enter previous credentials for verification
   - Set new username and password
   - Auto-redirected to login after update

---

## 📡 API Documentation

### **Base URL**
```
Local: http://localhost:5000
Production: https://your-backend.vercel.app
```

### **Menu Endpoints**

#### Get All Menu Items
```http
GET /
```
**Response**: Array of menu items

#### Check Menu Item Existence
```http
POST /check
Content-Type: application/json

{
  "name": "Chicken Biryani"
}
```
**Response**: `{ "exists": true/false }`

#### Add Menu Item
```http
POST /
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

#### Delete Menu Item
```http
DELETE /
Content-Type: application/json

{
  "_id": "60d5ec49f1b2c8b1f8e4e1a1"
}
```

### **Cart/Order Endpoints**

#### Add Item to Cart
```http
POST /order
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

#### Get Cart Items
```http
GET /orders?sessionId=session_1234567890_abc123
```

#### Remove Item from Cart
```http
DELETE /orders
Content-Type: application/json

{
  "sessionId": "session_1234567890_abc123",
  "_id": "60d5ec49f1b2c8b1f8e4e1a2"
}
```

#### Clear Cart
```http
DELETE /orders/clear
Content-Type: application/json

{
  "sessionId": "session_1234567890_abc123"
}
```

### **Customer Order Endpoints**

#### Place Order
```http
POST /place-order
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

#### Get All Orders (Admin)
```http
GET /place-order
```

#### Get Orders by Session (Customer)
```http
GET /place-order?sessionId=session_1234567890_abc123
```

#### Delete Order (Mark as Done)
```http
DELETE /place-order/:orderId
```

### **Admin Endpoints**

#### Get Admin Credentials
```http
GET /admin
```

#### Verify Admin Credentials
```http
POST /admin/verify
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

#### Update Admin Credentials
```http
PUT /admin
Content-Type: application/json

{
  "username": "newadmin",
  "password": "newpassword123"
}
```

---

## 🌐 Deployment

### **Deploy to Vercel**

#### Backend Deployment

1. Navigate to server directory
2. Ensure `vercel.json` is configured:
```json
{
  "version": 2,
  "builds": [{ "src": "*.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "/" }]
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
2. Update `.env` with production API URL:
```bash
VITE_API_URL="https://your-backend.vercel.app"
```
3. Ensure `vercel.json` is configured:
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

**Backend (.env)**
```bash
MONGO_URI=your-mongo-string
```

**Frontend (.env)**
```bash
# Local Development
VITE_API_URL=http://localhost:5000

# Production
VITE_API_URL=https://your-backend.vercel.app
```

---

## 📁 Project Structure

```
hotel-management-system/
├── client/                          # Frontend React application
│   ├── public/
│   │   └── 8575289.png             # Logo image
│   ├── src/
│   │   ├── components/
│   │   │   ├── Admin.jsx           # Admin panel component
│   │   │   ├── AllOrders.jsx       # Order management component
│   │   │   ├── Cart.jsx            # Shopping cart component
│   │   │   ├── ChangeCredentials.jsx  # Credential update component
│   │   │   ├── Footer.jsx          # Footer component
│   │   │   ├── Login.jsx           # Admin login component
│   │   │   ├── Menu.jsx            # Menu display component
│   │   │   └── Navbar.jsx          # Navigation bar component
│   │   ├── App.jsx                 # Main app component with routes
│   │   ├── main.jsx                # React entry point
│   │   ├── App.css                 # Global styles
│   │   └── index.css               # Tailwind imports
│   ├── .env                        # Environment variables (gitignored)
│   ├── .env.example                # Environment variables template
│   ├── package.json                # Frontend dependencies
│   ├── vite.config.js              # Vite configuration
│   ├── tailwind.config.js          # Tailwind CSS configuration
│   ├── postcss.config.mjs          # PostCSS configuration
│   └── vercel.json                 # Vercel deployment config
│
├── server/                          # Backend Node.js application
│   ├── index.js                    # Express server with all routes
│   ├── .env                        # Environment variables (gitignored)
│   ├── .env.example                # Environment variables template
│   ├── package.json                # Backend dependencies
│   └── vercel.json                 # Vercel deployment config
│
└── Readme.md                       # Project documentation
```

---

## 🔒 Security Features

- ✅ Admin route protection with authentication
- ✅ Session-based cart management
- ✅ Input validation on all forms
- ✅ Error handling with user-friendly messages
- ✅ Secure credential storage in MongoDB
- ✅ CORS configuration for API security
- ✅ Helmet.js for Express security headers
- ✅ Environment variables for sensitive data
