import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { catchError, of, timeout } from 'rxjs';
import { AuthService } from '@core/services/auth.service';
import { LanguageService } from '@core/i18n/language.service';
import { ToastComponent } from '@shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent],
  template: '<router-outlet></router-outlet><app-toast />',
})
export class AppComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly languageService = inject(LanguageService);

  ngOnInit(): void {
    this.languageService.initializeLanguage();

    if (!this.authService.isAuthenticated()) {
      return;
    }

    this.authService.loadCurrentUser().pipe(
      timeout(5000),
      catchError(() => {
        this.authService.clearSession();
        return of(null);
      })
    ).subscribe();
  }
}
