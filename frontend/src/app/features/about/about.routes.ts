import { Routes } from '@angular/router';
import type { AppRouteData } from '@shared/models/route-shell.model';
import { AboutComponent } from './components/about/about.component';

export const ABOUT_ROUTES: Routes = [
  {
    path: '',
    component: AboutComponent,
    data: {
      access: ['public', 'customer', 'sale', 'accountant', 'manager', 'admin'],
      navLabelKey: 'NAV.HERO.ABOUT',
      pageTitleKey: 'NAV.HERO.ABOUT',
      shellTone: 'immersive',
    } satisfies AppRouteData,
  },
];
