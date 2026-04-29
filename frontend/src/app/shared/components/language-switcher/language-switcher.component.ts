import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Input, Output, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService, SupportedLanguage } from '@core/i18n/language.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div
      class="language-switcher"
      [class.language-switcher--dark]="tone === 'dark'"
      [class.language-switcher--hero]="size === 'hero'"
    >
      <div class="language-switcher__menu-wrap">
        <button
          type="button"
          class="language-switcher__trigger"
          (click)="toggleMenu()"
          [attr.aria-expanded]="isOpen"
          aria-haspopup="menu"
        >
          @if (size === 'hero') {
            <img src="assets/icons/language.svg" [attr.alt]="'COMMON.LANGUAGE' | translate" class="language-switcher__hero-image" />
          } @else {
            <img src="assets/icons/language.svg" [attr.alt]="'COMMON.LANGUAGE' | translate" />
          }
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

    .language-switcher--dark {
      color: #ffffff;
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
      transition: background-color 0.2s ease, border-color 0.2s ease;
    }

    .language-switcher__trigger:hover {
      background: rgba(38, 72, 147, 0.08);
    }

    .language-switcher--dark .language-switcher__trigger {
      border: 1px solid rgba(255, 255, 255, 0.18);
      background: rgba(255, 255, 255, 0.08);
    }

    .language-switcher--dark .language-switcher__trigger:hover {
      background: rgba(255, 255, 255, 0.18);
    }

    .language-switcher__trigger img {
      width: 1.85rem;
      height: 1.85rem;
      filter: brightness(0) saturate(100%) invert(20%) sepia(24%) saturate(3269%) hue-rotate(201deg) brightness(90%) contrast(95%);
    }

    .language-switcher--dark .language-switcher__trigger img {
      filter: brightness(0) saturate(100%) invert(100%);
    }

    .language-switcher__icon {
      font-size: 1.85rem;
      line-height: 1;
    }

    .language-switcher--hero .language-switcher__trigger {
      width: clamp(3.5rem, 6.48vh, 4.375rem);
      height: clamp(3.5rem, 6.48vh, 4.375rem);
      border: 0;
      background: transparent;
    }

    .language-switcher--hero .language-switcher__icon {
      font-size: clamp(1.7rem, 2.03vw, 2.45rem);
    }

    .language-switcher__hero-image {
      width: 100%;
      height: 100%;
      object-fit: contain;
      filter: none;
    }

    .language-switcher__menu {
      position: absolute;
      top: calc(100% + 0.5rem);
      right: 0;
      min-width: 9.5rem;
      padding: 0.3rem 0.45rem;
      border-radius: 10px;
      background: #ffffff;
      border: 1px solid rgba(15, 23, 42, 0.08);
      box-shadow: 0 8px 24px rgba(15, 23, 42, 0.13);
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      z-index: 20;
    }

    .language-switcher--dark .language-switcher__menu {
      background: rgba(15, 23, 42, 0.94);
      border: 1px solid rgba(255, 255, 255, 0.12);
      box-shadow: 0 20px 40px rgba(15, 23, 42, 0.3);
    }

    .language-switcher--hero .language-switcher__menu {
      min-width: 9.5rem;
      padding: 0.3rem 0.45rem;
      border-radius: 10px;
      background: #ffffff;
      border: 1px solid rgba(15, 23, 42, 0.08);
      box-shadow: 0 8px 24px rgba(15, 23, 42, 0.13);
    }

    .language-switcher__option {
      width: 100%;
      padding: 0.5rem 0.5rem;
      border: 0;
      border-radius: 6px;
      background: transparent;
      border-bottom: 1px solid rgba(38, 72, 147, 0.15);
      color: #1d1d1d;
      font-family: 'Afacad', sans-serif;
      font-size: 1rem;
      font-style: normal;
      line-height: 1.2;
      text-align: center;
      cursor: pointer;
      transition: background-color 0.15s ease;
    }

    .language-switcher--dark .language-switcher__option {
      border-bottom-color: rgba(255, 255, 255, 0.12);
      color: #f8fafc;
    }

    .language-switcher--hero .language-switcher__option {
      border-radius: 6px;
      border-bottom-color: rgba(38, 72, 147, 0.15);
      color: #1d1d1d;
      font-size: 1rem;
      font-style: normal;
      line-height: 1.2;
    }

    .language-switcher__option:last-child {
      border-bottom: 0;
    }

    .language-switcher__option--active {
      font-weight: 700;
      color: #264893;
    }

    .language-switcher--dark .language-switcher__option--active {
      color: #7dd3fc;
    }

    .language-switcher--hero .language-switcher__option--active {
      color: #264893;
      font-weight: 700;
    }

    .language-switcher__option:hover {
      background: rgba(38, 72, 147, 0.05);
    }

    .language-switcher--dark .language-switcher__option:hover {
      background: rgba(255, 255, 255, 0.08);
    }

    .language-switcher--hero .language-switcher__option:hover {
      background: rgba(38, 72, 147, 0.05);
    }
  `]
})
export class LanguageSwitcherComponent {
  private readonly languageService = inject(LanguageService);
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  @Input() tone: 'light' | 'dark' = 'light';
  @Input() size: 'default' | 'hero' = 'default';
  @Input() set forceClose(val: number) { if (val) this.isOpen = false; }
  @Output() readonly menuOpened = new EventEmitter<void>();

  isOpen = false;

  get currentLanguage(): SupportedLanguage {
    return this.languageService.getCurrentLanguage();
  }

  toggleMenu(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) this.menuOpened.emit();
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
