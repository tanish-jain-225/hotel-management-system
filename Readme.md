# DineEase - Hotel Menu Order App

The **DineEase - Hotel Menu Order App** is a full-stack web application designed to streamline the process of managing a hotel's menu, customer orders, and admin functionalities. It provides a seamless experience for customers to browse the menu, add items to their cart, and place orders, while also offering robust admin features for managing orders, menu items, and credentials.

---

## Features

### **Customer Features**

- **Menu Browsing**: View a categorized menu with details like cuisine, price, and description.
- **Cart Management**: Add, update, or remove items from the cart.
- **Order Placement**: Place orders with real-time GST and grand total calculations.

### **Admin Features**

- **Admin Login**: Secure login for admin users.
- **Menu Management**: Add, update, or delete menu items.
- **Order Management**: View all orders, mark orders as completed. 
- **Credential Management**: Update admin credentials securely.

### **Real-Time Updates**

- Instantaneous updates to the UI in response to backend changes.
- Option to refresh the browser on tab changes for the latest data.

---

## Tech Stack

### **Frontend**

- **React.js**: For building the user interface.
- **React Router**: For managing routes and navigation.
- **Tailwind CSS**: For responsive and modern styling.

### **Backend**

- **Node.js**: For server-side logic.
- **Express.js**: For building RESTful APIs.
- **MongoDB**: For database management.

---

## Installation and Setup

### **Prerequisites**

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)

### **Steps**

0. Clone the repository:
   ```bash
   git clone https://github.com/your-username/Hotel_Menu_Order_App.git
   cd Hotel_Menu_Order_App
   ```
1. Local Machine App Test - First replace MongoDB Connection string in 'server/.env' as 'MONGO_URI=Your_Connection_String'
2. Open a terminal in current folder i.e. 'hotel-management-system' and run Command 'cd .\server\'
3. Run Command 'npm i'
4. Run Command 'npm audit fix --force' In case there are Warnings (Optional)
5. Run Command 'node .\index.js'
6. Open another termainal in same folder and run Command 'cd .\client\'
7. Run Command 'npm i'
8. Run Command 'npm audit fix --force' In case there are Warnings (Optional)
9. Run Command 'npm run dev'
10. Go to localhost:5173 in browser and use app
