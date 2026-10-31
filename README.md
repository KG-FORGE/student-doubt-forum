🎓 Student Doubt Forum

A smarter space to ask, answer, and learn together.

Student Doubt Forum is a full-stack MERN application that brings students and educators together through collaborative academic discussions. Students can raise questions, share knowledge, discover helpful answers, and learn from a community supported by teacher verification and administrative moderation.

💡 Our mission: Make academic doubt resolution more accessible, collaborative, and reliable.

⸻

✨ Features at a Glance

Feature	Description
🔐 Authentication	JWT-based authentication with access and refresh tokens
👥 Role-Based Access	Separate permissions for students, teachers, and administrators
❓ Question Forum	Create, browse, search, filter, and manage academic doubts
💬 Answers & Discussions	Share detailed answers and track answer revisions
✅ Teacher Verification	Highlight answers verified by teachers or administrators
🏆 Reputation System	Reward helpful contributions through voting and verification
⬆️ Community Voting	Vote on content with server-side self-voting protections
🔖 Bookmarks	Save useful questions for future reference
🔔 Notifications	Track answers, verification events, votes, and account updates
🚩 Content Moderation	Report inappropriate content for administrative review
🛡️ Admin Dashboard	Manage users, subjects, announcements, and moderation reports
📋 Audit Logs	Record administrative actions for accountability
📧 Account Recovery	Support email verification and password recovery workflows

⸻

🖼️ How It Works

                 STUDENT DOUBT FORUM
                          │
              ┌───────────┴───────────┐
              │                       │
          STUDENTS                 EDUCATORS
              │                       │
        Ask Questions             Answer Doubts
              │                       │
              └───────────┬───────────┘
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

⸻

👥 User Roles

🎓 Student

* Register and log in securely.
* Ask academic questions and explore existing discussions.
* Submit answers and participate in discussions.
* Vote on answers and bookmark useful questions.
* Receive notifications and report inappropriate content.
* Manage questions they are authorized to edit or close.

👨‍🏫 Teacher

* Participate in academic discussions.
* Verify helpful student answers.
* Help identify reliable and useful solutions.
* Earn recognition for supporting the learning community.

Teacher privileges are assigned by administrators rather than through public registration.

🛡️ Administrator

* View platform statistics.
* Manage users, roles, and account status.
* Review and resolve moderation reports.
* Manage academic subjects and announcements.
* Access administrative audit logs.

⸻

🏆 Reputation System

The platform encourages students to contribute useful academic knowledge through a reputation system.

Action	Reputation Change
Answer receives an upvote	+10
Answer receives a downvote	-5
Answer is verified by a teacher or administrator	+15

The backend is designed to enforce voting restrictions and maintain reputation updates. Exact scoring behavior should be verified through testing before treating these rules as production guarantees.

⸻

🛠️ Technology Stack

Frontend

* React 19 — Component-based user interface
* React Router v7 — Client-side navigation
* Vite — Development server and build tooling
* Tailwind CSS v4 — Utility-first styling
* Lucide React — Interface icons
* Axios — HTTP requests and token-refresh handling

Backend

* Node.js — JavaScript runtime
* Express.js — REST API framework
* MongoDB — Document database
* Mongoose 8 — MongoDB object modeling
* JSON Web Token (JWT) — Token-based authentication
* bcryptjs — Password hashing
* Zod — Request-data validation
* Helmet — HTTP security headers
* express-rate-limit — Request-rate limiting
* Nodemailer — Email delivery

Testing

* Vitest — Test runner
* Supertest — HTTP integration testing
* MongoMemoryServer — Isolated in-memory MongoDB for tests

⸻

🏗️ Architecture

┌─────────────────────────────┐
│        React Frontend       │
│     Vite + Tailwind CSS     │
└──────────────┬──────────────┘
               │
               │ HTTP / REST API
               ▼
