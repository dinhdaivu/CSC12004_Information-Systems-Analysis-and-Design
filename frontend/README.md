# Frontend - HomeStay Dorm

Angular 21 single-page application with Tailwind CSS 4 styling.

## Quick Start

```bash
npm install
npm start
```

The app will open at `http://localhost:4200`

## Project Structure

```
src/
├── app/
│   ├── core/              # Singleton services, interceptors, guards
│   ├── shared/            # Reusable components, pipes, directives
│   ├── features/          # Feature modules (auth, rooms, bookings, admin)
│   └── environments/      # Environment configurations
├── assets/                # Static files
├── styles.scss            # Global styles
└── index.html
```

## Available Commands

```bash
npm start              # Development server
npm run build          # Production build (dist/)
npm test               # Run unit tests
npm run lint           # ESLint check
npm run lint:fix       # Auto-fix linting issues
```

## Features

- Standalone Angular components (no NgModules)
- Lazy-loaded feature modules
- Tailwind CSS 4 styling
- RxJS observable patterns
- HTTP interceptors (auth, error handling)
- Type-safe TypeScript models

## Dependencies

- Angular 21
- TypeScript 5.9.3
- Tailwind CSS 4
- RxJS 7.8
- Jasmine & Karma for testing

## Environment Configuration

Environment files in `src/environments/`:
- `environment.ts` - Development
- `environment.prod.ts` - Production

Update these with your API endpoints and configuration.
