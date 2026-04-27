import { Component } from '@angular/core';
import { PageStubComponent } from '@shared/components/page-stub/page-stub.component';

@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [PageStubComponent],
  template: `
    <app-page-stub
      eyebrowKey="NAV.ADMIN.USERS"
      titleKey="PAGES.ADMIN_USERS.TITLE"
      descriptionKey="PAGES.ADMIN_USERS.DESCRIPTION"
      icon="bi bi-people-fill"
    ></app-page-stub>
  `
})
export class UsersManagementComponent {}