┌─────────────────────────────┐
│       Express Backend       │
│                             │
│ Authentication & RBAC       │
│ Questions & Answers         │
│ Voting & Bookmarks          │
│ Notifications & Reports     │
│ Administrative Operations   │
└──────────────┬──────────────┘
               │
               │ Mongoose
               ▼
┌─────────────────────────────┐
│           MongoDB           │
│                             │
│ Users, Questions, Answers   │
│ Votes, Bookmarks, Reports   │
│ Notifications & Audit Logs  │
└─────────────────────────────┘

⸻

🚀 Getting Started

Follow these steps to run the application locally.

Prerequisites

Install the following:

* Node.js — version 18 or higher
* npm
* MongoDB Community Server or a MongoDB Atlas connection

Note: Use a Node.js version compatible with the project’s installed dependencies. If your installed packages require a newer version, follow their requirements.

1. Clone the Repository

git clone <YOUR_GITHUB_REPOSITORY_URL>
cd student-doubt-forum

Replace <YOUR_GITHUB_REPOSITORY_URL> with your repository’s clone URL.

2. Configure the Backend

cd server
cp .env.example .env
npm install

Open server/.env and configure the required environment variables.

Example:

PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/student-doubt-forum
JWT_ACCESS_SECRET=<your-random-access-secret>
JWT_REFRESH_SECRET=<your-random-refresh-secret>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
EMAIL_HOST=<your-smtp-host>
EMAIL_PORT=587
EMAIL_USER=<your-smtp-username>
EMAIL_PASS=<your-smtp-password>
EMAIL_FROM=<your-sender-address>
ADMIN_SEED_EMAIL=<your-admin-email>
ADMIN_SEED_PASSWORD=<your-strong-admin-password>
ADMIN_SEED_NAME=System Admin

Use strong, unique secrets. Never commit your real .env file or production credentials.

3. Start the Backend

From the server directory:

npm run dev

The backend is expected to run at:

http://localhost:5001

Check the health endpoint:

http://localhost:5001/api/health

The exact response depends on the application’s health-check implementation.

4. Configure the Frontend

Open another terminal:

cd client
npm install

5. Start the Frontend

npm run dev

Open the Vite URL shown in your terminal. The default development URL is:

http://localhost:5173

The frontend uses the Vite proxy to communicate with the backend. Ensure that its target matches the backend’s configured port.

6. Optional: Create an Administrator

From the server directory:

npm run seed:admin

Configure the administrator’s credentials in the environment before running the seed command.

Use this command only if it is available in your version of the project.

⸻

⚙️ Environment Configuration

The following variables are used by the documented application configuration. Check server/.env.example and the actual server code for the definitive list of required variables.

Variable	Purpose
PORT	Backend server port
NODE_ENV	Application environment
MONGODB_URI	MongoDB connection string
JWT_ACCESS_SECRET	Access-token signing secret
JWT_REFRESH_SECRET	Refresh-token signing secret
JWT_ACCESS_EXPIRES_IN	Access-token lifetime
JWT_REFRESH_EXPIRES_IN	Refresh-token lifetime
CLIENT_ORIGIN	Allowed frontend origin
EMAIL_HOST	SMTP server hostname
EMAIL_PORT	SMTP server port
EMAIL_USER	SMTP username
EMAIL_PASS	SMTP password
EMAIL_FROM	Sender email address
ADMIN_SEED_EMAIL	Initial administrator email
ADMIN_SEED_PASSWORD	Initial administrator password
ADMIN_SEED_NAME	Initial administrator display name

Database Notes

* The application is designed to work with MongoDB.
* The development configuration may fall back to an ephemeral in-memory MongoDB instance if a local database connection fails.
* In-memory development data is temporary and may be lost when the process restarts.
* Automated tests use an isolated in-memory database when configured by the test setup.
* Configure a persistent MongoDB instance when you need data to survive restarts.

Email Notes

Email verification and password recovery depend on the application’s email configuration.

