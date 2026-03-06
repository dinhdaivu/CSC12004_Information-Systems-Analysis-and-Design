---
name: add-angular-feature
description: Add a new Angular feature module (page, route, service) to the frontend. Use when creating a new feature area, page, or standalone component that needs lazy-loaded routing. Follows Angular 21 standalone component conventions.
---

# Add an Angular Feature

Add a complete feature using Angular 21 **standalone components** and **lazy-loaded routes**.

## Feature Directory Structure

```
frontend/src/app/features/[feature-name]/
├── [feature-name].routes.ts       ← lazy-loaded route config
├── pages/
│   └── [page-name]/
│       ├── [page-name].component.ts
│       └── [page-name].component.html
├── components/                    ← reusable sub-components (optional)
│   └── [component-name]/
│       ├── [name].component.ts
│       └── [name].component.html
└── services/
    └── [feature-name].service.ts  ← feature-specific service
```

## Step-by-Step

### 1. Create the Service

`frontend/src/app/features/rooms/services/room.service.ts`
```typescript
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Room {
  id: string;
  room_number: string;
  status: string;
  price: number;
}

@Injectable({ providedIn: 'root' })
export class RoomService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/rooms`;

  getAvailableRooms(): Observable<{ data: Room[] }> {
    return this.http.get<{ data: Room[] }>(this.apiUrl);
  }
}
```

### 2. Create a Standalone Component

`frontend/src/app/features/rooms/pages/room-list/room-list.component.ts`
```typescript
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoomService, Room } from '../../services/room.service';

@Component({
  selector: 'app-room-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './room-list.component.html'
})
export class RoomListComponent implements OnInit {
  private roomService = inject(RoomService);

  rooms = signal<Room[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.roomService.getAvailableRooms().subscribe({
      next: (res) => {
        this.rooms.set(res.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }
}
```

### 3. Create the Route File

`frontend/src/app/features/rooms/rooms.routes.ts`
```typescript
import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const ROOMS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/room-list/room-list.component').then(m => m.RoomListComponent),
    canActivate: [authGuard]
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/room-detail/room-detail.component').then(m => m.RoomDetailComponent),
    canActivate: [authGuard]
  }
];
```

### 4. Register in App Routes

`frontend/src/app/app.routes.ts` — add entry:
```typescript
{
  path: 'rooms',
  loadChildren: () => import('./features/rooms/rooms.routes').then(m => m.ROOMS_ROUTES)
}
```

### 5. Write Tests

`frontend/src/app/features/rooms/pages/room-list/room-list.component.spec.ts`
```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoomListComponent } from './room-list.component';
import { RoomService } from '../../services/room.service';
import { of } from 'rxjs';

describe('RoomListComponent', () => {
  let component: RoomListComponent;
  let fixture: ComponentFixture<RoomListComponent>;
  const mockRoomService = { getAvailableRooms: jest.fn().mockReturnValue(of({ data: [] })) };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomListComponent],
      providers: [{ provide: RoomService, useValue: mockRoomService }]
    }).compileComponents();

    fixture = TestBed.createComponent(RoomListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());
});
```

```bash
cd frontend && npm test
```

## Angular 21 Rules

- **Always use `inject()`** instead of constructor injection
- **Use `signal()`** for reactive state (not BehaviorSubject for component state)
- **Never use NgModules** — use `standalone: true` on every component
- **Lazy-load everything** — no eager imports in app.routes.ts
- Import `CommonModule` (or specific directives: `NgIf`, `NgFor`) in component `imports: []`
- Use `HttpClient` via `inject(HttpClient)` — requires `provideHttpClient()` in `app.config.ts`

## Guards Reference

- `authGuard` — redirect to `/auth/login` if not authenticated
- `roleGuard('admin')` — redirect if user lacks role
- Guards located in `frontend/src/app/core/guards/`
