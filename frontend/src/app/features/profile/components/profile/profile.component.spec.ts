import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ProfileComponent } from './profile.component';
import { AuthService } from '@core/services/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ReturnType<typeof TestBed.createComponent<ProfileComponent>>;
  let mockAuthService: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockAuthService = {
      getCurrentUser: jest.fn().mockReturnValue({ id: '123-abc', full_name: 'John Doe', email: 'john@example.com' }),
      logout: jest.fn().mockReturnValue(of(null)),
      updateCurrentUser: jest.fn().mockReturnValue(of({ full_name: 'Jane Doe', gender: 'Female', phone_number: '0123' })),
      clearSession: jest.fn()
    };
    mockRouter = { navigate: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [ProfileComponent, TranslateModule.forRoot(), FormsModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
  });

  it('should create and initialize user', () => {
    expect(component).toBeTruthy();
    expect(component.user?.full_name).toBe('John Doe');
    expect(component.residentDisplayId).toBeTruthy();
  });

  it('should handle residentDisplayId without user id', () => {
    component.user = null;
    expect(component.residentDisplayId).toBe('001');
  });

  it('should navigate to path', () => {
    component.navigate('/home');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should toggle user menu', () => {
    component.toggleUserMenu();
    expect(component.isUserMenuOpen).toBe(true);
  });

  it('should logout', () => {
    component.logout();
    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should enter edit mode', () => {
    component.enterEditMode();
    expect(component.isEditMode).toBe(true);
    expect(component.editFullName).toBe('John Doe');
  });

  it('should confirm save successfully', fakeAsync(() => {
    component.enterEditMode();
    component.editFullName = 'Jane Doe';
    component.editGender = 'Female';
    component.editPhone = '0123';
    
    component.confirmSave();
    tick(15000);
    
    expect(mockAuthService.updateCurrentUser).toHaveBeenCalled();
    expect(component.user?.full_name).toBe('Jane Doe');
  }));

  it('should handle save error 401', fakeAsync(() => {
    mockAuthService.updateCurrentUser.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 401 })));
    component.confirmSave();
    tick(15000);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  }));
});