import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '@core/services/auth.service';
import { LanguageSwitcherComponent } from '@shared/components/language-switcher/language-switcher.component';

const matchingPasswordValidator = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirm_password')?.value;

  if (!password || !confirmPassword || password === confirmPassword) {
    return null;
  }

  return { passwordMismatch: true };
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslateModule, LanguageSwitcherComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly translateService = inject(TranslateService);

  submitted = false;
  isSubmitting = false;
  errorMessage = '';
  showPassword = false;
  showConfirmPassword = false;

  readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirm_password: ['', [Validators.required, Validators.minLength(6)]],
  }, { validators: matchingPasswordValidator });

  togglePasswordVisibility(field: 'password' | 'confirm_password'): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
      return;
    }

    this.showConfirmPassword = !this.showConfirmPassword;
  }

  submit(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (this.form.invalid) {
      return;
    }

    this.isSubmitting = true;

    this.authService.register(this.form.getRawValue()).pipe(
      finalize(() => {
        this.isSubmitting = false;
      })
    ).subscribe({
      next: ({ email }) => {
        void this.router.navigate(['/confirm-email'], {
          queryParams: { email },
        });
      },
      error: (error: { message?: string; error?: { error?: { message?: string } } }) => {
        this.errorMessage =
          error.error?.error?.message ??
          error.message ??
          this.translateService.instant('AUTH.REGISTER.ERROR');
      },
    });
  }
}
