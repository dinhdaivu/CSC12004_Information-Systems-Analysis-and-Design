import { TestBed } from '@angular/core/testing';
import { MonthlyBillingComponent } from './monthly-billing.component';
import { FormsModule } from '@angular/forms';

describe('MonthlyBillingComponent', () => {
  let component: MonthlyBillingComponent;
  let fixture: any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthlyBillingComponent, FormsModule]
    }).compileComponents();
    fixture = TestBed.createComponent(MonthlyBillingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate fees', () => {
    const record = { residentInfo: 'A', room: '1', baseRent: 1000, elecLast: 10, elecThis: 20, waterLast: 5, waterThis: 10, serviceFee: 100, parkingFee: 50, cleaningFee: 50 };
    expect(component.elecKwh(record)).toBe(10);
    expect(component.waterM3(record)).toBe(5);
    expect(component.elecFee(record)).toBe(35000);
    expect(component.waterFee(record)).toBe(5000);
    expect(component.total(record)).toBe(1000 + 35000 + 5000 + 100 + 50 + 50);
    expect(component.grandTotal).toBeGreaterThan(0);
  });

  it('should navigate and filter', () => {
    component.searchTerm = 'Chi';
    expect(component.filtered.length).toBeGreaterThan(0);
    component.openDetail(component.filtered[0]);
    expect(component.view).toBe('detail');
    
    component.nextPage();
    component.prevPage();
    component.currentPage = 1;
    expect(component.currentPage).toBe(1);
  });
});