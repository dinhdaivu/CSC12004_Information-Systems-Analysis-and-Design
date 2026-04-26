import { supabase } from '../config/supabase';
import { 
  NotFoundError, 
  ConflictError, 
  InternalServerError 
} from '../utils/errors'; // Sử dụng các lớp lỗi đã định nghĩa
import { CreateRentalRequestDTO, RentalRequest } from '../models/rental-request.model';

export class RentalRequestService {
  /**
   * Tạo Yêu cầu thuê phòng mới và kiểm tra tính khả dụng
   */
  static async createRequest(customerId: string, payload: CreateRentalRequestDTO): Promise<RentalRequest> {
    
    // Kiểm tra kết nối Supabase
    if (!supabase) {
      throw new InternalServerError('Cấu hình Database chưa sẵn sàng');
    }

    // 1. Kiểm tra tính khả dụng (Availability Check)
    if (payload.bed_id) {
      // Truy vấn trạng thái giường nếu khách hàng chọn giường cụ thể (Dorm)
      const { data: bed, error: bedError } = await supabase
        .from('beds')
        .select('status')
        .eq('id', payload.bed_id)
        .single();

      if (bedError || !bed) throw new NotFoundError('Giường không tồn tại');
      // Trạng thái khả dụng được định nghĩa là 'available' trong Schema
      if (bed.status !== 'available') {
        throw new ConflictError('Giường này hiện không còn trống');
      }
      
    } else if (payload.room_id) {
      // Truy vấn trạng thái phòng nếu khách hàng chọn phòng nguyên căn
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('status')
        .eq('id', payload.room_id)
        .single();

      if (roomError || !room) throw new NotFoundError('Phòng không tồn tại');
      // Trạng thái khả dụng được định nghĩa là 'available' trong Schema
      if (room.status !== 'available') {
        throw new ConflictError('Phòng này hiện không còn trống');
      }
    }

    // 2. Viết hàm tạo Request: Insert dữ liệu vào bảng rental_requests
    const { data: newRequest, error: insertError } = await supabase
      .from('rental_requests')
      .insert([
        {
          customer_id: customerId,
          branch_id: payload.branch_id || null,
          room_id: payload.room_id || null,
          bed_id: payload.bed_id || null,
          preferred_room_type: payload.preferred_room_type || null,
          budget_min: payload.budget_min || null,
          budget_max: payload.budget_max || null,
          people_count: payload.people_count || 1,
          note: payload.note || null,
          status: 'requested' // Trạng thái khởi tạo theo quy định
        }
      ])
      .select()
      .single();

    // 3. Xử lý lỗi hệ thống nếu insert thất bại
    if (insertError) {
      throw new InternalServerError(`Lỗi khi tạo yêu cầu thuê: ${insertError.message}`);
    }

    return newRequest;
  }
}