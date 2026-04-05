# Finance Dashboard

Production-oriented full-stack finance dashboard: **Express + MongoDB (Mongoose)** API with **Passport.js** (local + JWT, **no sessions**), **strict MVC + service layer**, and a **Next.js (App Router)** client. Includes **RBAC**, **Joi** validation, **Cloudinary** receipt uploads, **dashboard aggregations**, **financial health score**, **spending insights**, and a **vanilla canvas starfield** on the UI.

---

## Repository layout

| Path | Purpose |
|------|---------|
| `server/` | Express API, Passport, Mongoose models, services, controllers, routes |
| `client/` | Next.js App Router UI, auth context, API helper |

---

## Architecture (backend)

- **Routes** — HTTP wiring only; no business logic.
- **Controllers** — Thin: validate (via middleware where possible), call services, send JSON.
- **Services** — Business rules, token issuance, aggregations, access rules.
- **Models** — Mongoose schemas.
- **Config** — DB, Cloudinary, Passport strategy registration.
- **Middlewares** — Auth wrappers, validation, uploads, centralized errors.

**Passport principle used here:** *Passport verifies identity; services own tokens and domain logic.*  
See `server/config/passport.js` — strategies stay minimal (e.g. `// keeping passport logic minimal to avoid tight coupling`).

---

## Authentication: Passport flow

1. **Register** (`POST /api/auth/register`)  
   - Controller → `auth.service.register` hashes password with **bcrypt**, creates user with role **Viewer**, returns **safe user** + **JWT** (token minted in the **service**, not in Passport).

2. **Login** (`POST /api/auth/login`)  
   - **Joi** validates body → **`authenticateLocal`** runs **`passport.authenticate("local", { session: false })`**.  
   - Local strategy loads user by email, compares password, rejects **inactive** users.  
   - On success, controller calls **`auth.service.issueTokenForUser(req.user)`** and returns JWT + safe user.

3. **Protected routes**  
   - **`authenticateJWT`** wraps **`passport.authenticate("jwt", { session: false })`**.  
   - **passport-jwt** reads **`Authorization: Bearer <token>`**, verifies with **`JWT_SECRET`**, loads user by `sub`, rejects missing/inactive users.

**Sessions:** Not used. **Stateless JWT only.**

---

## JWT flow (client ↔ API)

- **Payload:** `{ sub: "<userId>" }` signed with **`JWT_SECRET`**, expiry **`JWT_EXPIRES_IN`** (default `1d`).
- **Client storage decision:** JWT is stored in **`sessionStorage`** under `fd_token`, and sent as **`Authorization: Bearer …`** on each request (see `client/lib/api.js`). A copy of the safe user JSON is stored as `fd_user` for quick UI bootstrap.
- **Why not HTTP-only cookie here?** Cookie-based JWT is often preferable in production (XSS cannot exfiltrate the token). This project uses **Bearer + sessionStorage** for a straightforward SPA ↔ separate API setup; migrating to **httpOnly cookies** would mean: API sets `Set-Cookie`, CORS `credentials: true`, JWT extracted via `ExtractJwt.fromExtractors([cookieExtractor])`, and **no** JS access to the token. Document this tradeoff in your threat model.

---

## Role-based access (RBAC)

| Role | Records | Dashboard | Upload receipt |
|------|---------|-----------|----------------|
| **Viewer** | Read own (list/get) | Summary for own data | No |
| **Analyst** | Full CRUD **own** | Summary for own data | Yes |
| **Admin** | Full CRUD **all** users; optional `userId` filter (list/summary) | Summary for **all** unless `userId` query | Yes |

**Middlewares** (`server/middlewares/auth.js`):

- **`authenticateJWT`** — Passport JWT wrapper; sets `req.user`.
- **`authorizeRoles(...roles)`** — Returns 403 if `req.user.role` not in the list.

**Registration** always creates **Viewer**. Use **`npm run seed:admin`** or update MongoDB to promote users (e.g. set `role` to `Analyst` or `Admin`).

---

## API endpoints

Base URL: **`http://localhost:5000/api`** (configurable via `PORT`).

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | No | Create user (Viewer), bcrypt hash, returns user + JWT |
| POST | `/auth/login` | No (local Passport) | Email/password → JWT |
| GET | `/auth/me` | JWT | Current user (password never exposed) |

