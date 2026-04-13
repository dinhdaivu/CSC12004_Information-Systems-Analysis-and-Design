import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, QueryList, ViewChildren, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractControl, FormArray, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '@core/services/auth.service';
import { LanguageSwitcherComponent } from '@shared/components/language-switcher/language-switcher.component';

const matchingPasswordValidator = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirm_password')?.value;

  if (!password && !confirmPassword) {
    return null;
  }

  return password === confirmPassword ? null : { passwordMismatch: true };
};

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, LanguageSwitcherComponent],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly translateService = inject(TranslateService);

  @ViewChildren('codeInput') private readonly codeInputs?: QueryList<ElementRef<HTMLInputElement>>;

  email = this.route.snapshot.queryParamMap.get('email') ?? '';

  submitted = false;
  isSubmitting = false;
  isResending = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  showConfirmPassword = false;

  readonly form = this.formBuilder.group({
    code: this.formBuilder.array(
      Array.from({ length: 6 }, () => this.formBuilder.control('', [Validators.required, Validators.pattern(/^\d$/)]))
    ),
    password: this.formBuilder.control('', [Validators.required, Validators.minLength(6)]),
    confirm_password: this.formBuilder.control('', [Validators.required, Validators.minLength(6)]),
  }, {
    validators: matchingPasswordValidator,
  });

  get codeControls(): FormArray {
    return this.form.controls.code;
  }

  ngOnInit(): void {
    if (this.email) {
      return;
    }

    void this.router.navigate(['/login']);
  }

  togglePasswordVisibility(field: 'password' | 'confirm_password'): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
      return;
    }

    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onDigitInput(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const sanitized = input.value.replace(/\D/g, '');

    if (sanitized.length > 1) {
      this.fillCodeFrom(index, sanitized);
      return;
    }

    this.codeControls.at(index).setValue(sanitized);

    if (sanitized.length === 1 && index < this.codeControls.length - 1) {
      this.focusInput(index + 1);
    }
  }

  onKeyDown(index: number, event: KeyboardEvent): void {
    if (event.key === 'Backspace' && !this.codeControls.at(index).value && index > 0) {
      this.focusInput(index - 1);
    }
  }

  onCodePaste(index: number, event: ClipboardEvent): void {
    const pastedValue = event.clipboardData?.getData('text')?.replace(/\D/g, '') ?? '';

    if (!pastedValue) {
      return;
    }

    event.preventDefault();
    this.fillCodeFrom(index, pastedValue);
  }

  submit(): void {
    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.form.invalid) {
      return;
    }

    if (!this.email) {
      void this.router.navigate(['/login']);
      return;
    }

    this.isSubmitting = true;

    this.authService.resetPasswordWithCode({
      email: this.email,
      code: this.codeControls.value.join(''),
      password: this.form.controls.password.value ?? '',
      confirm_password: this.form.controls.confirm_password.value ?? '',
    }).pipe(
      finalize(() => {
        this.isSubmitting = false;
      })
    ).subscribe({
      next: () => {
        this.successMessage = this.translateService.instant('AUTH.RESET_PASSWORD.SUCCESS');
      },
      error: (error: { message?: string; error?: { error?: { message?: string } } }) => {
        this.errorMessage =
          error.error?.error?.message ??
          error.message ??
          this.translateService.instant('AUTH.RESET_PASSWORD.ERROR');
      },
    });
  }

  resendCode(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.email) {
      void this.router.navigate(['/login']);
      return;
    }

    this.isResending = true;

    this.authService.forgotPassword({ email: this.email }).pipe(
      finalize(() => {
        this.isResending = false;
      })
    ).subscribe({
      next: () => {
        this.successMessage = this.translateService.instant('AUTH.RESET_PASSWORD.RESEND_SUCCESS');
      },
      error: () => {
        this.errorMessage = this.translateService.instant('AUTH.RESET_PASSWORD.ERROR');
      },
    });
  }

  goToLogin(): void {
    void this.router.navigate(['/login']);
  }

  private focusInput(index: number): void {
    const target = this.codeInputs?.get(index)?.nativeElement;
    target?.focus();
    target?.select();
  }

  private fillCodeFrom(startIndex: number, value: string): void {
    const digits = value.replace(/\D/g, '').slice(0, this.codeControls.length - startIndex).split('');

    digits.forEach((digit, offset) => {
      this.codeControls.at(startIndex + offset).setValue(digit);
    });

    const nextIndex = Math.min(startIndex + digits.length, this.codeControls.length - 1);
    this.focusInput(nextIndex);
  }
}
