# HomeStay Dorm

Modern dormitory management system for private housing facilities

A comprehensive web-based platform for room rental, deposits, contracts, and payment tracking. Built with Angular 21, Express.js, and Supabase.

---

## Quick Navigation

| Link                                          | Purpose                       |
| --------------------------------------------- | ----------------------------- |
| **[Getting Started](#getting-started)**       | Complete setup guide          |
| **[frontend/README.md](frontend/README.md)**  | Angular-specific setup        |
| **[backend/README.md](backend/README.md)**    | Express.js-specific setup     |
| **[supabase/README.md](supabase/README.md)**  | Database configuration        |
| **[CONTRIBUTING.md](CONTRIBUTING.md)**        | Development guidelines        |

---

## Overview

HomeStay Dorm provides an intuitive interface for:

- Viewing and managing available rooms
- Processing rental bookings with automated deposits
- Managing rental agreements and contracts
- Tracking payments and transactions
- Role-based access control (User, Staff, Admin)
- Real-time room availability updates

## Technology Stack

| Component        | Technology                                             |
| ---------------- | -------------------------------------------            |
| Frontend         | Angular 21, TypeScript 5.9.3, Tailwind CSS 4, RxJS 7.8 |
| Backend          | Express.js 5.2.1, TypeScript 5.9.3, Node.js 20.x+      |
| Database         | Supabase (PostgreSQL), Row Level Security              |
| Storage          | Cloudinary                                             |
| Email            | Resend                                                 |
| Payments         | VietQR                                                 |
| Authentication   | Supabase Auth + JWT                                    |
| Testing          | Jest (Backend), Jasmine (Frontend)                     |
| CI/CD            | GitHub Actions                                         |

---

## Project Structure

```text
HomeStay Dorm/
├── frontend/                  # Angular 21 SPA
│   ├── src/app/
│   │   ├── core/             # Services, guards, interceptors
│   │   ├── shared/           # Reusable components
│   │   ├── features/         # Feature modules
│   │   └── environments/     # Config
│   └── README.md
│
├── backend/                   # Express.js REST API
│   ├── src/
│   │   ├── config/           # Service configs
│   │   ├── middleware/       # Auth, error handling
│   │   ├── routes/           # API endpoints
│   │   ├── controllers/      # Route handlers
│   │   ├── services/         # Business logic
│   │   └── models/           # TypeScript interfaces
│   └── README.md
│
├── docs/                      # Reference documentation
│   ├── README.md             # Architecture & API docs
│   ├── GitHub_Development_Standards.pdf
│   └── Requirements.pdf
│
├── .github/workflows/         # CI/CD pipelines
│   ├── frontend-ci.yml
│   └── backend-ci.yml
│
├── supabase/                  # Database setup
│   ├── migrations/            # SQL migration files
│   │   └── 001_initial_schema.sql
│   ├── policies/              # RLS policies
│   │   └── README.md
│   └── README.md
│
├── README.md                  # This file
├── CONTRIBUTING.md            # Guidelines
├── LICENSE                    # MIT
└── .gitignore
```

---

## Getting Started

### Prerequisites

- **Node.js** 20.x - [nodejs.org](https://nodejs.org)
- **npm** 10.x (included with Node.js)
- **Git** - For version control
- **Code Editor** - VS Code recommended

### Step 1: Install Dependencies

```bash
cd frontend
npm install

cd ../backend
npm install
```

### Step 2: Setup External Services

Create free accounts and get credentials:

1. **Supabase** - [supabase.com](https://supabase.com)
   - Project URL
   - API Key (anon)

2. **Cloudinary** - [cloudinary.com](https://cloudinary.com)
   - Cloud Name
   - API Key & Secret

3. **Resend** - [resend.com](https://resend.com)
   - API Key

4. **VietQR** (optional)
   - Client ID & Secret

### Step 3: Configure Environment

#### Backend Environment Setup

The backend uses `.env` file for environment variables:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your credentials:

```env
# Application Configuration
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:4200

# Supabase Database & Auth
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Cloudinary Image Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Resend Email Service
RESEND_API_KEY=your_resend_api_key

# VietQR Payment Gateway (Optional)
VIETQR_CLIENT_ID=your_client_id
VIETQR_CLIENT_SECRET=your_client_secret

# JWT Authentication
JWT_SECRET=your_strong_secret_key_at_least_32_characters
JWT_EXPIRE=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:4200
```

**Important Notes:**
- The backend uses `.env` for environment variables
- Never commit `.env` to version control (it's in `.gitignore`)
- Generate a strong JWT_SECRET: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- For production, use `.env.production` with production URLs

#### Frontend Environment Setup

The frontend uses environment TypeScript files (not .env files):

Edit `frontend/src/environments/environment.ts` for development:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/v1',
  supabaseUrl: 'https://your-project.supabase.co',
  supabaseAnonKey: 'your_anon_key_here'
};
```

Edit `frontend/src/environments/environment.prod.ts` for production:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.your-domain.com/api/v1',
  supabaseUrl: 'https://your-project.supabase.co',
  supabaseAnonKey: 'your_anon_key_here'
};
```

**Important Notes:**
- Frontend environment files ARE committed to the repository
- Only use public keys (never service role keys) in frontend
- Update `apiUrl` to match your backend deployment URL in production

### Step 4: Run Development Servers

Terminal 1 - Backend:

```bash
cd backend
npm run dev
# Runs on http://localhost:3000
```

Terminal 2 - Frontend:

```bash
cd frontend
npm start
# Runs on http://localhost:4200
```

### Step 5: Verify

- Backend running at [http://localhost:3000](http://localhost:3000)
- Frontend at [http://localhost:4200](http://localhost:4200)
- No console errors in browser

---

## Available Commands

### Frontend

```bash
npm start              # Development server
npm run build          # Production build
npm test               # Run unit tests
npm run lint           # ESLint check
npm run lint:fix       # Auto-fix lint issues
```

### Backend

```bash
npm run dev            # Dev server with hot reload
npm run build          # Compile TypeScript
npm test               # Run Jest tests
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report
npm run lint           # ESLint check
npm run lint:fix       # Auto-fix issues
```

---

## Key Features

- **Room Management** - Browse and manage available rooms
- **Booking System** - Reserve rooms with automated deposit processing
- **Contract Management** - Digital rental agreements
- **Payment Tracking** - Secure payment and transaction history
- **Role-Based Access** - User, Staff, and Admin roles
- **Real-time Updates** - Live room availability and notifications

---

## Development Workflow

1. Create Branch

   ```bash
   git checkout -b feature/your-feature
   ```

2. Make Changes

   - Follow [CONTRIBUTING.md](CONTRIBUTING.md)
   - Write tests
   - Run linting

3. Commit

   ```bash
   git commit -m "feat: description"
   ```

4. Push & Create PR

   ```bash
   git push origin feature/your-feature
   ```

---

## Documentation

- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Development guidelines
- **[frontend/README.md](frontend/README.md)** - Angular setup and commands
- **[backend/README.md](backend/README.md)** - Express.js setup and commands
- **[supabase/README.md](supabase/README.md)** - Database setup and migrations
- **[docs/README.md](docs/README.md)** - System architecture and API documentation

---

## CI/CD Pipeline

GitHub Actions automatically:

- Runs linting
- Executes tests
- Builds production version
- Reports coverage

Workflows: `.github/workflows/frontend-ci.yml`, `backend-ci.yml`

---

## Troubleshooting

Port already in use

```bash
# Windows: Find and kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac: Find and kill process on port 3000
lsof -i :3000
kill -9 <PID>
```

Module not found

```bash
rm -rf node_modules package-lock.json
npm install
```

TypeScript errors

```bash
npm run build
```

npm command not found

```bash
# Reinstall Node.js from https://nodejs.org
# Make sure to add to PATH during installation
```

---

## Course Information

- **Course:** CSC12004 - Systems Analysis and Design
- **Institution:** HCMUS - Faculty of Information Technology

---

## License

MIT License - See [LICENSE](LICENSE)

---

**Ready to start?** Follow [Getting Started](#getting-started) above!
