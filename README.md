# 🎓 Student Doubt Forum

<p align="center">
  <strong>A smarter space to ask, answer, and learn together.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 8" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js 18+" />
  <img src="https://img.shields.io/badge/Express-4.18-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose_8-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Vitest-Tested-6E9F18?style=for-the-badge&logo=vitest&logoColor=white" alt="Vitest" />
</p>

---

## 📖 Overview

**Student Doubt Forum** is a full-stack MERN application that brings students and educators together through collaborative academic discussions. Students can raise questions, share knowledge, discover verified answers, and participate in a community supported by instructor verification and administrative moderation.

> 💡 **Our Mission:** Make academic doubt resolution accessible, collaborative, transparent, and dependable.

---

## ✨ Features at a Glance

| Feature | Category | Description |
| :--- | :--- | :--- |
| 🔐 **Authentication** | Security | JWT access tokens (in-memory) paired with HttpOnly rotating refresh tokens and reuse detection |
| 👥 **Role-Based Access** | Authorization | Granular permission boundaries for **Students**, **Teachers**, and **Administrators** |
| ❓ **Question Forum** | Academic | Ask, browse, text-search, tag, filter by subject, and manage academic doubts |
| 💬 **Answers & Discussions** | Collaboration | Post solutions, discuss concepts in markdown, and maintain solution histories |
| ✅ **Teacher Verification** | Quality | Instructors verify accurate solutions, pinning them to the top of discussions |
| 🏆 **Reputation System** | Gamification | Authors earn reputation through community upvotes (+10) and teacher verifications (+15) |
| ⬆️ **Community Voting** | Integrity | Vote on questions and answers with server-enforced anti-self-voting guards |
| 🔖 **Personal Bookmarks** | Productivity | Save important doubts for quick access from the student dashboard |
| 🔔 **Notification Center** | Engagement | Real-time alerts for answers received, instructor verifications, votes, and status updates |
| 🚩 **Content Moderation** | Safety | Community-driven reporting for spam, offensive content, plagiarism, or off-topic posts |
| 🛡️ **Admin Dashboard** | Operations | Complete console to manage users, roles, account suspensions, subjects, and announcements |
| 📋 **Audit Logs** | Compliance | Immutable record of sensitive administrative actions and security events |
| 📧 **Account Recovery** | Account | Support for email verification links and time-limited password recovery tokens |

---

## 🖼️ How It Works

```text
                             STUDENT DOUBT FORUM
                                      │
                   ┌──────────────────┴──────────────────┐
                   │                                     │
               STUDENTS                              EDUCATORS
                   │                                     │
             Ask Questions                         Answer Doubts
                   │                                     │
                   └──────────────────┬──────────────────┘
                                      │
                             Community Discussion
                                      │
                            Helpful Answers & Votes
                                      │
                            Teacher Verification
                                      │
                              Trusted Knowledge
                                      │
                               ADMINISTRATORS
                                      │
                          Moderation & Management
```

---

## 👥 User Roles & Permissions

### 🎓 Student
* **Authentication:** Register and log in securely (public registration strictly assigns student privileges).
* **Ask & Explore:** Create academic questions with subjects and tags; browse existing discussions with debounced search.
* **Participate:** Submit answers to open questions and engage with peers.
* **Vote & Bookmark:** Upvote/downvote content (self-voting prohibited) and bookmark useful doubts for reference.
* **Notifications:** Receive alerts when questions are answered or content is upvoted/verified.
* **Lifecycle:** Edit, close, or delete questions they authored.

### 👨‍🏫 Teacher / Instructor
* **Academic Leadership:** Participate in academic discussions with designated teacher credentials.
* **Verify Answers:** Officially verify student solutions with a verified badge, promoting them to the top.
* **Quality Assurance:** Filter doubts by subject to identify unanswered or unverified questions needing expert attention.
* **Reputation Endorsement:** Award +15 reputation points to authors upon solution verification.
* *Note: Teacher privileges are assigned exclusively by platform administrators, never via public registration.*

### 🛡️ Administrator
* **Platform Health:** Monitor platform analytics (users, questions, answers, pending reports, subjects).
* **User Management:** Promote students to teachers/admins, or suspend/reactivate accounts on policy violations.
* **Moderation Queue:** Review reported content and resolve reports with optional content removal.
* **Curriculum Management:** Create, rename, or toggle active academic subjects.
* **Announcements:** Broadcast system-wide announcements to all forum members.
* **Accountability:** Review immutable system audit logs for administrative accountability.

---

## 🏆 Reputation System

The platform gamifies contributions to reward reliable academic assistance and deter low-quality content.

| Action | Reputation Delta | Authority / Trigger |
| :--- | :---: | :--- |
| **Answer receives an upvote** | `+10` | Registered peer community |
| **Answer receives a downvote** | `-5` | Registered peer community |
| **Answer verified by instructor** | `+15` | Teacher or Administrator |
| **Verification removed** | `-15` | Teacher or Administrator |

