import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { roleGuard } from '@core/guards/role.guard';
import type { AppRouteData } from '@shared/models/route-shell.model';
import { ProfileComponent } from './components/profile/profile.component';

const profileAccessData = {
  access: ['customer'],
  navLabelKey: 'COMMON.PROFILE',
  roles: ['customer'],
} satisfies AppRouteData;

export const PROFILE_ROUTES: Routes = [
  {
    path: '',
    component: ProfileComponent,
    canActivate: [authGuard, roleGuard],
    data: {
      ...profileAccessData,
      pageTitleKey: 'PAGES.PROFILE.TITLE',
    },
  },
];
