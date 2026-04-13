import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService, SupportedLanguage } from '@core/i18n/language.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="language-switcher">
      <div class="language-switcher__menu-wrap">
        <button
          type="button"
          class="language-switcher__trigger"
          (click)="toggleMenu()"
          [attr.aria-expanded]="isOpen"
          aria-haspopup="menu"
        >
          <img src="assets/icons/language.svg" [attr.alt]="'COMMON.LANGUAGE' | translate" />
        </button>

        <div class="language-switcher__menu" *ngIf="isOpen" role="menu">
          <button
            type="button"
            class="language-switcher__option"
            [class.language-switcher__option--active]="currentLanguage === 'en'"
            (click)="changeLanguage('en')"
            role="menuitem"
          >
            {{ 'COMMON.ENGLISH' | translate }}
          </button>

          <button
            type="button"
            class="language-switcher__option"
            [class.language-switcher__option--active]="currentLanguage === 'vi'"
            (click)="changeLanguage('vi')"
            role="menuitem"
          >
            {{ 'COMMON.VIETNAMESE' | translate }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
    }

    .language-switcher {
      display: flex;
      align-items: center;
      color: #264893;
      font-family: 'Afacad', sans-serif;
    }

    .language-switcher__menu-wrap {
      position: relative;
    }

    .language-switcher__trigger {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2.75rem;
      height: 2.75rem;
      border: 0;
      border-radius: 999px;
      background: transparent;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .language-switcher__trigger:hover {
      background: rgba(38, 72, 147, 0.08);
    }

    .language-switcher__trigger img {
      width: 1.85rem;
      height: 1.85rem;
      filter: brightness(0) saturate(100%) invert(20%) sepia(24%) saturate(3269%) hue-rotate(201deg) brightness(90%) contrast(95%);
    }

    .language-switcher__menu {
      position: absolute;
      top: calc(100% + 0.5rem);
      right: 0;
      min-width: 9rem;
      padding: 0.45rem 0.55rem;
      border-radius: 8px;
      background: #efebe3;
      box-shadow: 0 12px 24px rgba(18, 29, 62, 0.18);
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      z-index: 20;
    }

    .language-switcher__option {
      width: 100%;
      padding: 0.45rem 0.25rem;
      border: 0;
      border-radius: 6px;
      background: transparent;
      border-bottom: 1px solid rgba(38, 72, 147, 0.5);
      color: #1d1d1d;
      font-family: 'Afacad', sans-serif;
      font-size: 1rem;
      font-style: normal;
      line-height: 1.2;
      text-align: center;
      cursor: pointer;
    }

    .language-switcher__option:last-child {
      border-bottom: 0;
    }

    .language-switcher__option--active {
      font-weight: 700;
      color: #264893;
    }

    .language-switcher__option:hover {
      background: rgba(255, 255, 255, 0.55);
    }
  `]
})
export class LanguageSwitcherComponent {
  private readonly languageService = inject(LanguageService);
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  isOpen = false;

  get currentLanguage(): SupportedLanguage {
    return this.languageService.getCurrentLanguage();
  }

  toggleMenu(): void {
    this.isOpen = !this.isOpen;
  }

  changeLanguage(language: SupportedLanguage): void {
    this.languageService.setLanguage(language);
    this.isOpen = false;
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node | null)) {
      this.isOpen = false;
    }
  }
}
