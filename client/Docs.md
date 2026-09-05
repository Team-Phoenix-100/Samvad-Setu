# Frontend (Client) Documentation

**Version:** 1.0.0  
**Last Updated:** 2026-08-30  
**Framework:** React + Vite  
**State Management:** Zustand  
**API Client:** Axios

This document provides a comprehensive guide for the SICP (Samvad-Setu Citizen Issue Portal) frontend application, including architecture, authentication flow, state management, and component structure.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Architecture Overview](#architecture-overview)
- [State Management](#state-management)
- [Authentication System](#authentication-system)
- [API Integration](#api-integration)
- [Key Components](#key-components)
- [Environment Configuration](#environment-configuration)
- [Development Guidelines](#development-guidelines)
- [Agentic Workflow Updates](#agentic-workflow-updates)

---

## Quick Start

### Installation

```bash
cd client
npm install
```

### Development Server

```bash
npm run dev
```

The app will run on `http://localhost:5173`

### Production Build

```bash
npm run build
```

---

## Project Structure

```
client/
├── public/                    # Static assets
├── src/
│   ├── api/
│   │   ├── axios.js          # Configured axios instance with JWT interceptor
│   │   └── mockApi.js        # Mock data for development
│   ├── components/
│   │   └── ui/               # Reusable UI components
│   │       ├── Badge.jsx
│   │       ├── Button.jsx
│   │       └── SignalDot.jsx
│   ├── pages/
│   │   ├── admin/            # Admin dashboard
│   │   ├── citizen/          # Citizen portal pages
│   │   ├── dev/              # Developer tools
│   │   ├── hei/              # Higher Education Institution pages
│   │   ├── industry/         # Industry/CSR pages
│   │   └── public/           # Public routes (Login, Signup, Landing)
│   ├── store/
│   │   ├── authStore.js      # Authentication state (Zustand)
│   │   ├── toastStore.js     # Toast notifications (Zustand)
│   │   └── problemStore.js   # Problem management state
│   ├── App.jsx               # Main app component with routing
│   ├── main.jsx              # Application entry point
│   ├── index.css             # Global styles
│   └── App.css               # App-specific styles
├── package.json              # Dependencies
├── vite.config.js            # Vite configuration
└── Docs.md                   # This file
```

---

## Architecture Overview

### Tech Stack

| Component            | Technology      | Purpose                                                 |
| -------------------- | --------------- | ------------------------------------------------------- |
| **UI Framework**     | React 18+       | Component-based UI library                              |
| **Build Tool**       | Vite            | Fast development server and production bundler          |
| **State Management** | Zustand         | Lightweight state management for auth and notifications |
| **API Client**       | Axios           | HTTP client with automatic JWT token injection          |
| **leaflet**             | ^1.9.4  | Open-source JavaScript library for mobile-friendly interactive maps |
| **react-leaflet**       | ^5.0.0  | React components for Leaflet maps                                   |
| **react-easy-crop**     | ^5.2.0  | Component to crop images with easy interactions                     |
| **lucide-react**        | ^0.263.1| Beautiful and consistent icon toolkit                               |       |

### Design Pattern

- **Component-Based Architecture:** Modular, reusable components organized by feature
- **State Management:** Zustand stores for global state (Auth, Toast)
- **API Integration:** Centralized axios instance with automatic JWT handling
- **Role-Based Routing:** Different dashboards for different user roles

---

## State Management

### 🔐 authStore.js

Manages user authentication state and operations.

**State Variables:**

```javascript
- user: null              // Current user object
- token: string | null    // JWT token from localStorage
- isLoading: boolean      // Loading state during API calls
- error: null | string    // Error messages
```

**Methods:**

| Method   | Parameters          | Returns            | Description                           |
| -------- | ------------------- | ------------------ | ------------------------------------- |
| `login`        | `email`, `password` | `Promise<boolean>` | Authenticate user and store JWT token |
| `signup`       | `userData`          | `Promise<boolean>` | Register new user with provided role  |
| `logout`       | None                | `Promise<void>`    | Call backend logout and clear session |
| `fetchProfile` | None                | `Promise<Object>`  | Fetch latest user profile from API    |

**Usage Example:**

```javascript
import { useAuthStore } from "../../store/authStore";

function LoginForm() {
  const { login, isLoading, error } = useAuthStore();

  const handleLogin = async () => {
    const success = await login(email, password);
    if (success) {
      navigate("/dashboard");
    }
  };
}
```

**Key Features:**

- ✅ Automatic JWT token storage in localStorage
- ✅ Persistent authentication across page reloads
- ✅ Error handling with user-friendly messages
- ✅ Loading state for UI feedback

---

### 🔔 toastStore.js

Manages toast notification display.

**State Variables:**

```javascript
- toast: null | { message: string, type: 'success' | 'error' }
```

**Methods:**

| Method      | Parameters                      | Description                              |
| ----------- | ------------------------------- | ---------------------------------------- |
| `showToast` | `message`, `type?`, `duration?` | Display toast notification (default: 4s) |
| `hideToast` | None                            | Manually hide toast                      |

**Usage Example:**

```javascript
import { useToastStore } from "../../store/toastStore";

function MyComponent() {
  const { showToast } = useToastStore();

  const handleSuccess = () => {
    showToast("Problem submitted successfully!", "success");
  };
}
```

---

### 📋 problemStore.js

Manages problem submissions and listing state (schema defined in server documentation).

---

## Authentication System

### Authentication Flow

```
User Input (Login/Signup)
    ↓
Frontend Form Component
    ↓
authStore.login() / signup()
    ↓
POST /api/auth/login or /api/auth/register
    ↓
Backend Validates & Returns JWT Token
    ↓
Token Stored in localStorage
    ↓
Axios Interceptor Automatically Adds Token to All Requests
    ↓
User Logged In ✓
```

### User Roles & Access Levels

| Role             | Database Value     | Dashboard             | Permissions                              |
| ---------------- | ------------------ | --------------------- | ---------------------------------------- |
| **Citizen**      | `citizen`          | `/citizen/dashboard`  | Submit problems, view public issues      |
| **HEI**          | `hei`              | `/hei/dashboard`      | Review and claim problems for resolution |
| **Industry/CSR** | `industry_csr`     | `/industry/dashboard` | Browse problems, offer solutions         |
| **Admin**        | `government_admin` | `/admin/analytics`    | Moderate content, view analytics         |

### Protected Routes

All private endpoints require a valid JWT token in the `Authorization` header:

```javascript
Authorization: Bearer <JWT_TOKEN>
```

The axios interceptor automatically adds this header to every request.

---

## API Integration

### Axios Configuration

**File:** `src/api/axios.js`

```javascript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Automatic JWT Injection
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### API Endpoints

#### Authentication Endpoints

| Method   | Endpoint         | Public? | Request Body                                                   | Response               |
| -------- | ---------------- | ------- | -------------------------------------------------------------- | ---------------------- |
| **POST** | `/auth/register` | Yes     | `{ name, email, password, role, institutionName, department }` | `{ _id, token, user }` |
| **POST** | `/auth/login`    | Yes     | `{ email, password }`                                          | `{ _id, token, user }` |
| **POST** | `/auth/logout`   | No      | None                                                           | `{ message }`          |
| **GET**  | `/auth/me`       | No      | None                                                           | `{ user }`             |

#### Problem Management Endpoints

| Method    | Endpoint                 | Access Level | Description           |
| --------- | ------------------------ | ------------ | --------------------- |
| **GET**   | `/problems/public`       | Public       | List public problems  |
| **POST**  | `/problems`              | Citizen only | Submit new problem    |
| **POST**  | `/problems/:id/claim`    | HEI only     | Claim a problem       |
| **PATCH** | `/problems/:id/moderate` | Admin only   | Update problem status |

---

## Key Components

### 🔐 Login Page

**File:** `src/pages/public/Login.jsx`

**Features:**

- Email/Phone and password input
- Role auto-detection based on input
- DigiLocker SSO placeholder
- Link to signup page

**Integration:**

- Uses `useAuthStore()` for login
- Uses `useToastStore()` for notifications
- Redirects based on detected role

### ✍️ Signup Page

**File:** `src/pages/public/Signup.jsx`

**Features:**

- Role selection (Citizen, University, Industry, Admin)
- Role-specific form fields
- Consent checkbox
- Form validation
- Password confirmation

**Role Mapping:**

```javascript
citizen → citizen (no org required)
university → hei (requires institution name)
industry → industry_csr (requires company details)
```

**Integration:**

- Maps UI roles to database roles
- Sends formatted payload to `/auth/register`
- Stores JWT token on success
- Shows toast notifications for feedback

### 🎯 Role-Based Dashboards

| Role     | Component         | Path                  | Purpose                           |
| -------- | ----------------- | --------------------- | --------------------------------- |
| Citizen  | CitizenDashboard  | `/citizen/dashboard`  | Submit and track problems         |
| HEI      | HeiDashboard      | `/hei/dashboard`      | Review and claim problems         |
| Industry | IndustryDashboard | `/industry/dashboard` | Browse and offer solutions        |
| Admin    | AdminAnalytics    | `/admin/analytics`    | Platform analytics and moderation |

---

## Environment Configuration

### .env.local (Create this file)

```env
VITE_API_URL=http://localhost:5000
```

### Vite Configuration

**File:** `vite.config.js`

Defines build output, dev server settings, and environment variables loading.

---

## Development Guidelines

### Code Organization

1. **Components:** Keep UI components in `components/ui/`
2. **Pages:** Organize by user role in `pages/{role}/`
3. **Stores:** All Zustand stores in `store/`
4. **API:** Axios and mock data in `api/`

### State Management Best Practices

- Use Zustand for global state (auth, notifications)
- Use React hooks for component-level state
- Keep store logic simple and focused

### API Communication

- Always use the configured `api` instance (from `axios.js`)
- Handle errors with try-catch and show toast notifications
- Display loading states during API calls
- Store JWT token securely in localStorage

### Adding New API Endpoints

1. Update `src/api/axios.js` if new interceptors needed
2. Add methods to appropriate store (e.g., authStore, problemStore)
3. Use `api.post()`, `api.get()` from configured instance
4. Handle errors and show user feedback via `useToastStore`

### Component Example

```javascript
import React, { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { useToastStore } from "../../store/toastStore";
import Button from "../../components/ui/Button";

export default function MyComponent() {
  const { user, isLoading } = useAuthStore();
  const { showToast } = useToastStore();

  const handleAction = async () => {
    try {
      // Your API call here
      showToast("Action successful!", "success");
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      <Button onClick={handleAction} disabled={isLoading}>
        Take Action
      </Button>
    </div>
  );
}
```

---

## Troubleshooting

| Issue                            | Solution                                            |
| -------------------------------- | --------------------------------------------------- |
| "Token not attached to requests" | Check if `VITE_API_URL` is set in `.env.local`      |
| "401 Unauthorized"               | JWT token may be expired; user needs to login again |
| "CORS error"                     | Ensure backend has CORS enabled for frontend URL    |
| "Page reloads lose auth state"   | Check if token is persisted in localStorage         |
| "Toast not showing"              | Ensure toast component is rendered in App.jsx       |

---

## Next Steps

- [ ] Implement protected route guards
- [ ] Add JWT token refresh mechanism
- [ ] Complete problem submission flow
- [ ] Implement HEI claim and moderation flows
- [ ] Add analytics dashboard for admin
- [ ] Integrate DigiLocker SSO
- [ ] Add comprehensive form validation
- [ ] Implement real-time notifications

---

## Agentic Workflow Updates

The following components and layouts were recently added via an Agentic Workflow:

### 1. Sidebar Layout (`src/components/layout/SidebarLayout.jsx`)
- Introduced a unified layout wrapper providing a persistent sidebar for the Citizen module.
- Includes responsive navigation (hides on mobile) and integrates the user's profile.
- Contains a Logout action that clears the session and triggers a global toast notification upon success.

### 2. Profile Page (`src/pages/citizen/Profile.jsx`)
- Replaced the temporary profile stub.
- Displays detailed user information (Name, Email, Phone, Address, Organization) mapped from the global `authStore`.
- Features an aesthetic avatar card with a "Verified Account" badge.
- Added a dedicated Logout button in the Account Security section that triggers a global toast notification.

### 3. Settings Page (`src/pages/citizen/Settings.jsx`)
- Introduced a dedicated settings interface for managing user preferences.
- Includes custom animated toggle switches for Notifications (Email, SMS), Privacy, and Appearance (Dark Mode).

### 4. Routing Updates (`src/App.jsx`)
- Refactored `App.jsx` to group the Citizen routes (`/citizen/dashboard`, `/citizen/submit`, `/citizen/notifications`, `/citizen/profile`, `/citizen/settings`) under the `SidebarLayout`.
- Integrated `ProtectedRoute` wrappers around all module routes to enforce client-side role-based access control (RBAC).

### 5. Role-Based Access Control (`src/components/layout/ProtectedRoute.jsx`)
- Created a robust React Router wrapper that verifies JWT authentication and validates `user.role` against an `allowedRoles` array.
- Automatically redirects unauthorized users (e.g., a citizen trying to access `/admin/analytics`) to their designated dashboard or the login page.
- Resolves the refresh-state bug by asynchronously fetching the user profile via `authStore` if a token is present but the user data is null.

### 6. Dynamic Admin Sidebar Layout
- Refactored `SidebarLayout.jsx` to dynamically render navigation items and portal titles based on the authenticated user's role.
- Government Admins now see "Admin Analytics", while Citizens see "Dashboard", all within the same unified layout and aesthetic.
- Profile and Settings pages are securely reused across modules (e.g., `/admin/profile`) to ensure DRY principles.

### 7. Bug Fix: Problem Detail Routing
- Fixed a dynamic routing bug in `ProblemDetail.jsx` where the "Back to Dashboard" button hardcoded a redirect to `/citizen/dashboard`.
- The back link is now dynamically computed based on `user.role`, ensuring Government Admins and other stakeholders return to their proper dashboards.

### 8. Live Database Integration (`src/store/problemStore.js`)
- Completely refactored the Problem Management system to use live MongoDB data instead of mock placeholders.
- `problemStore.js` now uses the authenticated Axios `api` instance to perform `GET /api/problems/public`, `POST /api/problems`, and `DELETE /api/problems/:id` requests.
- Integrated a new **Delete** feature directly into the `ProblemDetail.jsx` view. The Delete button conditionally renders *only* if the currently authenticated Citizen is the original author of the problem.

### 9. Submit Problem UI/UX Overhaul & Cloudinary
- **Smooth Animations**: Integrated `framer-motion` to wrap all multi-step form transitions in buttery-smooth `<motion.div>` slide and fade animations, making it feel like a premium mobile app.
- **Live Geolocation**: Replaced the static GPS display with a "Use Current Location" button that leverages the browser's `navigator.geolocation` API to retrieve actual latitude and longitude coordinates.
- **Image Cropping**: Integrated `react-easy-crop` into a custom modal. Users can now zoom, drag, and crop their images into 1:1, 4:3, or Free-Form aspect ratios before uploading.
- **Cloudinary Media Uploads**: Upgraded the file input to capture actual cropped `File` objects. The `problemStore` intercepts these files and transforms the payload into a native `multipart/form-data` request. The backend streams these files directly to Cloudinary, ensuring scalable and secure cloud storage.
- **Dynamic Toasts**: Hooked into `useToastStore` to provide instant, beautiful feedback messages when a location is fetched, an image is processed, a problem is successfully submitted, or a problem is securely deleted.
- **Full-Screen Previews**: Added premium modal overlays with dark backdrops to elegantly view cropped images before submission and attached evidence on the Problem Details page.

## Global UI & Route Security Update (Phase 2)
- **Public Layout**: A new `PublicLayout.jsx` orchestrates the presentation of the global `<Navbar />` and `<Footer />` exclusively across public-facing routes (`/`, `/login`, `/signup`, `/map`).
- **Navbar Extraction**: The embedded navigation was extracted from the Landing page into a reusable component featuring dynamic routing and active-state styling.
- **Premium Footer**: A new, modern, 4-column footer was integrated featuring glassmorphic effects, lucid icons, and responsive stacking behavior.
- **Route Hardening**: Addressed a critical security vulnerability where HEI (`/hei/*`) and Industry (`/industry/*`) routes were publicly accessible. These routes are now strictly wrapped inside `<ProtectedRoute>` components with exact role validation (`hei`, `hei_admin`, `industry_csr`, `industry_admin`).
