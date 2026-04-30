import { Routes } from '@angular/router';
import type { AppRouteData } from '@shared/models/route-shell.model';
import { GuidelinesComponent } from './components/guidelines/guidelines.component';

export const GUIDELINES_ROUTES: Routes = [
  {
    path: '',
    component: GuidelinesComponent,
    data: {
      access: ['public', 'customer', 'sale', 'accountant', 'manager', 'admin'],
      navLabelKey: 'NAV.HERO.GUIDELINES',
      pageTitleKey: 'NAV.HERO.GUIDELINES',
      shellTone: 'immersive',
    } satisfies AppRouteData,
  },
];
