export interface Branch {
  id: string;
  name: string;
  address: string;
  description: string;
  heroImage: string;
  roomCount: number;
}

export interface SharedFacility {
  image: string;
  title: string;
  desc: string;
}

export interface RoomData {
  name: string;
  capacity: string;
  amenities: string;
  images: string[];
}

export type RoomType = 'twin' | 'quad';

export interface RoomAvailability {
  status: 'available' | 'full' | 'maintenance';
  availableBeds: number;
  totalBeds: number;
}

export interface BranchDetail {
  id: string;
  name: string;
  address: string;
  description: string;
  heroImage: string;
  sharedFacilities?: SharedFacility[];
  roomFacilities?: Record<RoomType, RoomData>;
  availability?: RoomAvailability;
  policies?: unknown;
}