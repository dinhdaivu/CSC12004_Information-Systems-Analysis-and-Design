export interface Room {
  id: string;
  branch_id: string;
  room_number: string;
  max_capacity: number;
  price_per_month: number;
  amenities: string[];
  status: 'available' | 'occupied' | 'maintenance';
  images_url: string[];
  created_at: string;
  updated_at: string;
}

export interface RoomFilter {
  branch_id?: string;
  status?: 'available' | 'occupied' | 'maintenance';
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
