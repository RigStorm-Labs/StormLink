# ⚡ StormLink

**A centralized StormLink dashboard for RigStorm companies** — combining project tracking, workflow organization, product pipelines and company-wide communication under one glass-and-lightning command center.

Built with **Next.js + TailwindCSS + Framer Motion + GSAP** on the front end and **Node.js + Express + MongoDB** on the back end, featuring **Google OAuth (NextAuth.js)**, JWT sessions and a secure admin CMS.

---

## ✨ Highlights

- 🎨 **High-end UI** — glassmorphism cards, electric-blue → storm-gray → deep-violet gradients, aurora background, Poppins/Inter typography with subtle glow.
- 🎞️ **Motion** — Framer Motion page/card transitions, GSAP-animated dashboard counters and banner entrances.
- 🔐 **Auth** — Google OAuth via NextAuth.js, admin credentials login, and demo Member/Viewer sessions. JWT-based session management with role-based access control (Admin / Member / Viewer).
- 🧩 **Modules** — Dashboard, Projects, Workflows (kanban pipeline with team roles), Products, Companies directory, and a full Admin CMS.
- 🛡️ **Security & performance** — Helmet, CORS, rate limiting, input sanitization (XSS hardening), field validation, and an optimized data layer with MongoDB Atlas or a zero-config in-memory fallback.

---

## 🏢 The RigStorm Companies

| Company | Description | Link |
|---------|-------------|------|
| RigStorm Labs | Core tech arm — PC building, AI integration, digital innovation. | www.rigstormlabs.linkpc.net |
| RigStorm SiteMarket | Marketplace for websites, domains, and hosting. | www.rigstormsitemarket.linkpc.net |
| RigStorm LandAura | Real estate listings and pricing strategies. | www.landaura.run.place |
| RigStorm Zeyora | Delivery service app concept with full-stack focus. | www.zeyora.run.place |
| AdStorm | Digital marketing and brand growth strategies. | www.adstorm.run.place |
| SkyED | Professional branding agency for startup identity. | www.skyed.run.place |
| RigStorm Hub | Centralized innovation center connecting all ventures. | www.rigstormhub.run.place |

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) · TailwindCSS · Framer Motion · GSAP |
| Backend | Node.js · Express 4 |
| Database | MongoDB (Mongoose 8) — with auto-seeded in-memory fallback for local dev |
| Auth | NextAuth.js (Google provider) + JWT (jsonwebtoken) |
| Security | Helmet · express-rate-limit · input sanitization · RBAC |

---

## 🚀 Quick Start

### Prerequisites
- Node.js **≥ 18.17** (20+ recommended)
- *(Optional)* a MongoDB Atlas connection string — without one, the API runs on a JSON-persisted in-memory store so you can develop with zero setup.

### 1. Install

```bash
npm run install:all     # installs server/ and client/ dependencies
```

### 2. Configure (optional but recommended)

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env.local
```

| Variable | Where | Purpose |
|----------|-------|---------|
| `MONGODB_URI` | `server/.env` | MongoDB Atlas connection string (leave empty for in-memory store) |
| `JWT_SECRET` | `server/.env` | Secret for signing session tokens — use a long random string in prod |
| `ADMIN_EMAILS` | `server/.env` | Comma-separated Google emails granted the Admin role |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | `client/.env.local` | Enables the “Continue with Google” button (via Google Cloud OAuth credentials) |
| `NEXTAUTH_SECRET` / `NEXTAUTH_URL` | `client/.env.local` | NextAuth session secret and base URL |
| `STORMLINK_API_URL` | `client/.env.local` | API base URL used by the server-side proxy (default `http://localhost:4000`) |

### 3. Run

```bash
npm run dev             # boots the API (:4000) and the dashboard (:3000) together
```

Or run them separately:

```bash
npm run dev:server      # Express API  → http://localhost:4000
npm run dev:client      # Next.js app  → http://localhost:3000
```

The Next.js server proxies `/api/backend/*` to the Express API, so the browser only ever talks to one origin — works behind any tunnel or preview host.

---

## 🔐 Logging In

### Admin panel — `/admin`
| | |
|---|---|
| **Username** | `RigStorm CEO` *(not case sensitive)* |
| **Password** | `Mango123` *(case sensitive)* |

