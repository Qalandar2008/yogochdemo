# Yog'och Inventory System

Professional wood product inventory management system built with React, Vite, and Tailwind CSS.

## 🎯 Features

### Public Mode (No Login)
- Home Dashboard with 8 statistic sections showing zero values
- Demo/preview state for potential users
- Login button to access admin panel

### Admin Mode (Login Required)
- Full dashboard with real statistics
- Product management (CRUD operations)
- Detailed statistics and analytics
- Volume tracking and profit calculations

### Authentication
- JWT-ready structure
- Token storage in localStorage
- Protected routes with `ProtectedRoute` component
- Demo credentials: `admin` / `admin`

### Language System
- Uzbek (Latin)
- Uzbek (Cyrillic)
- Dynamic language switching
- Translation files in `/locales/`

### UI/UX
- Premium wood-themed design
- Responsive layout
- Loading skeletons
- Smooth animations
- Search and pagination

## 🎨 Design System

### Colors
- Brown: `#6B4F3A`
- Light Wood: `#D2B48C`
- Beige: `#F5F5DC`
- Dark Wood: `#3E2C23`
- Accent: `#8B9A46`

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Navigate to project directory
cd yogoch-inventory

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Demo Login
- Username: `admin`
- Password: `admin`

## 📁 Project Structure

```
yogoch-inventory/
├── public/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Card.jsx
│   │   ├── StatsBox.jsx
│   │   ├── DataTable.jsx
│   │   ├── LanguageSelector.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Navbar.jsx
│   │   ├── Skeleton.jsx
│   │   └── ProtectedRoute.jsx
│   ├── contexts/         # React contexts
│   │   └── AuthContext.jsx
│   ├── hooks/            # Custom hooks
│   │   └── useTranslation.jsx
│   ├── layouts/          # Page layouts
│   │   └── AdminLayout.jsx
│   ├── locales/          # Translation files
│   │   ├── uz.json
│   │   └── uz_cyrl.json
│   ├── pages/            # Page components
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   └── admin/
│   │       ├── AdminDashboard.jsx
│   │       ├── Products.jsx
│   │       └── Stats.jsx
│   ├── services/         # API services
│   │   └── api.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

## 🔌 API Structure

### Endpoints (Mock Implementation)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/login` | POST | User authentication |
| `/api/products` | GET | List all products |
| `/api/products` | POST | Create new product |
| `/api/products/:id` | PUT | Update product |
| `/api/products/:id` | DELETE | Delete product |
| `/api/stats` | GET | Get dashboard statistics |

### Product Data Structure
```javascript
{
  id: number,
  name: string,
  sizes: [
    { length: number, width: number, height: number, volume: number }
  ],
  quantity: number,
  purchasePrice: number,
  soldQuantity: number,
  soldVolume: number,
  totalVolume: number,
  profit: number
}
```

## 🛣️ Routes

| Route | Component | Access |
|-------|-------------|--------|
| `/` | Home | Public |
| `/login` | Login | Public |
| `/admin` | AdminDashboard | Protected |
| `/admin/products` | Products | Protected |
| `/admin/stats` | Stats | Protected |

## 🧩 Dashboard Sections (8 Total)

1. **Total Products** - Total number of product types
2. **Product Sizes** - Length, width, height dimensions table
3. **Quantity in Stock** - Available items count
4. **Purchase Price** - Entry prices
5. **Volume Tracking** - Cubic meter tracking (sold/available)
6. **Total Volume** - Total cubic meters
7. **Sold Quantity** - Items sold
8. **Profit** - Total profit (highlighted card)

## 🛠️ Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **HTTP Client**: Axios

## 📱 Responsive Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## 🔒 Security Notes

- JWT tokens stored in localStorage
- Protected routes require authentication
- Mock API for development (replace with real backend)
- No sensitive data in frontend code

## 📝 Development Notes

To switch from mock API to real backend:
1. Update `src/services/api.js` to point to real API endpoints
2. Remove mock data and mock implementations
3. Configure axios baseURL to match your backend

## 📄 License

MIT License
