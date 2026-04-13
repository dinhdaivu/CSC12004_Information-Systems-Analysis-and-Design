import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '@core/services/auth.service';
import { LanguageSwitcherComponent } from '@shared/components/language-switcher/language-switcher.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslateModule, LanguageSwitcherComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly translateService = inject(TranslateService);

  submitted = false;
  isSubmitting = false;
  isSendingReset = false;
  errorMessage = '';
  showPassword = false;

  readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  requestPasswordReset(): void {
    this.errorMessage = '';
    this.submitted = true;
    this.form.controls.email.markAsTouched();

    if (this.form.controls.email.invalid) {
      return;
    }

    this.isSendingReset = true;

    this.authService.forgotPassword({ email: this.form.controls.email.getRawValue() }).pipe(
      finalize(() => {
        this.isSendingReset = false;
      })
    ).subscribe({
      next: () => {
        void this.router.navigate(['/reset-password'], {
          queryParams: {
            email: this.form.controls.email.getRawValue().trim().toLowerCase(),
          },
        });
      },
      error: (error: { error?: { error?: { message?: string } } }) => {
        this.errorMessage =
          error.error?.error?.message ?? this.translateService.instant('AUTH.LOGIN.RESET_ERROR');
      },
    });
  }

  submit(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (this.form.invalid) {
      return;
    }

    this.isSubmitting = true;

    this.authService.login(this.form.getRawValue()).pipe(
      finalize(() => {
        this.isSubmitting = false;
      })
    ).subscribe({
      next: (user) => {
        void this.authService.navigateAfterLogin(user.role);
      },
      error: (error: { error?: { error?: { message?: string } } }) => {
        this.errorMessage =
          error.error?.error?.message ?? this.translateService.instant('AUTH.LOGIN.ERROR');
      },
    });
  }
}
