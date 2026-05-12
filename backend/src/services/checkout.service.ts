import { supabaseServiceRole } from '@config/supabase';
import type {
  CheckoutListResponse,
  CheckoutRequestDTO,
  CompleteSettlementDTO,
  CreateCheckoutRequestDTO,
  CreateSettlementDTO,
  SettlementDTO,
} from '@models/checkout.model';
import {
  ConflictError,
  InternalServerError,
  NotFoundError,
  ValidationError,
} from '@utils/errors';

const CHECKOUT_SELECT = `
  id,
  contract_id,
  customer_id,
  requested_checkout_date,
  reason,
  status,
  created_at,
  updated_at,
  customer:users!checkout_requests_customer_id_fkey(id, full_name, email, phone_number),
  contract:contracts!checkout_requests_contract_id_fkey(
    id, start_date, end_date, monthly_price, status, room_id, bed_id, deposit_request_id
  ),
  room:contracts!checkout_requests_contract_id_fkey(
    room:rooms!contracts_room_id_fkey(id, room_number, room_type)
  ),
  bed:contracts!checkout_requests_contract_id_fkey(
    bed:beds!contracts_bed_id_fkey(id, bed_number)
  )
`;

function ensureClient() {
  if (!supabaseServiceRole) throw new InternalServerError('Supabase service role client is not configured');
  return supabaseServiceRole;
}