During development, the application may log verification or recovery links to the terminal if SMTP is not configured. Treat these links and tokens as sensitive.

⸻

📡 API Overview

The backend exposes REST API endpoints for the following resources.

Resource	Base Path	Purpose
Health	/api/health	Service health information
Authentication	/api/auth	Registration, login, sessions, and recovery
Questions	/api/questions	Question creation, discovery, and management
Answers	/api/answers	Answer submission and verification
Voting	/api/votes	Community voting
Bookmarks	/api/bookmarks	Saved questions
Reports	/api/reports	Content reporting
Notifications	/api/notifications	User notifications
Administration	/api/admin	User management and moderation

Selected Endpoints

Authentication

Method	Endpoint	Purpose
POST	/api/auth/register	Register a student
POST	/api/auth/login	Authenticate a user
POST	/api/auth/logout	End a refresh-token session
GET	/api/auth/me	Retrieve the current user
POST	/api/auth/refresh	Refresh authentication tokens
POST	/api/auth/forgot-password	Request password recovery
POST	/api/auth/reset-password	Reset a password

Questions and Answers

Method	Endpoint	Purpose
GET	/api/questions	Browse and search questions
POST	/api/questions	Create a question
GET	/api/questions/:id	Retrieve question details
PUT	/api/questions/:id	Update an authorized question
DELETE	/api/questions/:id	Delete an authorized question
POST	/api/answers/questions/:questionId/answers	Submit an answer
GET	/api/answers/questions/:questionId/answers	Retrieve answers

Administration

Administrative endpoints support platform statistics, user management, moderation reports, subject management, announcements, and audit-log access.

API documentation note: This is a high-level overview, not an exhaustive API specification. Consult the backend route files for the exact methods, parameters, permissions, and response formats supported by your current implementation.

⸻

🧪 Testing

The backend includes integration tests using Vitest, Supertest, and MongoMemoryServer.

From the server directory:

npm test

The documented test suites cover areas including:

* Health checks and HTTP security headers
* Registration and authentication
* Password hashing and token handling
* Question and answer operations
* Voting and bookmarks
* Role-based authorization

Testing status: The existence of test files does not establish that every test passes. Run the suite successfully before claiming that the project has been fully tested.

⸻

🔒 Security Considerations

The application includes security-oriented mechanisms such as:

* Password hashing with bcryptjs
* JWT-based authentication
* Refresh-token handling
* Role-based access control
* Request validation
* HTTP security headers
* Rate limiting
* Administrative moderation

The implementation also includes refresh-token rotation and reuse-detection logic.

These mechanisms should be validated through testing and security review before deploying the application to a production environment.

Never commit:

* .env files containing secrets
* Real SMTP credentials
* Production JWT secrets
* Private API keys
* Real user passwords or sensitive user data

⸻

🗺️ Future Improvements

Potential areas for further development include:

* 📧 Completing the frontend email-verification flow
* 👤 Adding profile editing
* 📢 Providing a student-facing announcements feed
* 🧪 Expanding automated and frontend test coverage
* 📱 Improving mobile responsiveness and accessibility
* 🚀 Deploying the application with persistent database storage
* 📊 Adding more detailed analytics and reporting

These items are future improvements unless they have already been implemented and verified in the current version.

⸻

🎓 Project Information

Project: Student Doubt Forum
Category: Full-Stack Web Development
Architecture: MERN
Purpose: Peer-to-peer academic discussion and doubt resolution

Built to make collaborative learning easier by bringing questions, answers, educators, and moderation tools together in one platform.

⸻

🤝 Contributing

Contributions and suggestions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Test your changes.
5. Submit a pull request with a clear description.

⸻

📄 License

No license has been specified here. Add a LICENSE file and update this section if you intend to distribute the project under an open-source license.

⸻

<p align="center">
  <strong>Learn together. Solve doubts. Grow together. 🎓</strong>
</p>