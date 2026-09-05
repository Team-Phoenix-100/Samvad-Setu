# Backend API Documentation

**Version:** 1.0.0  
**Last Updated:** 2026-08-30

This document outlines the architecture, technology stack, and initial API routes for our backend service. It serves as the primary reference for frontend and backend developers integrating with the system.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Setup & Installation](#local-setup--installation)
- [Project Dependencies](#project-dependencies)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [API Routes](#api-routes)

---

## Prerequisites

- **Node.js** v16+ and **npm** installed
- **MongoDB** running locally or connection string ready
- **Git** for version control

---

## Local Setup & Installation

### Step 1: Clone & Navigate

```bash
cd server
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Environment Configuration

Create a `.env` file in the server root:

```
JWT_SECRET=your_secret_key_here
MONGO_URI=mongodb://localhost:27017/samvad-setu
PORT=5000
NODE_ENV=development
```

### Step 4: Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`

---

## Project Dependencies

### 📦 Core Dependencies

| Package      | Version | Purpose                                                          |
| ------------ | ------- | ---------------------------------------------------------------- |
| **express**  | ^5.2.1  | Core web framework for building the API and handling routing     |
| **mongoose** | ^9.9.2  | Object Data Modeling (ODM) library for MongoDB interactions      |
| **multer**   | ^1.4.5-lts.1 | Middleware for handling multipart/form-data (file uploads)     |
| **cloudinary**| ^2.5.1  | Cloud service for image management and optimization              |
| **cors**     | ^2.8.6  | Enables Cross-Origin Resource Sharing for frontend communication |

### 🔐 Security Dependencies

| Package          | Version | Purpose                                                                 |
| ---------------- | ------- | ----------------------------------------------------------------------- |
| **jsonwebtoken** | ^9.0.3  | Generates and verifies secure JWTs for authentication and authorization |
| **bcryptjs**     | ^3.0.3  | Hashes and secures user passwords before storage in database            |

### ⚙️ Configuration & Environment

| Package    | Version | Purpose                                                               |
| ---------- | ------- | --------------------------------------------------------------------- |
| **dotenv** | ^17.4.2 | Loads environment variables from `.env` file for secure configuration |

### 🛠️ Development Dependencies

| Package     | Version | Purpose                                                          |
| ----------- | ------- | ---------------------------------------------------------------- |
| **nodemon** | ^3.1.14 | Automatically restarts the server when file changes are detected |

### 📋 Dependency Summary

- **Total Packages:** 7 (6 production + 1 development)
- **Security-focused:** Includes JWT and password hashing
- **Database:** MongoDB with Mongoose ODM
- **API:** Express with CORS support
- **Dev:** Hot-reload with Nodemon

---

## Architecture & Tech Stack

| Component            | Technology / Pattern        | Details                               |
| -------------------- | --------------------------- | ------------------------------------- |
| **Architecture**     | MVC (Model-View-Controller) | Organized by concerns for scalability |
| **API Framework**    | Express JS                  | Fast, minimal web framework           |
| **Database**         | MongoDB                     | NoSQL document database               |
| **Authentication**   | JWT (JSON Web Tokens)       | Stateless token-based auth            |
| **Password Hashing** | bcryptjs                    | Secure password storage               |

---

## API Routes

### 🔐 Authentication Routes

**Base Path:** `/api/auth`  
**File Location:** `routes/authRoutes.js` → `controllers/authController.js`

| Method   | Endpoint             | Access Level                    | Description                                                                             |
| -------- | -------------------- | ------------------------------- | --------------------------------------------------------------------------------------- |
| **POST** | `/api/auth/register` | Public                          | Registers a new user. Valid roles: `citizen`, `hei`, `industry_csr`, `government_admin` |
| **POST** | `/api/auth/login`    | Public                          | Authenticates a user and returns JWT token + user profile                               |
| **POST** | `/api/auth/logout`   | Private _(Authenticated users)_ | Terminates user session (requires client-side token deletion)                           |
| **GET**  | `/api/auth/me`       | Private _(Authenticated users)_ | Retrieves the current logged-in user's profile data                                     |

**Authentication Headers:**

```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

---

### 📋 Problem Management Routes

**Base Path:** `/api/problems`  
**File Location:** `routes/problemRoutes.js` → `controllers/problemController.js`

| Method    | Endpoint                     | Access Level                           | Description                                                      | Status         |
| --------- | ---------------------------- | -------------------------------------- | ---------------------------------------------------------------- | -------------- |
| **GET**   | `/api/problems/public`       | Public                                 | Retrieves all civic problems from the database                   | 🟢 Live MongoDB |
| **POST**  | `/api/problems`              | Private _(Citizen only)_               | Submits a new problem with multipart/form-data Cloudinary image upload | 🟢 Live MongoDB |
| **DELETE**| `/api/problems/:id`          | Private _(Citizen only)_               | Deletes a problem and syncs deletion with Cloudinary assets      | 🟢 Live MongoDB |
| **POST**  | `/api/problems/:id/claim`    | Private _(HEI, HEI Admin)_             | Allows an institution to claim a specific problem for resolution | ⚠️ Placeholder |
| **PATCH** | `/api/problems/:id/moderate` | Private _(Govt Admin, Platform Admin)_ | Updates the lifecycle status of a reported problem               | ⚠️ Placeholder |

---

### 🛡️ Admin & Government Routes

**Base Path:** `/api/admin`  
**File Location:** `routes/adminRoutes.js`

| Method    | Endpoint                     | Access Level                           | Description                                                      |
| --------- | ---------------------------- | -------------------------------------- | ---------------------------------------------------------------- |
| **GET**   | `/api/admin/verify`          | Private _(Govt Admin, Platform Admin)_ | Verifies strict admin access via RBAC middleware                 |

---

## Development Notes

- 📌 All private routes require valid JWT in `Authorization` header
- 📌 Problem Management endpoints are currently placeholders
- 📌 Database integration for Problems is pending
- 📌 Use `npm run dev` for hot-reload during development

## Global UI & Route Security Update (Phase 2)
- **Public Layout**: A new `PublicLayout.jsx` orchestrates the presentation of the global `<Navbar />` and `<Footer />` exclusively across public-facing routes (`/`, `/login`, `/signup`, `/map`).
- **Navbar Extraction**: The embedded navigation was extracted from the Landing page into a reusable component featuring dynamic routing and active-state styling.
- **Premium Footer**: A new, modern, 4-column footer was integrated featuring glassmorphic effects, lucid icons, and responsive stacking behavior.
- **Route Hardening**: Addressed a critical security vulnerability where HEI (`/hei/*`) and Industry (`/industry/*`) routes were publicly accessible. These routes are now strictly wrapped inside `<ProtectedRoute>` components with exact role validation (`hei`, `hei_admin`, `industry_csr`, `industry_admin`).
