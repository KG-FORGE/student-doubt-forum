# Student Doubt Forum 🎓

A full-stack, secure MERN platform designed for peer-to-peer academic discussion, doubt resolution, teacher verification, and administrative moderation.

---

## 🌟 Key Features

### 👤 Authentication & Role-Based Authorization
- **Secure JWT Architecture**: 15-minute in-memory access tokens paired with 7-day HttpOnly, `SameSite=Strict` rotating refresh tokens.
- **Refresh Token Reuse Detection**: Implements cryptographic token families. If a compromised or consumed refresh token is presented, the entire family is revoked immediately.
- **Strict Role Boundaries**:
  - **Student**: Public registration only creates student accounts.
  - **Teacher / Instructor**: Designated solely by platform administrators. Can officially verify student answers (+15 reputation points awarded to author).
  - **Administrator**: Dedicated dashboard for user management (role promotion, suspension), content moderation, subjects, broadcast announcements, and immutable audit logs.
- **Account State Verification**: Suspended accounts are immediately rejected across all endpoints and existing sessions terminated.

### ❓ Doubts & Knowledge Sharing
- **Questions Lifecycle**: Ask doubts with title, detailed description, subjects/courses, and tags. Authors and admins can close/reopen or delete doubts.
- **Rich Answers**: Post markdown answers, discuss problem steps, and track revision history.
- **Instructor Verification**: Teachers and administrators can verify answers, promoting them to the top of the discussion with official badges.
- **Reputation Engine**: Upvoting answers gives authors +10 reputation, downvoting applies -5 penalty, and instructor verification awards +15 reputation points.
- **Integrity Protections**: Server-side prevention of self-voting, vote-toggling support, and atomic score updates.
- **Bookmarks**: Save important doubts for quick access from the student dashboard.
- **Moderation Reports**: Community members can report abusive, offensive, misleading, or spam content for administrative review.
- **Notification Center**: Alerts for answers received, instructor verifications, upvotes, and account status changes.

---

## 🛠️ Technology Stack

- **Frontend**:
  - React 19 + React Router v7
  - Vite + Tailwind CSS v4
  - Lucide React Icons
  - Axios with automated token refresh & request interceptors
- **Backend**:
  - Node.js (ES Modules) + Express
  - MongoDB + Mongoose 8
  - Helmet (security headers) & CORS
  - express-rate-limit (protection against brute force attacks)
  - Zod (schema validation)
  - bcryptjs (salted password hashing)
  - jsonwebtoken (stateless JWTs)
  - Nodemailer (email verification and password recovery)
- **Testing**:
  - Vitest + Supertest + MongoMemoryServer (isolated, in-memory integration testing)

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18.0 or higher)
- npm or yarn
- MongoDB (Local instance or MongoDB Atlas URI)

### 1. Server Setup

```bash
cd server

# Copy environment template
cp .env.example .env

# Install dependencies
npm install

# Run database tests (uses in-memory MongoDB automatically)
npm test

# (Optional) Seed the initial Administrator account
npm run seed:admin

# Start the development server (runs on http://localhost:5001)
npm run dev
```

> **macOS Port Note**: The backend runs on port **5001** (relocated from 5000 to avoid conflicts with Apple AirPlay Receiver / `ControlCenter` on macOS). The frontend Vite proxy forwards `/api/*` requests directly to `http://localhost:5001`.

### 2. Client Setup

```bash
cd ../client

# Install dependencies
npm install

# Build verification
npm run build

# Start the Vite development server (runs on http://localhost:5173 with proxy to backend)
npm run dev
```

---

## ⚙️ Environment Variables

### `server/.env`

| Variable | Description | Default / Example |
|---|---|---|
| `PORT` | API server port (port 5001 avoids macOS AirPlay collision) | `5001` |
| `NODE_ENV` | Environment mode | `development` |
| `MONGODB_URI` | MongoDB connection URI | `mongodb://localhost:27017/student-doubt-forum` |
| `JWT_ACCESS_SECRET` | Secret for 15-minute access tokens (min 64 chars in prod) | `<random-hex-string>` |
| `JWT_REFRESH_SECRET` | Secret for 7-day refresh tokens (min 64 chars in prod) | `<random-hex-string>` |
| `JWT_ACCESS_EXPIRES_IN` | Access token duration | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token duration | `7d` |
| `CLIENT_ORIGIN` | Allowed client URL for CORS | `http://localhost:5173` |
| `EMAIL_HOST` | SMTP server host (optional in dev) | `smtp.mailtrap.io` |
| `EMAIL_PORT` | SMTP port | `587` |
| `EMAIL_USER` | SMTP username | `<username>` |
| `EMAIL_PASS` | SMTP password | `<password>` |
| `EMAIL_FROM` | Sender address | `noreply@doubtforum.local` |
| `ADMIN_SEED_EMAIL` | Initial admin account email | `admin@doubtforum.local` |
| `ADMIN_SEED_PASSWORD` | Initial admin password (min 8 chars, 1 uppercase, 1 digit) | `AdminPass123!` |
| `ADMIN_SEED_NAME` | Initial admin display name | `System Admin` |

