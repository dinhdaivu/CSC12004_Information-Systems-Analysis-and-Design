import { Component } from '@angular/core';
import { PageStubComponent } from '@shared/components/page-stub/page-stub.component';

@Component({
  selector: 'app-bookings-list',
  standalone: true,
  imports: [PageStubComponent],
  template: `
    <app-page-stub
      eyebrowKey="NAV.PUBLIC.BOOKINGS"
      titleKey="PAGES.BOOKINGS_LIST.TITLE"
      descriptionKey="PAGES.BOOKINGS_LIST.DESCRIPTION"
      icon="bi bi-journal-check"
    ></app-page-stub>
  `
})
export class BookingsListComponent {}
