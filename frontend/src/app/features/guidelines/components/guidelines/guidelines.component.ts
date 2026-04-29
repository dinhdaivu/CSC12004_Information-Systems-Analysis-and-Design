import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { PublicFooterComponent } from '@shared/components/public-footer/public-footer.component';

type GuidelineStep = {
  number: string;
  titleKey: string;
  items: { labelKey: string; descKey: string; subItems?: string[] }[];
};

@Component({
  selector: 'app-guidelines',
  standalone: true,
  imports: [CommonModule, TranslateModule, PublicFooterComponent],
  template: `
    <section class="gl-page">

      <!-- ── Hero ── -->
      <header class="gl-hero">
        <img src="assets/pictures/GuidelinesHeader.png" alt="" aria-hidden="true" class="gl-hero__bg" />
        <div class="gl-hero__overlay-dark"></div>
        <div class="gl-hero__overlay-bottom"></div>

        <div class="gl-shell gl-hero__content">
          <div class="gl-hero__copy">
            <h1>{{ 'GUIDELINES.HERO.TITLE' | translate }}</h1>
            <p class="gl-hero__subtitle">{{ 'GUIDELINES.HERO.SUBTITLE' | translate }}</p>
            <p class="gl-hero__tagline">{{ 'GUIDELINES.HERO.TAGLINE' | translate }}</p>
          </div>
        </div>
      </header>

      <!-- ── Steps ── -->
      <main class="gl-main">
        <div class="gl-shell gl-steps">
          @for (step of steps; track step.number) {
            <article class="gl-step reveal">
              <h2 class="gl-step__title">
                {{ step.number | translate }}: {{ step.titleKey | translate }}
              </h2>
              <ul class="gl-step__list">
                @for (item of step.items; track item.labelKey) {
                  <li class="gl-step__item">
                    <strong>{{ item.labelKey | translate }}</strong>{{ item.descKey | translate }}
                    @if (item.subItems) {
                      <ul class="gl-step__sublist">
                        @for (sub of item.subItems; track sub) {
                          <li class="gl-step__subitem">{{ sub | translate }}</li>
                        }
                      </ul>
                    }
                  </li>
                }
              </ul>
            </article>
          }
        </div>
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

    .gl-page {
      min-height: 100vh;
      background: #fef4df;
      color: #264893;
    }

    .gl-shell {
      width: min(100%, 120rem);
      margin: 0 auto;
      padding-inline: clamp(2rem, 14.2vw, 18rem);
    }

    /* ── Hero ──────────────────────────────────── */

    .gl-hero {
      position: relative;
      min-height: clamp(30rem, 46vw, 58rem);
      overflow: hidden;
      background: #e8e0d4;
    }

    .gl-hero__bg,
    .gl-hero__overlay-dark,
    .gl-hero__overlay-bottom {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }

    .gl-hero__bg {
      object-fit: cover;
      object-position: center top;
      opacity: 0.22;
    }

    .gl-hero__overlay-dark {
      background: linear-gradient(180deg,
        rgba(0,0,0,0.50) 0%,
        rgba(0,0,0,0.25) 14%,
        rgba(0,0,0,0.06) 26%,
        transparent 38%
      );
    }

    .gl-hero__overlay-bottom {
      background: linear-gradient(180deg,
        transparent 0%,
        transparent 40%,
        rgba(254,244,223,0.55) 65%,
        #fef4df 100%
      );
    }

    .gl-hero__content {
      position: relative;
      z-index: 1;
      min-height: clamp(30rem, 46vw, 58rem);
      padding-top: clamp(9rem, 17vw, 22rem);
      padding-bottom: clamp(3rem, 5vw, 6rem);
    }

    .gl-hero__copy {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: clamp(0.5rem, 1.5vw, 1.75rem);
      text-align: center;
      color: #264893;
    }

    .gl-hero__copy h1 {
      margin: 0;
      font-family: 'Big Shoulders Text', sans-serif;
      font-size: clamp(3.5rem, 6.67vw, 8.5rem);
      font-weight: 800;
      line-height: 1;
      letter-spacing: -0.01em;
      text-transform: uppercase;
    }

    .gl-hero__subtitle {
      margin: 0;
      font-family: 'Big Shoulders Text', sans-serif;
      font-size: clamp(1rem, 2.1vw, 2.75rem);
      font-weight: 800;
      line-height: 1.1;
      text-transform: uppercase;
      letter-spacing: 0.01em;
    }

    .gl-hero__tagline {
      margin: 0;
      max-width: 70rem;
      font-family: 'Afacad', sans-serif;
      font-size: clamp(1rem, 1.85vw, 2.2rem);
      font-style: italic;
      line-height: 1.55;
      opacity: 0.88;
    }

    /* ── Steps ─────────────────────────────────── */

    .gl-main {
      background: #fef4df;
      padding-bottom: clamp(4rem, 7vw, 8rem);
    }

    .gl-steps {
      display: flex;
      flex-direction: column;
      gap: clamp(1.25rem, 2vw, 2rem);
      padding-top: clamp(3rem, 4.5vw, 5rem);
    }

    .gl-step {
      padding-bottom: 0;
    }

    .gl-step__title {
      margin: 0 0 clamp(0.85rem, 1.3vw, 1.25rem);
      font-family: 'Afacad', sans-serif;
      font-size: clamp(1.25rem, 1.7vw, 1.9rem);
      font-weight: 700;
      line-height: 1.25;
      color: #264893;
    }

    .gl-step__list {
      margin: 0;
      padding: 0;
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: clamp(0.45rem, 0.7vw, 0.7rem);
    }

    .gl-step__item {
      font-family: 'Afacad', sans-serif;
      font-size: clamp(1rem, 1.25vw, 1.35rem);
      line-height: 1.65;
      padding-left: 1.1rem;
      position: relative;
      color: #264893;
      text-align: justify;
    }

    .gl-step__item::before {
      content: '•';
      position: absolute;
      left: 0;
      opacity: 0.7;
    }

    .gl-step__item strong {
      font-weight: 700;
    }

    .gl-step__sublist {
      margin: 0.4rem 0 0;
      padding: 0;
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }

    .gl-step__subitem {
      font-family: 'Afacad', sans-serif;
      font-size: clamp(0.95rem, 1.15vw, 1.25rem);
      line-height: 1.6;
      text-align: justify;
      padding-left: 1.1rem;
      position: relative;
      color: #264893;
    }

    .gl-step__subitem::before {
      content: '•';
      position: absolute;
      left: 0;
      opacity: 0.55;
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
      display: grid;
      place-items: center;
      box-shadow: 0 6px 24px rgba(38,72,147,0.45);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      z-index: 200;
      padding: 0;
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
    .reveal:nth-child(4) { transition-delay: 0.39s; }
  `]
})
export class GuidelinesComponent implements AfterViewInit, OnDestroy {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private observer: IntersectionObserver | null = null;

