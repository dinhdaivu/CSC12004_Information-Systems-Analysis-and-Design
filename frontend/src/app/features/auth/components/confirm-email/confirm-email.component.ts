import { CommonModule } from '@angular/common';
import { Component, ElementRef, QueryList, ViewChildren, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '@core/services/auth.service';
import { LanguageSwitcherComponent } from '@shared/components/language-switcher/language-switcher.component';

@Component({
  selector: 'app-confirm-email',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, LanguageSwitcherComponent],
  templateUrl: './confirm-email.component.html',
  styleUrls: ['./confirm-email.component.scss']
})
export class ConfirmEmailComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly translateService = inject(TranslateService);

  @ViewChildren('codeInput') private readonly codeInputs?: QueryList<ElementRef<HTMLInputElement>>;

  email =
    this.route.snapshot.queryParamMap.get('email') ??
    this.authService.getPendingRegistrationEmail() ??
    '';

  submitted = false;
  isSubmitting = false;
  isResending = false;
  errorMessage = '';
  successMessage = '';

  readonly form = this.formBuilder.group({
    code: this.formBuilder.array(
      Array.from({ length: 6 }, () => this.formBuilder.control('', [Validators.required, Validators.pattern(/^\d$/)]))
    ),
  });

  get codeControls(): FormArray {
    return this.form.controls.code;
  }

  onDigitInput(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const sanitized = input.value.replace(/\D/g, '').slice(-1);
    this.codeControls.at(index).setValue(sanitized);

    if (sanitized && index < this.codeControls.length - 1) {
      this.focusInput(index + 1);
    }
  }

  onKeyDown(index: number, event: KeyboardEvent): void {
    if (event.key === 'Backspace' && !this.codeControls.at(index).value && index > 0) {
      this.focusInput(index - 1);
    }
  }

  submit(): void {
    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.form.invalid) {
      return;
    }

    this.isSubmitting = true;

    this.authService.verifyRegistrationCode({
      email: this.email,
      code: this.codeControls.value.join(''),
    }).pipe(
      finalize(() => {
        this.isSubmitting = false;
      })
    ).subscribe({
      next: () => {
        this.successMessage = this.translateService.instant('AUTH.CONFIRM_EMAIL.SUCCESS');
      },
      error: (error: { message?: string; error?: { error?: { message?: string } } }) => {
        this.errorMessage =
          error.error?.error?.message ??
          error.message ??
          this.translateService.instant('AUTH.CONFIRM_EMAIL.ERROR');
      },
    });
  }

  resendCode(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.isResending = true;

    this.authService.resendVerificationCode(this.email).pipe(
      finalize(() => {
        this.isResending = false;
      })
    ).subscribe({
      next: () => {
        this.successMessage = this.translateService.instant('AUTH.CONFIRM_EMAIL.RESEND_SUCCESS');
      },
      error: () => {
        this.errorMessage = this.translateService.instant('AUTH.CONFIRM_EMAIL.ERROR');
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
}
