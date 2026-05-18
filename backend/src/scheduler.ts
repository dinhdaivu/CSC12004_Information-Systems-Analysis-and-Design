import { supabaseServiceRole } from '@config/supabase';

type DepositExpiredRow = { id: string; room_id: string; rental_request_id: string | null };
type DepositDetailRow = { id: string; users: { full_name: string | null; email: string | null } | null };

async function expireOverdueDeposits(): Promise<void> {
  if (!supabaseServiceRole) return;

  const now = new Date().toISOString();

  // Find all pending deposits whose due_at has passed
  const { data: expired, error: fetchErr } = await supabaseServiceRole
    .from('deposit_requests')
    .select('id, room_id, rental_request_id')
    .eq('status', 'pending')
    .lt('due_at', now);

  if (fetchErr || !expired || expired.length === 0) return;

  const expiredRows = expired as DepositExpiredRow[];
  const ids = expiredRows.map((r) => r.id);

  // Mark them expired
  await supabaseServiceRole
    .from('deposit_requests')
    .update({ status: 'expired' })
    .in('id', ids);

  // Mark rental requests as cancelled
  const rentalRequestIds = expiredRows.map((r) => r.rental_request_id).filter(Boolean);
  if (rentalRequestIds.length > 0) {
    await supabaseServiceRole
      .from('rental_requests')
      .update({ status: 'cancelled' })
      .in('id', rentalRequestIds);
  }

  // Send expiration emails
  const { data: expiredDetails } = await supabaseServiceRole
    .from('deposit_requests')
    .select('id, users(full_name, email)')
    .in('id', ids);

  if (expiredDetails) {
    const { sendDepositFailedEmail } = await import('./services/email.service');
    for (const d of expiredDetails as unknown as DepositDetailRow[]) {
      if (d.users?.email) {
        await sendDepositFailedEmail({
          toEmail: d.users.email,
          customerName: d.users.full_name ?? '',
          reason: 'Your deposit payment timeframe of 24 hours has expired.'
        }).catch(console.error);
      }
    }
  }

  // For each affected room, check if it still has active deposits; if not, set available
  const roomIds = [...new Set(expiredRows.map((r) => r.room_id))];
  for (const roomId of roomIds) {
    const { data: active } = await supabaseServiceRole
      .from('deposit_requests')
      .select('id')
      .eq('room_id', roomId)
      .in('status', ['pending', 'paid'])
      .limit(1);

    if (!active || active.length === 0) {
      await supabaseServiceRole
        .from('rooms')
        .update({ status: 'available' })
        .eq('id', roomId);
    }
  }

  console.warn(`[Scheduler] Expired ${ids.length} overdue deposit(s).`);
}

type PendingRentalRow = {
  id: string;
  customer_id: string;
  room_id: string | null;
  bed_id: string | null;
  users: { full_name: string; email: string; gender: string | null } | null;
  rooms: { gender_policy: string | null; status: string; price_per_month: number | null } | null;
  beds: { status: string; price_per_month: number | null } | null;
  branches: { name: string } | null;
};

async function processPendingRentalRequests(): Promise<void> {
  if (!supabaseServiceRole) return;

  // Find rental_requests where status = 'requested'
  const { data: requests, error } = await supabaseServiceRole.from('rental_requests')
    .select('id, customer_id, room_id, bed_id, users(full_name, email, gender), rooms(gender_policy, status, price_per_month), beds(status, price_per_month), branches(name)')
    .eq('status', 'requested');

  if (error || !requests || requests.length === 0) return;

  for (const req of requests as unknown as PendingRentalRow[]) {
    let isMatch = true;
    let failReason = '';

    // 1. Check availability
    let isAvailable = false;
    let rentPrice = 0;

    if (req.bed_id && req.beds) {
      isAvailable = req.beds.status === 'available';
      rentPrice = req.beds.price_per_month || 0;
    } else if (req.room_id && req.rooms) {
      isAvailable = req.rooms.status === 'available';
      rentPrice = req.rooms.price_per_month || 0;
    }

    if (!isAvailable) {
      isMatch = false;
      failReason = 'Phòng/giường bạn chọn hiện đã được khách khác giữ chỗ hoặc đặt cọc trước.';
    }

    // 2. Check gender
    if (isMatch && req.rooms?.gender_policy && req.users?.gender) {
      const roomPol = req.rooms.gender_policy.toLowerCase();
      const userGen = req.users.gender.toLowerCase();
      if (roomPol !== 'mixed' && roomPol !== userGen) {
        isMatch = false;
        failReason = 'Giới tính của bạn không phù hợp với quy định của phòng này.';
      }
    }

    if (isMatch) {
      // Create deposit request
      const depositAmount = rentPrice * 2; // typical 2 months
      const dueAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      
      const { error: depErr } = await supabaseServiceRole.from('deposit_requests').insert({
        rental_request_id: req.id,
        customer_id: req.customer_id,
        room_id: req.room_id,
        bed_id: req.bed_id,
        amount: depositAmount,
        due_at: dueAt,
        status: 'pending'
      }).select().single();

      if (!depErr && req.users) {
        await supabaseServiceRole.from('rental_requests').update({ status: 'deposit_pending' }).eq('id', req.id);

        // Dynamic import to avoid circular dependency
        const { sendDepositInstructionEmail } = await import('./services/email.service');
        await sendDepositInstructionEmail({
          toEmail: req.users.email,
          customerName: req.users.full_name,
          bookingId: req.id,
          depositAmount: depositAmount,
          dueAt: dueAt
        });
      }
    } else {
      // Reject
      await supabaseServiceRole.from('rental_requests').update({ status: 'rejected' }).eq('id', req.id);

      if (req.users) {
        const { sendDepositRejectedEmail } = await import('./services/email.service');
        await sendDepositRejectedEmail({
          toEmail: req.users.email,
          customerName: req.users.full_name,
          roomLabel: req.bed_id ? 'Giường' : 'Phòng',
          branchName: req.branches?.name || 'Homestay',
          resultNote: failReason
        });
      }
    }
  }
}

export function startScheduler(): void {
  // Run once on startup
  expireOverdueDeposits().catch(console.error);
  processPendingRentalRequests().catch(console.error);

  // Then run periodically
  setInterval(() => {
    expireOverdueDeposits().catch(console.error);
  }, 60 * 60 * 1000); // 1 hour for expire

  setInterval(() => {
    processPendingRentalRequests().catch(console.error);
  }, 60 * 1000); // 1 min for pending requests
}
