import { TestBed } from '@angular/core/testing';
import { TransactionsComponent } from './transactions.component';
import { FormsModule } from '@angular/forms';

describe('TransactionsComponent', () => {
  let component: TransactionsComponent;
  let fixture: any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionsComponent, FormsModule]
    }).compileComponents();
    fixture = TestBed.createComponent(TransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter and paginate', () => {
    component.searchTerm = 'Deposit';
    component.onSearch();
    expect(component.filtered.length).toBeGreaterThan(0);
    expect(component.paged.length).toBeLessThanOrEqual(5);
    
    component.nextPage();
    component.prevPage();
    expect(component.currentPage).toBe(1);
  });

  it('should toggle branch menu', () => {
    component.toggleBranchMenu();
    expect(component.branchMenuOpen).toBe(true);
    component.selectBranch('Tô Hiến Thành', new Event('click'));
    expect(component.selectedBranch).toBe('Tô Hiến Thành');
    expect(component.branchMenuOpen).toBe(false);
  });

  it('should compute styles', () => {
    expect(component.statusBg('Completed')).toBe('#DCFCE7');
    expect(component.statusBg('Pending')).toBe('#FEF3C7');
    expect(component.statusBg('Failed')).toBe('#FEE2E2');
    expect(component.statusColor('Completed')).toBe('#15803D');
    expect(component.statusColor('Pending')).toBe('#92400E');
    expect(component.statusColor('Failed')).toBe('#991B1B');
  });
});