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

### Environment Files Structure

The frontend uses TypeScript files for environment configuration (not `.env` files):

```
frontend/src/environments/
├── environment.ts         # Development configuration
└── environment.prod.ts    # Production configuration
```

### Development Environment (`environment.ts`)

Edit `src/environments/environment.ts` for local development:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/v1',
  supabaseUrl: 'https://your-project.supabase.co',
  supabaseAnonKey: 'your_anon_key_here'
};
```

### Production Environment (`environment.prod.ts`)

Edit `src/environments/environment.prod.ts` for production deployment:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.your-domain.com/api/v1',
  supabaseUrl: 'https://your-project.supabase.co',
  supabaseAnonKey: 'your_anon_key_here'
};
```

### Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|----------|
| `production` | Build mode flag | `false` for dev, `true` for prod |
| `apiUrl` | Backend API base URL | `http://localhost:3000/api/v1` |
| `supabaseUrl` | Supabase project URL | `https://xxx.supabase.co` |
| `supabaseAnonKey` | Supabase anonymous key | Get from Supabase dashboard |

### Getting Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings > API**
4. Copy:
   - **Project URL** → `supabaseUrl`
   - **Project API keys > anon public** → `supabaseAnonKey`

⚠️ **Security Warning**: Never use the `service_role` key in the frontend!

### Using Environment Variables

Import and use in your components/services:

```typescript
import { environment } from '@environments/environment';

@Injectable()
export class ApiService {
  private apiUrl = environment.apiUrl;
  
  getData() {
    return this.http.get(`${this.apiUrl}/data`);
  }
}
```

### Build-Specific Configuration

Angular automatically uses the correct environment file:

```bash
# Development build - uses environment.ts
npm start
npm run build

# Production build - uses environment.prod.ts
npm run build --configuration production
ng build --prod
```

### Path Aliases

For convenient imports, use the configured path alias:

```typescript
// Instead of:
import { environment } from '../../environments/environment';

// Use:
import { environment } from '@environments/environment';
```

Configured in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@environments/*": ["src/environments/*"]
    }
  }
}
```

### Best Practices

1. **Commit environment files to version control**
   - Unlike backend `.env.local`, frontend environment files are safe to commit
   - They only contain public information (API URLs, public keys)

2. **Never store secrets in frontend**
   - No private keys, service role keys, or secrets
   - Everything in frontend is visible to users

3. **Use different API URLs per environment**
   - Development: `http://localhost:3000`
   - Staging: `https://api-staging.your-domain.com`
   - Production: `https://api.your-domain.com`

4. **Validate environment on startup**
   - Check if API is reachable
   - Verify Supabase connection
   - Log environment in console (development only)
