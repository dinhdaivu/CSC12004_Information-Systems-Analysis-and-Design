import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { catchError, of } from 'rxjs';
import { AuthService } from '@core/services/auth.service';
import { LanguageService } from '@core/i18n/language.service';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TranslateModule],
  template: `
    <div>
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
