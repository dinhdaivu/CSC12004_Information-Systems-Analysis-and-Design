import { Component } from '@angular/core';
import { PageStubComponent } from '@shared/components/page-stub/page-stub.component';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [PageStubComponent],
  template: `
    <app-page-stub
      eyebrowKey="NAV.ADMIN.PAYMENTS"
      titleKey="PAGES.ADMIN_PAYMENTS.TITLE"
      descriptionKey="PAGES.ADMIN_PAYMENTS.DESCRIPTION"
      icon="bi bi-credit-card-2-front-fill"
    ></app-page-stub>
  `
})
export class PaymentsComponent {}
