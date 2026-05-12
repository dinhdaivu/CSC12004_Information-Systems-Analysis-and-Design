import { Component, ElementRef, HostListener, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AuthService } from '@core/services/auth.service';
import { TranslateService } from '@ngx-translate/core';

interface SidebarItem {
  segment: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-accountant-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div [style.height.px]="1080 * sf" style="width:100%;overflow:hidden;position:relative;background:#FEF4DF;">
      <div [style.transform]="'scale('+sf+')'" style="position:absolute;top:0;left:0;transform-origin:top left;width:1920px;height:1080px;">
        <div style="width:1920px;height:1080px;position:relative;background:#FEF4DF;overflow:hidden;">

          <!-- Background: dark brown top banner -->
          <div style="position:absolute;width:1920px;height:644px;left:0;top:-5px;background:#503D2E;"></div>
          <!-- Background: poster image -->
          <img src="assets/pictures/Background.png"
               style="position:absolute;width:1133px;height:638px;left:552px;top:0;object-fit:cover;" alt="" />
          <!-- Background: gradient fade -->
          <div style="position:absolute;width:2000px;height:619px;left:-40px;top:-226px;
                      background:linear-gradient(180.4deg, rgba(254,244,223,0.10) -70.82%, #FEF4DF 99.65%);"></div>
          <!-- Background: bottom cream fill -->
          <div style="position:absolute;width:1920px;height:698px;left:0;top:393px;background:#FEF4DF;"></div>

          <!-- Sidebar: blue bar (Union shape via clipped rectangles) -->
          <div style="position:absolute;width:500px;height:1212px;left:-100px;top:-69px;
                      background:#264893;border-radius:30px;"></div>
          <div style="position:absolute;width:500px;height:400px;left:-100px;top:-69px;background:#264893;"></div>
          <div style="position:absolute;width:500px;height:750px;left:-100px;top:393px;background:#264893;"></div>
          <div style="position:absolute;width:184px;height:70px;left:-100px;top:331px;background:#264893;"></div>

          <!-- Logo -->
          <img (click)="go('/')" src="assets/icons/FooterLogo.png"
               style="position:absolute;width:185px;height:165px;left:107px;top:81px;
                      object-fit:contain;cursor:pointer;z-index:50;" alt="Logo" />
          <!-- Brand name under logo -->
          <div style="position:absolute;left:0;width:400px;top:253px;
                      text-align:center;color:white;font-size:22px;
                      font-family:'Big Shoulders Text',sans-serif;font-weight:900;
                      letter-spacing:3px;z-index:50;">HOMESTAY DORM</div>

          <!-- ─── TOP NAVIGATION BAR ─── -->
          <div (click)="go('/about')"
               style="position:absolute;width:126px;height:53px;left:1071px;top:110px;
                      display:flex;align-items:center;color:#264893;font-size:32px;
                      font-family:Afacad;font-weight:600;cursor:pointer;z-index:50;">About Us</div>
          <div (click)="go('/guidelines')"
               style="position:absolute;width:152px;height:53px;left:1238px;top:110px;
                      display:flex;align-items:center;color:#264893;font-size:32px;
                      font-family:Afacad;font-weight:600;cursor:pointer;z-index:50;">Guidelines</div>
          <div (click)="go('/contact')"
               style="position:absolute;width:135px;height:53px;left:1431px;top:110px;
                      display:flex;align-items:center;color:#264893;font-size:32px;
                      font-family:Afacad;font-weight:600;cursor:pointer;z-index:50;">Contact</div>

          <!-- ─── ICONS ROW (Globe + Account) — grouped, tight spacing ─── -->
          <div style="position:absolute;left:1600px;top:95px;z-index:200;
                      display:flex;align-items:center;gap:16px;">

            <!-- Globe / Language toggle -->
            <div style="position:relative;">
              <button type="button"
                (click)="toggleLangMenu()"
                aria-label="Switch language"
                style="width:50px;height:50px;border:0;border-radius:50%;
                       background:transparent;cursor:pointer;display:flex;align-items:center;
                       justify-content:center;transition:opacity 0.2s;"
                onmouseenter="this.style.opacity='0.82'"
                onmouseleave="this.style.opacity='1'">
                <img src="assets/icons/Globe.png" aria-hidden="true"
                     style="width:100%;height:100%;object-fit:contain;" />
              </button>

              <!-- Language dropdown -->
              <div *ngIf="isLangMenuOpen"
                   style="position:absolute;right:0;top:calc(100% + 10px);width:140px;
                          overflow:hidden;border-radius:10px;
                          border:1px solid rgba(15,23,42,0.08);
                          background:white;
                          box-shadow:0 8px 24px rgba(15,23,42,0.13);
                          font-family:Afacad,sans-serif;">
                <button type="button" (click)="setLang('en')"
                        style="width:100%;border:0;background:transparent;padding:10px;
                               font-size:1rem;text-align:center;cursor:pointer;
                               font-family:Afacad,sans-serif;transition:background 0.15s;"
                        [style.color]="currentLang==='en' ? '#264893' : '#1d1d1d'"
                        [style.font-weight]="currentLang==='en' ? '700' : '400'"
                        onmouseenter="this.style.background='rgba(38,72,147,0.05)'"
                        onmouseleave="this.style.background='transparent'">
                  English
                </button>
                <div style="height:1px;background:rgba(15,23,42,0.06);"></div>
                <button type="button" (click)="setLang('vi')"
                        style="width:100%;border:0;background:transparent;padding:10px;
                               font-size:1rem;text-align:center;cursor:pointer;
                               font-family:Afacad,sans-serif;transition:background 0.15s;"
                        [style.color]="currentLang==='vi' ? '#264893' : '#1d1d1d'"
                        [style.font-weight]="currentLang==='vi' ? '700' : '400'"
                        onmouseenter="this.style.background='rgba(38,72,147,0.05)'"
                        onmouseleave="this.style.background='transparent'">
                  Tiếng Việt
                </button>
              </div>
            </div>

            <!-- Account icon + dropdown -->
            <div style="position:relative;">
              <button type="button"
                (click)="toggleUserMenu()"
                aria-label="Open user menu"
                style="width:50px;height:50px;border:0;border-radius:50%;
                       background:transparent;cursor:pointer;display:flex;align-items:center;
                       justify-content:center;transition:opacity 0.2s;"
                onmouseenter="this.style.opacity='0.82'"
                onmouseleave="this.style.opacity='1'">
                <img src="assets/icons/account.svg" aria-hidden="true"
                     style="width:100%;height:100%;object-fit:contain;" />
              </button>

              <!-- Dropdown menu -->
              <div *ngIf="isUserMenuOpen"
                   style="position:absolute;right:0;top:calc(100% + 10px);width:152px;
                          overflow:hidden;border-radius:10px;
                          border:1px solid rgba(15,23,42,0.08);
                          background:white;
                          box-shadow:0 8px 24px rgba(15,23,42,0.13);
                          font-family:Afacad,sans-serif;">
                <button type="button" (click)="goProfile()"
                        style="width:100%;border:0;background:transparent;padding:10px;
                               color:#264893;font-size:1rem;font-weight:700;text-align:center;
                               cursor:pointer;font-family:Afacad,sans-serif;transition:background 0.15s;"
                        onmouseenter="this.style.background='rgba(38,72,147,0.05)'"
                        onmouseleave="this.style.background='transparent'">
                  Profile
                </button>
                <div style="height:1px;background:rgba(15,23,42,0.06);"></div>
                <button type="button" (click)="handleLogout()"
                        style="width:100%;border:0;background:transparent;padding:10px;
                               color:#1d1d1d;font-size:1rem;text-align:center;
                               cursor:pointer;font-family:Afacad,sans-serif;transition:background 0.15s;"
                        onmouseenter="this.style.background='rgba(38,72,147,0.05)'"
                        onmouseleave="this.style.background='transparent'">
                  Log Out
                </button>
              </div>
            </div>

          </div>

          <!-- ─── SIDEBAR NAV ITEMS ─── -->
          <ng-container *ngFor="let item of sidebarItems; let i = index">
            <!-- Active pill background -->
            <div *ngIf="isActive(item.segment)"
                 [style.top.px]="sidebarPillTop(i)"
                 style="position:absolute;left:100px;width:255px;height:62px;
                        background:#FEF4DF;border-radius:12px;z-index:40;"></div>

            <!-- Icon -->
            <img [src]="item.icon"
                 [style.top.px]="sidebarPillTop(i) + 13"
                 [style.filter]="isActive(item.segment) ? 'invert(23%) sepia(62%) saturate(1200%) hue-rotate(203deg) brightness(60%)' : 'brightness(10)'"
                 style="position:absolute;left:130px;width:36px;height:36px;
                        object-fit:contain;z-index:50;" alt="" />

            <!-- Label -->
            <div (click)="go('/accountant/' + item.segment)"
                 [style.top.px]="sidebarPillTop(i) + 11"
                 [style.color]="isActive(item.segment) ? '#264893' : '#FEF4DF'"
                 [style.font-weight]="isActive(item.segment) ? '700' : '500'"
                 style="position:absolute;left:178px;font-family:Afacad;font-size:28px;
                        cursor:pointer;z-index:50;line-height:40px;">
              {{ item.label }}
            </div>
          </ng-container>

          <!-- Contact info at bottom of sidebar -->
          <div style="position:absolute;width:390px;left:5px;top:860px;
                      text-align:center;z-index:30;">
            <div style="color:white;font-size:15px;font-family:Afacad;font-style:italic;font-weight:700;margin-bottom:8px;">
              Contact Information
            </div>
            <div style="color:white;font-size:12px;font-family:Afacad;font-style:italic;font-weight:700;line-height:1.8;">
              <span style="font-weight:700;">Headquarters: </span>
              <span style="font-weight:400;">227 Nguyen Van Cu St., Ward 4, District 5, HCMC</span><br/>
              <span style="font-weight:700;">Phone: </span>
              <span style="font-weight:400;">(+84) 818.916.621</span><br/>
              <span style="font-weight:700;">Email: </span>
              <span style="font-weight:400;">contact@homestaydorm.vn</span><br/>
              <span style="font-weight:700;">Office Hours: </span>
              <span style="font-weight:400;">Mon – Sat | 08:00 – 18:00</span>
            </div>
          </div>

          <!-- ─── MAIN CONTENT CARD ─── -->
          <div style="position:absolute;width:1317px;height:774px;left:500px;top:208px;
                      background:rgba(246,246,246,0.70);
                      box-shadow:5px 5px 50px 5px rgba(0,0,0,0.25);
                      border-radius:25px;z-index:10;overflow:hidden;display:flex;flex-direction:column;">
            <router-outlet></router-outlet>
          </div>

        </div>
      </div>
    </div>
  `
})
export class AccountantLayoutComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  sf = 1;
  currentUrl = '';
  isUserMenuOpen = false;
  isLangMenuOpen = false;
  currentLang = 'en';
  private urlSub!: Subscription;

  readonly sidebarItems: SidebarItem[] = [
    { segment: 'transactions',    label: 'Transactions',    icon: 'assets/icons/Contracts.png'    },
    { segment: 'monthly-billing', label: 'Monthly Billing', icon: 'assets/icons/Schedules.png'   },
    { segment: 'checkout',        label: 'Checkout',        icon: 'assets/icons/Details.png'     },
    { segment: 'refunds',         label: 'Refunds',         icon: 'assets/icons/Reservation.png' },
  ];

  /** Top position for the i-th sidebar pill (starting at 331px, spacing 98px) */
  sidebarPillTop(i: number): number { return 331 + i * 98; }

  @HostListener('window:resize') onResize() { this.sf = window.innerWidth / 1920; }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node | null)) {
      this.isUserMenuOpen = false;
      this.isLangMenuOpen = false;
    }
  }

  constructor(private router: Router, private translate: TranslateService) {}

  ngOnInit() {
    this.onResize();
    this.currentUrl = this.router.url;
    this.urlSub = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => { this.currentUrl = this.router.url; });
  }

  ngOnDestroy() { this.urlSub?.unsubscribe(); }

  go(path: string) { this.router.navigate([path]); }
  isActive(segment: string): boolean { return this.currentUrl.includes(`/accountant/${segment}`); }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
    if (this.isUserMenuOpen) this.isLangMenuOpen = false;
  }

  toggleLangMenu(): void {
    this.isLangMenuOpen = !this.isLangMenuOpen;
    if (this.isLangMenuOpen) this.isUserMenuOpen = false;
  }

  setLang(lang: string): void {
    this.currentLang = lang;
    this.translate.use(lang);
    this.isLangMenuOpen = false;
  }

  goProfile(): void {
    this.isUserMenuOpen = false;
    this.router.navigate(['/admin']);
  }

  handleLogout(): void {
    this.isUserMenuOpen = false;
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}
