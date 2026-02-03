# Backend - HomeStay Dorm

Express.js REST API with TypeScript, serving the HomeStay Dorm application.

## Quick Start

```bash
npm install
npm run dev
```

The API will start at `http://localhost:3000`

## Project Structure

```
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
```

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

Create `.env.local` with:
```
SUPABASE_URL=your_url
SUPABASE_KEY=your_key
CLOUDINARY_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_SECRET=your_secret
RESEND_API_KEY=your_key
VIETQR_CLIENT_ID=your_id
VIETQR_CLIENT_SECRET=your_secret
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
