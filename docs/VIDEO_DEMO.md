# DineEase Video Demo Walkthrough

Use this as a single 3-minute narration that includes the exact action to take on screen at each step.

## Demo Goal

Show the end-to-end experience of DineEase:
- customers browse the menu and place an order
- the app calculates totals with GST
- admins log in, manage menu items, and process orders
- users can track their own order status

## 3-Minute Walkthrough

### 0:00-0:20 - Open the app and introduce the product

Say: "This is DineEase, a full-stack hotel menu and order management system built with React, Vite, Node.js, Express, and MongoDB. It brings together the customer experience and the admin workflow in one platform."

Action: Open the home page on the menu screen and keep the hero/menu section visible.

### 0:20-0:55 - Show browsing and filtering

Say: "On the home page, users can search dishes, filter by section, and browse a live menu grouped by category. Each item shows the cuisine, price, and description, so discovery is fast and clear."

Action: Type a search term, change the section filter, and then click Add To Cart on one or two items.

Say: "When a customer adds an item, DineEase stores it against a session ID so the cart stays linked to that user session."

### 0:55-1:25 - Show cart totals and checkout

Say: "Now I open the cart. The app groups duplicate items, shows quantity, and calculates subtotal, GST, and grand total automatically. The GST rate comes from backend settings, so it can be controlled centrally."

Action: Open the cart, point to the grouped items and totals, then fill in name, contact number, and table or address.

Say: "After confirming the order, DineEase creates the customer order, assigns a serial number, and shows a receipt modal with the final bill."

### 1:25-1:55 - Show order tracking

Say: "The customer can then move to My Orders to see all orders from the current session. This screen shows the serial number, items, payment method, totals, and the current order status."

Action: Navigate to My Orders and highlight the order card and status area.

### 1:55-2:30 - Switch to admin login and dashboard

Say: "Next, I switch to the admin side. The login screen verifies credentials with bcrypt and returns a JWT for protected access."

Action: Open Login, enter admin credentials, and sign in.

Say: "Once logged in, the admin dashboard lets staff add, edit, search, and delete menu items. This is where menu data stays current, including dish name, cuisine, section, price, image, and description."

Action: Point to the add/edit form, search bar, and section filter in the dashboard.

### 2:30-2:50 - Show order management and settings

Say: "From the admin dashboard, I open Manage Orders. Active orders are listed with serial numbers, customer details, item breakdowns, and grand totals. The admin can print a receipt or mark an order as done to clear it from the queue."

Action: Open Manage Orders, show one order card, and click Mark as Done or Print Receipt.

Say: "The dashboard also includes GST settings, so pricing rules can be updated without changing the frontend."

Action: Briefly show the GST settings area or explain where it appears in the dashboard.

### 2:50-3:00 - Close the demo

Say: "DineEase combines a polished customer experience with a practical admin workflow, making it a complete restaurant operations demo built for real-world use."

Action: End on the admin dashboard or return to the home page.

## One-Page User Flow

### Customer Flow

1. Open the home page.
2. Search or filter menu items by section.
3. Add one or more dishes to the cart.
4. Open the cart and review grouped items.
5. Fill in name, contact, and table/address.
6. Confirm the order and show the receipt modal.
7. Navigate to My Orders to show order tracking.

### Admin Flow

1. Open the login page.
2. Sign in with admin credentials.
3. Land on the admin dashboard.
4. Add a new menu item or edit an existing one.
5. Open Manage Orders to view active customer orders.
6. Print a receipt or mark an order as done.
7. Optionally open Security Settings to change admin credentials.

## Presenter Notes

- Keep the cursor movement slow and deliberate.
- Pause briefly after each major action so the UI is readable.
- Use seeded sample menu items and at least one existing order if possible.
- Highlight the backend-driven parts: session-based cart, GST calculation, JWT admin login, and order completion.
