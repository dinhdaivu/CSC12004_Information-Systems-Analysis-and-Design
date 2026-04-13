import { TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { AuthService } from '@core/services/auth.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: any;
  let authService: { register: jest.Mock };
  let router: Router;

  beforeEach(async () => {
    authService = {
      register: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, ReactiveFormsModule, RouterTestingModule, TranslateModule.forRoot()],
      providers: [
        { provide: AuthService, useValue: authService },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the register form inputs', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('input[type="email"]')).toBeTruthy();
    expect(compiled.querySelector('#register-password')).toBeTruthy();
    expect(compiled.querySelector('#register-confirm-password')).toBeTruthy();
  });

  it('should not submit invalid form values', () => {
    fixture.detectChanges();

    component.submit();

    expect(authService.register).not.toHaveBeenCalled();
  });

  it('should show a mismatch error when passwords do not match', () => {
    fixture.detectChanges();
    component.form.setValue({
      email: 'user@example.com',
      password: 'secret123',
      confirm_password: 'secret456',
    });

    component.submit();

    expect(component.form.hasError('passwordMismatch')).toBe(true);
    expect(authService.register).not.toHaveBeenCalled();
  });

  it('should submit and navigate to confirm email page', () => {
    authService.register.mockReturnValue(of({ email: 'user@example.com' }));

    fixture.detectChanges();
    component.form.setValue({
      email: 'user@example.com',
      password: 'secret123',
      confirm_password: 'secret123',
    });

    component.submit();

    expect(authService.register).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'secret123',
      confirm_password: 'secret123',
    });
    expect(router.navigate).toHaveBeenCalledWith(['/confirm-email'], {
      queryParams: { email: 'user@example.com' },
    });
  });

  it('should surface register errors', () => {
    authService.register.mockReturnValue(throwError(() => new Error('Register failed')));

    fixture.detectChanges();
    component.form.setValue({
      email: 'user@example.com',
      password: 'secret123',
      confirm_password: 'secret123',
    });

    component.submit();

    expect(component.errorMessage).toBe('Register failed');
  });
});
