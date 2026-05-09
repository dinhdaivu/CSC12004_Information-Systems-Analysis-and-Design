import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { Router, RouterLink } from "@angular/router";

type SidebarNavItem = {
  label: string;
  path: string;
};

@Component({
  selector: "app-admin-sidebar",
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <aside
      class="fixed inset-y-0 left-0 z-20 hidden w-64 bg-[#12346d] text-white shadow-2xl md:block"
    >
      <div class="flex h-full flex-col p-6">
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

        <nav class="space-y-2 text-base font-medium">
          <a
            *ngFor="let item of sidebarNavItems"
            [routerLink]="item.path"
            class="block w-full rounded-xl px-4 py-3 text-left transition"
            [class.bg-white]="isNavActive(item.path)"
            [class.text-[#12346d]]="isNavActive(item.path)"
            [class.font-semibold]="isNavActive(item.path)"
            [class.shadow]="isNavActive(item.path)"
            [class.text-white/80]="!isNavActive(item.path)"
            [class.hover:bg-white/10]="!isNavActive(item.path)"
            [class.hover:text-white]="!isNavActive(item.path)"
          >
            {{ item.label }}
          </a>
        </nav>
      </div>
    </aside>
  `,
})
export class AdminSidebarComponent {
  private readonly router = inject(Router);

  readonly sidebarNavItems: SidebarNavItem[] = [
    { label: "Inquiries", path: "/admin/rental-requests" },
    { label: "Schedules", path: "/admin/scheduled" },
    { label: "Rooms", path: "/admin/rooms" },
    { label: "Reservations", path: "/admin/payments" },
    { label: "Users", path: "/admin/users" },
  ];

  isNavActive(path: string): boolean {
    if (path === "/admin/rental-requests") {
      return this.router.url === path;
    }

    return this.router.url.startsWith(path);
  }
}
