import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { PublicFooterComponent } from '@shared/components/public-footer/public-footer.component';

type ContactCard = {
  icon: string;
  titleKey: string;
  valueKey: string;
};

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, TranslateModule, PublicFooterComponent],
  template: `
    <section class="contact-page">

      <!-- ── Hero ── -->
      <header class="contact-hero">
        <img src="assets/pictures/ContactHeader.png" alt="" aria-hidden="true" class="contact-hero__bg" />
        <div class="contact-hero__overlay-dark"></div>
        <div class="contact-hero__overlay-bottom"></div>

        <div class="contact-shell contact-hero__content">
          <div class="contact-hero__copy">
            <h1>{{ 'CONTACT.HERO.TITLE' | translate }}</h1>
            <p class="contact-hero__subtitle">{{ 'CONTACT.HERO.SUBTITLE' | translate }}</p>
            <p class="contact-hero__tagline">{{ 'CONTACT.HERO.TAGLINE' | translate }}</p>
          </div>
        </div>
      </header>

      <!-- ── Contact cards ── -->
      <main class="contact-main">
        <section class="contact-shell contact-cards">
          @for (card of cards; track card.titleKey) {
            <article class="contact-card reveal">
              <div class="contact-card__icon">
                <img [src]="card.icon" aria-hidden="true" class="contact-card__icon-img" />
              </div>
              <h2 class="contact-card__title">{{ card.titleKey | translate }}</h2>
              <p class="contact-card__value">{{ card.valueKey | translate }}</p>
            </article>
          }
        </section>
      </main>

      <!-- ── Footer ── -->
      <app-public-footer></app-public-footer>

      <!-- ── Chat FAB ── -->
      <button type="button" class="chat-fab" aria-label="Open chat">
        <img src="assets/icons/chats.svg" alt="Chat" class="chat-fab__icon" />
      </button>
    </section>
  `,
  styles: [`
    :host { display: block; }

    .contact-page {
      min-height: 100vh;
      background: #fef4df;
      color: #264893;
    }

    .contact-shell {
      width: min(100%, 120rem);
      margin: 0 auto;
      padding-inline: clamp(2rem, 14.2vw, 18rem);
    }

    /* ── Hero ──────────────────────────────────── */

    .contact-hero {
      position: relative;
      min-height: clamp(30rem, 46vw, 58rem);
      overflow: hidden;
      background: #e8e0d4;
    }

    .contact-hero__bg,
    .contact-hero__overlay-dark,
    .contact-hero__overlay-bottom {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }

    .contact-hero__bg {
      object-fit: cover;
      object-position: center top;
      opacity: 0.22;
    }

    .contact-hero__overlay-dark {
      background: linear-gradient(180deg,
        rgba(0,0,0,0.50) 0%,
        rgba(0,0,0,0.25) 14%,
        rgba(0,0,0,0.06) 26%,
        transparent 38%
      );
    }

    .contact-hero__overlay-bottom {
      background: linear-gradient(180deg,
        transparent 0%,
        transparent 40%,
        rgba(254,244,223,0.55) 65%,
        #fef4df 100%
      );
    }

    .contact-hero__content {
      position: relative;
      z-index: 1;
      min-height: clamp(30rem, 46vw, 58rem);
      padding-top: clamp(9rem, 17vw, 22rem);
      padding-bottom: clamp(3rem, 5vw, 6rem);
    }

    .contact-hero__copy {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: clamp(0.5rem, 1.5vw, 1.75rem);
      text-align: center;
      color: #264893;
    }

    .contact-hero__copy h1 {
      margin: 0;
      font-family: 'Big Shoulders Text', sans-serif;
      font-size: clamp(3.5rem, 6.67vw, 8.5rem);
      font-weight: 800;
      line-height: 1;
      letter-spacing: -0.01em;
      text-transform: uppercase;
    }

    .contact-hero__subtitle {
      margin: 0;
      font-family: 'Big Shoulders Text', sans-serif;
      font-size: clamp(1rem, 2.1vw, 2.75rem);
      font-weight: 800;
      line-height: 1.1;
      text-transform: uppercase;
      letter-spacing: 0.01em;
    }

    .contact-hero__tagline {
      margin: 0;
      max-width: 56rem;
      font-family: 'Afacad', sans-serif;
      font-size: clamp(0.95rem, 1.6vw, 2rem);
      font-style: italic;
      line-height: 1.55;
      opacity: 0.88;
      padding-inline: 1rem;
    }

    /* ── Cards ─────────────────────────────────── */

    .contact-main {
      background: #fef4df;
      padding-bottom: clamp(3rem, 6vw, 6rem);
    }

    .contact-cards {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: clamp(2rem, 4vw, 5rem);
      padding-top: clamp(3rem, 5vw, 6rem);
      padding-bottom: clamp(2rem, 4vw, 4rem);
    }

    @media (max-width: 860px) {
      .contact-cards { grid-template-columns: 1fr; max-width: 32rem; }
    }

    .contact-card {
      text-align: center;
      font-family: 'Afacad', sans-serif;
    }

    .contact-card__icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: clamp(4rem, 5vw, 5.5rem);
      height: clamp(4rem, 5vw, 5.5rem);
      margin: 0 auto clamp(1rem, 1.5vw, 1.5rem);
    }

    .contact-card__icon-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .contact-card__title {
      margin: 0 0 clamp(0.5rem, 0.8vw, 0.85rem);
      font-family: 'Big Shoulders Text', sans-serif;
      font-size: clamp(1.4rem, 2.3vw, 2.5rem);
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.02em;
      line-height: 1.05;
    }

    .contact-card__value {
      margin: 0;
      font-size: clamp(0.9rem, 1.1vw, 1.2rem);
      line-height: 1.55;
      opacity: 0.85;
      white-space: pre-line;
    }

    /* ── Chat FAB ────────────────────────────────── */

    .chat-fab {
      position: fixed;
      bottom: clamp(1.5rem, 3vw, 2.5rem);
      right: clamp(1.5rem, 3vw, 2.5rem);
      width: clamp(3.25rem, 4.5vw, 5rem);
      height: clamp(3.25rem, 4.5vw, 5rem);
      border-radius: 50%;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0;
      display: grid;
      place-items: center;
      box-shadow: 0 6px 24px rgba(38,72,147,0.45);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      z-index: 200;
    }

    .chat-fab:hover { transform: scale(1.1); box-shadow: 0 10px 36px rgba(38,72,147,0.55); }
    .chat-fab:active { transform: scale(0.96); }

    .chat-fab__icon {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    /* ── Scroll-reveal ───────────────────────────── */

    .reveal {
      opacity: 0;
      transform: translateY(2rem);
      transition: opacity 0.65s ease, transform 0.65s ease;
    }

    .reveal.revealed { opacity: 1; transform: none; }
    .reveal:nth-child(2) { transition-delay: 0.13s; }
    .reveal:nth-child(3) { transition-delay: 0.26s; }
  `]
})
export class ContactComponent implements AfterViewInit, OnDestroy {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private observer: IntersectionObserver | null = null;

  readonly cards: ContactCard[] = [
    {
      icon: 'assets/icons/house.svg',
      titleKey: 'CONTACT.CARDS.VISIT.TITLE',
      valueKey: 'CONTACT.CARDS.VISIT.VALUE',
    },
    {
      icon: 'assets/icons/phone.svg',
      titleKey: 'CONTACT.CARDS.CALL.TITLE',
      valueKey: 'CONTACT.CARDS.CALL.VALUE',
    },
    {
      icon: 'assets/icons/mail-contact.svg',
      titleKey: 'CONTACT.CARDS.EMAIL.TITLE',
      valueKey: 'CONTACT.CARDS.EMAIL.VALUE',
    },
  ];

  ngAfterViewInit(): void {
    const elements = this.elementRef.nativeElement.querySelectorAll('.reveal');
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          } else {
            entry.target.classList.remove('revealed');
          }
        });
      },
      { threshold: 0.1 }
    );
    elements.forEach((el: Element) => this.observer!.observe(el));
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
