---
description: Start both frontend and backend development servers
---

## Start Development Servers

Run these in **two separate terminals**:

**Terminal 1 — Backend (Express.js)**
```bash
cd backend
npm run dev
```
Runs at: http://localhost:3000

**Terminal 2 — Frontend (Angular)**
```bash
cd frontend
npm start
```
Runs at: http://localhost:4200

**Verify**
- Backend: `curl http://localhost:3000/api/health` → should return `{ "status": "OK" }`
- Frontend: Open http://localhost:4200 in browser
