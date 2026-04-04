import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type SupportedLanguage = 'en' | 'vi';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private readonly translate = inject(TranslateService);
  private readonly storageKey = 'app_language';
  private readonly fallbackLanguage: SupportedLanguage = 'en';
  private readonly supportedLanguages: SupportedLanguage[] = ['en', 'vi'];

  initializeLanguage(): void {
    this.translate.addLangs(this.supportedLanguages);
    this.translate.setDefaultLang(this.fallbackLanguage);

    const savedLanguage = this.getSavedLanguage();

    if (savedLanguage) {
      this.translate.use(savedLanguage);
      return;
    }

    this.translate.use(this.resolveBrowserLanguage());
  }

  setLanguage(language: SupportedLanguage): void {
    this.translate.use(language);
    localStorage.setItem(this.storageKey, language);
  }

  getCurrentLanguage(): SupportedLanguage {
    const active = this.translate.currentLang || this.translate.defaultLang;
    return this.isSupportedLanguage(active) ? active : this.fallbackLanguage;
  }

  getSupportedLanguages(): SupportedLanguage[] {
    return [...this.supportedLanguages];
  }

  private getSavedLanguage(): SupportedLanguage | null {
    const stored = localStorage.getItem(this.storageKey);
    return this.isSupportedLanguage(stored) ? stored : null;
  }

  private resolveBrowserLanguage(): SupportedLanguage {
    const browserLanguage = this.translate.getBrowserLang();
    return this.isSupportedLanguage(browserLanguage) ? browserLanguage : this.fallbackLanguage;
  }

  private isSupportedLanguage(value: unknown): value is SupportedLanguage {
    return typeof value === 'string' && this.supportedLanguages.includes(value as SupportedLanguage);
  }
}
