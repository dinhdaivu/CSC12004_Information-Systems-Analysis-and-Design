export interface RentalPayload {
  expected_move_in_date: string;
  rental_duration_months: number;
  people_count: number;
  preferred_room_type: string;
  note: string;
  branch_id?: string;
  room_id?: string;
}

export interface RentalRequestResponse {
  id: string;
  customer_id: string;
  room_id?: string;
  status: string;
  created_at: string;
}