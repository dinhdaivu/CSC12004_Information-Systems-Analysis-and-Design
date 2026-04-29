import { TestBed } from '@angular/core/testing';
import { ConfirmEmailComponent } from './confirm-email.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { AuthService } from '@core/services/auth.service';

describe('ConfirmEmailComponent', () => {
  let authService: {
    getPendingRegistrationEmail: jest.Mock;
    verifyRegistrationCode: jest.Mock;
    resendVerificationCode: jest.Mock;
  };
  let router: { navigate: jest.Mock };

  const createComponent = async (queryEntries: Array<[string, string]>) => {
    await TestBed.configureTestingModule({
      imports: [ConfirmEmailComponent, ReactiveFormsModule, RouterTestingModule, TranslateModule.forRoot()],
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

    const fixture = TestBed.createComponent(ConfirmEmailComponent);
    return { fixture, component: fixture.componentInstance };
  };

  beforeEach(() => {
    TestBed.resetTestingModule();

    authService = {
      getPendingRegistrationEmail: jest.fn(() => 'stored@example.com'),
      verifyRegistrationCode: jest.fn(),
      resendVerificationCode: jest.fn(),
    };
    router = {
      navigate: jest.fn().mockResolvedValue(true),
    };
  });

  it('should create the component in signup verification mode', async () => {
    const { component } = await createComponent([['email', 'signup@example.com']]);
    expect(component).toBeTruthy();
  });

  it('should redirect to register when no email context is available', async () => {
    authService.getPendingRegistrationEmail.mockReturnValue('');
    const { fixture } = await createComponent([]);

    fixture.detectChanges();

    expect(router.navigate).toHaveBeenCalledWith(['/register']);
  });

  it('should render six verification inputs', async () => {
    const { fixture } = await createComponent([['email', 'signup@example.com']]);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('.confirm-form__code-input')).toHaveLength(6);
  });

  it('should not submit incomplete verification code in signup mode', async () => {
    const { fixture, component } = await createComponent([['email', 'signup@example.com']]);
    fixture.detectChanges();

    component.submit();

    expect(authService.verifyRegistrationCode).not.toHaveBeenCalled();
  });

  it('should submit the full verification code in signup mode and redirect to dashboard', async () => {
    authService.verifyRegistrationCode.mockReturnValue(of({
      id: 'user-1',
      email: 'signup@example.com',
      full_name: 'Signup User',
      role: 'customer',
      status: 'active',
      created_at: '2026-04-09T00:00:00.000Z',
      updated_at: '2026-04-09T00:00:00.000Z',
    }));
    const { fixture, component } = await createComponent([['email', 'signup@example.com']]);
    fixture.detectChanges();

    ['1', '2', '3', '4', '5', '6'].forEach((digit, index) => {
      component.codeControls.at(index).setValue(digit);
    });

    component.submit();

    expect(authService.verifyRegistrationCode).toHaveBeenCalledWith({
      email: 'signup@example.com',
      code: '123456',
    });
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should resend the verification code in signup mode', async () => {
    authService.resendVerificationCode.mockReturnValue(of(void 0));
    const { fixture, component } = await createComponent([['email', 'signup@example.com']]);
    fixture.detectChanges();

    component.resendCode();

    expect(authService.resendVerificationCode).toHaveBeenCalledWith('signup@example.com');
  });

  it('should not resend the verification code without an email', async () => {
    authService.getPendingRegistrationEmail.mockReturnValue('');
    const { fixture, component } = await createComponent([]);
    fixture.detectChanges();
    jest.clearAllMocks();

    component.resendCode();

    expect(authService.resendVerificationCode).not.toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/register']);
  });

  it('should paste all six digits across the verification inputs', async () => {
    const { fixture, component } = await createComponent([['email', 'signup@example.com']]);
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

  it('should surface verification errors', async () => {
    authService.verifyRegistrationCode.mockReturnValue(throwError(() => new Error('Bad code')));
    const { fixture, component } = await createComponent([['email', 'signup@example.com']]);
    fixture.detectChanges();

    ['1', '2', '3', '4', '5', '6'].forEach((digit, index) => {
      component.codeControls.at(index).setValue(digit);
    });

    component.submit();

    expect(component.errorMessage).toBe('Bad code');
  });

  it('should navigate to login via goToLogin', async () => {
    const { component } = await createComponent([['email', 'signup@example.com']]);
    await component.goToLogin();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should handle resend error', async () => {
    authService.resendVerificationCode.mockReturnValue(throwError(() => new Error('fail')));
    const { fixture, component } = await createComponent([['email', 'signup@example.com']]);
    fixture.detectChanges();
    component.resendCode();
    expect(component.errorMessage).toBeTruthy();
  });

  it('should ignore paste with no digits', async () => {
    const { fixture, component } = await createComponent([['email', 'signup@example.com']]);
    fixture.detectChanges();
    const preventDefault = jest.fn();
    component.onCodePaste(0, {
      clipboardData: { getData: () => 'abc' },
      preventDefault,
    } as unknown as ClipboardEvent);
    expect(preventDefault).not.toHaveBeenCalled();
  });

  it('should handle onDigitInput with single digit', async () => {
    const { fixture, component } = await createComponent([['email', 'signup@example.com']]);
    fixture.detectChanges();
    const input = document.createElement('input');
    input.value = '5';
    component.onDigitInput(0, { target: input } as unknown as Event);
    expect(component.codeControls.at(0).value).toBe('5');
  });

  it('should handle onDigitInput with multi-digit value (paste via input)', async () => {
    const { fixture, component } = await createComponent([['email', 'signup@example.com']]);
    fixture.detectChanges();
    const input = document.createElement('input');
    input.value = '123456';
    component.onDigitInput(0, { target: input } as unknown as Event);
    expect(component.codeControls.value.join('')).toBe('123456');
  });

  it('should handle onKeyDown backspace on first index (no-op)', async () => {
    const { fixture, component } = await createComponent([['email', 'signup@example.com']]);
    fixture.detectChanges();
    component.codeControls.at(0).setValue('');
    expect(() => component.onKeyDown(0, { key: 'Backspace' } as KeyboardEvent)).not.toThrow();
  });

  it('should navigate to register when email is empty during submit', async () => {
    authService.getPendingRegistrationEmail.mockReturnValue('');
    const { fixture, component } = await createComponent([]);
    fixture.detectChanges();
    jest.clearAllMocks();
    // Force a valid form but no email
    ['1', '2', '3', '4', '5', '6'].forEach((digit, index) => {
      component.codeControls.at(index).setValue(digit);
    });
    (component as any).email = '';
    component.submit();
    expect(router.navigate).toHaveBeenCalledWith(['/register']);
  });
});
