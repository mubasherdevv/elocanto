# OLX Marketplace - Full Stack Classified Ads Platform

A full-stack classified ads marketplace built with **MERN Stack** (MongoDB, Express.js, React + Vite, Node.js).

---

## 🚀 Features Implemented

### 1. User Authentication System
- JWT-based secure registration and login
- Password hashing with bcrypt
- Email verification with OTP codes
- Password reset functionality
- Google OAuth integration
- Account lockout after failed login attempts (5 attempts)
- Temporary email domain blocking

### 2. Classified Ads Marketplace
- **Post Ads**: Create listings with multiple images, pricing, categories, subcategories
- **Ad Types**: Featured ads (highlighted with gold styling) and Simple ads
- **Categories**: Hierarchical category/subcategory system
- **Cities**: Location-based listings
- **Search & Filters**: Filter by category, subcategory, price range, city
- **Favorites**: Save ads to favorites list

### 3. Dual View Tracking System
- **Featured Ads**: Impression-based tracking (every page load counts)
- **Simple Ads**: Unique view tracking (1 view per user/IP, resets after 24 hours)
- Bot detection and filtering
- Analytics ready for dashboard

### 4. User Dashboard
- View own posted ads
- Edit profile (name, phone, city, bio)
- Favorites management
- Ad renewal (auto-duration based on settings)
- Messages inbox

### 5. Admin Dashboard (`/admin`)
- **Dashboard Analytics**: Revenue trends, user stats, category breakdown
- **Ads Management**: Approve/reject ads, edit details, renew ads, delete
- **User Management**: View users, ban/unban, assign badges
- **Category Management**: Create/edit/delete categories and subcategories
- **SEO Settings**: Meta tags, keywords for dynamic pages
- **Site Settings**: Configurable ads duration, pagination, price format
- **Activity Logs**: Track admin actions and user activities
- **Reports Management**: View user-submitted reports

### 6. Auto-Sync Ads Duration
- When admin changes Simple/Featured ad duration in settings, all active ads are automatically updated
- Bulk update without manual renewal required
- Instant sync across all pages

### 7. Email System
- SMTP configuration for transactional emails
- Email templates for verification, password reset, password changed
- Customizable sender name and email

### 8. Security Features
- Rate limiting (100 requests per 15 minutes)
- Helmet.js for HTTP security headers
- JWT token expiry configuration
- Password strength validation
- Protected routes for authenticated users

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, Vite, TailwindCSS 3, React Router v6, Axios, Recharts, Heroicons |
| **Backend** | Node.js, Express.js, MongoDB Atlas, Mongoose 8 |
| **Auth** | JWT, bcryptjs, Google OAuth |
| **Email** | Nodemailer (SMTP) |

---

## 📂 Project Structure

```
ecomapp/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/           # Business logic
│   │   ├── adController.js
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── categoryController.js
│   │   ├── cityController.js
│   │   ├── favoriteController.js
│   │   ├── messageController.js
│   │   ├── reportController.js
│   │   ├── seoController.js
│   │   ├── subcategoryController.js
│   │   ├── userController.js
│   │   └── viewController.js
│   ├── middleware/
│   │   ├── authMiddleware.js  # JWT auth, admin check
│   │   └── rateLimiter.js     # Request rate limiting
│   ├── models/                # Mongoose schemas
│   │   ├── ActivityLog.js
│   │   ├── Ad.js
│   │   ├── Category.js
│   │   ├── City.js
│   │   ├── Favorite.js
│   │   ├── FeaturedAdView.js
│   │   ├── Message.js
│   │   ├── Report.js
│   │   ├── SeoContent.js
│   │   ├── Settings.js
│   │   ├── SimpleAdView.js
│   │   ├── Subcategory.js
│   │   ├── User.js
│   │   └── index.js
│   ├── routes/                 # API routes
│   │   ├── adRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── cityRoutes.js
│   │   ├── favoriteRoutes.js
│   │   ├── messageRoutes.js
│   │   ├── reportRoutes.js
│   │   ├── seoContentRoutes.js
│   │   ├── settingsRoutes.js
│   │   ├── subcategoryRoutes.js
│   │   ├── uploadRoutes.js
│   │   ├── userRoutes.js
│   │   ├── viewRoutes.js
│   │   └── index.js
│   ├── utils/
│   │   ├── activityLogger.js
│   │   ├── emailSender.js
│   │   └── validators.js
│   └── server.js
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/         # Reusable components
│       │   ├── AdCard.jsx
│       │   ├── AdGrid.jsx
│       │   ├── CitySelector.jsx
│       │   ├── ImageCarousel.jsx
│       │   ├── Layout.jsx
│       │   ├── Navbar.jsx
│       │   ├── ProtectedRoute.jsx
│       │   ├── Rating.jsx
│       │   └── index.js
│       ├── context/             # React contexts
│       │   ├── AdContext.jsx
│       │   ├── AuthContext.jsx
│       │   ├── CartContext.jsx
│       │   └── SettingsContext.jsx
│       ├── hooks/              # Custom hooks
│       │   └── useViewTracker.js
│       ├── pages/              # Page components
│       │   ├── AdDetailPage.jsx
│       │   ├── AdsListingPage.jsx
│       │   ├── AdminAdsPage.jsx
│       │   ├── AdminDashboardPage.jsx
│       │   ├── AdminReportsPage.jsx
│       │   ├── AdminSettingsPage.jsx
│       │   ├── AdminUsersPage.jsx
│       │   ├── CategoryManagePage.jsx
│       │   ├── ForgotPasswordPage.jsx
│       │   ├── HomePage.jsx
│       │   ├── LoginPage.jsx
│       │   ├── MessagesPage.jsx
│       │   ├── PostAdPage.jsx
│       │   ├── ProfilePage.jsx
│       │   ├── RegisterPage.jsx
│       │   ├── ResetPasswordPage.jsx
│       │   ├── UserDashboardPage.jsx
│       │   └── UserProfile.jsx
│       ├── utils/
│       │   └── urlUtils.js
│       ├── App.jsx
│       └── main.jsx
├── uploads/                   # Uploaded files
├── .env.example
├── package.json
└── README.md
```

