---
description: Run Jest tests for frontend and backend
---

## Run Tests

**Backend**
```bash
cd backend
npm test
```

**Backend with coverage**
```bash
cd backend
npm run test:coverage
```

**Frontend**
```bash
cd frontend
npm test
```

**Frontend with coverage**
```bash
cd frontend
npm run test:coverage
```

**Run a specific test file**
```bash
# Backend
cd backend && npx jest tests/services/room.service.test.ts

# Frontend
cd frontend && npx jest src/app/features/rooms/room-list.component.spec.ts
```

**Coverage target:** >70% for all files.

Coverage reports appear in:
- `backend/coverage/`
- `frontend/coverage/`