> [!NOTE]
> All vote score increments and reputation adjustments are calculated atomically on the server. Self-voting is blocked across all endpoints.

---

## 🛠️ Technology Stack

### Frontend Architecture
* **React 19** — Functional UI components with hooks and clean state boundaries
* **React Router v7** — Client-side routing, protected routes, and role guards
* **Vite 8** — Next-generation build tool and dev server
* **Tailwind CSS v4** — Modern utility-first styling with responsive design
* **Lucide React** — Crisp icon system
* **Axios** — HTTP client configured with automatic 401 token refresh queue interceptors

### Backend Architecture
* **Node.js (ES Modules)** — Server-side JavaScript runtime
* **Express.js 4** — RESTful API architecture
* **MongoDB & Mongoose 8** — Document database with schema validation and indexing
* **JSON Web Token (JWT)** — Stateless in-memory access tokens with HttpOnly cookie refresh tokens
* **bcryptjs** — Salted password hashing (12 rounds)
* **Zod** — Strict runtime schema validation for request bodies and query parameters
* **Helmet** — Essential HTTP security headers (`nosniff`, `hidePoweredBy`, etc.)
* **express-rate-limit** — Rate limiting protecting against brute force and DDoS attacks
* **Nodemailer** — Outbound email delivery for account verification and password recovery

### Testing & Quality Assurance
* **Vitest** — High-performance ESM test runner
* **Supertest** — Integration testing for HTTP endpoints
* **MongoMemoryServer** — Isolated, in-memory MongoDB environment for zero-side-effect test runs

---

## 🏗️ System Architecture

```text
┌────────────────────────────────────────────────────────┐
│                     React Frontend                     │
│                  Vite + Tailwind CSS                   │
└───────────────────────────┬────────────────────────────┘
                            │
                            │ HTTP / REST API (Port 5173 -> 5001 Proxy)
                            ▼
┌────────────────────────────────────────────────────────┐
│                    Express Backend                     │
│                                                        │
│  ├── Authentication & RBAC (JWT + Refresh Tokens)     │
│  ├── Questions & Answers Service                      │
│  ├── Voting & Reputation Engine                       │
│  ├── Bookmarks & Notification Center                  │
│  └── Administrative Console & Moderation Pipeline     │
└───────────────────────────┬────────────────────────────┘
                            │
                            │ Mongoose 8 (Object Data Modeling)
                            ▼
┌────────────────────────────────────────────────────────┐
│                        MongoDB                         │
│                                                        │
│  ├── Users, RefreshTokens (TTL Indexed)               │
│  ├── Questions (Full-Text Indexed) & Answers          │
│  ├── Votes & Bookmarks (Compound Unique Indexed)      │
│  └── Reports, Notifications & Append-Only Audit Logs  │
└────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

Follow these steps to set up and run the application locally.

### Prerequisites
* **Node.js** — v18.0.0 or higher
* **npm** — v9.0.0 or higher
* **MongoDB** — Local `mongod` community server or a MongoDB Atlas URI *(Optional for dev: automatically falls back to in-memory MongoDB if local daemon is absent)*

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/KG-FORGE/student-doubt-forum.git
cd student-doubt-forum
```

---

### Step 2: Configure & Start the Backend

```bash
cd server

# Copy environment template
cp .env.example .env

# Install backend dependencies
npm install

# Start development server
npm run dev
```

The backend server will start on:
```text
http://localhost:5001
```

Verify service status via the health check endpoint:
```text
http://localhost:5001/api/health
```

> [!TIP]
> **macOS Port Note:** The backend runs on port **5001** (relocated from 5000 to avoid conflicts with Apple AirPlay Receiver / ControlCenter on macOS).

> [!NOTE]
> **In-Memory Development Fallback & Demo Accounts:**
> If a local MongoDB instance is not detected on port 27017, the server automatically starts an in-memory database (`mongodb-memory-server`) and seeds default demo accounts:
> * **Administrator:** `admin@doubtforum.local` / `AdminPass123!`
> * **Instructor:** `teacher@doubtforum.local` / `TeacherPass123!`
> * **Student:** `student@doubtforum.local` / `StudentPass123!`

---

### Step 3: Configure & Start the Frontend

Open a second terminal window:

```bash
cd client

# Install frontend dependencies
npm install

# Start Vite development server
npm run dev
```

Open the client URL in your browser:
```text
http://localhost:5173
```

The Vite development server is configured with a reverse proxy that automatically forwards all `/api/*` calls to `http://localhost:5001`.

---

### Step 4 (Optional): Bootstrap Administrator Account

To seed a customized initial administrator account into your database:

