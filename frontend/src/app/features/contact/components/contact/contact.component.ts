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
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, TranslateModule, ChatWidgetComponent, LanguageSwitcherComponent],
  template: `
    <div [style.height.px]="2066 * scaleFactor" style="width: 100%; overflow: hidden; position: relative; background: white;">
      <div [style.transform]="'scale(' + scaleFactor + ')'" style="position: absolute; top: 0; left: 0; transform-origin: top left; width: 1920px; height: 2066px;">
        <div style="width: 1920px; height: 2066px; position: relative; background: white; overflow: hidden">
          <img style="width: 1920px; height: 1163px; left: 0px; top: -191px; position: absolute" src="assets/pictures/ContactBackground.png" />
          <div style="width: 505px; height: 1920px; left: 0px; top: 505px; position: absolute; transform: rotate(-90deg); transform-origin: top left; background: linear-gradient(270deg, rgba(0, 0, 0, 0.80) 0%, rgba(0, 0, 0, 0) 100%)"></div>
          <div style="width: 1920px; height: 905px; left: 0px; top: 0px; position: absolute; background: linear-gradient(180deg, rgba(254, 244, 223, 0) 0%, #FEF4DF 100%)"></div>
          <div style="width: 1920px; height: 1928px; left: 0px; top: 902px; position: absolute; background: #FEF4DF"></div>
          <div style="width: 1920px; height: 400px; left: 0px; top: 1666px; position: absolute; background: #264893"></div>
          <div style="left: 263px; top: 1916px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column"><span style="color: #FEF4DF; font-size: 28px; font-family: Afacad; font-style: italic; font-weight: 400; word-wrap: break-word">{{ 'ABOUT.FOOTER.TAGLINE' | translate }}<br/></span><span style="color: #FEF4DF; font-size: 20px; font-family: Afacad; font-style: italic; font-weight: 400; word-wrap: break-word"><br/>{{ 'ABOUT.FOOTER.COPYRIGHT' | translate }}</span></div>
          <img style="width: 200px; height: 178px; left: 406px; top: 1725px; position: absolute" src="assets/icons/FooterLogo.png" />
          <div style="width: 684px; height: 209px; left: 1047px; top: 1761px; position: absolute"><span style="color: white; font-size: 40px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word">{{ 'ABOUT.FOOTER.CONTACT_TITLE' | translate }}<br/></span><span style="color: white; font-size: 24px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word"><br/>{{ 'ABOUT.FOOTER.HQ_LABEL' | translate }}</span><span style="color: white; font-size: 24px; font-family: Afacad; font-weight: 400; word-wrap: break-word">{{ 'ABOUT.FOOTER.HQ_VALUE' | translate }}<br/></span><span style="color: white; font-size: 24px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word">{{ 'ABOUT.FOOTER.PHONE_LABEL' | translate }}</span><span style="color: white; font-size: 24px; font-family: Afacad; font-weight: 400; word-wrap: break-word">{{ 'ABOUT.FOOTER.PHONE_VALUE' | translate }}<br/></span><span style="color: white; font-size: 24px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word">{{ 'ABOUT.FOOTER.EMAIL_LABEL' | translate }}</span><span style="color: white; font-size: 24px; font-family: Afacad; font-weight: 400; word-wrap: break-word"> {{ 'ABOUT.FOOTER.EMAIL_VALUE' | translate }}<br/></span><span style="color: white; font-size: 24px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word">{{ 'ABOUT.FOOTER.HOURS_LABEL' | translate }}</span><span style="color: white; font-size: 24px; font-family: Afacad; font-weight: 400; word-wrap: break-word"> {{ 'ABOUT.FOOTER.HOURS_VALUE' | translate }}</span></div>
          <div style="width: 323.54px; height: 79.96px; left: 267px; top: 1190px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 64px; font-family: Afacad; font-weight: 700; word-wrap: break-word">{{ 'CONTACT.CARDS.VISIT.TITLE' | translate }}</div>
          <div style="width: 374px; height: 81px; left: 242px; top: 1310px; position: absolute; text-align: center; color: #264893; font-size: 30px; font-family: Afacad; font-weight: 400; word-wrap: break-word" [innerHTML]="'CONTACT.CARDS.VISIT.VALUE' | translate"></div>
          <div style="width: 70px; height: 70px; left: 394px; top: 1063px; position: absolute;">
            <img style="width: 100%; height: 100%; object-fit: contain" src="assets/icons/Home.png" />
          </div>
          <div style="width: 366px; height: 108px; left: 1282px; top: 1310px; position: absolute; text-align: center; color: #264893; font-size: 30px; font-family: Afacad; font-weight: 400; word-wrap: break-word">{{ 'CONTACT.CARDS.EMAIL.VALUE' | translate }}</div>
          <div style="width: 414px; height: 80px; left: 1258px; top: 1190px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 64px; font-family: Afacad; font-weight: 700; word-wrap: break-word">{{ 'CONTACT.CARDS.EMAIL.TITLE' | translate }}</div>
          <div style="width: 70px; height: 70px; left: 1430px; top: 1063px; position: absolute; overflow: hidden">
            <img style="width: 100%; height: 100%; object-fit: contain" src="assets/icons/Mail.png" />
          </div>
          <div style="width: 288px; height: 108px; left: 816px; top: 1310px; position: absolute; text-align: center; color: #264893; font-size: 30px; font-family: Afacad; font-weight: 400; word-wrap: break-word">{{ 'CONTACT.CARDS.CALL.VALUE' | translate }}</div>
          <div style="width: 323.54px; height: 79.96px; left: 798px; top: 1190px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 64px; font-family: Afacad; font-weight: 700; word-wrap: break-word">{{ 'CONTACT.CARDS.CALL.TITLE' | translate }}</div>
          <div style="width: 70px; height: 70px; left: 925px; top: 1063px; position: absolute; overflow: hidden">
            <img style="width: 100%; height: 100%; object-fit: contain" src="assets/icons/Phone.png" />
          </div>
          <div style="left: 743px; top: 320px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 128px; font-family: Big Shoulders Text; font-weight: 800; word-wrap: break-word">{{ 'CONTACT.HERO.TITLE' | translate }}</div>
          <div style="left: 604px; top: 510px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 48px; font-family: Big Shoulders Text; font-weight: 800; word-wrap: break-word">{{ 'CONTACT.HERO.SUBTITLE' | translate }}</div>
          <div style="width: 1284px; left: 318px; top: 605px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 36px; font-family: Afacad; font-style: italic; font-weight: 400; word-wrap: break-word">{{ 'CONTACT.HERO.TAGLINE' | translate }}</div>
          <img (click)="navigate('/')" style="width: 185px; height: 165px; left: 100px; top: 100px; position: absolute; cursor: pointer;" src="assets/icons/logo.svg" />
          <div style="position: absolute; left: 1067px; top: 108px; display: flex; gap: 60px; align-items: center; height: 53px;">
            <div (click)="navigate('/about')" class="relative cursor-pointer hover:opacity-80 transition-opacity" style="display: flex; align-items: center; justify-content: center; color: white; font-size: 32px; font-family: Afacad; font-weight: 600; white-space: nowrap;">
              {{ 'NAV.HERO.ABOUT' | translate }}
            </div>
            <div (click)="navigate('/guidelines')" class="relative cursor-pointer hover:opacity-80 transition-opacity" style="display: flex; align-items: center; justify-content: center; color: white; font-size: 32px; font-family: Afacad; font-weight: 600; white-space: nowrap;">
              {{ 'NAV.HERO.GUIDELINES' | translate }}
            </div>
            <div (click)="navigate('/contact')" class="relative cursor-pointer" style="display: flex; align-items: center; justify-content: center; color: white; font-size: 32px; font-family: Afacad; font-weight: 600; white-space: nowrap;">
              {{ 'NAV.HERO.CONTACT' | translate }}
              <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 h-[3px] bg-white w-full"></div>
            </div>
          </div>

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
export class ContactComponent implements OnInit {
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