### Financial records

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/records` | JWT | Viewer+ | Paginated list; filters: `page`, `limit`, `type`, `category`, `dateFrom`, `dateTo`; Admin: `userId` |
| GET | `/records/:id` | JWT | Viewer+ | Single record (scoped) |
| POST | `/records` | JWT | Analyst, Admin | Create (Admin may set `userId` for another owner) |
| PATCH | `/records/:id` | JWT | Analyst, Admin | Update (ownership rules in service) |
| DELETE | `/records/:id` | JWT | Analyst, Admin | Delete |

### Dashboard

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/dashboard/summary` | JWT | Totals, health score, insights, top categories, recent rows; Admin optional `?userId=` |

### Upload (Cloudinary)

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| POST | `/upload/receipt` | JWT | Analyst, Admin | `multipart/form-data` field **`file`** (image) → `{ url, publicId }` |

### Health

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Liveness |

Errors return JSON: `{ success: false, message }` via centralized handler (`server/middlewares/errorHandler.js`).

---

## Domain features

- **Financial health score** — Service computes a **0–100** score from income vs total cash flow (`income + expense`) in the user’s visible scope; neutral **50** when no data (`server/services/dashboard.service.js`).
- **Spending insights** — Rule-based messages (top category, burn rate vs income, long-tail categories).
- **Frontend** — Dashboard and records views consume the summary and CRUD APIs; **starfield** is a client canvas (`client/components/Starfield.js`).

---

## Environment variables

### Server (`server/.env`)

Copy from `server/.env.example`:

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | Mongo connection string |
| `JWT_SECRET` | Yes | Strong secret for signing JWTs |
| `JWT_EXPIRES_IN` | No | Default `1d` |
| `PORT` | No | Default `5000` |
| `CLIENT_ORIGIN` | No | CORS origin, default `http://localhost:3000` |
| `CLOUDINARY_*` | For uploads | If missing, upload route returns **503** |

Optional **seed** overrides: `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `SEED_ADMIN_NAME`.

### Client (`client/.env.local`)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | API base including `/api`, e.g. `http://localhost:5000/api` |

---

## How to run

### Prerequisites

- **Node.js 18+**
- **MongoDB** reachable at your `MONGODB_URI`
- (Optional) **Cloudinary** account for receipts

### 1. Database

Start MongoDB locally or use Atlas and set `MONGODB_URI`.

### 2. Backend

```powershell
cd server
copy .env.example .env
# Edit .env — set MONGODB_URI and JWT_SECRET (and Cloudinary if needed)

npm install
npm run dev
```

API: `http://localhost:5000` — try `GET http://localhost:5000/health`.

**Create an Admin user:**

```powershell
cd server
npm run seed:admin
```

Default credentials (override via env): `admin@example.com` / `ChangeMeAdmin1!` — **change immediately** in real deployments.

**Promote a user to Analyst** (example with `mongosh`):

```js
db.users.updateOne(
  { email: "you@example.com" },
  { $set: { role: "Analyst" } }
)
```

### 3. Frontend

```powershell
cd client
copy .env.local.example .env.local
# Ensure NEXT_PUBLIC_API_URL matches your API

npm install
npm run dev
```

App: `http://localhost:3000` — register, log in, open **Dashboard** and **Records**.

### Production builds

```powershell
cd server
npm start

cd client
npm run build
npm start
```

Use a process manager (PM2, systemd) and terminate TLS at a reverse proxy; store secrets in a vault, not in the repo.

---

## Security notes

- Passwords are **bcrypt**-hashed; API responses use **`toSafeJSON()`** (no password field).
- **Inactive** users cannot complete local login and are rejected by JWT strategy.
- Use a **long random `JWT_SECRET`** in production; rotate with a planned cutover.
- **HTTPS** in production; tighten CORS to known origins.

---

## Scripts reference

| Location | Command | Purpose |
|----------|---------|---------|
| `server` | `npm run dev` | API with `--watch` |
| `server` | `npm start` | API production mode |
| `server` | `npm run seed:admin` | Create Admin user if missing |
| `client` | `npm run dev` | Next.js dev server |
| `client` | `npm run build` | Production build |

---

## License

Private / educational use — adjust as needed for your organization.
