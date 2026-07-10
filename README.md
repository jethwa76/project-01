<div align="center">

# ✨ ShowcasePro

### A Full-Stack Portfolio Showcase Platform

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6+-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![License](https://img.shields.io/badge/License-MIT-F59E0B?style=for-the-badge)](LICENSE)

An immersive, premium portfolio and content engine designed for engineers and creators to showcase projects, skills, and credentials — with a full admin dashboard, authentication system, and contact management.

[🚀 Getting Started](#-getting-started) · [📸 Screenshots](#-screenshots) · [✨ Features](#-features) · [🏗️ Architecture](#️-architecture) · [📚 Docs](#-documentation)

</div>

---

## 📸 Screenshots

<div align="center">
<table>
<tr>
<td align="center"><b>🏠 Landing Page</b></td>
<td align="center"><b>📂 Projects</b></td>
</tr>
<tr>
<td><img src="docs/screenshots/landing.png" alt="Landing Page" width="400"/></td>
<td><img src="docs/screenshots/projects.png" alt="Projects Page" width="400"/></td>
</tr>
<tr>
<td align="center"><b>📝 Blog</b></td>
<td align="center"><b>🔐 Login</b></td>
</tr>
<tr>
<td><img src="docs/screenshots/blog.png" alt="Blog Page" width="400"/></td>
<td><img src="docs/screenshots/login.png" alt="Login Page" width="400"/></td>
</tr>
</table>
</div>

> 💡 **Tip:** Add your own screenshots to `docs/screenshots/` to showcase your deployment!

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🎨 Frontend
- ⚡ **Blazing fast** — Vite + React 19
- 🎬 **Smooth animations** — Framer Motion
- 🔍 **Search & filter** — Projects and blogs
- 📱 **Fully responsive** — Mobile-first design
- 🌙 **Dark mode** — System-aware theming
- 📝 **Contact forms** — Built-in validation
- 🔔 **Notifications** — Real-time user alerts
- ❤️ **Save & Favorite** — Bookmark projects

</td>
<td width="50%">

### ⚙️ Backend
- 🔐 **JWT Auth** — HTTP-only cookie sessions
- 🛡️ **Enterprise security** — Helmet, CORS, rate limiting
- 🖼️ **Cloudinary** — Managed image uploads
- 📊 **RESTful API** — Clean controller/route architecture
- 🗄️ **MongoDB + Mongoose** — Schema validation & indexing
- 📧 **Email support** — Nodemailer integration
- 🧪 **Auto-seeding** — Dev-ready in-memory MongoDB fallback
- 👮 **Role-based access** — Admin & User permissions

</td>
</tr>
</table>

### 🛠️ Admin Dashboard
> Manage your entire portfolio from a single, clean interface:
> - ➕ Create / ✏️ Edit / 🗑️ Delete — **Projects**, **Blogs**, **Skills**, **Certificates**, **Testimonials**
> - 📬 View and manage **contact messages** with status tracking
> - 👥 **User management** with role assignment

---

## 🏗️ Architecture

```
📦 ShowcasePro
├── 🖥️  frontend/                React SPA (Vite + Tailwind)
│   ├── src/
│   │   ├── api/                Axios HTTP client
│   │   ├── components/         Reusable UI components
│   │   │   ├── common/         Buttons, Loaders, Modals
│   │   │   ├── layout/         Navbar, Footer, PageShell
│   │   │   └── sections/       Hero, Features, Testimonials
│   │   ├── context/            Auth, Theme, Toast providers
│   │   ├── data/               Demo/fallback data
│   │   ├── pages/              Route-level views
│   │   │   ├── admin/          Dashboard, ManageResource
│   │   │   └── user/           Settings, Notifications, Lists
│   │   ├── styles/             Global CSS + Tailwind config
│   │   ├── App.jsx             Router & layout
│   │   └── main.jsx            Entry point
│   └── package.json
│
├── ⚙️  backend/                 Express REST API
│   ├── src/
│   │   ├── config/             Database & environment
│   │   ├── controllers/        Business logic handlers
│   │   ├── middleware/         Auth, security, error handling
│   │   ├── models/             Mongoose schemas
│   │   ├── routes/             API route definitions
│   │   ├── utils/              Email, file upload helpers
│   │   ├── validators/         Request validation schemas
│   │   ├── app.js              Express app configuration
│   │   ├── seed.js             Database seeding script
│   │   └── server.js           Server entry point
│   ├── .env.example            Environment template
│   └── package.json
│
├── 📖 docs/                     Extended documentation
│   ├── API.md                  REST endpoint specs
│   ├── ARCHITECTURE.md         System design diagrams
│   ├── DATABASE.md             ER models & schemas
│   └── DEPLOYMENT.md           Production deploy guide
│
├── package.json                Monorepo workspace scripts
└── README.md                   ← You are here
```

---

## 🛡️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, Vite 6, Tailwind CSS 3.4, React Router DOM, React Hook Form, Framer Motion, Axios, React Icons |
| **Backend** | Node.js, Express 4, Mongoose, JWT (jsonwebtoken), Bcryptjs, Multer, Cloudinary, Nodemailer, Morgan |
| **Security** | Helmet, CORS, express-rate-limit, express-mongo-sanitize, HPP |
| **Database** | MongoDB (Atlas / Local / In-Memory fallback) |
| **Dev Tools** | Nodemon, Concurrently, ESLint, Vite HMR |

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version | Required |
|------|---------|----------|
| [Node.js](https://nodejs.org/) | v18+ | ✅ Yes |
| [MongoDB](https://www.mongodb.com/) | v6+ | ⚠️ Optional (auto-fallback to in-memory) |
| [Cloudinary](https://cloudinary.com/) | — | ⚠️ Optional (for image uploads) |

### 1️⃣ Clone & Install

```bash
git clone https://github.com/your-username/showcasepro.git
cd showcasepro

# Install all dependencies (root + backend + frontend)
npm run install:all
```

### 2️⃣ Configure Environment

**Backend** — create `backend/.env`:
```bash
cp backend/.env.example backend/.env
```

```env
NODE_ENV=development
PORT=5000
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173

# Optional — leave blank to use in-memory MongoDB
MONGO_URI=mongodb://127.0.0.1:27017/portfolio_showcase

# Optional — only needed for image uploads
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

**Frontend** — create `frontend/.env`:
```bash
cp frontend/.env.example frontend/.env
```

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=ShowcasePro
```

### 3️⃣ Start Development Server

```bash
npm run dev
```

This launches both servers concurrently:

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | `http://localhost:5173` | React app with HMR |
| Backend | `http://localhost:5000` | Express API server |

> 🎉 **That's it!** The app auto-seeds demo data on first launch when using in-memory MongoDB.

### 4️⃣ Default Admin Login

```
📧 Email:    admin@example.com
🔑 Password: Password123!
```

---

## 🔒 Security

| Protection | Implementation |
|-----------|---------------|
| **Data Sanitization** | `express-mongo-sanitize` — blocks NoSQL injection |
| **HTTP Headers** | `helmet` — sets secure response headers |
| **Rate Limiting** | `express-rate-limit` — prevents DDoS & brute force |
| **CORS** | Strict origin + credentials policy |
| **Cookie Security** | `httpOnly`, `secure`, `sameSite` flags on JWT tokens |
| **Password Hashing** | `bcryptjs` with salt rounds |
| **Input Validation** | `express-validator` schemas on all routes |

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [📐 Architecture](./docs/ARCHITECTURE.md) | System design, data flow diagrams |
| [🗄️ Database Schema](./docs/DATABASE.md) | Mongoose models, ER relationships |
| [🔌 API Reference](./docs/API.md) | All REST endpoints with parameters |
| [🚀 Deployment](./docs/DEPLOYMENT.md) | Production setup (Render, Vercel, Atlas) |

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend + backend concurrently |
| `npm run install:all` | Install dependencies for all packages |
| `cd backend && npm run seed` | Seed database with demo data |
| `cd backend && npm run dev` | Start only the backend (port 5000) |
| `cd frontend && npm run dev` | Start only the frontend (port 5173) |
| `cd frontend && npm run build` | Production build of the frontend |

---

<div align="center">

## 🤝 Connect

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Harsh_Jethwa-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/harsh-jethwa-a2020531b/)
[![Email](https://img.shields.io/badge/Email-harshyjethwa2020@gmail.com-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:harshyjethwa2020@gmail.com)

---

**Built with Harsh Jethwa**

<sub>© 2026 ShowcasePro. All rights reserved.</sub>

</div>