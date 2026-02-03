# Backend - HomeStay Dorm

Express.js REST API with TypeScript, serving the HomeStay Dorm application.

## Quick Start

```bash
npm install
npm run dev
```

The API will start at `http://localhost:3000`

## Project Structure

src/
├── index.ts               # Application entry point
├── config/                # Service configurations
│   ├── supabase.ts        # Supabase client
│   └── cloudinary.ts      # Cloudinary client
├── middleware/            # Express middleware
│   └── auth.middleware.ts # JWT authentication
├── models/                # TypeScript interfaces
├── routes/                # API route definitions
├── services/              # Business logic
├── controllers/           # Route handlers
└── utils/
    ├── errors.ts          # Error classes
    └── token.ts           # Token utilities

## Available Commands

```bash
npm run dev            # Development server with hot reload
npm run build          # Compile TypeScript to dist/
npm start              # Run compiled app
npm test               # Run tests with Jest
npm run test:watch     # Watch mode testing
npm run test:coverage  # Coverage report
npm run lint           # ESLint check
npm run lint:fix       # Auto-fix linting issues
```

## Features

- RESTful API with Express.js 5.2.1
- JWT authentication via Supabase
- Role-based access control (RBAC)
- Error handling middleware
- Input validation
- TypeScript for type safety
- Jest unit testing
- ESLint code quality

## Environment Configuration

### Setup Environment File

Create `.env` in the `backend/` directory:

```bash
cp .env.example .env
```

### Environment Variables

Edit `.env` with your configuration:

```env
# Application Configuration
NODE_ENV=development                    # Environment: development, production, test
PORT=3000                               # Server port (default: 3000)
FRONTEND_URL=http://localhost:4200     # Frontend URL for CORS

# Supabase Configuration
# Get these from: https://supabase.com/dashboard > Project Settings > API
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Cloudinary Configuration
# Get these from: https://cloudinary.com/console
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Resend Email Service
# Get API key from: https://resend.com/api-keys
RESEND_API_KEY=your_resend_api_key

# VietQR Payment Gateway (Optional)
# Get credentials from: https://vietqr.io
VIETQR_CLIENT_ID=your_client_id
VIETQR_CLIENT_SECRET=your_client_secret

# JWT Configuration
# Generate strong secret: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your_strong_secret_key_at_least_32_characters
JWT_EXPIRE=7d                          # Token expiration: 1h, 24h, 7d, 30d

# CORS Configuration
CORS_ORIGIN=http://localhost:4200      # Allowed frontend origins
```

### Environment Variable Details

#### Required Variables

- **SUPABASE_URL**: Your Supabase project URL
- **SUPABASE_ANON_KEY**: Public anon key for client-side operations
- **SUPABASE_SERVICE_ROLE_KEY**: Service role key for admin operations (keep secret!)
- **JWT_SECRET**: Secret key for signing JWT tokens (minimum 32 characters)

#### Optional Variables

- **CLOUDINARY_***: Required only if using image upload features
- **RESEND_API_KEY**: Required only if using email notifications
- **VIETQR_***: Required only if using VietQR payment gateway

#### Default Values

- **NODE_ENV**: Defaults to `development`
- **PORT**: Defaults to `3000`
- **JWT_EXPIRE**: Defaults to `7d` (7 days)

### Security Best Practices

1. **Never commit `.env` to version control**
   - Already in `.gitignore`
   - Use `.env.example` as template

2. **Generate strong JWT_SECRET**
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

3. **Use different secrets for each environment**
   - Development: `.env`
   - Production: `.env.production`
   - Testing: `.env.test`

4. **Rotate secrets regularly**
   - Change JWT_SECRET every 90 days
   - Update API keys on security incidents

### Environment File Priority

The application loads environment variables in this order:

1. `.env` (local development)
2. `.env.production` (production builds)
3. `.env.test` (testing environment)

### Validating Configuration

Verify your environment setup:

```bash
# Check if all required variables are set
npm run dev

# Should see:
✅ Server is running on http://localhost:3000

# If you see errors about missing config:
# - Check .env exists in backend/ directory
# - Verify all required variables are set
# - Ensure no syntax errors in .env
```

## API Routes

Base URL: `http://localhost:3000/api/v1`

See [../docs/API_ENDPOINTS.md](../docs/API_ENDPOINTS.md) for complete API documentation.

## Dependencies

- Express.js 5.2.1
- TypeScript 5.9.3
- Node.js 20.x+
- Jest for testing
- ESLint for code quality

## Testing

```bash
npm test              # Run all tests once
npm run test:watch    # Watch mode
npm run test:coverage # With coverage report
```

## Security

- CORS configured
- Helmet for security headers
- JWT token validation
- Input sanitization
- Row Level Security (RLS) on database
