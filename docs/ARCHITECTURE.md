# Architecture

## System Diagram

```mermaid
flowchart LR
  Browser["React + Vite Frontend"] -->|Axios REST calls| API["Express API"]
  API --> Auth["JWT + bcrypt auth"]
  API --> Mongo["MongoDB Atlas"]
  API --> Cloudinary["Cloudinary image uploads"]
  API --> Security["Helmet, CORS, rate limits, sanitization"]
  Browser --> Vercel["Vercel deployment"]
  API --> Render["Render deployment"]
```

## Backend Architecture

```mermaid
flowchart TD
  Request["HTTP Request"] --> Routes["Route Modules"]
  Routes --> Middleware["Auth, Role, Validation, Security"]
  Middleware --> Controllers["Controllers"]
  Controllers --> Models["Mongoose Models"]
  Models --> DB["MongoDB"]
  Controllers --> Response["JSON Response"]
```

## Frontend Architecture

```mermaid
flowchart TD
  App["App Router"] --> Public["Public Pages"]
  App --> Auth["Auth Pages"]
  App --> Admin["Admin Dashboard"]
  App --> User["User Dashboard"]
  Public --> Components["Reusable Components"]
  Admin --> API["Axios API Client"]
  User --> API
  API --> Backend["Express API"]
  App --> Context["Auth, Theme, Toast Context"]
```

## Production Considerations

- Replace placeholder email utility with a real email provider.
- Use strong secrets and separate environment variables per environment.
- Enable MongoDB Atlas IP/network rules for deployment providers.
- Keep frontend and backend origins explicit in CORS.
- Configure Cloudinary upload presets or signed uploads for stricter media workflows.
- Add automated tests around auth, authorization, and core CRUD flows before launch.
