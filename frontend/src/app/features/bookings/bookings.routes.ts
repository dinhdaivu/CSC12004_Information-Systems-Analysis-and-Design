import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { roleGuard } from '@core/guards/role.guard';
import type { AppRouteData } from '@shared/models/route-shell.model';
import { BookingDetailComponent } from './components/booking-detail/booking-detail.component';
import { BookingsListComponent } from './components/bookings-list/bookings-list.component';
import { NewBookingComponent } from './components/new-booking/new-booking.component';

const bookingAccessData = {
  access: ['customer'],
  navLabelKey: 'NAV.PUBLIC.BOOKINGS',
  roles: ['customer'],
} satisfies AppRouteData;

export const BOOKINGS_ROUTES: Routes = [
  {
    path: '',
    component: BookingsListComponent,
    canActivate: [authGuard, roleGuard],
    data: {
      ...bookingAccessData,
      pageTitleKey: 'PAGES.BOOKINGS_LIST.TITLE',
    }
  },
  {
    path: 'new',
    component: NewBookingComponent,
    canActivate: [authGuard, roleGuard],
    data: {
      ...bookingAccessData,
      pageTitleKey: 'PAGES.BOOKINGS_NEW.TITLE',
    }
  },
  {
    path: ':id',
    component: BookingDetailComponent,
    canActivate: [authGuard, roleGuard],
    data: {
      ...bookingAccessData,
      pageTitleKey: 'PAGES.BOOKINGS_DETAIL.TITLE',
    }
  }
];
