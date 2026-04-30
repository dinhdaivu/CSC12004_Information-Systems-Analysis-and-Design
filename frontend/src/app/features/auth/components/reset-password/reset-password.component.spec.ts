import { TestBed } from '@angular/core/testing';
import { ResetPasswordComponent } from './reset-password.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { AuthService } from '@core/services/auth.service';

describe('ResetPasswordComponent', () => {
  let authService: {
    resetPasswordWithCode: jest.Mock;
    forgotPassword: jest.Mock;
  };
  let router: { navigate: jest.Mock };
  let queryEntries: Array<[string, string]>;

  beforeEach(async () => {
    authService = {
      resetPasswordWithCode: jest.fn(),
      forgotPassword: jest.fn(),
    };
    router = {
      navigate: jest.fn().mockResolvedValue(true),
    };
    queryEntries = [['email', 'recover@example.com']];

    await TestBed.configureTestingModule({
      imports: [ResetPasswordComponent, ReactiveFormsModule, RouterTestingModule, TranslateModule.forRoot()],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: new Map(queryEntries),
            },
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(ResetPasswordComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should render six verification inputs', () => {
    const fixture = TestBed.createComponent(ResetPasswordComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('.reset-form__code-input')).toHaveLength(6);
  });

  it('should redirect to login when email is missing', async () => {
    TestBed.resetTestingModule();
    queryEntries = [];

    await TestBed.configureTestingModule({
      imports: [ResetPasswordComponent, ReactiveFormsModule, RouterTestingModule, TranslateModule.forRoot()],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: new Map(queryEntries),
            },
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ResetPasswordComponent);
    fixture.detectChanges();

    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should submit a recovery code and new password', () => {
    authService.resetPasswordWithCode.mockReturnValue(of(void 0));
    const fixture = TestBed.createComponent(ResetPasswordComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    ['1', '2', '3', '4', '5', '6'].forEach((digit, index) => {
      component.codeControls.at(index).setValue(digit);
    });
    component.form.controls.password.setValue('secret123');
    component.form.controls.confirm_password.setValue('secret123');

    component.submit();

    expect(authService.resetPasswordWithCode).toHaveBeenCalledWith({
      email: 'recover@example.com',
      code: '123456',
      password: 'secret123',
      confirm_password: 'secret123',
    });
  });

  it('should resend the recovery code', () => {
    authService.forgotPassword.mockReturnValue(of(void 0));
    const fixture = TestBed.createComponent(ResetPasswordComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.resendCode();

    expect(authService.forgotPassword).toHaveBeenCalledWith({ email: 'recover@example.com' });
  });

  it('should not resend the recovery code without an email', async () => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [ResetPasswordComponent, ReactiveFormsModule, RouterTestingModule, TranslateModule.forRoot()],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: new Map(),
            },
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ResetPasswordComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    jest.clearAllMocks();

    component.resendCode();

    expect(authService.forgotPassword).not.toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should paste all six digits across the recovery code inputs', () => {
    const fixture = TestBed.createComponent(ResetPasswordComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const preventDefault = jest.fn();
    component.onCodePaste(0, {
      clipboardData: {
        getData: () => '123456',
      },
      preventDefault,
    } as unknown as ClipboardEvent);

    expect(preventDefault).toHaveBeenCalled();
    expect(component.codeControls.value.join('')).toBe('123456');
  });

  it('should surface recovery errors', () => {
    authService.resetPasswordWithCode.mockReturnValue(throwError(() => new Error('Bad code')));
    const fixture = TestBed.createComponent(ResetPasswordComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    ['1', '2', '3', '4', '5', '6'].forEach((digit, index) => {
      component.codeControls.at(index).setValue(digit);
    });
    component.form.controls.password.setValue('secret123');
    component.form.controls.confirm_password.setValue('secret123');

    component.submit();

    expect(component.errorMessage).toBe('Bad code');
  });

  it('should toggle password visibility', () => {
    const fixture = TestBed.createComponent(ResetPasswordComponent);
    const component = fixture.componentInstance;
    expect(component.showPassword).toBe(false);
    component.togglePasswordVisibility('password');
    expect(component.showPassword).toBe(true);
    component.togglePasswordVisibility('confirm_password');
    expect(component.showConfirmPassword).toBe(true);
  });

  it('should handle onDigitInput with single digit', () => {
    const fixture = TestBed.createComponent(ResetPasswordComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    const input = document.createElement('input');
    input.value = '7';
    component.onDigitInput(0, { target: input } as unknown as Event);
    expect(component.codeControls.at(0).value).toBe('7');
  });

  it('should handle onDigitInput with multi-digit value', () => {
    const fixture = TestBed.createComponent(ResetPasswordComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    const input = document.createElement('input');
    input.value = '654321';
    component.onDigitInput(0, { target: input } as unknown as Event);
    expect(component.codeControls.value.join('')).toBe('654321');
  });

  it('should handle onKeyDown backspace on last non-empty index (no navigation)', () => {
    const fixture = TestBed.createComponent(ResetPasswordComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    component.codeControls.at(2).setValue('5');
    expect(() => component.onKeyDown(2, { key: 'Backspace' } as KeyboardEvent)).not.toThrow();
  });

  it('should ignore paste with no digits', () => {
    const fixture = TestBed.createComponent(ResetPasswordComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    const preventDefault = jest.fn();
    component.onCodePaste(0, {
      clipboardData: { getData: () => 'xyz' },
      preventDefault,
    } as unknown as ClipboardEvent);
    expect(preventDefault).not.toHaveBeenCalled();
  });

  it('should not submit when form is invalid', () => {
    const fixture = TestBed.createComponent(ResetPasswordComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    component.submit();
    expect(authService.resetPasswordWithCode).not.toHaveBeenCalled();
  });

  it('should navigate to login via goToLogin', () => {
    const fixture = TestBed.createComponent(ResetPasswordComponent);
    const component = fixture.componentInstance;
    component.goToLogin();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should handle resend error', () => {
    authService.forgotPassword.mockReturnValue(throwError(() => new Error('fail')));
    const fixture = TestBed.createComponent(ResetPasswordComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    component.resendCode();
    expect(component.errorMessage).toBeTruthy();
  });
});
