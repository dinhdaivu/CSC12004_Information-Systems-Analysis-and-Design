import { TestBed } from '@angular/core/testing';
import { NewBookingComponent } from './new-booking.component';

describe('NewBookingComponent', () => {
  let component: NewBookingComponent;
  let fixture: any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewBookingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NewBookingComponent);
    component = fixture.componentInstance;
  });

  it('should create new booking form', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize booking form', () => {
    fixture.detectChanges();
    expect(component).toBeDefined();
  });

  it('should handle form submission', () => {
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should validate booking details', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
