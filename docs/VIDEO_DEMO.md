# Project Demo Script Plan

Duration: 2-3 minutes

Goal: deliver a winning, high-clarity walkthrough of the complete project flow with visible proof.

Last validated against current build: June 22, 2026

## Winning Structure

1. Hook the problem quickly.
2. Show live menu search, filtering, and add-to-cart in action.
3. Show session-based cart checkout and dynamic GST calculations.
4. Prove kitchen order processing, audio alerts, and receipt printing.
5. Close with deployment and impact.

## Full Recording Script (DineEase)

### 0:00-0:10 | Problem Hook

Screen action:
- Open the menu page hero section.

Say:
- "Traditional restaurant ordering processes suffer from slow queues, manual bill errors, and disconnected menus. DineEase solves this with a secure, session-aware menu and live kitchen management system."

### 0:10-0:25 | Product and Roles

Screen action:
- Keep the categories filter bar and first few menu items visible.

Say:
- "The platform seamlessly connects the customer browsing experience with real-time backend kitchen workflows, syncing shopping cart actions and order history under a unified MongoDB architecture."

### 0:25-0:35 | Customer Menu Selection

Screen action:
- Filter by a category (e.g., select a cuisine option).
- Type a dish name into the search bar.
- Click Add To Cart on one or two items to show the toast notifications and quantity controls.

Say:
- "Customers can instantly filter by category, search the menu, and add items. The cart persists matching their session ID, ensuring their choices are stored securely."

### 0:35-1:10 | Cart and Checkout Totals

Screen action:
- Click the cart icon to navigate to the Cart page.
- Point to the subtotal, GST percentage, and grand total.
- Fill out the checkout form with customer name, contact number, and table number.
- Click Confirm Order to place it and show the Receipt modal.

Say:
- "In the cart, duplicate items are grouped, showing a breakdown of pricing. The system calculates subtotal, GST based on dynamic server settings, and the grand total. After entering customer details, we generate a secure order receipt."

### 1:10-1:25 | Live Order Status Tracking

Screen action:
- Click Track My Order Status in the receipt modal to navigate to the My Orders page.
- Highlight the active stepper showing the order status as Placed.

Say:
- "Once placed, the order goes to the tracker page. It uses auto-polling to update the stepper instantly as the kitchen works, from Placed to Served."

### 1:25-1:55 | Admin Dashboard & Analytics

Screen action:
- Navigate to the login page and sign in as admin.
- Point at the analytics metrics: Active Orders, Completed (24h), and Revenue (24h).
- Modify the GST rate in the GST Configuration panel and click Save.

Say:
- "Now we switch to the admin dashboard, protected by JWT access. The metrics panel displays active orders, completed counts, and total revenue. Let's update our GST rate here; it immediately modifies checkout calculations frontend-wide."

### 1:55-2:20 | Menu Stock Control

Screen action:
- Scroll down to the menu item management area.
- Click the checkmark to toggle stock availability for an item (e.g., set to Out of Stock).
- Click edit on an item, change its price, and save.

Say:
- "Staff can manage the live menu, edit pricing, or toggle stock availability instantly. Out-of-stock items update on the customer menu page in real-time, preventing incorrect orders."

### 2:20-2:35 | Kitchen Governance & Print

Screen action:
- Navigate to Manage Orders.
- Show the new customer order card.
- Click Start Preparing, click Print Receipt (canceling the browser print window), and then click Mark as Served.

Say:
- "In Manage Orders, active orders show in a live kitchen feed. When a new order arrives, a Web Audio chime sounds automatically. We can print receipts for kitchen staff, and transition statuses until the order is served."

### 2:35-2:50 | Deployment and Impact Close

Screen action:
- Show the repository structure or deployed configuration links.

Say:
- "DineEase is deployed with React + Vite on the frontend and Express + Node.js on Vercel, fully integrated with MongoDB. It makes dining operations faster, error-free, and simpler to govern."

## Backup Branch (If AI or Network Is Slow)

If database operations or the server response is slow, say this and continue:

- "The order submission is processing. In parallel, here is a pre-existing active order on our tracker screen showing the exact stepper layout and kitchen feed verification."
- "The platform utilizes asynchronous polling and error boundaries so the user state remains fully persistent."

Then jump directly to the Admin Dashboard section.

## On-Screen Sequence Checklist

1. Landing menu and hero visible.
2. Menu filtering and search shown.
3. Cart item grouping and GST calculation pointed out.
4. Receipt modal with serial number shown.
5. My Orders stepper tracker displayed.
6. Admin authentication and analytics panel visible.
7. GST rate configuration update shown.
8. Menu item edit and stock toggling demonstrated.
9. Kitchen orders page with state progression and print view shown.

## Delivery Tips for Higher Score

1. Keep cursor movement deliberate and minimal.
2. Never wait silently during server/network calls; narrate database persistence and status polling.
3. Use one concrete dish example from search to saved order.
4. Use "session-aware" wording, not absolute offline claims.
5. End with measurable value: speed, governance, and revenue metrics.

## Pre-Recording Setup

1. Keep one browser tab open for customer menu and another for admin dashboard.
2. Keep the seeder database initialized with standard items.
3. Prepare a test client session to avoid empty carts.
4. Confirm server is running locally and printing layouts render cleanly.
5. Record at readable zoom and consistent resolution.
