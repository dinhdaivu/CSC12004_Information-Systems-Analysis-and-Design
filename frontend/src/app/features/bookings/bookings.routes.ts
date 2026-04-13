import { BookingsListComponent } from './components/bookings-list/bookings-list.component';
import { NewBookingComponent } from './components/new-booking/new-booking.component';
import { BookingDetailComponent } from './components/booking-detail/booking-detail.component';
import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';

export const BOOKINGS_ROUTES: Routes = [
  {
    path: '',
    component: BookingsListComponent,
    canActivate: [authGuard]
  },
  {
    path: 'new',
    component: NewBookingComponent,
    canActivate: [authGuard]
  },
  {
    path: ':id',
    component: BookingDetailComponent,
    canActivate: [authGuard]
  }
];
