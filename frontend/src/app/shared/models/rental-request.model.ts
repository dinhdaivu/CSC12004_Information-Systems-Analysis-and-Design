export interface RentalRequestPayload {
  room_id?: string | null;
  expected_move_in_date: string;
  rental_duration_months: number;
  people_count: number;
  budget_max?: number;
  note?: string;
}

export interface RentalRequestResponse {
  id: string;
  customer_id: string;
  room_id?: string;
  status: string;
  created_at: string;
}