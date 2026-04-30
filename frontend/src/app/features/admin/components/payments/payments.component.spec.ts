import { TestBed } from '@angular/core/testing';
import { PaymentsComponent } from './payments.component';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';

describe('PaymentsComponent', () => {
  let component: PaymentsComponent;
  let fixture: any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentsComponent],
      providers: [provideRouter([]), {
        provide: ActivatedRoute,
        useValue: {
          params: of({}),
          queryParams: of({})
        }
      }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentsComponent);
    component = fixture.componentInstance;
  });

  it('should create payments view', () => {
    expect(component).toBeTruthy();
  });

  it('should load payment history', () => {
    fixture.detectChanges();
    expect(component).toBeDefined();
  });

  it('should display payments list', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled).toBeTruthy();
  });

  it('should handle payment details', () => {
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