```bash
cd server
npm run seed:admin
```
*(Requires `ADMIN_SEED_EMAIL`, `ADMIN_SEED_PASSWORD`, and `ADMIN_SEED_NAME` to be configured in `server/.env`)*.

---

## ⚙️ Environment Configuration

### `server/.env` Reference

| Variable | Description | Default / Example | Required |
| :--- | :--- | :--- | :---: |
| `PORT` | Backend Express listener port | `5001` | No |
| `NODE_ENV` | Application environment mode (`development`, `production`, `test`) | `development` | No |
| `MONGODB_URI` | MongoDB connection URI string | `mongodb://localhost:27017/student-doubt-forum` | **Yes** |
| `JWT_ACCESS_SECRET` | Secret for signing 15-minute access tokens (min 64 chars in prod) | `<random-64-char-string>` | **Yes** |
| `JWT_REFRESH_SECRET` | Secret for signing 7-day refresh tokens (min 64 chars in prod) | `<random-64-char-string>` | **Yes** |
| `JWT_ACCESS_EXPIRES_IN` | Access token lifespan | `15m` | No |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token lifespan | `7d` | No |
| `CLIENT_ORIGIN` | Allowed client URL for CORS headers | `http://localhost:5173` | No |
| `EMAIL_HOST` | SMTP server hostname | `smtp.gmail.com` | No |
| `EMAIL_PORT` | SMTP port | `587` | No |
| `EMAIL_SECURE` | Use TLS/SSL (`true` or `false`) | `false` | No |
| `EMAIL_USER` | SMTP username | `<username>` | No |
| `EMAIL_PASS` | SMTP application password | `<app-password>` | No |
| `EMAIL_FROM` | Outgoing email sender address | `noreply@doubtforum.local` | No |
| `ADMIN_SEED_EMAIL` | Admin email for `npm run seed:admin` | `admin@doubtforum.local` | No |
| `ADMIN_SEED_PASSWORD` | Admin password for seed script | `AdminPass123!` | No |
| `ADMIN_SEED_NAME` | Admin display name for seed script | `System Admin` | No |

> [!NOTE]
> **Email Delivery in Development:** Email credentials are optional for local development. If SMTP is unconfigured, verification links and password reset tokens are logged directly to the server terminal.

---

## 📡 API Overview

### Base Routes

| Resource | Base Path | Description | Access |
| :--- | :--- | :--- | :--- |
| **Discovery** | `/` | API banner and root route directory | Public |
| **Discovery** | `/api` | REST resource index | Public |
| **Health** | `/api/health` | Service health, timestamp, and database state | Public |
| **Authentication** | `/api/auth` | User registration, login, token refresh, sessions | Public / Authenticated |
| **Questions** | `/api/questions` | Ask, browse, search, update, and manage doubts | Public / Authenticated |
| **Answers** | `/api/answers` | Post solutions, update, and toggle teacher verification | Public / Authenticated |
| **Voting** | `/api/votes` | Cast, toggle, and retrieve upvotes/downvotes | Authenticated |
| **Bookmarks** | `/api/bookmarks` | Save and manage personal doubt bookmarks | Authenticated |
| **Reports** | `/api/reports` | Submit moderation reports on abusive content | Authenticated |
| **Notifications** | `/api/notifications` | Unread notifications counter and alert list | Authenticated |
| **Administration** | `/api/admin` | User management, reports moderation, audit logs | Admin Only |

---

### Selected API Endpoints

#### Authentication (`/api/auth`)
| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Create new student account (always assigns student role) |
| `POST` | `/api/auth/login` | Public | Authenticate; sets HttpOnly refresh cookie and returns access token |
| `POST` | `/api/auth/logout` | Authenticated | Revoke refresh token and clear cookie |
| `GET` | `/api/auth/me` | Authenticated | Return authenticated user's public profile |
| `POST` | `/api/auth/refresh` | Cookie | Rotate refresh token; detects token reuse and revokes compromised families |
| `POST` | `/api/auth/forgot-password` | Public | Dispatch password recovery link/token (console-logged in dev) |
| `POST` | `/api/auth/reset-password` | Public | Reset password using valid single-use reset token |
| `PUT` | `/api/auth/change-password` | Authenticated | Update password; invalidates other active refresh sessions |
| `GET` | `/api/auth/verify-email` | Public | Verify account email address via cryptographic token |
| `POST` | `/api/auth/resend-verification` | Authenticated | Request a fresh verification email |

