# Nirman - Frontend 🏗️

Nirman is an enterprise-grade construction management and procurement platform. This frontend application provides tailored dashboards for Admins, Vendors, and Workers, facilitating real-time communication, project tracking, and AI-driven procurement insights.

## 🚀 Tech Stack & Core Libraries

- **Framework:** Angular 18+ (Standalone Components, Signals)
- **State Management:** NgRx
- **UI & Styling:** Angular Material, SCSS (Glassmorphism & Dark-Neutral Theme)
- **Data Visualization:** ECharts, DHTMLX Gantt (Project Timelines)
- **File Management:** FilePond (Document & Image Uploads)
- **Mapping & Location:** Google Maps API
- **Payments:** Stripe Elements
- **Real-time & Comm:** Socket.io-client
- **Deployment:** Vercel

## 📂 Project Architecture

The application follows a highly scalable **Feature-based Architecture**:

```
src/
├── app/
│   ├── core/           # Singleton services, interceptors, guards, and app-wide configs
│   ├── shared/         # Reusable UI components, pipes, directives, and models
│   ├── features/       # Feature modules (Domain-driven)
│   │   ├── admin/      # Admin dashboard, AI Insights, Project Management
│   │   ├── vendor/     # Vendor portal, Purchase Orders, Quotations
│   │   ├── worker/     # Worker attendance, tasks, and scheduling
│   │   └── auth/       # Authentication (Login, OTP, Signup workflows)
│   └── store/          # NgRx State (Actions, Reducers, Effects, Selectors)
├── assets/             # Static assets (images, icons)
├── environments/       # Environment variables (dev, prod)
└── styles/             # Global SCSS, theme variables, and mixins
```

## ✨ Key Features

- **Role-Based Dashboards:** Distinct experiences for Admins, Supervisors, Vendors, and Workers.
- **AI Procurement Assistant:** Integrated Retrieval-Augmented Generation (RAG) chat powered by Gemini.
- **Financial Forecasting:** AI-driven cash flow analysis, budget utilization metrics, and strategic recommendations.
- **Project Tracking:** Interactive Gantt charts for construction milestones.
- **Real-Time Updates:** WebSockets for live notifications and chat.
- **Secure File Handling:** Upload and manage architectural drawings and invoices.

## 🛠️ Setup & Installation

### Prerequisites
- Node.js (v18+)
- PNPM or NPM
- Angular CLI

### 1. Clone & Install
```bash
# Navigate to the frontend directory
cd nirman/front-end

# Install dependencies
npm install
```

### 2. Environment Configuration
Create a `environment.ts` and `environment.prod.ts` inside `src/environments/`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/v1',
  socketUrl: 'http://localhost:3000',
  stripePublicKey: 'pk_test_...',
  googleMapsApiKey: 'AIza...'
};
```

### 3. Run Development Server
```bash
npm start
# The app will be available at http://localhost:4200/
```

## 📏 Coding Standards & Best Practices
- **Standalone Components:** All new components must be standalone (`standalone: true`).
- **Reactivity:** Favor Angular Signals (`signal`, `computed`, `effect`) for local component state.
- **Styling:** Use CSS variables and BEM conventions within modular SCSS. Ensure responsive layouts.
- **Services:** All API calls must return strongly typed `Observable<T>` matching the Backend DTOs.
