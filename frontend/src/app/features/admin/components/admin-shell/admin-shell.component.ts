import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit, inject } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '@core/services/auth.service';
import { Subject } from 'rxjs';
import { LanguageSwitcherComponent } from '@shared/components';
import { filter, takeUntil } from 'rxjs/operators';

type NavItem = {
  path: string;
  labelKey: string;
  textTop: number;
  textLeft: number;
  textWidth: number;
  inactiveIcon: string;
  activeIcon: string;
  iconTop: number;
  iconLeft: number;
  iconWidth: number;
  iconHeight: number;
};

const UNION_MAP: [string, string][] = [
  ['/admin/rental-requests', 'RentalUnion.png'],
  ['/admin/scheduled', 'UnionSchedule.png'],
  ['/admin/rooms', 'RoomsUnion.png'],
  ['/admin/payments', 'ReservationUnion.png'],
  ['/admin/contracts', 'ContractUnion.png'],
  ['/admin/users', 'UsersUnion.png'],
  ['/admin/checkout-requests', 'CheckoutUnion.png'],
  ['/admin/handovers', 'HandoverUnion.png'],
  ['/admin/chat', 'ChatUnion.png'],
];

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, LanguageSwitcherComponent],
  styles: [`
    .hover-effect { transition: all 0.2s ease-in-out; cursor: pointer; }
    .hover-effect:hover { opacity: 0.9; }
  `],
  template: `
    <div
      [style.height.px]="1080 * scaleFactor"
      style="width: 100%; overflow: hidden; position: relative; background: #FEF4DF;"
    >
      <div
        [style.transform]="'scale(' + scaleFactor + ')'"
        style="position: absolute; top: 0; left: 0; transform-origin: top left; width: 1920px; height: 1080px;"
      >
        <div style="width: 1920px; height: 1080px; position: relative; background: #FEF4DF; overflow: hidden">
          <div style="width: 1920px; height: 644px; left: 0px; top: -5px; position: absolute; background: #503D2E"></div>
          <img style="width: 1133px; height: 638px; left: 552px; top: 0px; position: absolute;" src="assets/pictures/Background.png" />
          <div style="width: 2000px; height: 622px; left: -40px; top: -226px; position: absolute; background: linear-gradient(180deg, rgba(254, 244, 223, 0.10) 0%, #FEF4DF 100%)"></div>
          <div style="width: 1920px; height: 698px; left: 0px; top: 393px; position: absolute; background: #FEF4DF"></div>

          <router-outlet></router-outlet>

          <img [src]="'assets/pictures/' + unionImage" style="width: 405px; height: 1080px; left: 0px; top: 0px; position: absolute;" />
          <img (click)="navigate('/')" class="hover-effect" style="width: 185px; height: 165px; left: 107px; top: 81px; position: absolute; cursor: pointer;" src="assets/icons/BookingLogo.png" />

          <ng-container *ngFor="let item of navItems">
            <div
              (click)="navigate(item.path)"
              class="hover-effect"
              [style.width.px]="item.textWidth"
              [style.top.px]="item.textTop"
              [style.left.px]="item.textLeft"
              [style.color]="isNavActive(item.path) ? '#264893' : '#FEF4DF'"
              [style.fontWeight]="isNavActive(item.path) ? 700 : 500"
              style="height: 46px; position: absolute; justify-content: center; display: flex; flex-direction: column; font-size: 28px; font-family: Afacad; word-wrap: break-word; cursor: pointer;"
            >{{ item.labelKey | translate }}</div>
            <img
              (click)="navigate(item.path)"
              class="hover-effect"
              [src]="'assets/icons/' + (isNavActive(item.path) ? item.activeIcon : item.inactiveIcon)"
              [style.width.px]="item.iconWidth"
              [style.height.px]="item.iconHeight"
              [style.top.px]="item.iconTop"
              [style.left.px]="item.iconLeft"
              style="position: absolute; cursor: pointer;"
            />
          </ng-container>

          <div (click)="navigate('/about')" class="hover-effect" style="width: 126px; height: 53px; left: 1071px; top: 110px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 32px; font-family: Afacad; font-weight: 600; word-wrap: break-word; cursor: pointer;">
            {{ 'COMMON.ABOUT_US' | translate }}
          </div>
          <div (click)="navigate('/guidelines')" class="hover-effect" style="width: 152px; height: 53px; left: 1238px; top: 110px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 32px; font-family: Afacad; font-weight: 600; word-wrap: break-word; cursor: pointer;">
            {{ 'COMMON.GUIDELINES' | translate }}
          </div>
          <div (click)="navigate('/contact')" class="hover-effect" style="width: 135px; height: 53px; left: 1431px; top: 110px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 32px; font-family: Afacad; font-weight: 600; word-wrap: break-word; cursor: pointer;">
            {{ 'COMMON.CONTACT' | translate }}
          </div>

          <div style="position: absolute; left: 1620px; top: 95px; z-index: 50;">
            <app-language-switcher tone="dark" size="hero" />
          </div>

          <img (click)="toggleUserMenu()" class="hover-effect" style="width: 70px; height: 70px; left: 1750px; top: 100px; position: absolute; cursor: pointer; z-index: 50;" src="assets/icons/Account.png" />
          <div *ngIf="isUserMenuOpen" style="position: absolute; left: 1680px; top: 180px; width: 150px; background: white; border-radius: 15px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); display: flex; flex-direction: column; padding: 8px 0; z-index: 100;">
            <div (mousedown)="logout()" class="hover-effect" style="padding: 8px 16px; font-family: Afacad; font-style: italic; color: #264893; font-size: 24px; cursor: pointer;">{{ 'COMMON.LOGOUT' | translate }}</div>
          </div>

          <div style="width: 400px; height: 209px; left: 0px; top: 870px; position: absolute; text-align: center">
            <span style="color: white; font-size: 24px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word">{{ 'CONTACT_INFO.TITLE' | translate }}<br /><br/></span>
            <span style="color: white; font-size: 15px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word">{{ 'CONTACT_INFO.HEADQUARTERS' | translate }} </span>
            <span style="color: white; font-size: 15px; font-family: Afacad; font-weight: 400; word-wrap: break-word">{{ 'CONTACT_INFO.ADDRESS_1' | translate }}<br />{{ 'CONTACT_INFO.ADDRESS_2' | translate }}<br/></span>
            <span style="color: white; font-size: 15px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word">{{ 'CONTACT_INFO.PHONE_LABEL' | translate }} </span>
            <span style="color: white; font-size: 15px; font-family: Afacad; font-weight: 400; word-wrap: break-word">{{ 'CONTACT_INFO.PHONE' | translate }}<br/></span>
            <span style="color: white; font-size: 15px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word">{{ 'CONTACT_INFO.EMAIL_LABEL' | translate }}</span>
            <span style="color: white; font-size: 15px; font-family: Afacad; font-weight: 400; word-wrap: break-word">{{ 'CONTACT_INFO.EMAIL' | translate }}<br/></span>
            <span style="color: white; font-size: 15px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word">{{ 'CONTACT_INFO.HOURS_LABEL' | translate }}</span>
            <span style="color: white; font-size: 15px; font-family: Afacad; font-weight: 400; word-wrap: break-word">{{ 'CONTACT_INFO.HOURS' | translate }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AdminShellComponent implements OnInit, OnDestroy {
  scaleFactor = 1;
  isUserMenuOpen = false;
  currentUrl = '';

  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly destroy$ = new Subject<void>();

  readonly navItems: NavItem[] = [
    { path: '/admin/rental-requests', labelKey: 'ADMIN_RENTAL.SIDEBAR.INQUIRIES', textTop: 320, textLeft: 166, textWidth: 196, inactiveIcon: 'WhiteInquiries.png', activeIcon: 'Inquiries.png', iconTop: 331, iconLeft: 110, iconWidth: 28, iconHeight: 25 },
    { path: '/admin/scheduled', labelKey: 'ADMIN_RENTAL.SIDEBAR.SCHEDULES', textTop: 380, textLeft: 166, textWidth: 160, inactiveIcon: 'Schedules.png', activeIcon: 'BlueSchedule.png', iconTop: 390, iconLeft: 107, iconWidth: 34, iconHeight: 30 },
    { path: '/admin/rooms', labelKey: 'ADMIN_RENTAL.SIDEBAR.ROOMS', textTop: 440, textLeft: 161, textWidth: 195, inactiveIcon: 'Rooms.png', activeIcon: 'BlueRooms.png', iconTop: 450, iconLeft: 107, iconWidth: 30, iconHeight: 27 },
    { path: '/admin/payments', labelKey: 'ADMIN_RENTAL.SIDEBAR.RESERVATIONS', textTop: 500, textLeft: 166, textWidth: 175, inactiveIcon: 'Reservation.png', activeIcon: 'BlueReservation.png', iconTop: 510, iconLeft: 107, iconWidth: 26, iconHeight: 26 },
    { path: '/admin/contracts', labelKey: 'ADMIN_RENTAL.SIDEBAR.CONTRACTS', textTop: 560, textLeft: 166, textWidth: 175, inactiveIcon: 'Contracts.png', activeIcon: 'BlueContracts.png', iconTop: 570, iconLeft: 107, iconWidth: 30, iconHeight: 30 },
    { path: '/admin/users', labelKey: 'ADMIN_RENTAL.SIDEBAR.USERS', textTop: 620, textLeft: 163, textWidth: 168, inactiveIcon: 'Users.png', activeIcon: 'BlueUsers.png', iconTop: 630, iconLeft: 107, iconWidth: 30, iconHeight: 30 },
    { path: '/admin/checkout-requests', labelKey: 'ADMIN_RENTAL.SIDEBAR.CHECKOUTS', textTop: 680, textLeft: 163, textWidth: 200, inactiveIcon: 'Checkout.png', activeIcon: 'BlueCheckout.png', iconTop: 690, iconLeft: 107, iconWidth: 30, iconHeight: 30 },
    { path: '/admin/handovers', labelKey: 'ADMIN_RENTAL.SIDEBAR.HANDOVERS', textTop: 740, textLeft: 166, textWidth: 175, inactiveIcon: 'Handover.png', activeIcon: 'BlueHandover.png', iconTop: 750, iconLeft: 107, iconWidth: 30, iconHeight: 30 },
    { path: '/admin/chat', labelKey: 'ADMIN_RENTAL.SIDEBAR.CHAT', textTop: 800, textLeft: 163, textWidth: 168, inactiveIcon: 'Chat.png', activeIcon: 'Chat.png', iconTop: 810, iconLeft: 110, iconWidth: 28, iconHeight: 28 },
  ];

  constructor() {
    this.updateScaleFactor();
  }

  get unionImage(): string {
    const entry = UNION_MAP.find(([key]) => this.currentUrl.startsWith(key));
    return entry ? entry[1] : 'RentalUnion.png';
  }

  isNavActive(path: string): boolean {
    return this.currentUrl.startsWith(path);
  }

  ngOnInit(): void {
    this.currentUrl = this.router.url;
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntil(this.destroy$),
      )
      .subscribe((e) => {
        this.currentUrl = (e as NavigationEnd).urlAfterRedirects;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateScaleFactor();
  }

  private updateScaleFactor(): void {
    this.scaleFactor = Math.min(window.innerWidth / 1920, 1);
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  navigate(path: string): void {
    this.router.navigate([path]);
    this.isUserMenuOpen = false;
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}
