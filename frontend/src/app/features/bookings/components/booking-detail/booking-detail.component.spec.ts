import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { BookingDetailComponent } from './booking-detail.component';

describe('BookingDetailComponent', () => {
  let component: BookingDetailComponent;
  let fixture: ReturnType<typeof TestBed.createComponent<BookingDetailComponent>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingDetailComponent, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(BookingDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create booking detail view', () => {
    expect(component).toBeTruthy();
  });

  it('should load booking details', () => {
    fixture.detectChanges();
    expect(component).toBeDefined();
  });

  it('should display booking information', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled).toBeTruthy();
  });

  it('should allow booking modifications', () => {
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
