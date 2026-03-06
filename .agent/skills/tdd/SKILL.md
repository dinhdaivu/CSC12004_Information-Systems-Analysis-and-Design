---
name: tdd
description: Write code using Test-Driven Development. Use this skill when the user asks to add tests, implement features test-first, fix bugs with failing tests first, or improve test coverage. Guides through the Red-Green-Refactor cycle using Jest (the test framework for both frontend and backend in this project).
---

# Test-Driven Development (TDD)

Guide development using the **Red → Green → Refactor** cycle with Jest.

This project uses Jest for both the Angular frontend and Express.js backend.

## The Cycle

```
1. RED    — Write a failing test that describes the desired behavior
2. GREEN  — Write the minimum code to make the test pass
3. REFACTOR — Clean up while keeping tests green
```

Never write implementation code before a failing test exists for it.

## Backend Tests (Express.js)

**Location:** `backend/tests/` or `backend/src/__tests__/`  
**Run:** `cd backend && npm test`  
**Coverage:** `cd backend && npm run test:coverage`

### Test structure (example for a service)
```typescript
// backend/tests/services/room.service.test.ts
import { RoomService } from '../../src/services/room.service';

describe('RoomService', () => {
  describe('getAvailableRooms', () => {
    it('should return only rooms with status "available"', async () => {
      // Arrange
      const mockRooms = [
        { id: '1', status: 'available', room_number: '101' },
        { id: '2', status: 'occupied', room_number: '102' },
      ];
      // Act & Assert...
    });
  });
});
```

### Mocking Supabase
```typescript
jest.mock('../../src/config/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: mockData, error: null })
      })
    })
  }
}));
```

### Integration tests with supertest
```typescript
import request from 'supertest';
import app from '../../src/index';

describe('GET /api/health', () => {
  it('should return 200 with status OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
  });
});
```

## Frontend Tests (Angular)

**Location:** Next to component files as `*.spec.ts`  
**Run:** `cd frontend && npm test`  
**Coverage:** `cd frontend && npm run test:coverage`

### Component test structure
```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoomListComponent } from './room-list.component';

describe('RoomListComponent', () => {
  let component: RoomListComponent;
  let fixture: ComponentFixture<RoomListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomListComponent]   // standalone component
    }).compileComponents();

    fixture = TestBed.createComponent(RoomListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

### Mocking services
```typescript
const mockRoomService = {
  getAvailableRooms: jest.fn().mockReturnValue(of([]))
};

await TestBed.configureTestingModule({
  imports: [RoomListComponent],
  providers: [{ provide: RoomService, useValue: mockRoomService }]
}).compileComponents();
```

## TDD Workflow

1. **Understand the requirement** — describe it as a test name: `it('should ...')`
2. **Write the test** — make it fail (RED)
3. **Verify it fails** — run `npm test`, confirm failure message makes sense
4. **Write minimum implementation** — just enough to pass (GREEN)
5. **Verify it passes** — run `npm test`
6. **Refactor** — clean up code, keep tests green
7. **Repeat** for next behavior

## Coverage Target

Project target is **>70% coverage**. Run coverage report and identify uncovered branches:

```bash
# Backend
cd backend && npm run test:coverage

# Frontend
cd frontend && npm run test:coverage
```

Focus on covering:
- Happy paths
- Error cases / edge cases
- Auth/role guard behavior
- Service method error handling
