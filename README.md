# ShowcasePro - Full-Stack Portfolio Showcase Platform

An immersive, premium portfolio and content engine designed for engineers and creators to display their projects, blogs, credentials, and skills. Built with a robust **Node.js/Express** backend, a responsive **React (Vite) + Tailwind CSS** frontend, and a secure **MongoDB** database.

---

## 🚀 Key Features

### 💻 Frontend (React + Vite)
- **Modern User Experience:** Smooth micro-interactions and transitions powered by **Framer Motion**.
- **Interactive Showcases:** Advanced searching, filtering, sorting, and pagination for projects and blogs.
- **Admin Dashboard:** Full-featured resource manager to manage projects, blogs, testimonials, certificates, and skills directly from the browser.
- **Contact Forms:** Direct client message submittal with built-in validation.
- **User Center:** Features like saved/favorited projects, comments on blogs, customized settings, and a user notification tray.

### ⚙️ Backend (Express + MongoDB)
- **Robust Authentication:** Secure JWT-based authentication using HTTP-only cookies and bcrypt password hashing.
- **Media Management:** Direct, secure image uploads via **Cloudinary** integration.
- **Comprehensive Security Suite:** Implements API rate limiting, CORS configuration, XSS protection, MongoDB query sanitization, parameter pollution protection (HPP), and custom security headers via **Helmet**.
- **API Architecture:** RESTful structure with specialized middleware for roles (Admin vs. User) and schema validation using `express-validator`.
- **Database Seeding:** Preconfigured script to seed the database with mock user, skill, project, and blog data.

---

## 🛠️ Tech Stack

- **Frontend:** React (v19), Vite, Tailwind CSS, React Router DOM, React Hook Form, React Icons, Axios, Framer Motion.
- **Backend:** Node.js, Express, Mongoose (MongoDB), Multer, Cloudinary, JWT, Nodemailer, Bcryptjs, Morgan, Compression.
- **Dev Tools:** ESLint, Nodemon, Concurrently.

---

## 📁 Repository Structure

```text
├── backend/                  # Express REST API
│   ├── src/
│   │   ├── config/           # Database config & env loader
│   │   ├── controllers/      # Route handler logic
│   │   ├── middleware/       # Auth, role-checks, rate-limiting, error handlers
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/           # Express routers
│   │   ├── utils/            # Helper functions (email, upload)
│   │   ├── validators/       # Input schemas and validation
│   │   ├── app.js            # Express app entry definition
│   │   ├── seed.js           # Database seeding script
│   │   └── server.js         # Port listener / entry point
│   ├── .env.example          # Environment variables template
│   └── package.json
│
├── frontend/                 # React Single Page App
│   ├── src/
│   │   ├── api/              # Axios client and API methods
│   │   ├── components/       # Shared UI components
│   │   ├── context/          # State management (Auth, Theme, Toast)
│   │   ├── pages/            # View components (Public, User, Admin)
│   │   ├── styles/           # Global styles and tailwind directives
│   │   ├── App.jsx           # Main routing entry
│   │   └── main.jsx          # React app DOM render point
│   ├── .env.example          # Frontend configuration template
│   ├── tailwind.config.js    # Tailwind layout customizations
│   └── package.json
│
├── docs/                     # Extended technical documentation
│   ├── API.md                # Endpoint specs and schema query params
│   ├── ARCHITECTURE.md       # Diagrammed frontend/backend system architecture
│   ├── DATABASE.md           # Mongoose collection models and ER relationships
│   └── DEPLOYMENT.md         # Production setup for Render, Vercel & Atlas
│
├── package.json              # Workspace-wide commands
└── README.md                 # Project starter guide (This file)
```

---

## ⚙️ Local Development Setup

Follow these steps to run the frontend and backend concurrently on your local machine:

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- A running [MongoDB](https://www.mongodb.com/) instance (local or MongoDB Atlas connection string)
- A [Cloudinary](https://cloudinary.com/) account for image storage

### 2. Installation
Clone the repository and run the installation script at the workspace root to install dependencies for both the frontend and backend:

```bash
# Install root, backend, and frontend dependencies
npm run install:all
```

### 3. Environment Configuration

#### Backend Setup
Create a `.env` file in the `backend/` directory by copying `.env.example`:

```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and update the variables:
- `MONGO_URI`: Your MongoDB connection string.
- `JWT_SECRET`: A long, complex random string.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Credentials from your Cloudinary console.

#### Frontend Setup
Create a `.env` file in the `frontend/` directory by copying `.env.example`:

```bash
cp frontend/.env.example frontend/.env
```

Open `frontend/.env` and verify the settings:
- `VITE_API_URL`: Points to your local backend API (default is `http://localhost:5000/api`).

### 4. Database Seeding
Populate the database with initial categories, a default administrator account, and sample showcase entries:

```bash
cd backend
npm run seed
```
*Note: This deletes any existing collections and creates a default administrator: **admin@example.com** with password **Password123!**.*

### 5. Running the Application
Return to the root directory and start the unified development server:

```bash
# Runs frontend (on port 5173) and backend (on port 5000) concurrently
npm run dev
```

---

## 📚 Technical Documentation & Guides

For details on configuration, database entity models, and API definitions, check the documentation files:
- **System Flowcharts:** [Architecture Guide](./docs/ARCHITECTURE.md)
- **DB Relationships:** [Database & ER Schema](./docs/DATABASE.md)
- **REST Endpoints & Parameters:** [API Documentation](./docs/API.md)
- **Production Setup Checklist:** [Deployment Instructions](./docs/DEPLOYMENT.md)

---

## 🔒 Security Measures
- **Data Sanitization:** Protects against NoSQL query injections.
- **XSS Prevention:** Filters user inputs to neutralize malicious script injections.
- **Rate Limiting:** Protects endpoints from DDoS and brute force credential attacks.
- **HTTP Security Headers:** Hardened through `helmet` middleware.
- **CORS Protection:** Restricts frontend credentials and origins appropriately.
- **Cookie Security:** JWT stored securely using `httpOnly`, secure flag, and sameSite properties.


build with harsh jethwa | 15/07/2026 |  2:00 AM | 