Admins get full CRUD across every module, including deletions and user management.

### Google OAuth
Add your Google OAuth credentials to `client/.env.local` and the **“Continue with Google”** button appears on the login screen. Google sign-ins receive the **Member** role (or **Admin** if their email is listed in `ADMIN_EMAILS`).

### Demo sessions
No credentials? Use the **Demo** tab to explore instantly as a **Member** (create/edit) or **Viewer** (read-only).

### Role-based access control

| Action | Viewer | Member | Admin |
|--------|:------:|:------:|:-----:|
| Read all data | ✅ | ✅ | ✅ |
| Create / update records | ❌ | ✅ | ✅ |
| Delete records | ❌ | ❌ | ✅ |
| List API users | ❌ | ❌ | ✅ |
| Admin CMS (`/admin`) | ❌ | ❌ | ✅ |

---

## 📁 Project Structure

```
StormLink/
├── scripts/dev.js           # boots API + client together with colored logs
├── server/                  # Express + MongoDB API
│   └── src/
│       ├── index.js         # app bootstrap, security middleware, route mounting
│       ├── config.js        # environment configuration
│       ├── seed.js          # starter data (7 companies, projects, workflows…)
│       ├── middleware/      # JWT auth, RBAC, sanitization & validation
│       ├── routes/          # auth, generic CRUD factory, stats
│       └── store/           # MongoDB (Mongoose) + in-memory fallback stores
└── client/                  # Next.js dashboard
    ├── app/
    │   ├── layout.jsx       # fonts, aurora background, providers
    │   ├── login/           # Google / Admin / Demo sign-in
    │   ├── (app)/           # protected shell (sidebar + header)
    │   │   ├── dashboard/   # stats, hot projects, goals, pipeline, team
    │   │   ├── projects/    # grid with status filters + CRUD modals
    │   │   ├── workflows/   # 4-stage kanban with role assignments
    │   │   ├── products/    # product cards with progress & versions
    │   │   ├── companies/   # RigStorm directory cards with links & goals
    │   │   └── admin/       # CMS: tabbed CRUD for every collection
    │   └── api/auth/        # NextAuth.js handlers + OAuth config probe
    ├── components/          # Sidebar, Header, modals, badges, toasts…
    └── lib/                 # API client, auth context, constants
```

---

## 🔌 API Overview

Base path: `/api` (browser: `/api/backend` via the Next.js proxy)

| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | Service health + active store type |
| `POST /api/auth/admin` | Admin login → JWT |
| `POST /api/auth/demo` | Demo login (`member` / `viewer`) → JWT |
| `POST /api/auth/google` | Exchange a verified Google profile for a JWT |
| `GET /api/auth/me` | Current session |
| `GET /api/stats` | Dashboard aggregates (counts, status groups, averages) |
| `GET/POST/PUT/PATCH/DELETE /api/{projects,workflows,products,companies,goals,members,notifications}` | CRUD (role-gated) |
| `POST /api/notifications/read-all` | Mark every notification read |
| `GET/POST/PUT/DELETE /api/users` | User management (admin-only reads) |

All authenticated endpoints expect `Authorization: Bearer <token>`.

---

## ☁️ Deployment Notes

- **Frontend** — deploy the `client/` app to Vercel (or any Node host via `next build && next start`). Set `STORMLINK_API_URL` to the API's public URL.
- **Backend** — deploy `server/` to Render/Railway/Fly and set `MONGODB_URI` (MongoDB Atlas) plus a strong `JWT_SECRET`.
- **Database** — the app auto-seeds every empty collection on boot, so a fresh Atlas cluster populates itself with the RigStorm starter data.
- **Google OAuth** — add your deployed URL to the Google OAuth authorized redirect URIs (`{client}/api/auth/callback/google`).

---

## 🛠 Scripts

| Command | Description |
|---------|-------------|
| `npm run install:all` | Install server + client dependencies |
| `npm run dev` | Run API + client together |
| `npm run dev:server` | Run only the Express API |
| `npm run dev:client` | Run only the Next.js app |
| `npm run build` | Production build of the client |
| `npm run seed` | Manually seed empty collections |

---

*Forged in the storm by RigStorm Labs ⚡*
