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
2. Create a collection named `adminCredentials`.
3. Insert an initial document to set your login:
   ```json
   {
     "username": "admin",
     "password": "1234"
   }
   ```

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

The system uses a **Simple Plain-Text Matching** logic for admin tasks:

- **Login**: Accessed via `/login`. Matches submitted `username` and `password` directly against the database.
- **Security Settings**: Accessed via the "Reset Credentials?" link on the login page.
- **Debug Logs**: Check your server terminal to see real-time comparisons between entered and fetched credentials.

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
The GST rate is currently set at **5%**. You can modify this in `client/src/components/Cart.jsx` by changing the `GST_RATE` constant.

---

## 🆘 Troubleshooting
- **401 Unauthorized**: Ensure your `JWT_SECRET` in `.env` matches the one being used by the server at startup.
- **CORS Errors**: Verify that the `cors` middleware in `server/index.js` allows your frontend domain.
- **Empty Menu**: Ensure your `MONGO_URI` is correct and you have seeded the `items` collection in the `hotelMenu` database.
