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
  created_at: string;
  updated_at: string;
}

export interface RoomFilter {
  branch_id?: string;
  status?: RoomStatus;
  min_capacity?: number;
  max_capacity?: number;
  min_price?: number;
  max_price?: number;
  page?: number;
  limit?: number;
}

export interface RoomResponse {
  success: boolean;
  data: Room | Room[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
