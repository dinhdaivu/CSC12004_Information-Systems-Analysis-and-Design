import { Component } from '@angular/core';
import { PageStubComponent } from '@shared/components/page-stub/page-stub.component';

@Component({
  selector: 'app-room-detail',
  standalone: true,
  imports: [PageStubComponent],
  template: `
    <app-page-stub
      eyebrowKey="NAV.PUBLIC.ROOMS"
      titleKey="PAGES.ROOM_DETAIL.TITLE"
      descriptionKey="PAGES.ROOM_DETAIL.DESCRIPTION"
      icon="bi bi-door-open-fill"
    ></app-page-stub>
  `
})
export class RoomDetailComponent {}
