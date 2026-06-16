# 🛠️ DineEase Installation & Configuration Guide

Follow these steps to set up DineEase for local development and production deployment.

---

## 📋 Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB Atlas** account (or local MongoDB instance)
- **Git**

---

## 🚀 Local Development

### 1. Database Configuration
1. Create a MongoDB database named `hotelMenu`.
2. Create a collection named `adminCredentials`. (Note: The application will automatically seed this with default credentials `{ "username": "admin", "password": "123456" }` securely on first connection if empty).

### 2. Backend Setup (`/server`)
1. Navigate to the server folder:
   ```bash
   cd server
   npm install
   ```
2. Create a `.env` file from the example:
   ```env
   MONGO_URI=your_mongodb_atlas_uri
   PORT=5000
   JWT_SECRET=your_secure_random_string
   ```
3. Run the server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup (`/client`)
1. Navigate to the client folder:
   ```bash
   cd client
   npm install
   ```
2. Create a `.env` file from the example:
   ```env
   VITE_API_URL_DEV=http://localhost:5000
   VITE_API_URL_PROD=https://your-deployed-backend.vercel.app
   ```
3. Run the app:
   ```bash
   npm run dev
   ```

---

## 🔐 Administrative Access

The system uses a **Bcrypt Hashed Authentication** model for admin tasks:

- **Login**: Accessed via `/login`. Verifies submitted credentials against secure bcrypt hashes in the database.
- **Auto-Seeding**: If the database `adminCredentials` collection is empty, it automatically seeds `{ "username": "admin", "password": "123456" }` (stored securely as a bcrypt hash) on first database connection.
- **Auto-Migration**: Any existing plain-text passwords in your database are automatically migrated to secure bcrypt hashes on startup/first database connection.
- **Security Settings**: Accessed via the "Reset Credentials?" link on the login page. Allows updating credentials by verifying the previous password and storing the new password as a bcrypt hash.

---

## 🌍 Production Deployment

### Vercel Deployment
1. Push your code to GitHub.
2. Link the repository to Vercel.
3. **Frontend Settings**:
   - Framework: Vite
   - Root Directory: `client`
   - Env Vars: `VITE_API_URL_PROD`
4. **Backend Settings**:
   - Framework: Other (Serverless Functions)
   - Root Directory: `server`
   - Env Vars: `MONGO_URI`, `JWT_SECRET`, `PORT=5000`

---

## 🛠️ Common Tasks

### **Adding Menu Categories**
Categories are dynamically generated from the `section` field in your MongoDB items. To add a new category, simply add an item with a new section name.

### **Updating GST Rates**
The GST rate is dynamically stored in the database (`systemSettings` collection) and can be modified by the administrator directly via the **GST Configuration Panel** on the **Admin Dashboard** (`/admin`).

---

## 🆘 Troubleshooting
- **401 Unauthorized**: Ensure your `JWT_SECRET` in `.env` matches the one being used by the server at startup.
- **CORS Errors**: Verify that the `cors` middleware in `server/index.js` allows your frontend domain.
- **Empty Menu**: Ensure your `MONGO_URI` is correct and you have seeded the `menuItems` collection in the `hotelMenu` database.
