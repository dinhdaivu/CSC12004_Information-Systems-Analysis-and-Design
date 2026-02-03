import { RoomsListComponent } from './components/rooms-list/rooms-list.component';
import { RoomDetailComponent } from './components/room-detail/room-detail.component';
import { Routes } from '@angular/router';

export const ROOMS_ROUTES: Routes = [
  {
    path: '',
    component: RoomsListComponent
  },
  {
    path: ':id',
    component: RoomDetailComponent
  }
];
