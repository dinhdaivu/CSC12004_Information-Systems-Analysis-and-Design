import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { PublicFooterComponent } from '@shared/components/public-footer/public-footer.component';

type PillarCard = {
  titleKey: string;
  descriptionKey: string;
  image: string;
};

type StatCard = {
  imgSrc: string;
  valueKey: string;
  titleKey: string;
  descriptionKey: string;
};

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, TranslateModule, PublicFooterComponent],
  template: `
    <section class="about-page">
      <header class="about-hero">
        <img src="assets/pictures/AboutUsHeader.png" alt="" aria-hidden="true" class="about-hero__bg" />
        <div class="about-hero__overlay-dark"></div>
        <div class="about-hero__overlay-bottom"></div>

        <div class="about-shell about-hero__content">
          <div class="about-hero__copy">
            <h1>{{ 'ABOUT.HERO.TITLE' | translate }}</h1>
            <p class="about-hero__tagline">{{ 'ABOUT.HERO.TAGLINE' | translate }}</p>
            <p class="about-hero__quote">{{ 'ABOUT.HERO.QUOTE' | translate }}</p>
          </div>
        </div>
      </header>

      <main class="about-main">
        <section class="about-shell about-pillars">
          @for (pillar of pillars; track pillar.titleKey) {
            <article class="pillar-card reveal">
              <div class="pillar-card__art">
                <img [src]="pillar.image" [alt]="pillar.titleKey | translate" class="pillar-card__art-img" />
              </div>
              <h2>{{ pillar.titleKey | translate }}</h2>
              <p>{{ pillar.descriptionKey | translate }}</p>
            </article>
          }
        </section>

        <section class="about-shell about-story reveal">
          <p>{{ 'ABOUT.STORY.INTRO' | translate }}</p>
          <p>{{ 'ABOUT.STORY.BODY' | translate }}</p>
        </section>

        <section class="about-shell about-stats">
          @for (stat of stats; track stat.titleKey) {
            <article class="stat-card reveal">
              <div class="stat-card__icon">
                <img [src]="stat.imgSrc" aria-hidden="true" class="stat-card__icon-img" />
              </div>
              <div class="stat-card__value">{{ stat.valueKey | translate }}</div>
              <h3 class="stat-card__title">{{ stat.titleKey | translate }}</h3>
              <p class="stat-card__desc">{{ stat.descriptionKey | translate }}</p>
            </article>
          }
        </section>
      </main>

      <app-public-footer></app-public-footer>

      <button type="button" class="chat-fab" aria-label="Open chat">
        <img src="assets/icons/chats.svg" alt="Chat" class="chat-fab__icon" />
      </button>
    </section>
  `,
  styles: [`
    :host {
      display: block;
    }

    .about-page {
      min-height: 100vh;
      background: #fef4df;
      color: #264893;
    }

    .about-shell {
      width: min(100%, 120rem);
      margin: 0 auto;
      /* Figma: section left edge ~273px on 1920px canvas → 14.2vw */
      padding-inline: clamp(2rem, 14.2vw, 18rem);
    }

    /* ── Hero ─────────────────────────────────── */

    .about-hero {
      position: relative;
      /* 1920px design: content ends at ~901px; add bottom fade → ~1080px = 56.25vw */
      min-height: clamp(38rem, 56.25vw, 74rem);
      overflow: hidden;
      background: #e8e0d4;
    }

    .about-hero__bg,
    .about-hero__overlay-dark,
    .about-hero__overlay-bottom {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }

    .about-hero__bg {
      object-fit: cover;
      object-position: center top;
      opacity: 0.28;
    }

    /* dark band at the very top so nav text stays readable */
    .about-hero__overlay-dark {
      background: linear-gradient(180deg,
        rgba(0, 0, 0, 0.55) 0%,
        rgba(0, 0, 0, 0.30) 12%,
        rgba(0, 0, 0, 0.08) 24%,
        transparent 36%
      );
    }

    .about-hero__overlay-bottom {
      background: linear-gradient(180deg, transparent 0%, transparent 45%, rgba(254, 244, 223, 0.60) 68%, #fef4df 100%);
    }

    .about-hero__content {
      position: relative;
      z-index: 1;
      min-height: clamp(38rem, 56.25vw, 74rem);
      padding-top: clamp(9rem, 17vw, 22rem);
      padding-bottom: clamp(4rem, 6vw, 8rem);
    }

    .about-hero__copy {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      /* Figma gap: ~37px between elements at 1920px → ~2vw */
      gap: clamp(0.5rem, 2vw, 2.25rem);
      text-align: center;
      color: #264893;
    }

    .about-hero__copy h1 {
      margin: 0;
      font-family: 'Big Shoulders Text', sans-serif;
      /* Figma: 128px / 1920px = 6.67vw */
      font-size: clamp(3rem, 6.67vw, 8.5rem);
      font-weight: 800;
      line-height: 1.0;
      letter-spacing: -0.01em;
    }

    .about-hero__tagline {
      margin: 0;
      max-width: 80rem;
      font-family: 'Big Shoulders Text', sans-serif;
      font-size: clamp(1rem, 2.1vw, 2.75rem);
      font-weight: 800;
      line-height: 1.1;
      text-transform: uppercase;
      letter-spacing: 0.01em;
    }

    .about-hero__quote {
      margin: 0;
      max-width: 72rem;
      font-family: 'Afacad', sans-serif;
      font-size: clamp(0.95rem, 1.6vw, 2rem);
      line-height: 1.55;
      font-style: italic;
      padding-inline: 1rem;
      opacity: 0.88;
    }

    /* ── Main ─────────────────────────────────── */

    .about-main {
      background: #fef4df;
      padding-bottom: clamp(3rem, 5vw, 5rem);
    }

    /* ── Pillars ──────────────────────────────── */

    .about-pillars {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: clamp(1.5rem, 3vw, 3.5rem);
      /* padding-top reserves space for the mascots floating above the cards */
      padding-top: clamp(10rem, 13vw, 14rem);
      padding-bottom: clamp(3rem, 6vw, 6rem);
      /* extra side room so edge mascots don't overflow the shell margin */
      padding-inline: clamp(3rem, 5vw, 6rem);
    }

    @media (max-width: 860px) {
      .about-pillars {
        grid-template-columns: 1fr;
        gap: clamp(9rem, 13vw, 14rem);
      }
    }

    .pillar-card {
      position: relative;
      border: 3px solid #264893;
      border-radius: 1.5rem;
      background: rgba(255, 251, 241, 0.80);
      padding: clamp(1.75rem, 2.5vw, 2.5rem) clamp(1.5rem, 2.5vw, 2.5rem) clamp(1.75rem, 2.5vw, 2.5rem);
      text-align: center;
    }

    .pillar-card__art {
      position: absolute;
      left: 50%;
      /* anchor bottom of art to top of card; shift down so feet overlap border */
      bottom: 100%;
      transform: translate(-50%, 2.5rem);
      width: clamp(8rem, 10.5vw, 11rem);
    }

    .pillar-card__art-img {
      width: 100%;
      height: auto;
      display: block;
    }

    .pillar-card h2 {
      margin: 0 0 0.75rem;
      font-family: 'Afacad', sans-serif;
      font-size: clamp(1.35rem, 2vw, 2.25rem);
      font-weight: 700;
      line-height: 1.1;
    }

    .pillar-card p {
      margin: 0;
      font-family: 'Afacad', sans-serif;
      font-size: clamp(0.95rem, 1.15vw, 1.2rem);
      line-height: 1.65;
      text-align: justify;
      opacity: 0.85;
    }

    /* ── Story ────────────────────────────────── */

    .about-story {
      padding-top: clamp(2rem, 4vw, 4rem);
      padding-bottom: clamp(3rem, 5vw, 5rem);
      font-family: 'Afacad', sans-serif;
      font-style: italic;
      font-size: clamp(1rem, 1.25vw, 1.5rem);
      line-height: 1.75;
      text-align: center;
      max-width: 90rem;
      margin-inline: auto;
    }

    .about-story p + p {
      margin-top: 1.5rem;
    }

    /* ── Stats ────────────────────────────────── */

    .about-stats {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: clamp(1.5rem, 3vw, 3rem);
      padding-bottom: clamp(3rem, 6vw, 6rem);
    }

    @media (max-width: 860px) {
      .about-stats {
        grid-template-columns: 1fr;
        max-width: 36rem;
      }
    }

    .stat-card {
      text-align: center;
      font-family: 'Afacad', sans-serif;
    }

    .stat-card__icon {
      display: grid;
      place-items: center;
      width: clamp(4rem, 5.5vw, 5.5rem);
      height: clamp(4rem, 5.5vw, 5.5rem);
      margin: 0 auto clamp(1rem, 1.5vw, 1.5rem);
    }

    .stat-card__icon-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .stat-card__value {
      font-family: 'Big Shoulders Text', sans-serif;
      font-size: clamp(2.4rem, 4.5vw, 4.75rem);
      font-weight: 800;
      line-height: 0.95;
      color: #264893;
    }

    .stat-card__title {
      margin: 0.6rem 0 0;
      font-size: clamp(1.15rem, 1.7vw, 1.85rem);
      font-weight: 600;
      line-height: 1.2;
    }

    .stat-card__desc {
      margin: 0.75rem 0 0;
      font-size: clamp(0.92rem, 1.05vw, 1.1rem);
      line-height: 1.65;
      text-align: justify;
      opacity: 0.8;
    }

    /* ── Floating chat button ─────────────────── */

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
      box-shadow: 0 6px 24px rgba(38, 72, 147, 0.45);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      z-index: 200;
    }

    .chat-fab:hover {
      transform: scale(1.1);
      box-shadow: 0 10px 36px rgba(38, 72, 147, 0.55);
    }

    .chat-fab:active {
      transform: scale(0.96);
    }

    .chat-fab__icon {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    /* ── Scroll-reveal animations ─────────────── */

    .reveal {
      opacity: 0;
      transform: translateY(2rem);
      transition: opacity 0.65s ease, transform 0.65s ease;
    }

    .reveal.revealed {
      opacity: 1;
      transform: none;
    }

    /* stagger for grid siblings */
    .reveal:nth-child(2) { transition-delay: 0.13s; }
    .reveal:nth-child(3) { transition-delay: 0.26s; }
  `]
})
export class AboutComponent implements AfterViewInit, OnDestroy {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private observer: IntersectionObserver | null = null;

