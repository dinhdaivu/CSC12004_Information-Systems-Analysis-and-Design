import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { Router, RouterLink } from "@angular/router";

type SidebarNavItem = {
  label: string;
  path: string;
  icon?: string;
};

@Component({
  selector: "app-admin-sidebar",
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- Backdrop overlay (mobile only, when sidebar open) -->
    <div
      *ngIf="isOpen()"
      class="fixed inset-0 z-10 bg-black/50 lg:hidden"
      (click)="closeSidebar()"
    ></div>

    <!-- Sidebar -->
    <aside
      class="fixed inset-y-0 left-0 z-20 w-64 bg-[#12346d] text-white shadow-2xl transition-transform duration-300 ease-in-out"
      [class.-translate-x-full]="!isOpen()"
      [class.translate-x-0]="isOpen()"
      [class.lg:translate-x-0]="true"
    >
      <div class="flex h-full flex-col p-6">
        <!-- Logo section -->
        <div class="mb-8 flex items-center gap-3">
          <img
            src="/assets/icons/Logo.png"
            alt="HomeStay Dorm Logo"
            class="h-12 w-12 rounded-full bg-white/90 p-1"
          />
          <div>
            <p class="text-sm uppercase tracking-[0.2em] text-white/75">
              HomeStay
            </p>
            <h1 class="text-lg font-semibold leading-tight">HOMESTAY DORM</h1>
          </div>
        </div>

        <!-- Close button (mobile only) -->
        <button
          type="button"
          (click)="closeSidebar()"
          class="mb-4 ml-auto block rounded-lg p-2 text-white hover:bg-white/10 lg:hidden"
          aria-label="Close sidebar"
        >
          <svg
            class="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>

        <!-- Navigation -->
        <nav class="space-y-2 text-base font-medium">
          <a
            *ngFor="let item of sidebarNavItems"
            [routerLink]="item.path"
            (click)="onNavClick()"
            class="block w-full rounded-xl px-4 py-3 text-left transition-all duration-200"
            [class.bg-white]="isNavActive(item.path)"
            [class.text-[#12346d]]="isNavActive(item.path)"
            [class.font-semibold]="isNavActive(item.path)"
            [class.shadow-lg]="isNavActive(item.path)"
            [class.text-white/80]="!isNavActive(item.path)"
            [class.hover:bg-white/10]="!isNavActive(item.path)"
            [class.hover:text-white]="!isNavActive(item.path)"
          >
            <div class="flex items-center gap-3">
              <span>{{ item.label }}</span>
            </div>
          </a>
        </nav>
      </div>
    </aside>
  `,
})
export class AdminSidebarComponent {
  private readonly router = inject(Router);

  // State
  isOpen = signal(false);

  readonly sidebarNavItems: SidebarNavItem[] = [
    { label: "Inquiries", path: "/admin" },
    { label: "Schedules", path: "/admin/scheduled" },
    { label: "Rooms", path: "/admin/rooms" },
    { label: "Reservations", path: "/admin/payments" },
    { label: "Contracts", path: "/admin/contracts" },
    { label: "Users", path: "/admin/users" },
  ];

  /**
   * Toggle sidebar visibility on mobile
   */
  toggleSidebar(): void {
    this.isOpen.update((val) => !val);
  }

  /**
   * Close sidebar (e.g., on mobile when clicking backdrop or nav item)
   */
  closeSidebar(): void {
    this.isOpen.set(false);
  }

  /**
   * Close sidebar on mobile after navigation
   */
  onNavClick(): void {
    if (window.innerWidth < 1024) {
      this.closeSidebar();
    }
  }

  /**
   * Check if nav item is active
   */
  isNavActive(path: string): boolean {
    if (path === "/admin") {
      return this.router.url === path;
    }
    return this.router.url.startsWith(path);
  }
}
