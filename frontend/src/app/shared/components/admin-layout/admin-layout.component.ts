import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '@core/services/auth.service';
import type { AppRole, User } from '@shared/models/auth.model';
import type { AppRouteData } from '@shared/models/route-shell.model';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';

type AdminNavItem = {
  labelKey: string;
  route: string;
  icon: string;
  roles: AppRole[];
  exact?: boolean;
};

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, TranslateModule, LanguageSwitcherComponent],
  template: `
    <div class="min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#eff6ff_45%,_#e2e8f0_100%)]">
      <div class="mx-auto flex min-h-screen max-w-[1600px]">
        <aside class="fixed inset-y-0 left-0 z-40 hidden w-[296px] border-r border-slate-200/70 bg-slate-950 px-6 py-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.28)] xl:block">
          <div class="flex h-full flex-col">
            <a routerLink="/admin" class="flex items-center gap-3 rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4">
              <img src="assets/icons/Logo.png" alt="HomeStay Dorm" class="h-14 w-14 rounded-2xl object-contain" />
              <div>
                <p class="font-['Big_Shoulders_Text'] text-3xl font-black uppercase tracking-[0.12em]">HomeStay</p>
                <p class="text-sm text-white/60">{{ 'SHELL.ADMIN.TAGLINE' | translate }}</p>
              </div>
            </a>

            <nav class="mt-8 flex flex-1 flex-col gap-2">
              @for (item of visibleNavItems(); track item.route) {
                <a
                  [routerLink]="item.route"
                  routerLinkActive="bg-white text-slate-950 shadow-lg"
                  [routerLinkActiveOptions]="{ exact: item.exact ?? false }"
                  class="inline-flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-white/75 transition hover:bg-white/10 hover:text-white"
                >
                  <i [class]="item.icon"></i>
                  <span>{{ item.labelKey | translate }}</span>
                </a>
              }
            </nav>

            <div class="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">{{ 'SHELL.ADMIN.ACCESS_BADGE' | translate }}</p>
              <p class="mt-2 text-lg font-semibold">{{ currentUser()?.full_name || ('SHELL.USER.GUEST_TITLE' | translate) }}</p>
              <p class="text-sm text-white/60">{{ currentUser()?.email || ('SHELL.ADMIN.ACCESS_FALLBACK' | translate) }}</p>
            </div>
          </div>
        </aside>

        <div class="flex min-h-screen w-full flex-1 flex-col xl:pl-[296px]">
          <header class="sticky top-0 z-30 px-4 py-4 sm:px-6">
            <div class="flex items-center gap-3 rounded-[2rem] border border-white/70 bg-white/86 px-4 py-3 shadow-[0_18px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:px-6">
              <button
                type="button"
                class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 xl:hidden"
                (click)="toggleSidebar()"
                aria-label="Toggle admin navigation"
              >
                <i class="bi" [class.bi-list]="!isSidebarOpen" [class.bi-x-lg]="isSidebarOpen"></i>
              </button>

              <div class="min-w-0">
                <p class="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">{{ 'SHELL.ADMIN.HEADER_BADGE' | translate }}</p>
                <h1 class="truncate font-['Big_Shoulders_Text'] text-3xl font-black uppercase tracking-[0.08em] text-slate-950">
                  {{ currentPageTitleKey() | translate }}
                </h1>
              </div>

              <div class="ml-auto flex items-center gap-2">
                <app-language-switcher tone="light"></app-language-switcher>

                <div class="relative">
                  <button
                    type="button"
                    class="inline-flex h-11 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 text-slate-700 transition hover:bg-slate-100"
                    (click)="toggleUserMenu()"
                  >
                    <span class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                      {{ currentUserInitial() }}
                    </span>
                    <i class="bi bi-chevron-down text-xs"></i>
                  </button>

                  @if (isUserMenuOpen) {
                    <div class="absolute right-0 top-[calc(100%+0.75rem)] w-72 rounded-[1.5rem] border border-slate-200/70 bg-white/95 p-3 shadow-[0_24px_80px_rgba(15,23,42,0.18)] backdrop-blur-xl">
                      <div class="rounded-2xl bg-slate-950 px-4 py-4 text-white">
                        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">
                          {{ 'SHELL.USER.SIGNED_IN' | translate }}
                        </p>
                        <p class="mt-2 text-lg font-semibold">{{ currentUser()?.full_name || ('SHELL.USER.GUEST_TITLE' | translate) }}</p>
                        <p class="text-sm text-white/70">{{ currentUser()?.email || ('SHELL.ADMIN.ACCESS_FALLBACK' | translate) }}</p>
                      </div>

                      <div class="mt-3 flex flex-col gap-2">
                        <button type="button" class="menu-action" (click)="navigateTo('/dashboard')">
                          <i class="bi bi-house-door"></i>
                          <span>{{ 'NAV.PUBLIC.HOME' | translate }}</span>
                        </button>
                        <button type="button" class="menu-action menu-action--danger" (click)="handleLogout()">
                          <i class="bi bi-box-arrow-right"></i>
                          <span>{{ 'SHELL.USER.LOGOUT' | translate }}</span>
                        </button>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>
          </header>

          @if (isSidebarOpen) {
            <div class="fixed inset-0 z-20 bg-slate-950/40 xl:hidden" (click)="closeMenus()"></div>
            <aside class="fixed inset-y-0 left-0 z-30 w-[296px] border-r border-slate-200/20 bg-slate-950 px-6 py-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.28)] xl:hidden">
              <div class="flex items-center justify-between">
                <a routerLink="/admin" class="font-['Big_Shoulders_Text'] text-3xl font-black uppercase tracking-[0.12em]" (click)="closeMenus()">HomeStay</a>
                <button type="button" class="rounded-full border border-white/10 p-2" (click)="closeMenus()">
                  <i class="bi bi-x-lg"></i>
                </button>
              </div>

              <nav class="mt-8 flex flex-col gap-2">
                @for (item of visibleNavItems(); track item.route) {
                  <a
                    [routerLink]="item.route"
                    class="inline-flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-white/75 transition hover:bg-white/10 hover:text-white"
                    (click)="closeMenus()"
                  >
                    <i [class]="item.icon"></i>
                    <span>{{ item.labelKey | translate }}</span>
                  </a>
                }
              </nav>
            </aside>
          }

          <main class="flex-1 px-4 pb-8 pt-2 sm:px-6">
            <router-outlet></router-outlet>
          </main>
        </div>
      </div>
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
  `]
})
export class AdminLayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly navItems: AdminNavItem[] = [
    { labelKey: 'NAV.ADMIN.OVERVIEW', route: '/admin', icon: 'bi bi-grid-1x2-fill', roles: ['sale', 'accountant', 'manager', 'admin'], exact: true },
    { labelKey: 'NAV.ADMIN.ROOMS', route: '/admin/rooms', icon: 'bi bi-door-open-fill', roles: ['sale', 'accountant', 'manager', 'admin'] },
    { labelKey: 'NAV.ADMIN.PAYMENTS', route: '/admin/payments', icon: 'bi bi-credit-card-2-front-fill', roles: ['sale', 'accountant', 'manager', 'admin'] },
    { labelKey: 'NAV.ADMIN.USERS', route: '/admin/users', icon: 'bi bi-people-fill', roles: ['manager', 'admin'] },
  ];

  isSidebarOpen = false;
  isUserMenuOpen = false;

  currentUser(): User | null {
    return this.authService.getCurrentUser();
  }

  currentUserInitial(): string {
    const user = this.currentUser();
    const source = user?.full_name?.trim() || user?.email?.trim() || 'A';
    return source.charAt(0).toUpperCase();
  }

  visibleNavItems(): AdminNavItem[] {
    const role = this.currentUser()?.role;

    return this.navItems.filter((item) => (role ? item.roles.includes(role) : false));
  }

  currentPageTitleKey(): string {
    return this.getCurrentRouteData().pageTitleKey || 'NAV.ADMIN.OVERVIEW';
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  closeMenus(): void {
    this.isSidebarOpen = false;
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
