import { supabaseServiceRole } from '@config/supabase';

async function expireOverdueDeposits(): Promise<void> {
  if (!supabaseServiceRole) return;

  const now = new Date().toISOString();

  // Find all pending deposits whose due_at has passed
  const { data: expired, error: fetchErr } = await supabaseServiceRole
    .from('deposit_requests')
    .select('id, room_id')
    .eq('status', 'pending')
    .lt('due_at', now);

  if (fetchErr || !expired || expired.length === 0) return;

  const ids = expired.map((r: { id: string }) => r.id);

  // Mark them expired
  await supabaseServiceRole
    .from('deposit_requests')
    .update({ status: 'expired' })
    .in('id', ids);

  // For each affected room, check if it still has active deposits; if not, set available
  const roomIds = [...new Set(expired.map((r: { room_id: string }) => r.room_id))];
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

  console.log(`[Scheduler] Expired ${ids.length} overdue deposit(s).`);
}

export function startScheduler(): void {
  // Run once on startup to catch any missed expirations
  expireOverdueDeposits().catch(console.error);

  // Then run every hour
  setInterval(() => {
    expireOverdueDeposits().catch(console.error);
  }, 60 * 60 * 1000);
}
