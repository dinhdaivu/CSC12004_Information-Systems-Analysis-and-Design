import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { roleGuard } from '@core/guards/role.guard';
import type { AppRouteData } from '@shared/models/route-shell.model';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { PaymentsComponent } from './components/payments/payments.component';
import { RoomsManagementComponent } from './components/rooms-management/rooms-management.component';
import { UsersManagementComponent } from './components/users-management/users-management.component';
import { ScheduledManagementComponent } from "./components/scheduled-management/scheduled-management.component";
import { RentalRequestsComponent } from "./components/rental-requests/rental-request.component";

export const ADMIN_ROUTES: Routes = [
  {
    path: "",
    redirectTo: "rental-requests",
    pathMatch: "full",
  },
  {
    path: "dashboard",
    component: AdminDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ['sale', 'accountant', 'manager', 'admin'],
      access: ['sale', 'accountant', 'manager', 'admin'],
      navLabelKey: 'NAV.ADMIN.OVERVIEW',
      pageTitleKey: 'PAGES.ADMIN_DASHBOARD.TITLE',
    } satisfies AppRouteData
  },
  {
    path: "users",
    component: UsersManagementComponent,
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ['manager', 'admin'],
      access: ['manager', 'admin'],
      navLabelKey: 'NAV.ADMIN.USERS',
      pageTitleKey: 'PAGES.ADMIN_USERS.TITLE',
    } satisfies AppRouteData
  },
  {
    path: "users-management",
    redirectTo: "users",
    pathMatch: "full",
  },
  {
    path: "rooms",
    component: RoomsManagementComponent,
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ['sale', 'accountant', 'manager', 'admin'],
      access: ['sale', 'accountant', 'manager', 'admin'],
      navLabelKey: 'NAV.ADMIN.ROOMS',
      pageTitleKey: 'PAGES.ADMIN_ROOMS.TITLE',
    } satisfies AppRouteData
  },
  {
    path: "rooms-management",
    redirectTo: "rooms",
    pathMatch: "full",
  },
  {
    path: "payments",
    component: PaymentsComponent,
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ['sale', 'accountant', 'manager', 'admin'],
      access: ['sale', 'accountant', 'manager', 'admin'],
      navLabelKey: 'NAV.ADMIN.PAYMENTS',
      pageTitleKey: 'PAGES.ADMIN_PAYMENTS.TITLE',
    } satisfies AppRouteData
  },
  {
    path: "scheduled-management",
    redirectTo: "scheduled",
    pathMatch: "full",
  },
  {
    path: "scheduled",
    component: ScheduledManagementComponent,
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ["sale", "accountant", "manager", "admin"],
      access: ["sale", "accountant", "manager", "admin"],
      navLabelKey: "NAV.ADMIN.SCHEDULED",
      pageTitleKey: "PAGES.ADMIN_SCHEDULED.TITLE",
    } satisfies AppRouteData,
  },
  {
    path: "rental-requests",
    component: RentalRequestsComponent,
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ["sale", "manager", "admin"],
      access: ["sale", "manager", "admin"],
      navLabelKey: "NAV.ADMIN.RENTAL_REQUESTS",
      pageTitleKey: "PAGES.ADMIN_RENTAL_REQUESTS.TITLE",
    } satisfies AppRouteData,
  },
];
