# Craftfolio

A web-based platform that allows Rwandan designers and artisans to digitally document, showcase, and sell their creative works. Craftfolio provides visibility, easy curation, and direct market connectivity for local creators. Users can create profiles, upload their works, manage their online portfolio, and participate in live exhibitions with real-time streaming.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Designs](#designs)
- [Deployment Plan](#deployment-plan)
- [Links](#links)

---

## Features

- **User roles:** Admin, Author (artist), and Buyer
- **Authentication:** JWT-based auth with bcrypt password hashing
- **Artwork management:** Upload, curate, and showcase creative works
- **Exhibitions:** Create and manage exhibitions with live streaming (LiveKit)
- **Real-time updates:** Socket.io for notifications and exhibition events
- **Payments:** Stripe integration for checkout and webhooks
- **Dashboard:** Analytics, orders, and content management
- **Archive applications:** Submit and manage archive requests

---

## Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| React 19 | UI framework |
| TypeScript | Type safety |
| Vite 7 | Build tool & dev server |
| Tailwind CSS 4 | Styling |
| shadcn/ui | Component library (Radix UI) |
| React Router 7 | Client-side routing |
| Axios | HTTP client |
| Socket.io-client | Real-time events |
| LiveKit + PeerJS | Live streaming |
| Recharts | Charts & analytics |
| date-fns | Date utilities |
| Sonner | Toast notifications |

### Backend

| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express 5 | Web framework |
| Sequelize | ORM |
| PostgreSQL | Database |
| JWT + bcrypt | Authentication |
| Socket.io | Real-time events |
| Multer | File uploads |
| Stripe | Payments & webhooks |
| LiveKit Server SDK | Live streaming |
| Swagger | API documentation |
| node-cron | Scheduled jobs |
| Helmet & CORS | Security |

---

## Project Structure

```
MISSION-CAPSTONE/
├── frontend/                    # React + Vite SPA
│   ├── src/
│   │   ├── api/                 # API services & endpoints
│   │   ├── components/          # UI (layout, dashboard, ui)
│   │   ├── context/             # Auth & Cart state
│   │   ├── hooks/               # useAuth, useNotifications
│   │   ├── pages/               # Route pages
│   │   ├── lib/                 # Utilities
│   │   └── types/               # TypeScript types
│   ├── package.json
│   └── vite.config.ts
├── backend/                     # Express API
│   ├── src/
│   │   ├── jobs/                # Cron jobs
│   │   ├── modules/             # Features (auth, artwork, commerce, etc.)
│   │   └── utils/               # Database, middleware, swagger
│   ├── uploads/                 # Static uploads
│   ├── main.js
│   └── package.json
└── README.md
```



---

## Prerequisites

- **Node.js** (v18 or later) - https://nodejs.org/
- **npm** (comes with Node.js)
- **PostgreSQL** - https://www.postgresql.org/download/
- **Git** - https://git-scm.com/

---

## Installation & Setup

### Step 1: Clone the repository

git clone https://github.com/Amelieumutoni/MISSION-CAPSTONE.git
cd MISSION-CAPSTONE

### Step 2: Create the PostgreSQL database
- psql -U postgres
- CREATE DATABASE artdoc_db;
\q
### Step 3: Backend setup
cd backend
npm install

###Step 4: Create backend .env file
PORT=5000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=artdoc_db
DB_PASSWORD=your_postgres_password
DB_PORT=5432
DB_DIALECT=postgres
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=1h
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
FRONTEND_URL=https://localhost:5173
LIVEKIT_URL=wss://your-livekit-url.livekit.cloud
LIVEKIT_API_KEY=your_key
LIVEKIT_API_SECRET=your_secret

### Step 5: Run database migrations
npx sequelize-cli db:migrate
### Step 6: Frontend setup
Open a new terminal:
- cd MISSION-CAPSTONE
- cd frontend
- npm install

### Step 7: Create frontend .env file
Create frontend/.env with:
BACKEND_URL=/api
BACKEND_IMAGE_URL=/image
VITE_SOCKET_URL=/socket.io
VITE_LIVEKIT_URL=wss://your-livekit-url.livekit.cloud

### Running the Application

**Terminal 1 - Backend:**
```bash
cd MISSION-CAPSTONE/backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd MISSION-CAPSTONE/frontend
npm run dev
```

- **App:** https://localhost:5173
- **API docs:** http://localhost:5000/api-docs

---

## Deployment Plan (Vercel)

This project uses **Vercel** and **render** for deployment.

**Frontend:** [Vercel](https://vercel.com) · **Backend + DB:** [Render](https://render.com)

### Render (Backend)

1. Create **PostgreSQL** database → copy Internal URL.
2. Create **Web Service** → connect GitHub, set Root Directory: `backend`.
3. Build: `npm install && npx sequelize-cli db:migrate --env production` · Start: `node main.js`
4. Add env vars: `DB_*`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `FRONTEND_URL`, `LIVEKIT_*` (use values from DB URL).
5. Stripe webhook: Add endpoint `https://your-backend.onrender.com/api/webhooks/stripe` → copy signing secret to `STRIPE_WEBHOOK_SECRET`.

### Vercel (Frontend)

1. **Add New** → **Project** → import GitHub repo.
2. Root Directory: `frontend` · Framework: Vite · Build: `npm run build` · Output: `dist`
3. Env vars: `BACKEND_URL`, `BACKEND_IMAGE_URL`, `VITE_SOCKET_URL`, `VITE_LIVEKIT_URL` (point to your Render URL).
4. Deploy. Then set `FRONTEND_URL` in Render to your Vercel URL.



## Links

- **GitHub:** https://github.com/Amelieumutoni/MISSION-CAPSTONE.git
- **Video:** https://drive.google.com/file/d/19s0CIDRpOvVHkvTgZ9d41xKGJQMh0EHT/view?usp=sharing
**documentation** https://docs.google.com/document/d/1R3_EJOWCYuDQMLKY8pqIRKAYMvnxSx4yo0S60xgP080/edit?usp=sharing
