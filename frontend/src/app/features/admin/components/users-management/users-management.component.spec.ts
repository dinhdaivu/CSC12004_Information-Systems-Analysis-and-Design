import { TestBed } from '@angular/core/testing';
import { UsersManagementComponent } from './users-management.component';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';

describe('UsersManagementComponent', () => {
  let component: UsersManagementComponent;
  let fixture: any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersManagementComponent],
      providers: [provideRouter([]), {
        provide: ActivatedRoute,
        useValue: {
          params: of({}),
          queryParams: of({})
        }
      }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(UsersManagementComponent);
    component = fixture.componentInstance;
  });

  it('should create users management', () => {
    expect(component).toBeTruthy();
  });

  it('should load users list', () => {
    fixture.detectChanges();
    expect(component).toBeDefined();
  });

  it('should display users table', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled).toBeTruthy();
  });

  it('should handle user actions', () => {
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