> **Note on Email & Database**:
> - **In-Memory Development Fallback**: If local MongoDB (`localhost:27017`) is not running, the development server automatically boots an ephemeral in-memory database (`mongodb-memory-server`) so you can run the app without local MongoDB setup.
> - **Automated Demo Accounts**: In development mode with an empty database, default subjects and demo accounts are created automatically on startup:
>   - **Admin:** `admin@doubtforum.local` / `AdminPass123!`
>   - **Teacher:** `teacher@doubtforum.local` / `TeacherPass123!`
>   - **Student:** `student@doubtforum.local` / `StudentPass123!`
> - **Email Optional**: Email delivery is optional during local development. If SMTP credentials are not configured, verification links and password reset tokens are logged to the console transparently.
> - **Test Isolation**: Vitest test suites run against an isolated `mongodb-memory-server` instance and require no running external MongoDB daemon.

---

## 📡 API Endpoints Summary

### Service Discovery & Health
- `GET /`: API welcome banner, client app URL, and root discovery
- `GET /api`: Index of available API resources and routes
- `GET /api/health`: Service health status, ISO timestamp, database connectivity, and environment mode

### Authentication (`/api/auth`)
- `POST /register`: Register a new student account (public registration always creates students)
- `POST /login`: Authenticate with email/password; receives access token + HttpOnly refresh cookie
- `POST /logout`: Invalidate refresh token session and clear cookie
- `GET /me`: Fetch authenticated user public profile
- `POST /refresh`: Rotate refresh token and issue new access token (with token reuse detection)
- `POST /forgot-password`: Dispatch password reset link or token (console-logged in dev)
- `POST /reset-password`: Reset credentials with token (revokes all active sessions)
- `PUT /change-password`: Change password when authenticated (revokes other active sessions)
- `GET /verify-email`: Verify account via email token
- `POST /resend-verification`: Resend email verification link

### Doubts / Questions (`/api/questions`)
- `GET /`: Search, filter by subject/tags, sort (`newest`, `popular`, `unanswered`), and paginate
- `POST /`: Post a new doubt (Authenticated)
- `GET /:id`: Get doubt details and increment view count
- `PUT /:id`: Update doubt (Author or Admin)
- `DELETE /:id`: Delete doubt (Author or Admin) with cascade cleanup of answers, votes, and bookmarks
- `PATCH /:id/status`: Toggle doubt open/closed (Author or Admin)

### Answers (`/api/answers`)
- `GET /questions/:questionId/answers`: List answers for doubt (verified answers prioritized)
- `POST /questions/:questionId/answers`: Submit answer (Authenticated)
- `PUT /:id`: Update answer (Author or Admin)
- `DELETE /:id`: Delete answer (Author or Admin)
- `PUT /:id/verify`: Verify/unverify answer (Teacher or Admin only)

### Voting (`/api/votes`)
- `POST /`: Cast, toggle, or alter vote on doubt or answer (Anti-self voting enforced)
- `GET /user`: Retrieve user's active vote map for given targets

### Bookmarks (`/api/bookmarks`)
- `GET /`: List current user's bookmarked doubts
- `POST /`: Add doubt to bookmarks
- `DELETE /:questionId`: Remove bookmark
- `GET /ids`: Retrieve set of bookmarked IDs

### Moderation & Reports (`/api/reports`)
- `POST /`: Submit report on doubt or answer with category and reason

### Notifications (`/api/notifications`)
- `GET /`: List notifications for current user
- `GET /unread-count`: Fast unread notifications count
- `PUT /:id/read`: Mark single notification read
- `PUT /read-all`: Mark all notifications read

### Administrator Console (`/api/admin`) *(Admin only)*
- `GET /stats`: Real-time platform metrics and counts
- `GET /users`: Search and filter users by role and status
- `PUT /users/:id/role`: Promote/demote user (student/teacher/admin)
- `PUT /users/:id/status`: Suspend or reactivate user account
- `GET /reports`: View moderation reports queue
- `PUT /reports/:id`: Resolve or dismiss report (with optional content removal)
- `GET / POST / PUT /subjects`: Manage platform academic subjects
- `GET / POST / PUT / DELETE /announcements`: Manage announcements
- `GET /audit-logs`: View immutable audit log of administrative actions

---

## 🧪 Testing

The platform includes full integration test coverage with in-memory MongoDB:

```bash
cd server
npm test
```

Test Suites:
1. `health.test.js`: Health checks, CORS headers, Helmet headers, 404 handler.
2. `auth.test.js`: Registration, login, rate-limiting, password hashing, token rotation, reuse detection, suspension guards.
3. `forum.test.js`: Doubts CRUD, search, teacher verification, voting integrity, bookmarks, and admin security boundaries.