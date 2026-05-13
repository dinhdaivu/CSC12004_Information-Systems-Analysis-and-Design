import { supabaseServiceRole } from '../config/supabase';
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
    let query = supabaseServiceRole!
      .from('rental_requests')
      .select(`
        *,
        branches ( id, name, address ),
        rooms ( id, room_number, room_type ),
        beds ( id, bed_number ),
        users ( full_name, gender, phone_number, email, identity_number )
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

    const { data, error } = await supabaseServiceRole!
      .from('rental_requests')
      .select(`
        *,
        branches ( id, name, address, phone ),
        rooms ( id, room_number, room_type, price_per_month, max_capacity, status ),
        beds ( id, bed_number, price_per_month, status ),
        users ( full_name, gender, phone_number, email, identity_number ),
        deposit_requests ( id, amount, due_at, status, paid_at, notes, proof_image_url )
      `)
      .eq('id', bookingId)
      .eq('customer_id', customerId)
      .maybeSingle();

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
  static async handleAction(customerId: string, bookingId: string, action: string, payload?: any) {
    const booking = await this.getBookingById(customerId, bookingId);

    if (action === 'cancel') {
      // Logic State Machine: Chỉ cho phép hủy ở các trạng thái sơ khởi
      const allowedCancelStates = ['requested', 'reviewing', 'viewing_scheduled'];
      
      if (!allowedCancelStates.includes(booking.status)) {
        throw new ConflictError(`Không thể hủy yêu cầu đang ở trạng thái: ${booking.status}`);
      }

      const { data, error } = await supabaseServiceRole!
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

  static async checkAvailability(customerId: string, bookingId: string): Promise<boolean> {
    const booking = await this.getBookingById(customerId, bookingId);

    // Check availability
    let isAvailable = false;
    
    // Nếu có bed_id thì check bed, nếu không check room
    if (booking.beds) {
      isAvailable = booking.beds.status === 'available';
    } else if (booking.rooms) {
      isAvailable = booking.rooms.status === 'available';
    }

    if (!isAvailable) {
      // DB updates must complete before we return; fire email without blocking
      await supabaseServiceRole!
        .from('rental_requests')
        .update({ status: 'rejected' })
        .eq('id', bookingId);

      const depositRequest = booking.deposit_requests?.find((d: any) => d.status === 'pending');
      if (depositRequest) {
        await supabaseServiceRole!
          .from('deposit_requests')
          .update({ status: 'cancelled' })
          .eq('id', depositRequest.id);
      }

      // Fire-and-forget email — don't block the HTTP response
      import('./email.service').then(({ sendDepositRejectedEmail }) => {
        const roomLabel = booking.beds
          ? `Room ${booking.rooms.room_number} - Bed ${booking.beds.bed_number}`
          : `Room ${booking.rooms.room_number}`;
        sendDepositRejectedEmail({
          toEmail: booking.users.email,
          customerName: booking.users.full_name,
          roomLabel,
          branchName: booking.branches.name,
          resultNote: 'Phòng/giường bạn chọn hiện đã được khách khác đặt hoặc không còn trống.'
        }).catch((e: unknown) => console.error('sendDepositRejectedEmail failed:', e));
      }).catch(() => {});
    } else {
      const depositRequest = booking.deposit_requests?.find((d: any) => d.status === 'pending');
      if (depositRequest) {
        // Fire-and-forget email — don't block the HTTP response
        import('./email.service').then(({ sendDepositTermsAndPaymentEmail }) => {
          sendDepositTermsAndPaymentEmail({
            toEmail: booking.users.email,
            customerName: booking.users.full_name,
            depositAmount: depositRequest.amount
          }).catch((e: unknown) => console.error('sendDepositTermsAndPaymentEmail failed:', e));
        }).catch(() => {});
      }
    }

    return isAvailable;
  }

  static async submitDepositProof(customerId: string, bookingId: string, base64Image: string) {
    const booking = await this.getBookingById(customerId, bookingId);

    // Get the pending deposit request — auto-create if missing (legacy bookings)
    let depositRequest = booking.deposit_requests?.find((d: any) => d.status === 'pending');
    if (!depositRequest) {
      if (!booking.rooms?.id) {
        throw new ConflictError('Booking chưa được gán phòng, không thể nộp minh chứng.');
      }

      // Calculate amount: price × 2 × bedsCount (same formula as the controller)
      const bedsCount = booking.beds?.id ? 1 : (booking.rooms.max_capacity ?? 1);
      const amount = (booking.rooms.price_per_month ?? 0) * 2 * bedsCount;

      const { data: newDeposit, error: createErr } = await supabaseServiceRole!
        .from('deposit_requests')
        .insert({
          rental_request_id: bookingId,
          customer_id: customerId,
          room_id: booking.rooms.id,
          bed_id: booking.beds?.id ?? null,
          amount,
          due_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
        })
        .select('id, amount, due_at, status, paid_at, notes')
        .single();

      if (createErr || !newDeposit) {
        throw new AppError(500, 'DEPOSIT_CREATE_ERROR', `Không thể tạo deposit request: ${createErr?.message}`);
      }
      depositRequest = newDeposit;
    }

    // Import cloudinary lazily to avoid circular issues
    const cloudinary = (await import('../config/cloudinary')).default;
    
    let proofImageUrl = '';
    try {
      const uploadResult = await cloudinary.uploader.upload(base64Image, {
        folder: 'homestay-dorm/deposits'
      });
      proofImageUrl = uploadResult.secure_url;
    } catch (err: any) {
      throw new AppError(500, 'UPLOAD_ERROR', `Lỗi khi tải ảnh lên: ${err.message}`);
    }

    // Update deposit request with proof URL
    const { error: depositError } = await supabaseServiceRole!
      .from('deposit_requests')
      .update({ proof_image_url: proofImageUrl })
      .eq('id', depositRequest.id);

    if (depositError) {
      throw new AppError(500, 'DB_UPDATE_ERROR', `Lỗi cập nhật ảnh: ${depositError.message}`);
    }

    // Notify admin
    try {
      const { sendDepositSubmittedEmail } = await import('./email.service');
      const roomLabel = booking.beds 
        ? `Room ${booking.rooms?.room_number} - Bed ${booking.beds?.bed_number}`
        : `Room ${booking.rooms?.room_number}`;
        
      await sendDepositSubmittedEmail({
        customerName: booking.users?.full_name || 'Unknown',
        roomLabel: roomLabel,
        depositAmount: depositRequest.amount,
        depositId: depositRequest.id
      });
    } catch (e) {
      console.error('Failed to send admin notification email:', e);
    }

    return this.getBookingById(customerId, bookingId);
  }
}