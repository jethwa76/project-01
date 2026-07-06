# Deployment Guide

## MongoDB Atlas

1. Create a MongoDB Atlas cluster.
2. Create a database user with read/write permissions.
3. Add Render IP ranges or allow secure access according to your network policy.
4. Copy the connection string into `backend/.env` as `MONGO_URI`.

## Cloudinary

1. Create a Cloudinary account.
2. Copy cloud name, API key, and API secret.
3. Add them to the backend environment variables.

## Backend on Render

Create a new Web Service:

```text
Root Directory: backend
Build Command: npm install
Start Command: npm start
```

Environment variables:

```text
NODE_ENV=production
PORT=10000
MONGO_URI=<atlas-uri>
JWT_SECRET=<long-random-secret>
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_DAYS=7
FRONTEND_URL=https://your-vercel-app.vercel.app
CLOUDINARY_CLOUD_NAME=<value>
CLOUDINARY_API_KEY=<value>
CLOUDINARY_API_SECRET=<value>
RESET_PASSWORD_URL=https://your-vercel-app.vercel.app/reset-password
```

## Frontend on Vercel

Create a Vercel project:

```text
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
```

Environment variables:

```text
VITE_API_URL=https://your-render-api.onrender.com/api
VITE_APP_NAME=ShowcasePro
```

## Post-Deployment Checklist

- Visit `/api/health` on Render.
- Confirm CORS allows the Vercel domain.
- Register a user and seed or create an admin.
- Test login, protected routes, contact form, uploads, and password reset.
- Enable HTTPS-only cookies in production.
