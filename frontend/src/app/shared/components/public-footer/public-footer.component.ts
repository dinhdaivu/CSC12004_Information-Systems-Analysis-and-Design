import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-public-footer',
  standalone: true,
  imports: [TranslateModule],
  template: `
    <footer class="pf-footer">
      <div class="pf-shell pf-footer__inner">
        <div class="pf-footer__branding">
          <img src="assets/icons/logo.svg" alt="HomeStay Dorm" class="pf-footer__logo" />
          <p>{{ 'ABOUT.FOOTER.TAGLINE' | translate }}</p>
          <small>{{ 'ABOUT.FOOTER.COPYRIGHT' | translate }}</small>
        </div>

        <div class="pf-footer__info">
          <h2>{{ 'ABOUT.FOOTER.CONTACT_TITLE' | translate }}</h2>
          <p><strong>{{ 'ABOUT.FOOTER.HQ_LABEL' | translate }}</strong>{{ 'ABOUT.FOOTER.HQ_VALUE' | translate }}</p>
          <p><strong>{{ 'ABOUT.FOOTER.PHONE_LABEL' | translate }}</strong>{{ 'ABOUT.FOOTER.PHONE_VALUE' | translate }}</p>
          <p><strong>{{ 'ABOUT.FOOTER.EMAIL_LABEL' | translate }}</strong>{{ 'ABOUT.FOOTER.EMAIL_VALUE' | translate }}</p>
          <p><strong>{{ 'ABOUT.FOOTER.HOURS_LABEL' | translate }}</strong>{{ 'ABOUT.FOOTER.HOURS_VALUE' | translate }}</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    :host { display: block; }

    .pf-footer {
      background: #264893;
      color: #fef4df;
      padding: clamp(2.5rem, 4.5vw, 5rem) 0;
    }

    .pf-shell {
      width: min(100%, 120rem);
      margin: 0 auto;
      padding-inline: clamp(2rem, 14.2vw, 18rem);
    }

    .pf-footer__inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: clamp(2rem, 6vw, 8rem);
    }

    @media (max-width: 768px) {
      .pf-footer__inner {
        flex-direction: column;
        align-items: center;
        text-align: center;
      }
      .pf-footer__info {
        padding-left: 0;
        border-left: none;
        border-top: 1px solid rgba(254,244,223,0.25);
        padding-top: clamp(1.5rem, 3vw, 2rem);
        width: 100%;
      }
    }

    .pf-footer__branding {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      text-align: center;
      flex-shrink: 0;
    }

    .pf-footer__logo {
      width: clamp(9rem, 12vw, 14rem);
      height: auto;
      object-fit: contain;
      filter: brightness(0) invert(1);
    }

    .pf-footer__branding p {
      margin: 0.25rem 0 0;
      font-family: 'Afacad', sans-serif;
      font-size: clamp(0.9rem, 1.1vw, 1.15rem);
      font-style: italic;
      line-height: 1.4;
      opacity: 0.9;
    }

    .pf-footer__branding small {
      font-family: 'Afacad', sans-serif;
      font-size: clamp(0.75rem, 0.9vw, 0.95rem);
      opacity: 0.6;
    }

    .pf-footer__info {
      flex-shrink: 0;
      margin-left: auto;
    }

    .pf-footer__info h2 {
      margin: 0 0 clamp(0.75rem, 1.2vw, 1.25rem);
      font-family: 'Afacad', sans-serif;
      font-style: italic;
      font-size: clamp(1.6rem, 2.5vw, 2.75rem);
      font-weight: 700;
      line-height: 1;
    }

    .pf-footer__info p {
      margin: clamp(0.15rem, 0.25vw, 0.3rem) 0 0;
      font-family: 'Afacad', sans-serif;
      font-size: clamp(0.9rem, 1.1vw, 1.25rem);
      line-height: 1.4;
    }

    .pf-footer__info strong { font-weight: 700; }
  `]
})
export class PublicFooterComponent {}
