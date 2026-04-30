import { Component } from '@angular/core';
import { PageStubComponent } from '@shared/components/page-stub/page-stub.component';

@Component({
  selector: 'app-booking-detail',
  standalone: true,
  imports: [PageStubComponent],
  template: `
    <app-page-stub
      eyebrowKey="NAV.PUBLIC.BOOKINGS"
      titleKey="PAGES.BOOKINGS_DETAIL.TITLE"
      descriptionKey="PAGES.BOOKINGS_DETAIL.DESCRIPTION"
      icon="bi bi-receipt-cutoff"
    ></app-page-stub>
  `
})
export class BookingDetailComponent {}
