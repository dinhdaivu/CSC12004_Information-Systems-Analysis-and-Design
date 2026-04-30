export type RoomStatus =
  | "available"
  | "holding"
  | "deposited"
  | "occupied"
  | "checkout_pending"
  | "maintenance";

export type BedStatus =
  | "available"
  | "holding"
  | "deposited"
  | "occupied"
  | "maintenance";

export interface Room {
  id: string;
  zoneId: string;
  roomNumber: string;
  roomType?: string;
  maxCapacity: number;
  pricePerMonth: number;
  amenities: string[];
  imagesUrl: string[];
  status: RoomStatus;
  createdAt: string;
  updatedAt: string;
  zones?: {
    id: string;
    name: string;
    branches?: {
        id: string;
        name: string;
        address: string;
    }
  };
  beds?: any[];
}

export interface Bed {
  id: string;
  roomId: string;
  bedNumber: string;
  pricePerMonth: number | null;
  status: BedStatus;
  createdAt: string;
  updatedAt: string;
}

export interface RoomWithBeds extends Room {
  branch: {
    id: string;
    name: string;
    address: string;
  } | null;
  zone?: {
    id: string;
    name: string;
  } | null;
  beds: Bed[];
}

export interface RoomFilters {
  zone_id?: string;
  room_status?: RoomStatus;
  bed_status?: BedStatus;
  room_type?: string;

  capacity?: number;
  min_price?: number;
  max_price?: number;
  search?: string;
}

export interface CreateRoomDTO {
  zone_id: string;
  room_number: string;
  room_type?: string;
  max_capacity: number;
  price_per_month: number;
  amenities?: string[];
  images_url?: string[];
  status?: RoomStatus;
}

export interface UpdateRoomDTO {
  room_number?: string;
  room_type?: string;
  max_capacity?: number;
  price_per_month?: number;
  amenities?: string[];
  images_url?: string[];
  status?: RoomStatus;
}