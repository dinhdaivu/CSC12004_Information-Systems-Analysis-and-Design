import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '@core/services/auth.service';
import type { User } from '@shared/models/auth.model';
import type { AppRouteData } from '@shared/models/route-shell.model';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';

type PublicNavItem = {
  labelKey: string;
  route: string;
  exact?: boolean;
  requiresAuth?: boolean;
  showForRoles?: Array<User['role']>;
};

type ImmersiveLink = {
  labelKey: string;
  route: string;
};

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, TranslateModule, LanguageSwitcherComponent],
  template: `
    <div class="min-h-screen bg-[radial-gradient(circle_at_top,_#f8fbff,_#eef2ff_42%,_#e2e8f0_100%)] text-slate-900">
      @if (isImmersiveRoute()) {
        <header class="absolute inset-x-0 top-0 z-50">
          <div class="mx-auto flex max-w-[1920px] items-start justify-between px-6 pt-8 sm:px-10 lg:hidden">
            <a routerLink="/dashboard" class="shrink-0" (click)="closeMenus()">
              <img
                src="assets/icons/logo.svg"
                alt="HomeStay Dorm"
                class="aspect-[185/165] h-auto w-[8rem] object-contain drop-shadow-[0_8px_30px_rgba(0,0,0,0.18)] sm:w-[9rem]"
              />
            </a>

            <div class="flex items-center gap-3">
              <button
                type="button"
                class="inline-flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/95 text-white transition hover:bg-white/10"
                (click)="toggleMobileMenu()"
                aria-label="Toggle navigation"
              >
                <i class="bi" [class.bi-list]="!isMobileMenuOpen" [class.bi-x-lg]="isMobileMenuOpen"></i>
              </button>

              <app-language-switcher tone="dark" size="hero"></app-language-switcher>

              <div class="relative">
                <button
                  type="button"
                  class="inline-flex h-12 w-12 items-center justify-center rounded-full transition hover:opacity-85"
                  (click)="toggleUserMenu()"
                  aria-label="Open user menu"
                >
                  <img src="assets/icons/Account.svg" aria-hidden="true" class="h-full w-full object-contain" />
                  <span class="sr-only">Account</span>
                </button>

                @if (isUserMenuOpen) {
                  <div class="absolute right-0 top-[calc(100%+0.75rem)] w-[12.5rem] overflow-hidden rounded-[1.6rem] border border-white/15 bg-slate-950/55 shadow-[0_22px_60px_rgba(0,0,0,0.28)] backdrop-blur-[18px]">
                    @if (currentUser()) {
                      <button type="button" class="immersive-menu-action" (click)="navigateTo(currentUserRoute())">
                        {{ currentUserLabel() | translate }}
                      </button>
                      <div class="h-px bg-white/12"></div>
                      <button type="button" class="immersive-menu-action" (click)="handleLogout()">
                        {{ 'SHELL.USER.LOGOUT' | translate }}
                      </button>
                    } @else {
                      <button type="button" class="immersive-menu-action" (click)="navigateTo('/register')">
                        {{ 'SHELL.USER.REGISTER' | translate }}
                      </button>
                      <div class="h-px bg-white/12"></div>
                      <button type="button" class="immersive-menu-action" (click)="navigateTo('/login')">
                        {{ 'SHELL.USER.LOGIN' | translate }}
                      </button>
                    }
                  </div>
                }
              </div>
            </div>
          </div>

          <div class="relative mx-auto hidden max-w-[1920px] lg:block lg:h-[14.5rem]">
            <a routerLink="/dashboard" class="absolute left-[5.2%] top-[6.25rem] block" (click)="closeMenus()">
              <img
                src="assets/icons/logo.svg"
                alt="HomeStay Dorm"
                class="h-auto w-[11.5625rem] object-contain drop-shadow-[0_8px_30px_rgba(0,0,0,0.18)]"
              />
            </a>

            <nav class="absolute left-[55.78%] top-[6.875rem] flex items-center gap-[3rem]">
              @for (item of immersiveLinks; track item.labelKey) {
                <a
                  [routerLink]="item.route"
                  class="font-['Afacad'] text-[2rem] font-semibold leading-[1.34375] text-white transition hover:text-sky-200"
                  (click)="closeMenus()"
                >
                  {{ item.labelKey | translate }}
                </a>
              }
            </nav>

            <div class="absolute right-[5.47%] top-[5.95rem] flex items-center gap-[1.2rem]">
              <app-language-switcher tone="dark" size="hero"></app-language-switcher>

              <div class="relative">
                <button
                  type="button"
                  class="inline-flex h-[4.375rem] w-[4.375rem] items-center justify-center rounded-full transition hover:opacity-85"
                  (click)="toggleUserMenu()"
                  aria-label="Open user menu"
                >
                  <img src="assets/icons/Account.svg" aria-hidden="true" class="h-full w-full object-contain" />
                  <span class="sr-only">Account</span>
                </button>

                @if (isUserMenuOpen) {
                  <div class="absolute right-0 top-[calc(100%+0.75rem)] w-[12.5rem] overflow-hidden rounded-[1.6rem] border border-white/15 bg-slate-950/55 shadow-[0_22px_60px_rgba(0,0,0,0.28)] backdrop-blur-[18px]">
                    @if (currentUser()) {
                      <button type="button" class="immersive-menu-action" (click)="navigateTo(currentUserRoute())">
                        {{ currentUserLabel() | translate }}
                      </button>
                      <div class="h-px bg-white/12"></div>
                      <button type="button" class="immersive-menu-action" (click)="handleLogout()">
                        {{ 'SHELL.USER.LOGOUT' | translate }}
                      </button>
                    } @else {
                      <button type="button" class="immersive-menu-action" (click)="navigateTo('/register')">
                        {{ 'SHELL.USER.REGISTER' | translate }}
                      </button>
                      <div class="h-px bg-white/12"></div>
                      <button type="button" class="immersive-menu-action" (click)="navigateTo('/login')">
                        {{ 'SHELL.USER.LOGIN' | translate }}
                      </button>
                    }
                  </div>
                }
              </div>
            </div>
          </div>

          @if (isMobileMenuOpen) {
            <div class="mx-6 mt-6 rounded-[1.75rem] border border-white/15 bg-slate-950/60 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:mx-10 lg:hidden">
              <nav class="flex flex-col gap-1">
                @for (item of immersiveLinks; track item.labelKey) {
                  <a
                    [routerLink]="item.route"
                    class="rounded-2xl px-4 py-3 text-xl font-semibold text-white transition hover:bg-white/10"
                    (click)="closeMenus()"
                  >
                    {{ item.labelKey | translate }}
                  </a>
                }
              </nav>
            </div>
          }
        </header>
      } @else {
        <header class="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6">
          <div class="mx-auto flex max-w-7xl items-center gap-4 rounded-[2rem] border border-slate-200/70 bg-white/88 px-4 py-3 text-slate-900 shadow-[0_20px_60px_rgba(15,23,42,0.16)] backdrop-blur-xl transition-all duration-300 sm:px-6">
            <a routerLink="/dashboard" class="flex min-w-0 items-center gap-3" (click)="closeMenus()">
              <img src="assets/icons/logo.svg" alt="HomeStay Dorm" class="h-14 w-14 rounded-2xl object-contain sm:h-16 sm:w-16" />
              <div class="min-w-0">
                <p class="truncate font-['Big_Shoulders_Text'] text-2xl font-black uppercase tracking-[0.14em] sm:text-3xl">
                  HomeStay Dorm
                </p>
                <p class="hidden truncate text-sm text-slate-500 sm:block">
                  {{ 'SHELL.PUBLIC.TAGLINE' | translate }}
                </p>
              </div>
            </a>

            <nav class="ml-auto hidden items-center gap-2 lg:flex">
              @for (item of visibleNavItems(); track item.route) {
                <a
                  [routerLink]="item.route"
                  routerLinkActive="bg-white text-slate-950 shadow-md"
                  [routerLinkActiveOptions]="{ exact: item.exact ?? false }"
                  class="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                  (click)="closeMenus()"
                >
                  {{ item.labelKey | translate }}
                </a>
              }
            </nav>

            <div class="ml-auto flex items-center gap-2 lg:ml-4">
              <button
                type="button"
                class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 transition lg:hidden"
                (click)="toggleMobileMenu()"
                aria-label="Toggle navigation"
              >
                <i class="bi" [class.bi-list]="!isMobileMenuOpen" [class.bi-x-lg]="isMobileMenuOpen"></i>
              </button>

              <app-language-switcher tone="light"></app-language-switcher>

              <div class="relative">
                <button
                  type="button"
                  class="inline-flex h-11 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 text-slate-700 transition"
                  (click)="toggleUserMenu()"
                >
                  <span class="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/90 text-sm font-bold text-white">
                    {{ currentUserInitial() }}
                  </span>
                  <i class="bi bi-chevron-down text-xs"></i>
                </button>

                @if (isUserMenuOpen) {
                  <div class="absolute right-0 top-[calc(100%+0.75rem)] w-72 rounded-[1.5rem] border border-slate-200/70 bg-white/95 p-3 text-slate-900 shadow-[0_24px_80px_rgba(15,23,42,0.18)] backdrop-blur-xl">
                    @if (currentUser()) {
                      <div class="rounded-2xl bg-slate-950 px-4 py-4 text-white">
                        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">
                          {{ 'SHELL.USER.SIGNED_IN' | translate }}
                        </p>
                        <p class="mt-2 text-lg font-semibold">{{ currentUser()!.full_name }}</p>
                        <p class="text-sm text-white/70">{{ currentUser()!.email }}</p>
                      </div>

                      <div class="mt-3 flex flex-col gap-2">
                        @if (isCustomer()) {
                          <button type="button" class="menu-action" (click)="navigateTo('/bookings')">
                            <i class="bi bi-journal-check"></i>
                            <span>{{ 'SHELL.USER.MY_BOOKINGS' | translate }}</span>
                          </button>
                        }

                        @if (isStaffOrAdmin()) {
                          <button type="button" class="menu-action" (click)="navigateTo('/admin')">
                            <i class="bi bi-grid-1x2-fill"></i>
                            <span>{{ 'SHELL.USER.ADMIN_WORKSPACE' | translate }}</span>
                          </button>
                        }

                        <button type="button" class="menu-action menu-action--danger" (click)="handleLogout()">
                          <i class="bi bi-box-arrow-right"></i>
                          <span>{{ 'SHELL.USER.LOGOUT' | translate }}</span>
                        </button>
                      </div>
                    } @else {
                      <div class="rounded-2xl bg-slate-100 px-4 py-4">
                        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                          {{ 'SHELL.USER.WELCOME_BADGE' | translate }}
                        </p>
                        <p class="mt-2 text-lg font-semibold text-slate-900">{{ 'SHELL.USER.GUEST_TITLE' | translate }}</p>
                        <p class="text-sm text-slate-600">{{ 'SHELL.USER.GUEST_SUBTITLE' | translate }}</p>
                      </div>

                      <div class="mt-3 flex flex-col gap-2">
                        <button type="button" class="menu-action" (click)="navigateTo('/login')">
                          <i class="bi bi-box-arrow-in-right"></i>
                          <span>{{ 'SHELL.USER.LOGIN' | translate }}</span>
                        </button>
                        <button type="button" class="menu-action" (click)="navigateTo('/register')">
                          <i class="bi bi-person-plus"></i>
                          <span>{{ 'SHELL.USER.REGISTER' | translate }}</span>
                        </button>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          </div>

          @if (isMobileMenuOpen) {
            <div class="mx-auto mt-3 max-w-7xl rounded-[1.75rem] border border-slate-200/70 bg-white/94 p-3 shadow-[0_20px_60px_rgba(15,23,42,0.16)] backdrop-blur-xl lg:hidden">
              <nav class="flex flex-col gap-2">
                @for (item of visibleNavItems(); track item.route) {
                  <a
                    [routerLink]="item.route"
                    class="rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    (click)="closeMenus()"
                  >
                    {{ item.labelKey | translate }}
                  </a>
                }
              </nav>
            </div>
          }
        </header>
      }

      <main
        [class.w-full]="isImmersiveRoute()"
        [class.px-0]="isImmersiveRoute()"
        [class.pb-0]="isImmersiveRoute()"
        [class.mx-auto]="!isImmersiveRoute()"
        [class.max-w-7xl]="!isImmersiveRoute()"
        [class.px-4]="!isImmersiveRoute()"
        [class.pb-10]="!isImmersiveRoute()"
        [class.sm:px-6]="!isImmersiveRoute()"
        [class.pt-28]="!isImmersiveRoute()"
        [class.sm:pt-32]="!isImmersiveRoute()"
      >
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .menu-action {
      display: inline-flex;
      width: 100%;
      align-items: center;
      gap: 0.75rem;
      border: 0;
      border-radius: 1rem;
      background: transparent;
      padding: 0.85rem 1rem;
      color: #0f172a;
      cursor: pointer;
      transition: background-color 0.2s ease, transform 0.2s ease;
    }

    .menu-action:hover {
      background: #f8fafc;
      transform: translateX(2px);
    }

    .menu-action--danger {
      color: #b91c1c;
    }

    .immersive-menu-action {
      width: 100%;
      border: 0;
      background: transparent;
      padding: 1rem 1.25rem;
      color: #ffffff;
      cursor: pointer;
      font-family: 'Afacad', sans-serif;
      font-size: clamp(1rem, 1.45vw, 1.65rem);
      font-style: italic;
      line-height: 1.15;
      text-align: center;
      transition: background-color 0.2s ease;
    }

    .immersive-menu-action:hover {
      background: rgba(255, 255, 255, 0.08);
    }
  `]
})
export class PublicLayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly navItems: PublicNavItem[] = [
    { labelKey: 'NAV.PUBLIC.HOME', route: '/dashboard', exact: true },
    { labelKey: 'NAV.PUBLIC.ROOMS', route: '/rooms' },
    { labelKey: 'NAV.PUBLIC.BOOKINGS', route: '/bookings', showForRoles: ['customer'], requiresAuth: true },
    { labelKey: 'NAV.PUBLIC.ADMIN', route: '/admin', showForRoles: ['sale', 'accountant', 'manager', 'admin'], requiresAuth: true },
  ];

  readonly immersiveLinks: ImmersiveLink[] = [
    { labelKey: 'NAV.HERO.ABOUT', route: '/dashboard' },
    { labelKey: 'NAV.HERO.GUIDELINES', route: '/dashboard' },
    { labelKey: 'NAV.HERO.CONTACT', route: '/dashboard' },
  ];

  isMobileMenuOpen = false;
  isUserMenuOpen = false;

  visibleNavItems(): PublicNavItem[] {
    const user = this.currentUser();

    return this.navItems.filter((item) => {
      if (item.requiresAuth && !user) {
        return false;
      }

      if (item.showForRoles && (!user || !item.showForRoles.includes(user.role))) {
        return false;
      }

      return true;
    });
  }

  currentUser(): User | null {
    return this.authService.getCurrentUser();
  }

  currentUserInitial(): string {
    const user = this.currentUser();
    const source = user?.full_name?.trim() || user?.email?.trim() || 'G';
    return source.charAt(0).toUpperCase();
  }

  currentUserRoute(): string {
    return this.isCustomer() ? '/bookings' : '/admin';
  }

  currentUserLabel(): string {
    return this.isCustomer() ? 'SHELL.USER.MY_BOOKINGS' : 'SHELL.USER.ADMIN_WORKSPACE';
  }

  isCustomer(): boolean {
    return this.currentUser()?.role === 'customer';
  }

  isStaffOrAdmin(): boolean {
    const role = this.currentUser()?.role;
    return !!role && role !== 'customer';
  }

  isImmersiveRoute(): boolean {
    return this.getCurrentRouteData().shellTone === 'immersive';
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  closeMenus(): void {
    this.isMobileMenuOpen = false;
    this.isUserMenuOpen = false;
  }

  navigateTo(route: string): void {
    this.closeMenus();
    void this.router.navigateByUrl(route);
  }

  handleLogout(): void {
    this.closeMenus();
    this.authService.logout().subscribe(() => {
      void this.router.navigateByUrl('/login');
    });
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node | null)) {
      this.closeMenus();
    }
  }

  private getCurrentRouteData(): AppRouteData {
    let snapshot: ActivatedRouteSnapshot = this.router.routerState.snapshot.root;

    while (snapshot.firstChild) {
      snapshot = snapshot.firstChild;
    }

    return (snapshot.data ?? {}) as AppRouteData;
  }
}