function monthsBetween(from: Date, to: Date): number {
  return (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
}

function calculateRefundRate(startDate: string, endDate: string): number {
  const now = new Date();
  const end = new Date(endDate);
  if (end <= now) return 1.0;
  const months = monthsBetween(new Date(startDate), now);
  return months < 6 ? 0.5 : 0.7;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any): CheckoutRequestDTO {
  const contractRaw = row.contract;
  const roomRaw = row.room?.room ?? null;
  const bedRaw = row.bed?.bed ?? null;

  return {
    id: row.id,
    contractId: row.contract_id,
    customerId: row.customer_id,
    requestedCheckoutDate: row.requested_checkout_date,
    reason: row.reason ?? null,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    customer: row.customer
      ? { id: row.customer.id, fullName: row.customer.full_name ?? null, email: row.customer.email, phoneNumber: row.customer.phone_number ?? null }
      : null,
    contract: contractRaw
      ? {
          id: contractRaw.id,
          startDate: contractRaw.start_date,
          endDate: contractRaw.end_date,
          monthlyPrice: Number(contractRaw.monthly_price),
          status: contractRaw.status,
          roomId: contractRaw.room_id,
          bedId: contractRaw.bed_id ?? null,
          depositRequestId: contractRaw.deposit_request_id ?? null,
        }
      : null,
    room: roomRaw ? { id: roomRaw.id, roomNumber: roomRaw.room_number, roomType: roomRaw.room_type } : null,
    bed: bedRaw ? { id: bedRaw.id, bedNumber: bedRaw.bed_number } : null,
    settlement: null,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSettlementRow(row: any): SettlementDTO {
  return {
    id: row.id,
    checkoutRequestId: row.checkout_request_id,
    contractId: row.contract_id,
    depositRequestId: row.deposit_request_id ?? null,
    depositTotal: Number(row.deposit_total),
    refundRate: Number(row.refund_rate),
    deduction: Number(row.deduction),
    finalAmount: Number(row.final_amount),
    paymentMethod: row.payment_method ?? null,
    status: row.status,
    notes: row.notes ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class CheckoutService {
  static async listCheckoutRequests(filters: {
    page: number;
    limit: number;
    status?: string;
    customerId?: string;
  }): Promise<CheckoutListResponse> {
    const client = ensureClient();

    let query = client
      .from('checkout_requests')
      .select(CHECKOUT_SELECT, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (filters.status) query = query.eq('status', filters.status);
    if (filters.customerId) query = query.eq('customer_id', filters.customerId);

    const from = (filters.page - 1) * filters.limit;
    const { data, error, count } = await query.range(from, from + filters.limit - 1);

    if (error) throw new InternalServerError(`Failed to list checkout requests: ${error.message}`);

    const rows = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((data as any[]) ?? []).map(async (row) => {
        const dto = mapRow(row);
        dto.settlement = await this.getSettlementByCheckoutId(dto.id);
        return dto;
      }),
    );

    const total = count ?? 0;
    return {
      data: rows,
      meta: { page: filters.page, limit: filters.limit, total, totalPages: total > 0 ? Math.ceil(total / filters.limit) : 0 },
    };
  }

  static async getCheckoutRequestById(id: string): Promise<CheckoutRequestDTO> {
    const client = ensureClient();

    const { data, error } = await client
      .from('checkout_requests')
      .select(CHECKOUT_SELECT)
      .eq('id', id)
      .maybeSingle();

    if (error) throw new InternalServerError(`Failed to load checkout request: ${error.message}`);
    if (!data) throw new NotFoundError('Checkout request not found');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dto = mapRow(data as any);
    dto.settlement = await this.getSettlementByCheckoutId(id);
    return dto;
  }

  static async createCheckoutRequest(payload: CreateCheckoutRequestDTO): Promise<CheckoutRequestDTO> {
    const client = ensureClient();

    const { data: contract, error: contractErr } = await client
      .from('contracts')
      .select('id, status, customer_id')
      .eq('id', payload.contract_id)
      .maybeSingle();

    if (contractErr) throw new InternalServerError(`Failed to validate contract: ${contractErr.message}`);
    if (!contract) throw new NotFoundError('Contract not found');
    if ((contract as { status: string }).status === 'terminated') {
      throw new ConflictError('Contract is already terminated');
    }
    if ((contract as { customer_id: string }).customer_id !== payload.customer_id) {
      throw new ConflictError('Contract does not belong to this customer');
    }

    const { data: existing } = await client
      .from('checkout_requests')
      .select('id')
      .eq('contract_id', payload.contract_id)
      .in('status', ['requested', 'confirmed'])
      .limit(1);

    if (existing && existing.length > 0) {
      throw new ConflictError('An active checkout request already exists for this contract');
    }

    const checkoutDate = new Date(payload.requested_checkout_date);
    if (isNaN(checkoutDate.getTime())) throw new ValidationError('requested_checkout_date must be a valid date');

    const { data: inserted, error: insertErr } = await client
      .from('checkout_requests')
      .insert({
        contract_id: payload.contract_id,
        customer_id: payload.customer_id,
        requested_checkout_date: payload.requested_checkout_date,
        reason: payload.reason ?? null,
        status: 'requested',
      })
      .select('id')
      .single();

    if (insertErr) throw new InternalServerError(`Failed to create checkout request: ${insertErr.message}`);

    return this.getCheckoutRequestById((inserted as { id: string }).id);
  }

  static async confirmCheckoutRequest(id: string): Promise<CheckoutRequestDTO> {
    const checkout = await this.getCheckoutRequestById(id);

    if (checkout.status !== 'requested') {
      throw new ConflictError('Only requests with status "requested" can be confirmed');
    }

    const client = ensureClient();
    const { error } = await client
      .from('checkout_requests')
      .update({ status: 'confirmed' })
      .eq('id', id);

    if (error) throw new InternalServerError(`Failed to confirm checkout request: ${error.message}`);

    return this.getCheckoutRequestById(id);
  }

  static async getSettlementByCheckoutId(checkoutId: string): Promise<SettlementDTO | null> {
    const client = ensureClient();

    const { data, error } = await client
      .from('settlements')
      .select('*')
      .eq('checkout_request_id', checkoutId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw new InternalServerError(`Failed to load settlement: ${error.message}`);
    if (!data) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return mapSettlementRow(data as any);
  }

  static async createSettlement(checkoutId: string, payload: CreateSettlementDTO): Promise<SettlementDTO> {
    const checkout = await this.getCheckoutRequestById(checkoutId);

    if (checkout.status !== 'confirmed') {
      throw new ConflictError('Settlement can only be created after manager confirms the room inspection');
    }

    const existing = await this.getSettlementByCheckoutId(checkoutId);
    if (existing && existing.status !== 'cancelled') {
      throw new ConflictError('An active settlement already exists for this checkout request');
    }

    if (!checkout.contract) throw new ConflictError('Checkout request has no linked contract');

    const client = ensureClient();

    // Resolve deposit amount
    let depositTotal = 0;
    let depositRequestId: string | null = null;

    if (checkout.contract.depositRequestId) {
      const { data: dep } = await client
        .from('deposit_requests')
        .select('id, amount, status')
        .eq('id', checkout.contract.depositRequestId)
        .maybeSingle();

      if (dep && (dep as { status: string }).status === 'paid') {
        depositTotal = Number((dep as { amount: number }).amount);
        depositRequestId = (dep as { id: string }).id;
      }
    }

    const refundRate = calculateRefundRate(checkout.contract.startDate, checkout.contract.endDate);
    const refundBase = depositTotal * refundRate;
    const finalAmount = refundBase - (payload.deduction ?? 0);

    const { data: inserted, error } = await client
      .from('settlements')
      .insert({
        checkout_request_id: checkoutId,
        contract_id: checkout.contractId,
        deposit_request_id: depositRequestId,
        deposit_total: depositTotal,
        refund_rate: refundRate,
        deduction: payload.deduction ?? 0,
        final_amount: finalAmount,
        payment_method: payload.payment_method ?? null,
        status: 'draft',
        notes: payload.notes ?? null,
      })
      .select('id')
      .single();

    if (error) throw new InternalServerError(`Failed to create settlement: ${error.message}`);

    const settlement = await this.getSettlementByCheckoutId(checkoutId);
    if (!settlement) throw new InternalServerError('Settlement was created but could not be retrieved');

    void inserted;
    return settlement;
  }

  static async updateSettlementDeduction(settlementId: string, payload: { deduction: number; notes?: string }): Promise<SettlementDTO> {
    const client = ensureClient();

    const { data: existing, error: fetchErr } = await client
      .from('settlements')
      .select('id, status, deposit_total, refund_rate')
      .eq('id', settlementId)
      .maybeSingle();

    if (fetchErr) throw new InternalServerError(`Failed to load settlement: ${fetchErr.message}`);
    if (!existing) throw new NotFoundError('Settlement not found');

    const s = existing as { id: string; status: string; deposit_total: number; refund_rate: number };

    if (s.status !== 'draft') {
      throw new ConflictError('Only draft settlements can be updated');
    }

    const refundBase = Number(s.deposit_total) * Number(s.refund_rate);
    const finalAmount = refundBase - payload.deduction;

    const { error } = await client
      .from('settlements')
      .update({
        deduction: payload.deduction,
        final_amount: finalAmount,
        notes: payload.notes ?? null,
      })
      .eq('id', settlementId);

    if (error) throw new InternalServerError(`Failed to update settlement: ${error.message}`);

    const { data: updated } = await client.from('settlements').select('*').eq('id', settlementId).single();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return mapSettlementRow(updated as any);
  }

  static async confirmSettlement(settlementId: string): Promise<SettlementDTO> {
    const client = ensureClient();

    const { data: existing, error: fetchErr } = await client
      .from('settlements')
      .select('id, status')
      .eq('id', settlementId)
      .maybeSingle();

    if (fetchErr) throw new InternalServerError(`Failed to load settlement: ${fetchErr.message}`);
    if (!existing) throw new NotFoundError('Settlement not found');

    if ((existing as { status: string }).status !== 'draft') {
      throw new ConflictError('Only draft settlements can be confirmed');
    }

    const { error } = await client
      .from('settlements')
      .update({ status: 'confirmed' })
      .eq('id', settlementId);

    if (error) throw new InternalServerError(`Failed to confirm settlement: ${error.message}`);

    const { data: updated } = await client.from('settlements').select('*').eq('id', settlementId).single();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return mapSettlementRow(updated as any);
  }

  static async completeSettlement(settlementId: string, payload: CompleteSettlementDTO): Promise<SettlementDTO> {
    const client = ensureClient();

    const { data: existing, error: fetchErr } = await client
      .from('settlements')
      .select('*, checkout_request:checkout_requests!settlements_checkout_request_id_fkey(id, contract_id, customer_id)')
      .eq('id', settlementId)
      .maybeSingle();

    if (fetchErr) throw new InternalServerError(`Failed to load settlement: ${fetchErr.message}`);
    if (!existing) throw new NotFoundError('Settlement not found');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = existing as any;

    if (s.status !== 'confirmed') {
      throw new ConflictError('Only confirmed settlements can be completed');
    }

    const finalAmount = Number(s.final_amount);
    const newStatus = finalAmount >= 0 ? 'refunded' : 'paid';

    const { error: updateErr } = await client
      .from('settlements')
      .update({ status: newStatus, payment_method: payload.payment_method, notes: payload.notes ?? s.notes })
      .eq('id', settlementId);

    if (updateErr) throw new InternalServerError(`Failed to complete settlement: ${updateErr.message}`);

    // Create payment record
    const paymentType = finalAmount >= 0 ? 'refund' : 'fee';
    await client.from('payments').insert({
      user_id: s.checkout_request.customer_id,
      settlement_id: settlementId,
      contract_id: s.contract_id,
      amount: Math.abs(finalAmount) > 0 ? Math.abs(finalAmount) : 1,
      type: paymentType,
      status: 'completed',
      payment_method: payload.payment_method,
      notes: payload.notes ?? null,
    });

    // Mark deposit as refunded if it was a refund
    if (finalAmount >= 0 && s.deposit_request_id) {
      await client
        .from('deposit_requests')
        .update({ status: 'refunded' })
        .eq('id', s.deposit_request_id);
    }

    const { data: updated } = await client.from('settlements').select('*').eq('id', settlementId).single();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return mapSettlementRow(updated as any);
  }

  static async completeCheckout(checkoutId: string): Promise<CheckoutRequestDTO> {
    const checkout = await this.getCheckoutRequestById(checkoutId);

    if (checkout.status !== 'confirmed') {
      throw new ConflictError('Checkout request must be confirmed before completion');
    }

    const settlement = await this.getSettlementByCheckoutId(checkoutId);
    if (!settlement || (settlement.status !== 'refunded' && settlement.status !== 'paid')) {
      throw new ConflictError('Settlement must be fully processed before completing checkout');
    }

    const client = ensureClient();

    // Determine contract final status
    const contractStatus = checkout.contract
      ? new Date(checkout.contract.endDate) <= new Date() ? 'completed' : 'terminated'
      : 'terminated';

    await client.from('contracts').update({ status: contractStatus }).eq('id', checkout.contractId);

    // Free up room and bed
    if (checkout.contract?.roomId) {
      await client.from('rooms').update({ status: 'available' }).eq('id', checkout.contract.roomId);
    }
    if (checkout.contract?.bedId) {
      await client.from('beds').update({ status: 'available' }).eq('id', checkout.contract.bedId);
    }

    const { error } = await client
      .from('checkout_requests')
      .update({ status: 'completed' })
      .eq('id', checkoutId);

    if (error) throw new InternalServerError(`Failed to complete checkout: ${error.message}`);

    return this.getCheckoutRequestById(checkoutId);
  }

  static async cancelCheckoutRequest(id: string): Promise<CheckoutRequestDTO> {
    const checkout = await this.getCheckoutRequestById(id);

    if (!['requested', 'confirmed'].includes(checkout.status)) {
      throw new ConflictError('Only active checkout requests can be cancelled');
    }

    const client = ensureClient();
    const { error } = await client
      .from('checkout_requests')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (error) throw new InternalServerError(`Failed to cancel checkout request: ${error.message}`);

    return this.getCheckoutRequestById(id);
  }
}
