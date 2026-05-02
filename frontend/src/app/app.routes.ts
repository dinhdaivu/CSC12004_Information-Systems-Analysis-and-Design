import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { roleGuard } from '@core/guards/role.guard';
import { AdminLayoutComponent } from '@shared/components/admin-layout/admin-layout.component';
import { PublicLayoutComponent } from '@shared/components/public-layout/public-layout.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: '',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES)
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ['sale', 'accountant', 'manager', 'admin'],
      pageTitleKey: 'NAV.ADMIN.OVERVIEW',
    },
    children: [
      {
        path: '',
        loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES)
      }
    ]
  },
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES)
      },
      {
        path: 'rooms',
        loadChildren: () => import('./features/rooms/rooms.routes').then((m) => m.ROOMS_ROUTES)
      },
      {
        path: 'bookings',
        loadChildren: () => import('./features/bookings/bookings.routes').then((m) => m.BOOKINGS_ROUTES)
      },
      {
        path: 'contracts',
        loadChildren: () => import('./features/contracts/contracts.routes').then((m) => m.CONTRACTS_ROUTES)
      },
      {
        path: 'about',
        loadChildren: () => import('./features/about/about.routes').then((m) => m.ABOUT_ROUTES)
      },
      {
        path: 'guidelines',
        loadChildren: () => import('./features/guidelines/guidelines.routes').then((m) => m.GUIDELINES_ROUTES)
      },
      {
        path: 'contact',
        loadChildren: () => import('./features/contact/contact.routes').then((m) => m.CONTACT_ROUTES)
      }
    ]
  },
  {
    path: 'accountant',
    loadChildren: () => import('./features/accountant/accountant.routes').then((m) => m.ACCOUNTANT_ROUTES)
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
