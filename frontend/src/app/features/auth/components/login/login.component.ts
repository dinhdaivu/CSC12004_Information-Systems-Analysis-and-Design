import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslateModule],
  template: `
    <section class="mx-auto max-w-md px-4 py-10">
      <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 class="text-2xl font-semibold text-gray-900">{{ 'AUTH.LOGIN.TITLE' | translate }}</h2>
        <p class="mt-2 text-sm text-gray-600">{{ 'AUTH.LOGIN.SUBTITLE' | translate }}</p>

        <form class="mt-6 space-y-4" [formGroup]="form" (ngSubmit)="submit()">
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700" for="email">
              {{ 'AUTH.FIELDS.EMAIL' | translate }}
            </label>
            <input
              id="email"
              type="email"
              formControlName="email"
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              [attr.placeholder]="'AUTH.FIELDS.EMAIL_PLACEHOLDER' | translate"
            />
            <p class="mt-1 text-sm text-red-600" *ngIf="submitted && form.controls.email.invalid">
              {{ 'AUTH.VALIDATION.EMAIL' | translate }}
            </p>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700" for="password">
              {{ 'AUTH.FIELDS.PASSWORD' | translate }}
            </label>
            <input
              id="password"
              type="password"
              formControlName="password"
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              [attr.placeholder]="'AUTH.FIELDS.PASSWORD_PLACEHOLDER' | translate"
            />
            <p class="mt-1 text-sm text-red-600" *ngIf="submitted && form.controls.password.invalid">
              {{ 'AUTH.VALIDATION.PASSWORD' | translate }}
            </p>
          </div>

          <p class="text-sm text-red-600" *ngIf="errorMessage">{{ errorMessage }}</p>

          <button
            type="submit"
            class="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            [disabled]="isSubmitting"
          >
            {{ (isSubmitting ? 'AUTH.LOGIN.SUBMITTING' : 'AUTH.LOGIN.SUBMIT') | translate }}
          </button>
        </form>

        <div class="mt-4 flex items-center justify-between gap-3 text-sm">
          <a routerLink="/auth/forgot-password" class="text-blue-600 hover:underline">
            {{ 'AUTH.LOGIN.FORGOT_PASSWORD' | translate }}
          </a>

          <a routerLink="/auth/register" class="text-blue-600 hover:underline">
            {{ 'AUTH.LOGIN.REGISTER' | translate }}
          </a>
        </div>
      </div>
    </section>
  `
})
export class LoginComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly translateService = inject(TranslateService);

  submitted = false;
  isSubmitting = false;
  errorMessage = '';

  readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

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
