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
});
