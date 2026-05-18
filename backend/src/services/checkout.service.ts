import { supabaseServiceRole } from '@config/supabase';
import type {
  CheckoutInspectionDTO,
  CheckoutInspectionStatus,
  CheckoutListResponse,
  CheckoutRequestDTO,
  CompleteSettlementDTO,
  CreateCheckoutInspectionDTO,
  CreateCheckoutRequestDTO,
  CreateSettlementDTO,
  DamageReportDTO,
  KeyReturnDTO,
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

// Spec §3.1.4:
//   - Deposit paid, no contract effectively in force (cancelled / never moved in): 80%
//   - Contract active, stayed <  6 months: 50%
//   - Contract active, stayed >= 6 months: 70%
//   - Contract expired naturally (end_date passed): 100%
// contractStatus: 'active' | 'terminated' | 'completed'
function calculateRefundRate(
  startDate: string,
  endDate: string,
  contractStatus: string,
): number {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Contract expired naturally
  if (contractStatus === 'completed' || end <= now) return 1.0;

  // Never moved in: settlement requested before start date, or contract was terminated
  // before stay began. Treat as "deposit-only" case → 80%.
  if (now < start) return 0.8;

  const months = monthsBetween(start, now);
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
    customerSignatureUrl: row.customer_signature_url ?? null,
    signedAt: row.signed_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapInspectionRow(row: any): CheckoutInspectionDTO {
  return {
    id: row.id,
    checkoutRequestId: row.checkout_request_id,
    managerId: row.manager_id ?? null,
    inspectedAt: row.inspected_at,
    cleanlinessNote: row.cleanliness_note ?? null,
    overallCondition: row.overall_condition ?? null,
    status: row.status as CheckoutInspectionStatus,
    notes: row.notes ?? null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    damageReports: (row.damage_reports ?? []).map((d: any) => ({
      id: d.id,
      checkoutInspectionId: d.checkout_inspection_id,
      itemName: d.item_name,
      description: d.description ?? null,
      estimatedCost: Number(d.estimated_cost ?? 0),
      imageUrl: d.image_url ?? null,
      createdAt: d.created_at,
    } satisfies DamageReportDTO)),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    keyReturns: (row.key_returns ?? []).map((k: any) => ({
      id: k.id,
      checkoutInspectionId: k.checkout_inspection_id,
      itemName: k.item_name,
      returned: Boolean(k.returned),
      replacementCost: Number(k.replacement_cost ?? 0),
      notes: k.notes ?? null,
      createdAt: k.created_at,
    } satisfies KeyReturnDTO)),
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

  /**
   * Sum unpaid invoice totals for a contract. Used as a minimum deduction floor
   * during settlement so unpaid rent/utilities can't be silently waived.
   */
  static async aggregateUnpaidInvoiceTotal(contractId: string): Promise<number> {
    const client = ensureClient();
    const { data, error } = await client
      .from('invoices')
      .select('total_amount')
      .eq('contract_id', contractId)
      .eq('status', 'unpaid');

    if (error) throw new InternalServerError(`Failed to aggregate unpaid invoices: ${error.message}`);
    return ((data as { total_amount: number | string }[] | null) ?? []).reduce(
      (sum, row) => sum + Number(row.total_amount ?? 0),
      0,
    );
  }

  /**
   * Sum damage estimates + replacement costs for unreturned keys from the
   * checkout inspection. Feeds into the settlement deduction floor.
   */
  static async aggregateInspectionDeduction(checkoutRequestId: string): Promise<number> {
    const client = ensureClient();
    const { data: inspection, error: insErr } = await client
      .from('checkout_inspections')
      .select('id')
      .eq('checkout_request_id', checkoutRequestId)
      .maybeSingle();
    if (insErr) throw new InternalServerError(`Failed to load inspection: ${insErr.message}`);
    if (!inspection) return 0;
    const inspectionId = (inspection as { id: string }).id;

    const [{ data: damages, error: dErr }, { data: keys, error: kErr }] = await Promise.all([
      client.from('damage_reports').select('estimated_cost').eq('checkout_inspection_id', inspectionId),
      client.from('key_returns').select('returned, replacement_cost').eq('checkout_inspection_id', inspectionId),
    ]);
    if (dErr) throw new InternalServerError(`Failed to load damage reports: ${dErr.message}`);
    if (kErr) throw new InternalServerError(`Failed to load key returns: ${kErr.message}`);

    const damageTotal = ((damages as { estimated_cost: number | string }[] | null) ?? []).reduce(
      (s, r) => s + Number(r.estimated_cost ?? 0),
      0,
    );
    const missingKeyTotal = ((keys as { returned: boolean; replacement_cost: number | string }[] | null) ?? [])
      .filter((r) => !r.returned)
      .reduce((s, r) => s + Number(r.replacement_cost ?? 0), 0);

    return damageTotal + missingKeyTotal;
  }

  // ============================================================
  // Checkout inspection management (UC4 §3.1.4 manager inspection)
  // ============================================================

  static async getInspectionByCheckoutId(checkoutRequestId: string): Promise<CheckoutInspectionDTO | null> {
    const client = ensureClient();
    const { data, error } = await client
      .from('checkout_inspections')
      .select(`
        id, checkout_request_id, manager_id, inspected_at, cleanliness_note, overall_condition,
        status, notes, created_at, updated_at,
        damage_reports(id, checkout_inspection_id, item_name, description, estimated_cost, image_url, created_at),
        key_returns(id, checkout_inspection_id, item_name, returned, replacement_cost, notes, created_at)
      `)
      .eq('checkout_request_id', checkoutRequestId)
      .maybeSingle();

    if (error) throw new InternalServerError(`Failed to load checkout inspection: ${error.message}`);
    if (!data) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return mapInspectionRow(data as any);
  }

  static async createInspection(
    checkoutRequestId: string,
    payload: CreateCheckoutInspectionDTO,
  ): Promise<CheckoutInspectionDTO> {
    // Ensure the checkout request exists and is confirmed (manager has accepted the request).
    const checkout = await this.getCheckoutRequestById(checkoutRequestId);
    if (!['requested', 'confirmed'].includes(checkout.status)) {
      throw new ConflictError('Inspection can only be created on active checkout requests');
    }

    const existing = await this.getInspectionByCheckoutId(checkoutRequestId);
    if (existing) {
      throw new ConflictError('An inspection already exists for this checkout request');
    }

    const client = ensureClient();
    const { data: inserted, error } = await client
      .from('checkout_inspections')
      .insert({
        checkout_request_id: checkoutRequestId,
        manager_id: payload.managerId ?? null,
        cleanliness_note: payload.cleanlinessNote ?? null,
        overall_condition: payload.overallCondition ?? null,
        notes: payload.notes ?? null,
        status: 'pending',
      })
      .select('id')
      .single();

    if (error) throw new InternalServerError(`Failed to create inspection: ${error.message}`);
    const inspectionId = (inserted as { id: string }).id;

    if (payload.damageReports && payload.damageReports.length > 0) {
      const { error: dErr } = await client.from('damage_reports').insert(
        payload.damageReports.map((d) => ({
          checkout_inspection_id: inspectionId,
          item_name: d.itemName,
          description: d.description ?? null,
          estimated_cost: d.estimatedCost ?? 0,
          image_url: d.imageUrl ?? null,
        })),
      );
      if (dErr) throw new InternalServerError(`Failed to insert damage reports: ${dErr.message}`);
    }

    if (payload.keyReturns && payload.keyReturns.length > 0) {
      const { error: kErr } = await client.from('key_returns').insert(
        payload.keyReturns.map((k) => ({
          checkout_inspection_id: inspectionId,
          item_name: k.itemName,
          returned: k.returned ?? false,
          replacement_cost: k.replacementCost ?? 0,
          notes: k.notes ?? null,
        })),
      );
      if (kErr) throw new InternalServerError(`Failed to insert key returns: ${kErr.message}`);
    }

    const result = await this.getInspectionByCheckoutId(checkoutRequestId);
    if (!result) throw new InternalServerError('Inspection created but could not be retrieved');
    return result;
  }

  static async completeInspection(checkoutRequestId: string): Promise<CheckoutInspectionDTO> {
    const inspection = await this.getInspectionByCheckoutId(checkoutRequestId);
    if (!inspection) throw new NotFoundError('Inspection not found for this checkout request');
    if (inspection.status === 'completed') {
      throw new ConflictError('Inspection is already completed');
    }

    const { error } = await ensureClient()
      .from('checkout_inspections')
      .update({ status: 'completed' })
      .eq('id', inspection.id);
    if (error) throw new InternalServerError(`Failed to complete inspection: ${error.message}`);

    const refreshed = await this.getInspectionByCheckoutId(checkoutRequestId);
    if (!refreshed) throw new InternalServerError('Inspection refreshed read failed');
    return refreshed;
  }

  /**
   * UC4 §3.1.4: customer signs settlement before refund disbursement.
   * Only confirmed-status settlements can be signed; completion (refund/payment)
   * runs through completeSettlement after this.
   */
  static async signSettlement(settlementId: string, customerSignatureUrl: string): Promise<SettlementDTO> {
    if (!customerSignatureUrl) throw new ValidationError('customerSignatureUrl is required');
    const client = ensureClient();
    const { data: existing, error: fetchErr } = await client
      .from('settlements')
      .select('id, status')
      .eq('id', settlementId)
      .maybeSingle();
    if (fetchErr) throw new InternalServerError(`Failed to load settlement: ${fetchErr.message}`);
    if (!existing) throw new NotFoundError('Settlement not found');
    if ((existing as { status: string }).status !== 'confirmed') {
      throw new ConflictError('Only confirmed settlements can be signed');
    }
    const { error } = await client
      .from('settlements')
      .update({
        customer_signature_url: customerSignatureUrl,
        signed_at: new Date().toISOString(),
      })
      .eq('id', settlementId);
    if (error) throw new InternalServerError(`Failed to sign settlement: ${error.message}`);

    const { data: updated } = await client.from('settlements').select('*').eq('id', settlementId).single();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return mapSettlementRow(updated as any);
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

    const refundRate = calculateRefundRate(
      checkout.contract.startDate,
      checkout.contract.endDate,
      checkout.contract.status,
    );
    const refundBase = depositTotal * refundRate;

    // Auto-aggregate unpaid invoice totals + inspection damage/missing-key costs
    // as a minimum deduction floor. Accountant can still override with a higher
    // figure (additional penalties) via payload.deduction.
    const unpaidInvoiceTotal = await this.aggregateUnpaidInvoiceTotal(checkout.contractId);
    const inspectionCost = await this.aggregateInspectionDeduction(checkoutId);
    const autoFloor = unpaidInvoiceTotal + inspectionCost;
    const requestedDeduction = payload.deduction ?? 0;
    const deduction = Math.max(requestedDeduction, autoFloor);
    const finalAmount = refundBase - deduction;

    const { data: inserted, error } = await client
      .from('settlements')
      .insert({
        checkout_request_id: checkoutId,
        contract_id: checkout.contractId,
        deposit_request_id: depositRequestId,
        deposit_total: depositTotal,
        refund_rate: refundRate,
        deduction,
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

    // UC4 §3.1.4: customer must sign the settlement report before refund/payment is finalized.
    if (!s.customer_signature_url) {
      throw new ConflictError('Customer signature is required before completing settlement');
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