  readonly pillars: PillarCard[] = [
    {
      titleKey: 'ABOUT.PILLARS.HOM.NAME',
      descriptionKey: 'ABOUT.PILLARS.HOM.DESC',
      image: 'assets/icons/hom.svg',
    },
    {
      titleKey: 'ABOUT.PILLARS.SA.NAME',
      descriptionKey: 'ABOUT.PILLARS.SA.DESC',
      image: 'assets/icons/sa.svg',
    },
    {
      titleKey: 'ABOUT.PILLARS.DO.NAME',
      descriptionKey: 'ABOUT.PILLARS.DO.DESC',
      image: 'assets/icons/do.svg',
    },
  ];

  readonly stats: StatCard[] = [
    {
      imgSrc: 'assets/icons/house.svg',
      valueKey: 'ABOUT.BRANCHES.VALUE',
      titleKey: 'ABOUT.BRANCHES.TITLE',
      descriptionKey: 'ABOUT.BRANCHES.CARD_DESC',
    },
    {
      imgSrc: 'assets/icons/people.svg',
      valueKey: 'ABOUT.TRANSPARENCY.VALUE',
      titleKey: 'ABOUT.TRANSPARENCY.TITLE',
      descriptionKey: 'ABOUT.TRANSPARENCY.CARD_DESC',
    },
    {
      imgSrc: 'assets/icons/clock.svg',
      valueKey: 'ABOUT.CONFIRMATION.VALUE',
      titleKey: 'ABOUT.CONFIRMATION.TITLE',
      descriptionKey: 'ABOUT.CONFIRMATION.CARD_DESC',
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
