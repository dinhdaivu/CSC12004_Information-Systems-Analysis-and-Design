---
name: add-backend-route
description: Add a new REST API endpoint to the Express.js backend. Use when creating a new route, controller, or service in the backend. Follows the project's Route → Controller → Service architecture pattern.
---

# Add a Backend Route

Follow the **Route → Controller → Service** pattern. Never put business logic in routes or controllers.

## Directory Structure

```
backend/src/
├── routes/        ← register path + HTTP method, bind to controller
├── controllers/   ← handle req/res, validate input, call service
├── services/      ← all business logic, Supabase queries
└── models/        ← TypeScript interfaces (types only, no logic)
```

## Step-by-Step

### 1. Define the Model (if new entity)

`backend/src/models/[entity].model.ts`
```typescript
export interface Room {
  id: string;
  branch_id: string;
  room_number: string;
  room_type: string;
  capacity: number;
  price: number;
  status: 'available' | 'occupied' | 'maintenance';
  created_at: string;
}

export interface CreateRoomDto {
  branch_id: string;
  room_number: string;
  room_type: string;
  capacity: number;
  price: number;
}
```

### 2. Create the Service

`backend/src/services/[entity].service.ts`
```typescript
import { supabase } from '../config/supabase';
import { Room, CreateRoomDto } from '../models/room.model';

export class RoomService {
  /**
   * Get all available rooms
   */
  async getAvailableRooms(): Promise<Room[]> {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('status', 'available');

    if (error) throw new Error(error.message);
    return data as Room[];
  }

  /**
   * Create a new room
   */
  async createRoom(dto: CreateRoomDto): Promise<Room> {
    const { data, error } = await supabase
      .from('rooms')
      .insert(dto)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as Room;
  }
}

export const roomService = new RoomService();
```

### 3. Create the Controller

`backend/src/controllers/[entity].controller.ts`
```typescript
import { Request, Response } from 'express';
import { roomService } from '../services/room.service';

export const getAvailableRooms = async (req: Request, res: Response) => {
  const rooms = await roomService.getAvailableRooms();
  res.json({ data: rooms });
};

export const createRoom = async (req: Request, res: Response) => {
  const room = await roomService.createRoom(req.body);
  res.status(201).json({ data: room });
};
```

> Express 5 propagates async errors automatically — no try/catch needed in controllers.

### 4. Create the Route File

`backend/src/routes/[entity].routes.ts`
```typescript
import { Router } from 'express';
import { getAvailableRooms, createRoom } from '../controllers/room.controller';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/role';

const router = Router();

router.get('/', authMiddleware, getAvailableRooms);
router.post('/', authMiddleware, requireRole('admin', 'staff'), createRoom);

export default router;
```

### 5. Register in index.ts

`backend/src/index.ts`
```typescript
import roomRoutes from './routes/room.routes';

// Routes
app.use('/api/v1/rooms', roomRoutes);
```

### 6. Write Tests

`backend/tests/[entity].service.test.ts` — follow the TDD skill.

```bash
cd backend && npm test
```

## Auth Middleware Reference

- `authMiddleware` — requires valid JWT; attaches `req.user`
- `requireRole('admin')` — restricts to specific roles
- Roles: `user`, `staff`, `admin`

## Common Pitfalls

- Don't query Supabase from controllers — always go through services
- Always handle `error` from Supabase: `if (error) throw new Error(error.message)`
- Use DTOs (separate from full model) for create/update payloads
- Route prefix must match what's registered in `index.ts` (`/api/v1/...`)