#### Questions & Answers
| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/questions` | Public | Search and list doubts (sort: `newest`, `popular`, `unanswered`) |
| `POST` | `/api/questions` | Authenticated | Create a new academic doubt with tags and subject |
| `GET` | `/api/questions/:id` | Public | Retrieve doubt details and atomically increment view count |
| `PUT` | `/api/questions/:id` | Author / Admin | Update doubt title, description, or tags |
| `DELETE` | `/api/questions/:id` | Author / Admin | Delete doubt with cascade cleanup of answers, votes, bookmarks |
| `PATCH` | `/api/questions/:id/status` | Author / Admin | Toggle doubt status (`open` / `closed`) |
| `GET` | `/api/questions/:questionId/answers` | Public | Retrieve answers (verified solutions sorted to top) |
| `POST` | `/api/questions/:questionId/answers` | Authenticated | Post answer to an open doubt |
| `PUT` | `/api/answers/:id` | Author / Admin | Update answer content |
| `DELETE` | `/api/answers/:id` | Author / Admin | Delete answer and adjust question count |
| `PUT` | `/api/answers/:id/verify` | Teacher / Admin | Toggle official teacher verification (+15 reputation points) |

#### Administration (`/api/admin`) *(Strictly requires role === 'admin')*
| Method | Endpoint | Purpose |
| :--- | :--- | :--- |
| `GET` | `/api/admin/stats` | Real-time platform metrics (users, questions, answers, reports) |
| `GET` | `/api/admin/users` | Search and filter users by role and account status |
| `PUT` | `/api/admin/users/:id/role` | Promote student to teacher/admin or modify role |
| `PUT` | `/api/admin/users/:id/status` | Suspend or reactivate user accounts (terminates active sessions) |
| `GET` | `/api/admin/reports` | Retrieve moderation reports queue with enriched post targets |
| `PUT` | `/api/admin/reports/:id` | Resolve or dismiss moderation report (with optional content removal) |
| `GET` / `POST` / `PUT` | `/api/admin/subjects` | Manage academic categories and subject tags |
| `GET` / `POST` / `DELETE` | `/api/admin/announcements` | Publish and manage system-wide announcements |
| `GET` | `/api/admin/audit-logs` | Retrieve append-only administrative audit log trail |

---

## 🧪 Testing

The backend includes integration test suites running against an isolated in-memory database:

```bash
cd server
npm test
```

### Test Suites Included:
* **`tests/health.test.js`** — Health check validation, CORS reflection, Helmet security headers, JSON 404 handler.
* **`tests/auth.test.js`** — Student registration boundaries, bcrypt hashing, timing attack mitigation, token rotation, reuse detection, suspension guards.
* **`tests/forum.test.js`** — Question creation/search/pagination, answer submission, teacher verification with reputation awards, self-voting prevention, bookmarks, and admin security boundaries.

---

## 🔒 Security Architecture

* **Salted Password Hashing:** Credentials hashed using `bcryptjs` with 12 salt rounds before database persistence.
* **In-Memory Access Tokens:** JWT access tokens are stored in application memory, eliminating exposure to browser `localStorage` or `sessionStorage` XSS theft.
* **HttpOnly Refresh Cookies:** Refresh tokens transmitted via secure, HttpOnly, path-restricted (`/api/auth`), `SameSite=Lax/Strict` cookies.
* **Cryptographic Token Families:** Refresh rotation tracks token lineages. Any attempt to replay a consumed or revoked token immediately revokes all tokens in that family.
* **Strict Role Verification:** Backend middleware (`authenticate` + `authorize`) re-evaluates user role and account status directly from the database on every authenticated request.
* **Rate Limiting:** Protection against brute-force login attempts (15 attempts/15m) and general API scraping (200 requests/15m).
* **Input Validation:** All inbound payloads parsed through Zod schemas before reaching business logic.
* **NoSQL Injection Resistance:** Query objects use strict parameter validation and object ID validation.

> [!CAUTION]
> **Production Deployment Hygiene:**
> * Never commit `.env` files to source control.
> * Always configure strong, cryptographically random secrets for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` (at least 64 characters in production).
> * Remove `ADMIN_SEED_EMAIL` and `ADMIN_SEED_PASSWORD` from `.env` immediately after initial bootstrap.

---

## 🗺️ Future Improvements

- [ ] Complete dedicated frontend route and UI for `/verify-email`.
- [ ] Add editable user profile view (bio, avatar, subject specializations).
- [ ] Implement public and student-facing announcements feed widget on dashboards.
- [ ] Add client-side component test suites (Vitest / React Testing Library).
- [ ] Enhance real-time notifications with WebSockets (Socket.IO).
- [ ] Implement multi-document transactions for cascade deletions in replica set environments.

---

## 🎓 Project Information

* **Project:** Student Doubt Forum
* **Category:** Full-Stack Web Application (MERN)
* **Architecture:** Decoupled Client-Server (REST API + SPA)
* **Purpose:** Academic collaboration, peer-to-peer learning, and teacher-verified doubt resolution

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

---

<p align="center">
  <strong>Learn together. Solve doubts. Grow together. 🎓</strong>
</p>