import { Component } from '@angular/core';
import { PageStubComponent } from '@shared/components/page-stub/page-stub.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [PageStubComponent],
  template: `
    <app-page-stub
      eyebrowKey="NAV.ADMIN.OVERVIEW"
      titleKey="PAGES.ADMIN_DASHBOARD.TITLE"
      descriptionKey="PAGES.ADMIN_DASHBOARD.DESCRIPTION"
      icon="bi bi-grid-1x2-fill"
    ></app-page-stub>
  `
})
export class AdminDashboardComponent {}
