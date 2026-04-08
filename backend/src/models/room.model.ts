// Room model interfaces
export type RoomStatus =
  | 'available'
  | 'holding'
  | 'deposited'
  | 'occupied'
  | 'checkout_pending'
  | 'maintenance';

export interface Room {
  id: string;
  branch_id: string;
  room_number: string;
  room_type?: string;
  max_capacity: number;
  price_per_month: number;
  amenities: string[];
  images_url: string[];
  status: RoomStatus;
  created_at: Date;
  updated_at: Date;
}

export interface CreateRoomDTO {
  branch_id: string;
  room_number: string;
  max_capacity: number;
  price_per_month: number;
  amenities?: string[];
}

export interface UpdateRoomDTO {
  room_number?: string;
  max_capacity?: number;
  price_per_month?: number;
  amenities?: string[];
  status?: RoomStatus;
}

export interface RoomFilter {
  branch_id?: string;
  status?: RoomStatus;
  page?: number;
  limit?: number;
}
