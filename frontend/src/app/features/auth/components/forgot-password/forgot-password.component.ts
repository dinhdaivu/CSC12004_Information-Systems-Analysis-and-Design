import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslateModule],
  template: `
    <section class="mx-auto max-w-md px-4 py-10">
      <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 class="text-2xl font-semibold text-gray-900">{{ 'AUTH.FORGOT_PASSWORD.TITLE' | translate }}</h2>
        <p class="mt-2 text-sm text-gray-600">{{ 'AUTH.FORGOT_PASSWORD.SUBTITLE' | translate }}</p>

        <form class="mt-6 space-y-4" [formGroup]="form" (ngSubmit)="submit()">
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700" for="reset-email">
              {{ 'AUTH.FIELDS.EMAIL' | translate }}
            </label>
            <input
              id="reset-email"
              type="email"
              formControlName="email"
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              [attr.placeholder]="'AUTH.FIELDS.EMAIL_PLACEHOLDER' | translate"
            />
            <p class="mt-1 text-sm text-red-600" *ngIf="submitted && form.controls.email.invalid">
              {{ 'AUTH.VALIDATION.EMAIL' | translate }}
            </p>
          </div>

          <p class="text-sm text-red-600" *ngIf="errorMessage">{{ errorMessage }}</p>
          <p class="text-sm text-green-700" *ngIf="successMessage">{{ successMessage }}</p>

          <button
            type="submit"
            class="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            [disabled]="isSubmitting"
          >
            {{ (isSubmitting ? 'AUTH.FORGOT_PASSWORD.SUBMITTING' : 'AUTH.FORGOT_PASSWORD.SUBMIT') | translate }}
          </button>
        </form>

        <a routerLink="/auth/login" class="mt-4 inline-block text-sm text-blue-600 hover:underline">
          {{ 'AUTH.FORGOT_PASSWORD.BACK_TO_LOGIN' | translate }}
        </a>
      </div>
    </section>
  `
})
export class ForgotPasswordComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly translateService = inject(TranslateService);

  submitted = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  submit(): void {
    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.form.invalid) {
      return;
    }

    this.isSubmitting = true;

    this.authService.forgotPassword(this.form.getRawValue()).pipe(
      finalize(() => {
        this.isSubmitting = false;
      })
    ).subscribe({
      next: () => {
        this.successMessage = this.translateService.instant('AUTH.FORGOT_PASSWORD.SUCCESS');
      },
      error: (error: { error?: { error?: { message?: string } } }) => {
        this.errorMessage =
          error.error?.error?.message ?? this.translateService.instant('AUTH.FORGOT_PASSWORD.ERROR');
      },
    });
  }
}
