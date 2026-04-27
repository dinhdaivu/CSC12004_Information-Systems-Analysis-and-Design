// Các thuộc tính có sẵn của bạn ở trên
export interface RentalRequest {
    id?: string;
    customer_id: string;
    branch_id?: string;
    room_id?: string;
    bed_id?: string;
    expected_move_in_date: string;
    rental_duration_months: number;
    preferred_room_type?: string;
    budget_min?: number;
    budget_max?: number;
    people_count: number;
    note?: string;
    status?: 'requested' | 'reviewing' | 'viewing_scheduled' | 'accepted' | 'rejected' | 'cancelled' | 'deposit_pending' | 'completed';
    created_at?: string;
    updated_at?: string;
}

// THÊM ĐOẠN NÀY ĐỂ FIX LỖI SERVICE
export type CreateRentalRequestDTO = Omit<RentalRequest, 'id' | 'created_at' | 'updated_at' | 'status'>;