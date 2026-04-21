import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { UsersManagementComponent } from './components/users-management/users-management.component';
import { RoomsManagementComponent } from './components/rooms-management/rooms-management.component';
import { RentalRequestsComponent } from './components/rental-requests/rental-request.component';
import { PaymentsComponent } from './components/payments/payments.component';
import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { roleGuard } from '@core/guards/role.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ['sale', 'accountant', 'manager', 'admin']
    }
  },
  {
    path: 'users',
    component: UsersManagementComponent,
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ['manager', 'admin']
    }
  },
  {
    path: 'rooms',
    component: RoomsManagementComponent,
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ['sale', 'accountant', 'manager', 'admin']
    }
  },
  {
    path: 'payments',
    component: PaymentsComponent,
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ['sale', 'accountant', 'manager', 'admin']
    }
  },
  {
    path: 'rental-requests',
    component: RentalRequestsComponent,
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ['sale', 'manager', 'admin']
    }
  }
];
