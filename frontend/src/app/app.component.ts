import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '@core/i18n/language.service';
import { LanguageSwitcherComponent } from '@shared/components/language-switcher/language-switcher.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TranslateModule, LanguageSwitcherComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <header class="border-b bg-white px-4 py-3 shadow-sm">
        <div class="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div>
            <h1 class="text-lg font-semibold text-gray-900">{{ 'APP.TITLE' | translate }}</h1>
            <p class="text-sm text-gray-600">{{ 'APP.WELCOME' | translate }}</p>
          </div>

          <app-language-switcher></app-language-switcher>
        </div>
      </header>

      <router-outlet></router-outlet>
    </div>
  `,
  styles: []
})
export class AppComponent implements OnInit {
  private readonly languageService = inject(LanguageService);

  title = 'HomeStay Dorm';

  ngOnInit(): void {
    this.languageService.initializeLanguage();
  }
}
