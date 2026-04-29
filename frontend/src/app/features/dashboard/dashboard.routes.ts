import { Routes } from '@angular/router';
import type { AppRouteData } from '@shared/models/route-shell.model';
import { DashboardComponent } from './components/dashboard/dashboard.component';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: DashboardComponent,
    data: {
      access: ['public', 'customer', 'sale', 'accountant', 'manager', 'admin'],
      navLabelKey: 'NAV.PUBLIC.HOME',
      pageTitleKey: 'NAV.PUBLIC.HOME',
      shellTone: 'immersive',
    } satisfies AppRouteData
  }
];
