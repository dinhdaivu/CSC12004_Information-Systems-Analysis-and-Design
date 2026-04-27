import { Component } from '@angular/core';
import { PageStubComponent } from '@shared/components/page-stub/page-stub.component';

@Component({
  selector: 'app-new-booking',
  standalone: true,
  imports: [PageStubComponent],
  template: `
    <app-page-stub
      eyebrowKey="NAV.PUBLIC.BOOKINGS"
      titleKey="PAGES.BOOKINGS_NEW.TITLE"
      descriptionKey="PAGES.BOOKINGS_NEW.DESCRIPTION"
      icon="bi bi-calendar-plus"
    ></app-page-stub>
  `
})
export class NewBookingComponent {}