  readonly steps: GuidelineStep[] = [
    {
      number: 'GUIDELINES.STEPS.STEP1.NUMBER',
      titleKey: 'GUIDELINES.STEPS.STEP1.TITLE',
      items: [
        { labelKey: 'GUIDELINES.STEPS.STEP1.ITEM1_LABEL', descKey: 'GUIDELINES.STEPS.STEP1.ITEM1_DESC' },
        { labelKey: 'GUIDELINES.STEPS.STEP1.ITEM2_LABEL', descKey: 'GUIDELINES.STEPS.STEP1.ITEM2_DESC' },
        { labelKey: 'GUIDELINES.STEPS.STEP1.ITEM3_LABEL', descKey: 'GUIDELINES.STEPS.STEP1.ITEM3_DESC' },
      ],
    },
    {
      number: 'GUIDELINES.STEPS.STEP2.NUMBER',
      titleKey: 'GUIDELINES.STEPS.STEP2.TITLE',
      items: [
        { labelKey: 'GUIDELINES.STEPS.STEP2.ITEM1_LABEL', descKey: 'GUIDELINES.STEPS.STEP2.ITEM1_DESC' },
        { labelKey: 'GUIDELINES.STEPS.STEP2.ITEM2_LABEL', descKey: 'GUIDELINES.STEPS.STEP2.ITEM2_DESC' },
        { labelKey: 'GUIDELINES.STEPS.STEP2.ITEM3_LABEL', descKey: 'GUIDELINES.STEPS.STEP2.ITEM3_DESC' },
      ],
    },
    {
      number: 'GUIDELINES.STEPS.STEP3.NUMBER',
      titleKey: 'GUIDELINES.STEPS.STEP3.TITLE',
      items: [
        { labelKey: 'GUIDELINES.STEPS.STEP3.ITEM1_LABEL', descKey: 'GUIDELINES.STEPS.STEP3.ITEM1_DESC' },
        { labelKey: 'GUIDELINES.STEPS.STEP3.ITEM2_LABEL', descKey: 'GUIDELINES.STEPS.STEP3.ITEM2_DESC' },
        { labelKey: 'GUIDELINES.STEPS.STEP3.ITEM3_LABEL', descKey: 'GUIDELINES.STEPS.STEP3.ITEM3_DESC' },
      ],
    },
    {
      number: 'GUIDELINES.STEPS.STEP4.NUMBER',
      titleKey: 'GUIDELINES.STEPS.STEP4.TITLE',
      items: [
        { labelKey: 'GUIDELINES.STEPS.STEP4.ITEM1_LABEL', descKey: 'GUIDELINES.STEPS.STEP4.ITEM1_DESC' },
        { labelKey: 'GUIDELINES.STEPS.STEP4.ITEM2_LABEL', descKey: 'GUIDELINES.STEPS.STEP4.ITEM2_DESC' },
        {
          labelKey: 'GUIDELINES.STEPS.STEP4.ITEM3_LABEL',
          descKey: 'GUIDELINES.STEPS.STEP4.ITEM3_DESC',
          subItems: [
            'GUIDELINES.STEPS.STEP4.ITEM3_SUB1',
            'GUIDELINES.STEPS.STEP4.ITEM3_SUB2',
            'GUIDELINES.STEPS.STEP4.ITEM3_SUB3',
            'GUIDELINES.STEPS.STEP4.ITEM3_SUB4',
          ],
        },
        { labelKey: 'GUIDELINES.STEPS.STEP4.ITEM4_LABEL', descKey: 'GUIDELINES.STEPS.STEP4.ITEM4_DESC' },
      ],
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
