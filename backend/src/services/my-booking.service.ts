import { supabase } from '../config/supabase';
import { NotFoundError, ConflictError, AppError } from '../utils/errors';

export interface MyBookingFilters {
  status?: string;
  type?: string;
}

export class MyBookingService {
  /**
   * Lấy danh sách booking/rental request của một khách hàng cụ thể
   */
  static async getMyBookings(customerId: string, filters: MyBookingFilters) {
    let query = supabase!
      .from('rental_requests')
      .select(`
        *,
        branches ( id, name, address ),
        rooms ( id, room_number, room_type ),
        beds ( id, bed_number )
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    // FIX LỖI ENUM: Map các query status chung sang ENUM chuẩn của DB
    if (filters.status) {
      const statusStr = filters.status.toLowerCase();
      
      switch (statusStr) {
        case 'pending': {
          // Pending trên UI tương đương với mới gửi hoặc đang duyệt trong DB
          query = query.in('status', ['requested', 'reviewing']);
          break;
        }
        case 'confirmed': {
          query = query.in('status', ['viewing_scheduled', 'accepted']);
          break;
        }
        case 'cancelled': {
          query = query.in('status', ['cancelled', 'rejected']);
          break;
        }
        case 'active': {
          query = query.eq('status', 'active');
          break;
        }
        case 'completed': {
          query = query.eq('status', 'completed');
          break;
        }
        case 'deposit_pending': {
          query = query.eq('status', 'deposit_pending');
          break;
        }
        default: {
          // Nếu truyền một status hoàn toàn không hợp lệ, chặn lỗi văng từ Postgres 
          // bằng cách lấy những ENUM hợp lệ hoặc query một ID không tồn tại
          const validEnums = ['requested', 'reviewing', 'viewing_scheduled', 'accepted', 'rejected', 'cancelled', 'deposit_pending', 'completed'];
          if (validEnums.includes(statusStr)) {
            query = query.eq('status', statusStr);
          } else {
             // Query ép rỗng để không bị văng lỗi 500 DB
            query = query.is('id', null);
          }
          break;
        }
      }
    }

    const { data, error } = await query;

    if (error) {
      throw new AppError(500, 'DB_ERROR', `Lỗi truy vấn dữ liệu: ${error.message}`);
    }

    return data;
  }

  /**
   * Lấy chi tiết một booking/request (Có kiểm tra quyền sở hữu)
   */
  static async getBookingById(customerId: string, bookingId: string) {

    const { data, error } = await supabase!
      .from('rental_requests')
      .select(`
        *,
        branches ( id, name, address, phone ),
        rooms ( id, room_number, room_type, price_per_month, max_capacity ),
        beds ( id, bed_number, price_per_month )
      `)
      .eq('id', bookingId)
      .eq('customer_id', customerId)
      .maybeSingle(); // 🔥 đổi từ single -> maybeSingle

    if (error) {
      throw new AppError(500, 'DB_ERROR', error.message);
    }

    if (!data) {
      throw new NotFoundError(
        `Không tìm thấy booking. bookingId=${bookingId}, customerId=${customerId}`
      );
    }

    return data;
  }

  /**
   * Xử lý Action (ví dụ: cancel) với State Machine Validation
   */
  static async handleAction(customerId: string, bookingId: string, action: string) {
    const booking = await this.getBookingById(customerId, bookingId);

    if (action === 'cancel') {
      // Logic State Machine: Chỉ cho phép hủy ở các trạng thái sơ khởi
      const allowedCancelStates = ['requested', 'reviewing', 'viewing_scheduled'];
      
      if (!allowedCancelStates.includes(booking.status)) {
        throw new ConflictError(`Không thể hủy yêu cầu đang ở trạng thái: ${booking.status}`);
      }

      const { data, error } = await supabase!
        .from('rental_requests')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId)
        .eq('customer_id', customerId)
        .select()
        .single();

      if (error) {
        throw new AppError(500, 'DB_UPDATE_ERROR', `Lỗi cập nhật trạng thái: ${error.message}`);
      }

      return data;
    }

    throw new AppError(400, 'INVALID_ACTION', 'Hành động không được hỗ trợ.');
  }
}