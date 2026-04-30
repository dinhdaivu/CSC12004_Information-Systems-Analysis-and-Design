import { Component } from '@angular/core';
import { PageStubComponent } from '@shared/components/page-stub/page-stub.component';

@Component({
  selector: 'app-rooms-list',
  standalone: true,
  imports: [PageStubComponent],
  template: `
    <app-page-stub
      eyebrowKey="NAV.PUBLIC.ROOMS"
      titleKey="PAGES.ROOMS_LIST.TITLE"
      descriptionKey="PAGES.ROOMS_LIST.DESCRIPTION"
      icon="bi bi-buildings-fill"
    ></app-page-stub>
  `
})
export class RoomsListComponent {}
