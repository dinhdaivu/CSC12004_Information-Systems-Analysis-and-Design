---
description: Run ESLint on frontend and backend
---

## Lint Check

**Backend**
```bash
cd backend
npm run lint
```

**Backend — auto-fix**
```bash
cd backend
npm run lint:fix
```

**Frontend**
```bash
cd frontend
npm run lint
```

**Frontend — auto-fix**
```bash
cd frontend
npm run lint:fix
```

Always run lint before pushing or creating a PR.  
Both pass in CI (`backend-ci.yml`, `frontend-ci.yml`).
