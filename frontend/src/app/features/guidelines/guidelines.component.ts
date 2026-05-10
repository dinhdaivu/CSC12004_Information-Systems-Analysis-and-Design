import { Component, OnInit, HostListener, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-guidelines',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div [style.height.px]="3564 * scaleFactor" style="width: 100%; overflow: hidden; position: relative; background: white;">
      <div [style.transform]="'scale(' + scaleFactor + ')'" style="position: absolute; top: 0; left: 0; transform-origin: top left; width: 1920px; height: 3564px;">
        <div style="width: 1920px; height: 3564px; position: relative; background: white; overflow: hidden">
          <img style="width: 1920px; height: 1343.65px; left: 0px; top: -186px; position: absolute" src="assets/pictures/GuidelinesBackground.png" />
          <div style="width: 583.44px; height: 1920px; left: 0px; top: 583.44px; position: absolute; transform: rotate(-90deg); transform-origin: top left; background: linear-gradient(270deg, rgba(0, 0, 0, 0.80) 0%, rgba(0, 0, 0, 0) 100%)"></div>
          <div style="width: 1920px; height: 942px; left: 0px; top: 0px; position: absolute; background: linear-gradient(180deg, rgba(254, 244, 223, 0) 0%, #FEF4DF 100%)"></div>
          <div style="width: 1920px; height: 3561px; left: 0px; top: 939px; position: absolute; background: #FEF4DF"></div>
          <div style="width: 132px; height: 132px; left: 1689px; top: 3008px; position: absolute; background: #264893; border-radius: 9999px"></div>
          <div style="width: 90px; height: 90px; left: 1710px; top: 3029px; position: absolute; overflow: hidden; display: flex; justify-content: center; align-items: center; cursor: pointer;">
            <img style="width: 100%; height: 100%; object-fit: contain" src="assets/icons/Chat.png" />
          </div>
          <div style="width: 1924px; height: 400px; left: -4px; top: 3164px; position: absolute; background: #264893"></div>
          <div style="width: 487.01px; left: 259.55px; top: 3414px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column"><span style="color: #FEF4DF; font-size: 28px; font-family: Afacad; font-style: italic; font-weight: 400; word-wrap: break-word">{{ 'ABOUT.FOOTER.TAGLINE' | translate }}<br/></span><span style="color: #FEF4DF; font-size: 20px; font-family: Afacad; font-style: italic; font-weight: 400; word-wrap: break-word"><br/>{{ 'ABOUT.FOOTER.COPYRIGHT' | translate }}</span></div>
          <img style="width: 200.18px; height: 178.21px; left: 402.95px; top: 3223px; position: absolute" src="assets/icons/FooterLogo.png" />
          <div style="width: 685.42px; height: 209px; left: 1045.18px; top: 3259px; position: absolute"><span style="color: white; font-size: 40px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word">{{ 'ABOUT.FOOTER.CONTACT_TITLE' | translate }}<br/></span><span style="color: white; font-size: 24px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word"><br/>{{ 'ABOUT.FOOTER.HQ_LABEL' | translate }}</span><span style="color: white; font-size: 24px; font-family: Afacad; font-weight: 400; word-wrap: break-word">{{ 'ABOUT.FOOTER.HQ_VALUE' | translate }}<br/></span><span style="color: white; font-size: 24px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word">{{ 'ABOUT.FOOTER.PHONE_LABEL' | translate }}</span><span style="color: white; font-size: 24px; font-family: Afacad; font-weight: 400; word-wrap: break-word">{{ 'ABOUT.FOOTER.PHONE_VALUE' | translate }}<br/></span><span style="color: white; font-size: 24px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word">{{ 'ABOUT.FOOTER.EMAIL_LABEL' | translate }}</span><span style="color: white; font-size: 24px; font-family: Afacad; font-weight: 400; word-wrap: break-word"> {{ 'ABOUT.FOOTER.EMAIL_VALUE' | translate }}<br/></span><span style="color: white; font-size: 24px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word">{{ 'ABOUT.FOOTER.HOURS_LABEL' | translate }}</span><span style="color: white; font-size: 24px; font-family: Afacad; font-weight: 400; word-wrap: break-word"> {{ 'ABOUT.FOOTER.HOURS_VALUE' | translate }}</span></div>
          
          <div style="width: 1532px; left: 194px; top: 1158px; position: absolute; text-align: justify; justify-content: center; display: flex; flex-direction: column">
            <span style="color: #264893; font-size: 48px; font-family: Afacad; font-weight: 700; word-wrap: break-word">{{ 'GUIDELINES.STEPS.STEP1.TITLE' | translate }}<br/></span>
            <span style="color: #264893; font-size: 36px; font-family: Afacad; font-weight: 400; word-wrap: break-word">
              <b>{{ 'GUIDELINES.STEPS.STEP1.ITEM1_LABEL' | translate }}</b> {{ 'GUIDELINES.STEPS.STEP1.ITEM1_DESC' | translate }}<br/>
              <b>{{ 'GUIDELINES.STEPS.STEP1.ITEM2_LABEL' | translate }}</b> {{ 'GUIDELINES.STEPS.STEP1.ITEM2_DESC' | translate }}<br/>
              <b>{{ 'GUIDELINES.STEPS.STEP1.ITEM3_LABEL' | translate }}</b> {{ 'GUIDELINES.STEPS.STEP1.ITEM3_DESC' | translate }}<br/>
            </span>
            <span style="color: #264893; font-size: 36px; font-family: Afacad; font-weight: 400; word-wrap: break-word"><br/></span>
            <span style="color: #264893; font-size: 48px; font-family: Afacad; font-weight: 700; word-wrap: break-word">{{ 'GUIDELINES.STEPS.STEP2.TITLE' | translate }}<br/></span>
            <span style="color: #264893; font-size: 36px; font-family: Afacad; font-weight: 400; word-wrap: break-word">
              <b>{{ 'GUIDELINES.STEPS.STEP2.ITEM1_LABEL' | translate }}</b> {{ 'GUIDELINES.STEPS.STEP2.ITEM1_DESC' | translate }}<br/>
              <b>{{ 'GUIDELINES.STEPS.STEP2.ITEM2_LABEL' | translate }}</b> {{ 'GUIDELINES.STEPS.STEP2.ITEM2_DESC' | translate }}<br/>
              <b>{{ 'GUIDELINES.STEPS.STEP2.ITEM3_LABEL' | translate }}</b> {{ 'GUIDELINES.STEPS.STEP2.ITEM3_DESC' | translate }}<br/>
            </span>
            <span style="color: #264893; font-size: 36px; font-family: Afacad; font-weight: 400; word-wrap: break-word"><br/></span>
            <span style="color: #264893; font-size: 48px; font-family: Afacad; font-weight: 700; word-wrap: break-word">{{ 'GUIDELINES.STEPS.STEP3.TITLE' | translate }}<br/></span>
            <span style="color: #264893; font-size: 36px; font-family: Afacad; font-weight: 400; word-wrap: break-word">
              <b>{{ 'GUIDELINES.STEPS.STEP3.ITEM1_LABEL' | translate }}</b> {{ 'GUIDELINES.STEPS.STEP3.ITEM1_DESC' | translate }}<br/>
              <b>{{ 'GUIDELINES.STEPS.STEP3.ITEM2_LABEL' | translate }}</b> {{ 'GUIDELINES.STEPS.STEP3.ITEM2_DESC' | translate }}<br/>
              <b>{{ 'GUIDELINES.STEPS.STEP3.ITEM3_LABEL' | translate }}</b> {{ 'GUIDELINES.STEPS.STEP3.ITEM3_DESC' | translate }}<br/>
            </span>
            <span style="color: #264893; font-size: 36px; font-family: Afacad; font-weight: 400; word-wrap: break-word"><br/></span>
            <span style="color: #264893; font-size: 48px; font-family: Afacad; font-weight: 700; word-wrap: break-word">{{ 'GUIDELINES.STEPS.STEP4.TITLE' | translate }}<br/></span>
            <span style="color: #264893; font-size: 36px; font-family: Afacad; font-weight: 400; word-wrap: break-word">
              <b>{{ 'GUIDELINES.STEPS.STEP4.ITEM1_LABEL' | translate }}</b> {{ 'GUIDELINES.STEPS.STEP4.ITEM1_DESC' | translate }}<br/>
              <b>{{ 'GUIDELINES.STEPS.STEP4.ITEM2_LABEL' | translate }}</b> {{ 'GUIDELINES.STEPS.STEP4.ITEM2_DESC' | translate }}<br/>
              <b>{{ 'GUIDELINES.STEPS.STEP4.ITEM3_LABEL' | translate }}</b> {{ 'GUIDELINES.STEPS.STEP4.ITEM3_DESC' | translate }}<br/>
            </span>
            <span style="color: #264893; font-size: 36px; font-family: Afacad; font-weight: 400; word-wrap: break-word; padding-left: 2em;">
              {{ 'GUIDELINES.STEPS.STEP4.ITEM3_SUB1' | translate }}<br/>
              {{ 'GUIDELINES.STEPS.STEP4.ITEM3_SUB2' | translate }}<br/>
              {{ 'GUIDELINES.STEPS.STEP4.ITEM3_SUB3' | translate }}<br/>
              {{ 'GUIDELINES.STEPS.STEP4.ITEM3_SUB4' | translate }}<br/>
            </span>
            <span style="color: #264893; font-size: 36px; font-family: Afacad; font-weight: 400; word-wrap: break-word">
              <b>{{ 'GUIDELINES.STEPS.STEP4.ITEM4_LABEL' | translate }}</b> {{ 'GUIDELINES.STEPS.STEP4.ITEM4_DESC' | translate }}
            </span>
          </div>

          <div style="left: 683px; top: 520px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 128px; font-family: Big Shoulders Text; font-weight: 800; word-wrap: break-word">{{ 'GUIDELINES.HERO.TITLE' | translate }}</div>
          <div style="left: 747px; top: 710px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 48px; font-family: Big Shoulders Text; font-weight: 800; word-wrap: break-word">{{ 'GUIDELINES.HERO.SUBTITLE' | translate }}</div>
          <div style="width: 1318px; left: 301px; top: 781px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 36px; font-family: Afacad; font-style: italic; font-weight: 400; word-wrap: break-word">{{ 'GUIDELINES.HERO.TAGLINE' | translate }}</div>
          
          <img (click)="navigate('/')" style="width: 185px; height: 165px; left: 100px; top: 100px; position: absolute; cursor: pointer;" src="assets/icons/logo.svg" />
          <div (click)="navigate('/guidelines')" style="width: 151.68px; height: 53px; left: 1239.41px; top: 108px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: white; font-size: 32px; font-family: Afacad; font-weight: 600; word-wrap: break-word; cursor: pointer;">{{ 'NAV.HERO.GUIDELINES' | translate }}</div>
          <div (click)="navigate('/about')" style="width: 180.74px; height: 53px; left: 1067.76px; top: 110px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: white; font-size: 32px; font-family: Afacad; font-weight: 600; word-wrap: break-word; cursor: pointer;">{{ 'NAV.HERO.ABOUT' | translate }}</div>
          <div (click)="navigate('/contact')" style="width: 134.72px; height: 53px; left: 1432.01px; top: 108px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: white; font-size: 32px; font-family: Afacad; font-weight: 600; word-wrap: break-word; cursor: pointer;">{{ 'NAV.HERO.CONTACT' | translate }}</div>
          <div style="width: 136px; height: 0px; left: 1238px; top: 163px; position: absolute; outline: 3px white solid; outline-offset: -1.50px"></div>

          <div class="relative" style="position: absolute; left: 1620px; top: 95px; z-index: 60;">
            <button type="button" (click)="toggleLangMenu()" class="inline-flex h-[75px] w-[75px] items-center justify-center rounded-full transition hover:opacity-85">
              <img src="assets/icons/language.svg" class="h-full w-full object-contain" alt="Language">
            </button>
            <div *ngIf="isLangMenuOpen" class="absolute right-0 top-[calc(100%+0.5rem)] w-40 overflow-hidden rounded-[10px] border border-slate-950/[0.08] bg-white shadow-xl z-[60] font-['Afacad']">
              <button (click)="changeLang('vi')" class="w-full text-left px-4 py-2.5 text-[1.1rem] font-semibold hover:bg-slate-50 text-slate-700">Tiếng Việt</button>
              <div class="h-px bg-slate-100"></div>
              <button (click)="changeLang('en')" class="w-full text-left px-4 py-2.5 text-[1.1rem] font-semibold hover:bg-slate-50 text-slate-700">English</button>
            </div>
          </div>

          <div class="relative" style="position: absolute; left: 1710px; top: 95px; z-index: 60;">
            <button type="button" (click)="toggleUserMenu()" class="inline-flex h-[75px] w-[75px] items-center justify-center rounded-full transition hover:opacity-85">
              <img src="assets/icons/account.svg" aria-hidden="true" class="h-full w-full object-contain">
            </button>
            <div *ngIf="isUserMenuOpen" class="absolute right-0 top-[calc(100%+0.5rem)] w-48 overflow-hidden rounded-[10px] border border-slate-950/[0.08] bg-white shadow-xl z-[60] font-['Afacad']">
              <ng-container *ngIf="isAuthenticated">
                <button (click)="navigate('/profile')" class="w-full text-left px-4 py-2.5 text-[1.1rem] font-semibold hover:bg-slate-50 text-slate-700">{{ 'COMMON.PROFILE' | translate }}</button>
                <button (click)="navigate('/bookings')" class="w-full text-left px-4 py-2.5 text-[1.1rem] font-semibold hover:bg-slate-50 text-slate-700">{{ 'NAV.PUBLIC.BOOKINGS' | translate }}</button>
                <div class="h-px bg-slate-100"></div>
                <button (click)="logout()" class="w-full text-left px-4 py-2.5 text-[1.1rem] font-semibold hover:bg-red-50 text-red-600">{{ 'COMMON.LOGOUT' | translate }}</button>
              </ng-container>
              <ng-container *ngIf="!isAuthenticated">
                <button (click)="navigate('/login')" class="w-full text-left px-4 py-2.5 text-[1.1rem] font-semibold hover:bg-slate-50 text-slate-700">{{ 'AUTH.LOG_IN' | translate }}</button>
                <button (click)="navigate('/register')" class="w-full text-left px-4 py-2.5 text-[1.1rem] font-semibold hover:bg-slate-50 text-slate-700">{{ 'AUTH.SIGN_UP' | translate }}</button>
              </ng-container>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class GuidelinesComponent implements OnInit {
  scaleFactor = 1;
  isLangMenuOpen = false;
  isUserMenuOpen = false;
  isAuthenticated = false;

  private router = inject(Router);
  private translate = inject(TranslateService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  @HostListener('window:resize')
  onResize() {
    this.scaleFactor = window.innerWidth / 1920;
  }

  ngOnInit(): void {
    this.onResize();
    this.isAuthenticated = this.authService.isAuthenticated();
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }

  toggleLangMenu() {
    this.isLangMenuOpen = !this.isLangMenuOpen;
    this.isUserMenuOpen = false;
    this.cdr.detectChanges();
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
    this.isLangMenuOpen = false;
    this.cdr.detectChanges();
  }

  changeLang(lang: string) {
    this.translate.use(lang);
    this.isLangMenuOpen = false;
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.isAuthenticated = false;
      this.isUserMenuOpen = false;
      this.router.navigate(['/login']);
    });
  }
}