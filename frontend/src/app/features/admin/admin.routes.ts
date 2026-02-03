import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { UsersManagementComponent } from './components/users-management/users-management.component';
import { RoomsManagementComponent } from './components/rooms-management/rooms-management.component';
import { TransactionsComponent } from './components/transactions/transactions.component';
import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminDashboardComponent
  },
  {
    path: 'users',
    component: UsersManagementComponent
  },
  {
    path: 'rooms',
    component: RoomsManagementComponent
  },
  {
    path: 'transactions',
    component: TransactionsComponent
  }
];
