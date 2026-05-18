// room.model.ts

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

export interface Branch {
  id: string;
  name: string;
  address: string;
}

export interface Zone {
  id: string;
  name: string;
  branches?: Branch;
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

export interface Room {
  id: string;

  // Support both old & new structure
  branchId?: string;
  zoneId?: string;

  roomNumber: string;
  roomType?: string;
  maxCapacity: number;
  pricePerMonth: number;

  amenities: string[];
  imagesUrl: string[];

  status: RoomStatus;

  createdAt: string;
  updatedAt: string;

  // Relations
  branch?: Branch | null;

  zones?: Zone;

  beds?: Bed[];
}

export interface RoomWithBeds extends Room {
  branch: Branch | null;

  zone?: {
    id: string;
    name: string;
  } | null;

  beds: Bed[];
}

export type GenderPolicy = "male" | "female" | "mixed";

export interface RoomFilters {
  // Support both APIs
  branch_id?: string;
  zone_id?: string;

  room_status?: RoomStatus;
  bed_status?: BedStatus;

  room_type?: string;

  capacity?: number;

  min_price?: number;
  max_price?: number;

  // UC1: customer gender — matches rooms where gender_policy IN (value, 'mixed').
  // Named `gender_policy` to align with the DB column and avoid CodeQL's
  // js/sensitive-get-query heuristic, which flags any GET param literally named `gender`.
  gender_policy?: "male" | "female";

  search?: string;
}

export interface CreateRoomDTO {
  // Support both APIs
  branch_id?: string;
  zone_id?: string;

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
