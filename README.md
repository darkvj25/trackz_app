# Trakz Food & Product Delivery Customer Application 🚀

Welcome to the **Trakz Customer-Facing Mobile & Web Delivery Application**. This is a standalone, mobile-first frontend built with **React**, **Vite**, **Tailwind CSS**, and **React Router**, designed to integrate seamlessly with the existing Trakz Merchant backend platform.

---

## 🌟 Key Features & Highlights

- **Mobile-First Responsive Design**: Inspired by Foodpanda and GrabFood UX, optimized for phones, tablets, and desktop.
- **Trakz Brand Identity**: Fresh, modern red/coral identity with custom typography, clean rounded cards, and smooth interactions.
- **Complete Customer Flow**:
  - **Onboarding & Auth**: Onboarding carousel, Login, Sign Up, Password Reset, Profile Management.
  - **Home Screen**: Greeting, delivery address selector, interactive banner carousel, food categories grid, best-sellers, featured merchants.
  - **Store Discovery & Filters**: Filter by category, delivery time, price, rating (4.5+), open stores, sorting options, and instant search.
  - **Restaurant Details & Menu**: Sticky menu categories, search within merchant, product cards with customization triggers.
  - **Product Customization Modal**: Variant selection (sizes), optional add-ons/toppings, quantity counter, special instructions, dynamic price updates.
  - **Shopping Cart**: Single-merchant constraint protection with conflict resolution modal, item customization breakdown, discount voucher code application (`TRAKZWELCOME`, `FREEDEL`, `TRAKZ100`), fee breakdown.
  - **Checkout Flow**: Address selector, delivery notes, payment method selection (Cash on Delivery, GCash, Maya, Card), order summary, test demo submission.
  - **Live Order Tracking**: Real-time status timeline covering all 9 statuses (`Pending`, `Confirmed`, `Preparing`, `Ready for pickup`, `Rider assigned`, `Picked up`, `On the way`, `Delivered`, `Cancelled`), interactive simulated map component, rider profile card, and a **Demo Simulation Control Panel** to test status changes in real-time!
  - **Order History & Receipts**: Active vs. past orders, itemized receipts, instant reorder action.
  - **In-App Notifications**: Real-time order alerts, promotional announcements, mark as read features.
  - **PWA Capabilities**: Service worker scaffold (`sw.js`) and web app manifest (`manifest.json`) for installation on mobile devices.
  - **Developer API Portal**: Built-in `/api-docs` screen detailing endpoints, environment variables, and data contracts for the backend developer.

---

## 🛠️ Technology Stack

- **Framework**: React 18
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS v3 with custom Trakz design tokens
- **Routing**: React Router DOM v6
- **Icons**: Lucide React
- **State Management**: React Context API (`AuthContext`, `CartContext`, `LocationContext`, `OrderContext`, `NotificationContext`)
- **HTTP Layer**: Centralized `apiClient.js` with configurable mock fallback

---

## 🚀 Quick Start & Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### 3. Build for Production
```bash
npm run build
```

---

## ⚙️ Environment Variables & Backend Integration

The app uses environment variables defined in `.env`:

```env
VITE_API_BASE_URL=https://api.trakz.app/v1
VITE_USE_MOCK_DATA=true
VITE_WS_ORDER_TRACKING_URL=wss://api.trakz.app/ws/orders
VITE_APP_NAME=Trakz
```

### Switching to Production Backend
1. Set `VITE_API_BASE_URL` to your backend server URL (e.g. `https://your-trakz-backend.com/api/v1`).
2. Change `VITE_USE_MOCK_DATA` to `false`.
3. Build or restart the development server.

---

## 📁 Project Structure

```
trackz_app/
├── public/
│   ├── favicon.svg
│   ├── manifest.json
│   └── sw.js
├── src/
│   ├── components/
│   │   ├── cart/
│   │   ├── common/
│   │   ├── home/
│   │   ├── merchant/
│   │   ├── orders/
│   │   ├── profile/
│   │   └── tracking/
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── CartContext.jsx
│   │   ├── LocationContext.jsx
│   │   ├── NotificationContext.jsx
│   │   └── OrderContext.jsx
│   ├── data/
│   │   ├── mockAddresses.js
│   │   ├── mockCategories.js
│   │   ├── mockMerchants.js
│   │   ├── mockNotifications.js
│   │   ├── mockOrders.js
│   │   ├── mockProducts.js
│   │   └── mockPromos.js
│   ├── hooks/
│   ├── layouts/
│   ├── pages/
│   ├── routes/
│   ├── services/
│   │   ├── apiClient.js
│   │   ├── addressService.js
│   │   ├── authService.js
│   │   ├── cartService.js
│   │   ├── merchantService.js
│   │   ├── notificationService.js
│   │   ├── orderService.js
│   │   ├── paymentService.js
│   │   └── productService.js
│   ├── styles/
│   │   └── index.css
│   ├── utils/
│   ├── main.jsx
│   └── vite.config.js
├── docs/
│   └── API_INTEGRATION.md
├── .env.example
└── README.md
```

---

## 📄 License & Attribution

Designed and developed for **Trakz Delivery**. All rights reserved.
