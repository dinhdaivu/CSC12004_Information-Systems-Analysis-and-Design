import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService, SupportedLanguage } from '@core/i18n/language.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="flex items-center gap-2 text-sm">
      <span class="font-medium text-gray-700">{{ 'COMMON.LANGUAGE' | translate }}:</span>

      <button
        type="button"
        class="rounded border px-2 py-1 transition"
        [class.border-blue-500]="currentLanguage === 'en'"
        [class.bg-blue-50]="currentLanguage === 'en'"
        [class.text-blue-700]="currentLanguage === 'en'"
        [class.border-gray-300]="currentLanguage !== 'en'"
        (click)="changeLanguage('en')"
      >
        {{ 'COMMON.ENGLISH' | translate }}
      </button>

      <button
        type="button"
        class="rounded border px-2 py-1 transition"
        [class.border-blue-500]="currentLanguage === 'vi'"
        [class.bg-blue-50]="currentLanguage === 'vi'"
        [class.text-blue-700]="currentLanguage === 'vi'"
        [class.border-gray-300]="currentLanguage !== 'vi'"
        (click)="changeLanguage('vi')"
      >
        {{ 'COMMON.VIETNAMESE' | translate }}
      </button>
    </div>
  `
})
export class LanguageSwitcherComponent {
  private readonly languageService = inject(LanguageService);

  get currentLanguage(): SupportedLanguage {
    return this.languageService.getCurrentLanguage();
  }

  changeLanguage(language: SupportedLanguage): void {
    this.languageService.setLanguage(language);
  }
}
