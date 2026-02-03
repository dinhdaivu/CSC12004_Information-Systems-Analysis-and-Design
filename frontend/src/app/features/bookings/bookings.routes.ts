import { BookingsListComponent } from './components/bookings-list/bookings-list.component';
import { NewBookingComponent } from './components/new-booking/new-booking.component';
import { BookingDetailComponent } from './components/booking-detail/booking-detail.component';
import { Routes } from '@angular/router';

export const BOOKINGS_ROUTES: Routes = [
  {
    path: '',
    component: BookingsListComponent
  },
  {
    path: 'new',
    component: NewBookingComponent
  },
  {
    path: ':id',
    component: BookingDetailComponent
  }
];
