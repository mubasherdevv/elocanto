# E-Commerce Fullstack Platform

A full-stack e-commerce web application built with **MongoDB, Express.js, React + Vite, and Node.js** (MERN stack).

## ✨ Features Implemented

### 1. Dynamic Shopping Experience
- **Home Page**: Dynamically fetched featured products and product categories.
- **Product Catalog**: View products dynamically loaded from the database.
- **Shopping Cart**: Add items, adjust quantities, and persist the cart using `localStorage`.
- **Checkout Flow**: Collects shipping address, calculates totals, and creates secure Orders.
- **Order History**: Users can view their past orders and shipping details on a dedicated profile page.

### 2. User Authentication & Authorization
- Secure JWT-based registration and login system.
- Passwords hashed with `bcryptjs`.
- Protected frontend routes (`/profile`, `/orders`) and protected backend API endpoints.
- Role-based authorization separating standard Users from Admins.

### 3. Admin Dashboard & Management
- Secure `/admin` route protected by an `isAdmin` database flag.
- **Store Overview**: Analytics dashboard utilizing MongoDB Aggregation Pipelines to visualize 7-day revenue trends and KPIs via `recharts`.
- **Order Management**: View all customer orders and mark them as delivered.
- **Product Management**: Full CRUD operations to create, edit, delete, and manage inventory and pricing.
- **Category Management**: Dynamic GUI to create global product categories, complete with product-count aggregation integration.

## 🛠 Tech Stack
| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, TailwindCSS 3, React Router v6, Recharts, Axios |
| **Backend** | Node.js, Express.js, MongoDB Atlas, Mongoose, JWT, bcryptjs |

## 📂 Project Structure
```text
ecomm/
├── frontend/     # React application
└── backend/      # Express.js API
```

## 🚀 Additional Features to Add

### High-Value Features
| Feature | Description |
|---------|-------------|
| **Payment Integration** | Stripe/PayPal for checkout payments |
| **Review & Ratings** | Product reviews with star ratings |
| **Wishlist** | Save products for later (separate from favorites) |
| **Search & Filters** | Advanced search with price range, sort, attributes |
| **Notifications** | In-app notifications for orders, messages, favorites |

### User Engagement
| Feature | Description |
|---------|-------------|
| **Live Chat** | Real-time chat using Socket.io |
| **Social Login** | Google/Facebook OAuth |
| **User Verification** | Email/phone verification |
| **Password Reset** | Forgot password flow |
| **Account Deletion** | GDPR compliance |

### Admin & Analytics
| Feature | Description |
|---------|-------------|
| **Dashboard Widgets** | Top products, recent activity, revenue charts |
| **Email Marketing** | Newsletter subscriptions, promotional emails |
| **Coupons/Discounts** | Promo codes system |
| **Inventory Alerts** | Low stock notifications |
| **Site Analytics** | Page views, user behavior tracking |

### Additional
| Feature | Description |
|---------|-------------|
| **Multi-language** | i18n support |
| **Dark Mode** | Theme toggle |
| **PWA Support** | Installable mobile app |
| **Bulk Import/Export** | CSV import for products |
| **Report System** | User-reported content moderation |

## ⚡ Running Locally

**1. Clone the project**
```bash
git clone <your-repo>
cd ecomm
```

**2. Backend Setup**
Create a `.env` file in the `backend/` directory:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key
```

Run the backend:
```bash
cd backend
npm install
npm run dev
# → API runs on http://localhost:5000
```

**3. Frontend Setup**
```bash
cd frontend
npm install
npm run dev
# → React runs on http://localhost:5173
```
