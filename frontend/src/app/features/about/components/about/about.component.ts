import { Component, OnInit, HostListener, inject, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '@core/services/auth.service';
import { ChatWidgetComponent } from '@shared/components/chat-widget/chat-widget.component';
import { LanguageSwitcherComponent } from '@shared/components';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, TranslateModule, ChatWidgetComponent, LanguageSwitcherComponent],
  template: `
    <div [style.height.px]="3277 * scaleFactor" style="width: 100%; overflow: hidden; position: relative; background: white;">
      <div [style.transform]="'scale(' + scaleFactor + ')'" style="position: absolute; top: 0; left: 0; transform-origin: top left; width: 1920px; height: 3277px;">
        <div style="width: 1920px; height: 3277px; position: relative; background: white; overflow: hidden">
          <img style="width: 1992px; height: 1197px; left: -15px; top: -103px; position: absolute" src="assets/pictures/AboutUsBackground.png" />
          <div style="width: 505px; height: 1920px; left: 0px; top: 465px; position: absolute; transform: rotate(-90deg); transform-origin: top left; background: linear-gradient(270deg, rgba(0, 0, 0, 0.80) 0%, rgba(0, 0, 0, 0) 100%)"></div>
          <div style="width: 2085px; height: 720px; left: -91px; top: -40px; position: absolute; background: linear-gradient(180deg, rgba(254, 244, 223, 0) 0%, #FEF4DF 100%)"></div>
          <div style="width: 1954px; height: 3320px; left: -6px; top: 677px; position: absolute; background: #FEF4DF"></div>
          <div style="width: 1920.01px; height: 422px; left: -0.01px; top: 2855px; position: absolute; background: #264893"></div>
          <div style="width: 497.01px; left: 232.99px; top: 3098px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column"><span style="color: #FEF4DF; font-size: 28px; font-family: Afacad; font-style: italic; font-weight: 400; word-wrap: break-word">{{ 'ABOUT.FOOTER.TAGLINE' | translate }}<br/></span><span style="color: #FEF4DF; font-size: 20px; font-family: Afacad; font-style: italic; font-weight: 400; word-wrap: break-word"><br/>{{ 'ABOUT.FOOTER.COPYRIGHT' | translate }}</span></div>
          <img style="width: 202.22px; height: 180.03px; left: 380.37px; top: 2907px; position: absolute" src="assets/icons/FooterLogo.png" />
          <div style="width: 682.58px; height: 209px; left: 1021.38px; top: 2943px; position: absolute"><span style="color: white; font-size: 40px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word">{{ 'ABOUT.FOOTER.CONTACT_TITLE' | translate }}<br/></span><span style="color: white; font-size: 24px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word"><br/>{{ 'ABOUT.FOOTER.HQ_LABEL' | translate }}</span><span style="color: white; font-size: 24px; font-family: Afacad; font-weight: 400; word-wrap: break-word">{{ 'ABOUT.FOOTER.HQ_VALUE' | translate }}<br/></span><span style="color: white; font-size: 24px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word">{{ 'ABOUT.FOOTER.PHONE_LABEL' | translate }}</span><span style="color: white; font-size: 24px; font-family: Afacad; font-weight: 400; word-wrap: break-word">{{ 'ABOUT.FOOTER.PHONE_VALUE' | translate }}<br/></span><span style="color: white; font-size: 24px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word">{{ 'ABOUT.FOOTER.EMAIL_LABEL' | translate }}</span><span style="color: white; font-size: 24px; font-family: Afacad; font-weight: 400; word-wrap: break-word"> {{ 'ABOUT.FOOTER.EMAIL_VALUE' | translate }}<br/></span><span style="color: white; font-size: 24px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word">{{ 'ABOUT.FOOTER.HOURS_LABEL' | translate }}</span><span style="color: white; font-size: 24px; font-family: Afacad; font-weight: 400; word-wrap: break-word"> {{ 'ABOUT.FOOTER.HOURS_VALUE' | translate }}</span></div>
          <div style="width: 322.87px; height: 79.96px; left: 258px; top: 2420.26px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 64px; font-family: Afacad; font-weight: 700; word-wrap: break-word">{{ 'ABOUT.BRANCHES.VALUE' | translate }}</div>
          <div style="width: 400px; height: 44px; left: 219.66px; top: 2506px; position: absolute; text-align: center; color: #264893; font-size: 32px; font-family: Afacad; font-weight: 600; word-wrap: break-word">{{ 'ABOUT.BRANCHES.TITLE' | translate }}</div>
          <div style="width: 287.40px; height: 81px; left: 278.96px; top: 2576px; position: absolute; text-align: justify; color: #264893; font-size: 20px; font-family: Afacad; font-weight: 400; word-wrap: break-word">{{ 'ABOUT.BRANCHES.CARD_DESC' | translate }}</div>
          <div style="width: 69.93px; height: 69.93px; left: 384.70px; top: 2337px; position: absolute;">
            <img style="width: 100%; height: 100%; object-fit: contain" src="assets/icons/Home.png" />
          </div>
          <div style="width: 287.40px; height: 108px; left: 1306.82px; top: 2582px; position: absolute; text-align: justify; color: #264893; font-size: 20px; font-family: Afacad; font-weight: 400; word-wrap: break-word">{{ 'ABOUT.TRANSPARENCY.CARD_DESC' | translate }}</div>
          <div style="width: 427.11px; height: 44px; left: 1233.97px; top: 2516px; position: absolute; text-align: center; color: #264893; font-size: 32px; font-family: Afacad; font-weight: 600; word-wrap: break-word">{{ 'ABOUT.TRANSPARENCY.TITLE' | translate }}</div>
          <div style="width: 322.87px; height: 79.96px; left: 1292.90px; top: 2420px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 64px; font-family: Afacad; font-weight: 700; word-wrap: break-word">{{ 'ABOUT.TRANSPARENCY.VALUE' | translate }}</div>
          <div style="width: 69.85px; height: 70px; left: 1418.59px; top: 2337px; position: absolute; overflow: hidden">
            <img style="width: 100%; height: 100%; object-fit: contain" src="assets/icons/FinancialTransparency.png" />
          </div>
          <div style="width: 287.40px; height: 108px; left: 819.83px; top: 2582px; position: absolute; text-align: justify; color: #264893; font-size: 20px; font-family: Afacad; font-weight: 400; word-wrap: break-word">{{ 'ABOUT.CONFIRMATION.CARD_DESC' | translate }}</div>
          <div style="width: 287.40px; height: 44px; left: 805.86px; top: 2516px; position: absolute; text-align: center; color: #264893; font-size: 32px; font-family: Afacad; font-weight: 600; word-wrap: break-word">{{ 'ABOUT.CONFIRMATION.TITLE' | translate }}</div>
          <div style="width: 322.87px; height: 79.96px; left: 788.18px; top: 2420px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 64px; font-family: Afacad; font-weight: 700; word-wrap: break-word">{{ 'ABOUT.CONFIRMATION.VALUE' | translate }}</div>
          <div style="width: 69.93px; height: 69.93px; left: 914.60px; top: 2337px; position: absolute;">
            <img style="width: 100%; height: 100%; object-fit: contain" src="assets/icons/24Hour.png" />          
          </div>
          <div style="width: 1526.83px; height: 362px; left: 208px; top: 1890px; position: absolute; text-align: center; color: #264893; font-size: 36px; font-family: Afacad; font-style: italic; font-weight: 400; word-wrap: break-word" [innerHTML]="'ABOUT.STORY.INTRO' | translate"></div>
          <div style="width: 417.94px; height: 417.94px; left: 232px; top: 1346.40px; position: absolute; border-radius: 25px; outline: 3px #264893 solid"></div>
          <img style="width: 186.68px; height: 221.97px; left: 347.16px; top: 1173.65px; position: absolute; " src="assets/icons/DedicationMascot.png" />
          <div style="width: 323.20px; height: 79.87px; left: 279.37px; top: 1429.06px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 36px; font-family: Afacad; font-weight: 500; word-wrap: break-word">{{ 'ABOUT.PILLARS.HOM.NAME' | translate }}</div>
          <div style="width: 287.70px; height: 119.88px; left: 296.93px; top: 1536.93px; position: absolute; text-align: justify; color: #264893; font-size: 19px; font-family: Afacad; font-style: italic; font-weight: 400; word-wrap: break-word">{{ 'ABOUT.PILLARS.HOM.DESC' | translate }}</div>
          <div style="width: 417.94px; height: 417.94px; left: 761.55px; top: 1346.04px; position: absolute; border-radius: 25px; outline: 3px #264893 solid"></div>
          <div style="width: 323.20px; height: 79.87px; left: 808.92px; top: 1428.70px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 36px; font-family: Afacad; font-weight: 500; word-wrap: break-word">{{ 'ABOUT.PILLARS.SA.NAME' | translate }}</div>
          <img style="width: 241.47px; height: 270.27px; left: 849.78px; top: 1125px; position: absolute; " src="assets/icons/WarmthMascot.png" />
          <div style="width: 287.70px; height: 119.88px; left: 826.62px; top: 1536.57px; position: absolute; text-align: justify; color: #264893; font-size: 19px; font-family: Afacad; font-style: italic; font-weight: 400; word-wrap: break-word">{{ 'ABOUT.PILLARS.SA.DESC' | translate }}</div>
          <div style="width: 417.94px; height: 417.94px; left: 1266.05px; top: 1346.71px; position: absolute; border-radius: 25px; outline: 3px #264893 solid"></div>
          <div style="width: 323.20px; height: 79.87px; left: 1313.41px; top: 1429.36px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 36px; font-family: Afacad; font-weight: 500; word-wrap: break-word">{{ 'ABOUT.PILLARS.DO.NAME' | translate }}</div>
          <img style="width: 195.97px; height: 209.90px; left: 1376.57px; top: 1186.03px; position: absolute; " src="assets/icons/TransparencyMascot.png" />
          <div style="width: 287.70px; height: 119.88px; left: 1331.35px; top: 1537.24px; position: absolute; text-align: justify; color: #264893; font-size: 19px; font-family: Afacad; font-style: italic; font-weight: 400; word-wrap: break-word">{{ 'ABOUT.PILLARS.DO.DESC' | translate }}</div>
          <div style="width: 689px; left: 631px; top: 320px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 128px; font-family: Big Shoulders Text; font-weight: 800; word-wrap: break-word">{{ 'ABOUT.HERO.TITLE' | translate }}</div>
          <div style="width: 1429px; left: 273px; top: 510px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 48px; font-family: Big Shoulders Text; font-weight: 800; word-wrap: break-word">{{ 'ABOUT.HERO.TAGLINE' | translate }}</div>
          <div style="width: 1281.34px; left: 338.31px; top: 605px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 36px; font-family: Afacad; font-style: italic; font-weight: 400; word-wrap: break-word" [innerHTML]="'ABOUT.HERO.QUOTE' | translate"></div>
          <div style="position: absolute; left: 1067px; top: 108px; display: flex; gap: 60px; align-items: center; height: 53px;">
            <div (click)="navigate('/about')" class="relative cursor-pointer" style="display: flex; align-items: center; justify-content: center; color: white; font-size: 32px; font-family: Afacad; font-weight: 600; white-space: nowrap;">
              {{ 'NAV.HERO.ABOUT' | translate }}
              <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 h-[3px] bg-white w-full"></div>
            </div>
            <div (click)="navigate('/guidelines')" class="relative cursor-pointer hover:opacity-80 transition-opacity" style="display: flex; align-items: center; justify-content: center; color: white; font-size: 32px; font-family: Afacad; font-weight: 600; white-space: nowrap;">
              {{ 'NAV.HERO.GUIDELINES' | translate }}
            </div>
            <div (click)="navigate('/contact')" class="relative cursor-pointer hover:opacity-80 transition-opacity" style="display: flex; align-items: center; justify-content: center; color: white; font-size: 32px; font-family: Afacad; font-weight: 600; white-space: nowrap;">
              {{ 'NAV.HERO.CONTACT' | translate }}
            </div>
          </div>
          <img (click)="navigate('/')" style="width: 184.88px; height: 164.77px; left: 103.77px; top: 100.23px; position: absolute; cursor: pointer;" src="assets/icons/logo.svg" />

          <div style="position: absolute; left: 1620px; top: 95px; z-index: 60;">
            <app-language-switcher tone="dark" size="hero" />
          </div>

          <div class="relative" style="position: absolute; left: 1710px; top: 95px; z-index: 60;">
            <button type="button" (click)="toggleUserMenu()" class="inline-flex h-[75px] w-[75px] items-center justify-center rounded-full transition hover:opacity-85">
              <img src="assets/icons/account.svg" aria-hidden="true" class="h-full w-full object-contain">
            </button>
            <div *ngIf="isUserMenuOpen" class="absolute right-0 top-[calc(100%+0.5rem)] w-48 overflow-hidden rounded-[10px] border border-slate-950/[0.08] bg-white shadow-xl z-[60] font-['Afacad']">
              <ng-container *ngIf="isAuthenticated">
                <button (click)="navigate('/profile')" class="w-full text-center px-4 py-2.5 text-[1.1rem] font-semibold hover:bg-slate-50 text-slate-700">{{ 'COMMON.PROFILE' | translate }}</button>
                <button (click)="navigate('/bookings')" class="w-full text-center px-4 py-2.5 text-[1.1rem] font-semibold hover:bg-slate-50 text-slate-700">{{ 'NAV.PUBLIC.BOOKINGS' | translate }}</button>
                <div class="h-px bg-slate-100"></div>
                <button (click)="logout()" class="w-full text-center px-4 py-2.5 text-[1.1rem] font-semibold hover:bg-red-50 text-red-600">{{ 'COMMON.LOGOUT' | translate }}</button>
              </ng-container>
              <ng-container *ngIf="!isAuthenticated">
                <button (click)="navigate('/login')" class="w-full text-center px-4 py-2.5 text-[1.1rem] font-semibold hover:bg-slate-50 text-slate-700">{{ 'AUTH.LOG_IN' | translate }}</button>
                <button (click)="navigate('/register')" class="w-full text-center px-4 py-2.5 text-[1.1rem] font-semibold hover:bg-slate-50 text-slate-700">{{ 'AUTH.SIGN_UP' | translate }}</button>
              </ng-container>
            </div>
          </div>
        </div>
      </div>
    </div>

    <app-chat-widget />
  `
})
export class AboutComponent implements OnInit {
  scaleFactor = 1;
  isUserMenuOpen = false;
  isAuthenticated = false;

  private router = inject(Router);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  @HostListener('window:resize')
  onResize() {
    this.scaleFactor = window.innerWidth / 1920;
  }

  ngOnInit(): void {
    this.onResize();
    this.authService.currentUser$.pipe(
      map(u => !!u),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(v => {
      this.isAuthenticated = v;
      this.cdr.detectChanges();
    });
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
    this.cdr.detectChanges();
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.isUserMenuOpen = false;
      this.router.navigate(['/login']);
    });
  }
}