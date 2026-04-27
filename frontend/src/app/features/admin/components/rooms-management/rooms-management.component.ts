import { Component } from '@angular/core';
import { PageStubComponent } from '@shared/components/page-stub/page-stub.component';

@Component({
  selector: 'app-rooms-management',
  standalone: true,
  imports: [PageStubComponent],
  template: `
    <app-page-stub
      eyebrowKey="NAV.ADMIN.ROOMS"
      titleKey="PAGES.ADMIN_ROOMS.TITLE"
      descriptionKey="PAGES.ADMIN_ROOMS.DESCRIPTION"
      icon="bi bi-door-open-fill"
    ></app-page-stub>
  `
})
export class RoomsManagementComponent {}
