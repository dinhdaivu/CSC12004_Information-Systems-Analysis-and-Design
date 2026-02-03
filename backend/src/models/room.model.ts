// Room model interfaces
export interface Room {
  id: string;
  branch_id: string;
  room_number: string;
  max_capacity: number;
  price_per_month: number;
  amenities: string[];
  status: 'available' | 'occupied' | 'maintenance';
  images_url: string[];
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
  status?: 'available' | 'occupied' | 'maintenance';
}

export interface RoomFilter {
  branch_id?: string;
  status?: 'available' | 'occupied' | 'maintenance';
  page?: number;
  limit?: number;
}
