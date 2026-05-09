import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { roleGuard } from '@core/guards/role.guard';
import type { AppRouteData } from '@shared/models/route-shell.model';
import { CustomerContractsComponent } from './components/customer-contracts/customer-contracts.component';

const contractAccessData = {
  access: ['customer'],
  navLabelKey: 'COMMON.CONTRACT',
  roles: ['customer'],
} satisfies AppRouteData;

export const CONTRACTS_ROUTES: Routes = [
  {
    path: '',
    component: CustomerContractsComponent,
    canActivate: [authGuard, roleGuard],
    data: {
      ...contractAccessData,
      pageTitleKey: 'PAGES.CONTRACTS.TITLE',
    },
  },
];
