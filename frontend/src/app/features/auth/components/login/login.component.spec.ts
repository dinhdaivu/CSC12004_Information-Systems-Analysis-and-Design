import { TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { AuthService } from '@core/services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: any;
  let authService: {
    login: jest.Mock;
    navigateAfterLogin: jest.Mock;
    forgotPassword: jest.Mock;
  };

  beforeEach(async () => {
    authService = {
      login: jest.fn(),
      navigateAfterLogin: jest.fn(),
      forgotPassword: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule, RouterTestingModule, TranslateModule.forRoot()],
      providers: [{ provide: AuthService, useValue: authService }]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render email and password inputs', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('input[type="email"]')).toBeTruthy();
    expect(compiled.querySelector('input[type="password"]')).toBeTruthy();
  });

  it('should not submit when the form is invalid', () => {
    fixture.detectChanges();

    component.submit();

    expect(authService.login).not.toHaveBeenCalled();
  });

  it('should submit valid credentials and redirect by role', () => {
    authService.login.mockReturnValue(of({
      id: 'user-1',
      email: 'user@example.com',
      full_name: 'Test User',
      role: 'customer',
      status: 'active',
      created_at: '2026-04-09T00:00:00.000Z',
      updated_at: '2026-04-09T00:00:00.000Z',
    }));
    authService.navigateAfterLogin.mockResolvedValue(true);

    fixture.detectChanges();
    component.form.setValue({
      email: 'user@example.com',
      password: 'secret123',
    });

    component.submit();

    expect(authService.login).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'secret123',
    });
    expect(authService.navigateAfterLogin).toHaveBeenCalledWith('customer');
  });

  it('should surface backend login errors', () => {
    authService.login.mockReturnValue(throwError(() => ({
      error: {
        error: {
          message: 'Invalid email or password',
        },
      },
    })));

    fixture.detectChanges();
    component.form.setValue({
      email: 'user@example.com',
      password: 'secret123',
    });

    component.submit();

    expect(component.errorMessage).toBe('Invalid email or password');
  });

  it('should trigger password recovery and route to the recovery page', () => {
    authService.forgotPassword.mockReturnValue(of(void 0));

    fixture.detectChanges();
    component.form.controls.email.setValue('user@example.com');

    const router = TestBed.inject(Router);
    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);

    component.requestPasswordReset();

    expect(authService.forgotPassword).toHaveBeenCalledWith({ email: 'user@example.com' });
    expect(navigateSpy).toHaveBeenCalledWith(['/reset-password'], {
      queryParams: {
        email: 'user@example.com',
      },
    });
  });
});
