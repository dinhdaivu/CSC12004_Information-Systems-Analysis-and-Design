import { Routes } from '@angular/router';
import type { AppRouteData } from '@shared/models/route-shell.model';
import { RoomDetailComponent } from './components/room-detail/room-detail.component';
import { RoomsListComponent } from './components/rooms-list/rooms-list.component';

export const ROOMS_ROUTES: Routes = [
  {
    path: '',
    component: RoomsListComponent,
    data: {
      access: ['public', 'customer', 'sale', 'accountant', 'manager', 'admin'],
      navLabelKey: 'NAV.PUBLIC.ROOMS',
      pageTitleKey: 'PAGES.ROOMS_LIST.TITLE',
    } satisfies AppRouteData
  },
  {
    path: ':id',
    component: RoomDetailComponent,
    data: {
      access: ['public', 'customer', 'sale', 'accountant', 'manager', 'admin'],
      pageTitleKey: 'PAGES.ROOM_DETAIL.TITLE',
    } satisfies AppRouteData
  }
];
