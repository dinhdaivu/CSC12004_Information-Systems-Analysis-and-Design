 import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { catchError, of } from 'rxjs';
import { AuthService } from '@core/services/auth.service';
import { LanguageService } from '@core/i18n/language.service';
import { LanguageSwitcherComponent } from '@shared/components/language-switcher/language-switcher.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TranslateModule, LanguageSwitcherComponent],
  template: `
    <div [class.min-h-screen]="!isFullscreenAuthRoute()" [class.bg-gray-50]="!isFullscreenAuthRoute()">
      @if (!isFullscreenAuthRoute()) {
      <header class="border-b bg-white px-4 py-3 shadow-sm">
        <div class="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div>
            <h1 class="text-lg font-semibold text-gray-900">{{ 'APP.TITLE' | translate }}</h1>
            <p class="text-sm text-gray-600">{{ 'APP.WELCOME' | translate }}</p>
          </div>

          <app-language-switcher></app-language-switcher>
        </div>
      </header>
      }

      <router-outlet></router-outlet>
    </div>
  `,
  styles: []
})
export class AppComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly languageService = inject(LanguageService);
  private readonly router = inject(Router);

  title = 'HomeStay Dorm';

  ngOnInit(): void {
    this.languageService.initializeLanguage();

    if (!this.authService.getToken()) {
      return;
    }

    this.authService.loadCurrentUser().pipe(
      catchError(() => {
        this.authService.clearSession();
        return of(null);
      })
    ).subscribe();
  }

  isFullscreenAuthRoute(): boolean {
    return ['/login', '/register', '/confirm-email', '/reset-password'].some((path) => this.router.url.startsWith(path));
  }
}
