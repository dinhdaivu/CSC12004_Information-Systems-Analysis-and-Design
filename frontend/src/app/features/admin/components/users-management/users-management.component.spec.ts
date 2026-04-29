import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { UsersManagementComponent } from './users-management.component';
import { UsersService } from '@core/services/users.service';

const mockResponse = {
  success: true,
  data: { data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 1 } },
};

const usersServiceMock = {
  fetchUsers: jest.fn(() => of(mockResponse)),
  updateUser: jest.fn(() => of(mockResponse)),
};

describe('UsersManagementComponent', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<UsersManagementComponent>>;
  let component: UsersManagementComponent;

  beforeEach(async () => {
    jest.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [
        UsersManagementComponent,
        RouterTestingModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: UsersService, useValue: usersServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UsersManagementComponent);
    component = fixture.componentInstance;
  });

  it('should create users management', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch users on detectChanges (ngOnInit)', () => {
    fixture.detectChanges();
    expect(usersServiceMock.fetchUsers).toHaveBeenCalled();
  });

  it('should clean up on destroy', () => {
    fixture.detectChanges();
    expect(() => fixture.destroy()).not.toThrow();
  });

  it('should not go to prev page when on page 1', () => {
    component.currentPage = 1;
    component.goToPrevPage();
    expect(component.currentPage).toBe(1);
  });

  it('should go to prev page when page > 1', () => {
    component.currentPage = 3;
    component.totalPages = 5;
    component.goToPrevPage();
    expect(component.currentPage).toBe(2);
  });

  it('should not go to next page when on last page', () => {
    component.currentPage = 5;
    component.totalPages = 5;
    component.goToNextPage();
    expect(component.currentPage).toBe(5);
  });

  it('should go to next page when not on last page', () => {
    component.currentPage = 2;
    component.totalPages = 5;
    component.goToNextPage();
    expect(component.currentPage).toBe(3);
  });

  it('should trigger search filter on search change', () => {
    component.onSearchChange('john');
    expect(component.currentPage).toBe(1);
  });

  it('should trigger role filter on role change', () => {
    component.onRoleChange('admin');
    expect(component.currentPage).toBe(1);
  });

  it('should trigger status filter on status change', () => {
    component.onStatusChange('active');
    expect(component.currentPage).toBe(1);
  });

  it('should reset page on role change to null', () => {
    component.currentPage = 3;
    component.onRoleChange(null);
    expect(component.currentPage).toBe(1);
  });

  it('should format date string', () => {
    const result = component.formatDate('2026-04-15T00:00:00Z');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('should return active status badge class', () => {
    const cls = component.statusBadgeClass('active');
    expect(cls).toContain('green');
  });

  it('should return inactive status badge class', () => {
    const cls = component.statusBadgeClass('inactive');
    expect(cls).toContain('gray');
  });

  it('should return banned status badge class', () => {
    const cls = component.statusBadgeClass('banned');
    expect(cls).toContain('red');
  });

  it('should return default badge class for unknown status', () => {
    const cls = component.statusBadgeClass('unknown' as any);
    expect(typeof cls).toBe('string');
    expect(cls.length).toBeGreaterThan(0);
  });

  it('should view user detail by id', () => {
    component.users = [{ id: 'u1', fullName: 'Jane Doe', email: 'jane@example.com', role: 'customer', status: 'active', createdAt: '2026-01-01' }] as any;
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    component.viewUserDetail('u1');
    expect(alertSpy).toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('should not alert when user not found by id', () => {
    component.users = [];
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    component.viewUserDetail('non-existent');
    expect(alertSpy).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('should call updateUser on role update', () => {
    const event = { target: { value: 'admin' } } as unknown as Event;
    component.onRoleUpdate('user-1', event);
    expect(usersServiceMock.updateUser).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user-1', role: 'admin' })
    );
  });

  it('should call updateUser on status update', () => {
    const event = { target: { value: 'banned' } } as unknown as Event;
    component.onStatusUpdate('user-1', event);
    expect(usersServiceMock.updateUser).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user-1', status: 'banned' })
    );
  });
});
