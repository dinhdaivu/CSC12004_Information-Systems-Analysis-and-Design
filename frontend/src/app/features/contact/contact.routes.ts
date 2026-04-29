import { Routes } from '@angular/router';
import type { AppRouteData } from '@shared/models/route-shell.model';
import { ContactComponent } from './components/contact/contact.component';

export const CONTACT_ROUTES: Routes = [
  {
    path: '',
    component: ContactComponent,
    data: {
      access: ['public', 'customer', 'sale', 'accountant', 'manager', 'admin'],
      navLabelKey: 'NAV.HERO.CONTACT',
      pageTitleKey: 'NAV.HERO.CONTACT',
      shellTone: 'immersive',
    } satisfies AppRouteData,
  },
];
