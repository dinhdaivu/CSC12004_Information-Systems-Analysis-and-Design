export type RentalMode = 'whole_room' | 'shared_bed';

export interface RentalPayload {
  expected_move_in_date: string;
  rental_duration_months: number;
  people_count: number;
  preferred_room_type: string;
  note: string;
  branch_id?: string;
  room_id?: string;
  identity_card_base64?: string;
  full_name?: string;
  phone_number?: string;
  gender?: string;
  identity_number?: string;
  // UC1 §3.1.1 — explicit rental mode + matching criteria
  rental_mode?: RentalMode;
  preferred_gender?: 'male' | 'female';
  prefers_quiet?: boolean;
  needs_parking?: boolean;
  needs_air_conditioner?: boolean;
  schedule_note?: string;
}

export interface RentalRequestResponse {
  id: string;
  customer_id: string;
  room_id?: string;
  status: string;
  created_at: string;
}

export interface UpdateRentalStatusPayload {
  status?: string;
  viewing_result?: string;
  room_id?: string;
  bed_id?: string;
}


export interface StaffRentalRequestResponse extends RentalRequestResponse {
  expected_move_in_date?: string;
  rental_duration_months?: number;
  people_count?: number;
  preferred_room_type?: string;
  note?: string;
  identity_card_url?: string;
  users?: {
    full_name: string;
    gender: string;
    phone_number: string;
    email: string;
    identity_number: string;
  };
  branches?: {
    name: string;
  };
  rooms?: {
    room_number: string;
  };
}