---

## 🌐 API Endpoints

### Public Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ads` | Get all ads with filters |
| GET | `/api/ads/featured` | Get featured ads |
| GET | `/api/ads/latest` | Get latest ads |
| GET | `/api/ads/:id` | Get single ad details |
| GET | `/api/categories` | Get all categories |
| GET | `/api/subcategories` | Get all subcategories |
| GET | `/api/cities` | Get all cities |
| GET | `/api/settings` | Get site settings |
| POST | `/api/views/track` | Track single ad view |
| POST | `/api/views/track-bulk` | Track multiple ad views |

### Auth Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/register` | User registration |
| POST | `/api/users/login` | User login |
| POST | `/api/users/google` | Google OAuth login |
| POST | `/api/users/verify-email` | Verify email OTP |
| POST | `/api/users/forgot-password` | Request password reset |
| POST | `/api/users/reset-password` | Reset password |
| GET | `/api/users/profile` | Get user profile |
| PUT | `/api/users/profile` | Update user profile |

### Protected Routes (Auth Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ads` | Create new ad |
| PUT | `/api/ads/:id` | Update ad |
| DELETE | `/api/ads/:id` | Delete ad |
| GET | `/api/ads/my` | Get user's ads |
| GET | `/api/favorites` | Get user favorites |
| POST | `/api/favorites/:adId` | Toggle favorite |
| GET | `/api/messages` | Get conversations |
| POST | `/api/messages` | Send message |

### Admin Routes (`/api/admin`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/analytics` | Dashboard analytics |
| PUT | `/settings` | Update site settings |
| POST | `/update-ads-duration` | Auto-sync ads duration |
| GET | `/users` | Get all users |
| PUT | `/users/:id/status` | Ban/unban user |
| PUT | `/users/:id/badges` | Manage user badges |
| GET | `/ads` | Get all ads (admin view) |
| PUT | `/ads/:id` | Update any ad |
| DELETE | `/ads/:id` | Delete any ad |
| GET | `/reports` | Get user reports |
| PUT | `/reports/:id` | Handle report |
| GET | `/activity-logs` | Get activity logs |

---

## ⚙️ Site Settings (Admin Configurable)

| Setting | Default | Description |
|---------|---------|-------------|
| `siteName` | MarketX | Site display name |
| `featuredAdsLimit` | 10 | Featured ads on homepage |
| `latestAdsLimit` | 10 | Latest ads on homepage |
| `simpleAdsDuration` | 30 days | Simple ad expiration |
| `featuredAdsDuration` | 7 days | Featured ad expiration |
| `maxImagesPerAd` | 5 | Max images per ad |
| `priceFormat` | PKR | Currency symbol |
| `featuredAdsPerPage` | 12 | Ads per page |
| `rotationLogic` | random | Featured ads rotation |
| `enableEmailVerification` | true | Require email verification |

---

## 🚀 Running Locally

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### 1. Clone the project
```bash
git clone <your-repo>
cd ecomapp
```

### 2. Backend Setup
Create `backend/.env`:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/ecomm
JWT_SECRET=your_super_secret_key_at_least_32_chars
JWT_EXPIRE=30d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

Run backend:
```bash
cd backend
npm install
npm run dev
# → API runs on http://localhost:5000
```

### 3. Frontend Setup
Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

Run frontend:
```bash
cd frontend
npm install
npm run dev
# → App runs on http://localhost:5173
```

---

## 🔐 Security Notes

- Never commit `.env` files
- Use strong JWT secrets (32+ characters)
- Enable MongoDB Atlas IP whitelist
- Use app passwords for Gmail SMTP
- Keep dependencies updated

---

## 📝 License

MIT License - Feel free to use for personal or commercial projects.
"# elocanto" 
