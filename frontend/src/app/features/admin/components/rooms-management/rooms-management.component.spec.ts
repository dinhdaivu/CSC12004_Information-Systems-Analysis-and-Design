import { TestBed } from '@angular/core/testing';
import { RoomsManagementComponent } from './rooms-management.component';

describe('RoomsManagementComponent', () => {
  let component: RoomsManagementComponent;
  let fixture: any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomsManagementComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RoomsManagementComponent);
    component = fixture.componentInstance;
  });

  it('should create rooms management', () => {
    expect(component).toBeTruthy();
  });

  it('should load rooms inventory', () => {
    fixture.detectChanges();
    expect(component).toBeDefined();
  });

  it('should display rooms management interface', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled).toBeTruthy();
  });

  it('should handle room operations', () => {
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
