import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { catchError, of } from 'rxjs';
import { AuthService } from '@core/services/auth.service';
import { LanguageService } from '@core/i18n/language.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>',
})
export class AppComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly languageService = inject(LanguageService);

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
}
