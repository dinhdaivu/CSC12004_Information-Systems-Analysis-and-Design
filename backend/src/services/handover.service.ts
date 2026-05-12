import { supabaseServiceRole } from '@config/supabase';
import type {
  Handover,
  HandoverItem,
  HandoverStatus,
  CreateHandoverInput,
  AddHandoverItemInput,
} from '@models/handover.model';
import { InternalServerError, NotFoundError, ConflictError } from '@utils/errors';

function client() {
  if (!supabaseServiceRole) throw new InternalServerError('Supabase client not configured');
  return supabaseServiceRole;
}

const HANDOVER_SELECT = `
  id, contract_id, manager_id, customer_id, handover_at, status, notes, created_at, updated_at,
  customer:users!handovers_customer_id_fkey(full_name, email),
  manager:users!handovers_manager_id_fkey(full_name),
  contract:contracts!handovers_contract_id_fkey(room_id, bed_id, start_date, end_date),
  handover_items(id, handover_id, item_name, item_condition, notes, created_at)
`;

function mapRow(row: Record<string, unknown>): Handover {
  const c = row.contract as Record<string, unknown> | null;
  const cu = row.customer as Record<string, unknown> | null;
  const m = row.manager as Record<string, unknown> | null;
  const items = (row.handover_items as Record<string, unknown>[] | null) ?? [];

  return {
    id: row.id as string,
    contractId: row.contract_id as string,
    managerId: row.manager_id as string | null,
    customerId: row.customer_id as string,
    handoverAt: row.handover_at as string,
    status: row.status as HandoverStatus,
    notes: row.notes as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    customer: cu ? { fullName: cu.full_name as string, email: cu.email as string } : null,
    manager: m ? { fullName: m.full_name as string } : null,
    contract: c
      ? {
          roomId: c.room_id as string,
          bedId: c.bed_id as string | null,
          startDate: c.start_date as string,
          endDate: c.end_date as string,
        }
      : null,
    items: items.map((i) => ({
      id: i.id as string,
      handoverId: i.handover_id as string,
      itemName: i.item_name as string,
      itemCondition: i.item_condition as string | null,
      notes: i.notes as string | null,
      createdAt: i.created_at as string,
    })) satisfies HandoverItem[],
  };
}

export class HandoverService {
  static async list(filters: { contractId?: string; customerId?: string; status?: HandoverStatus }): Promise<Handover[]> {
    let query = client()
      .from('handovers')
      .select(HANDOVER_SELECT)
      .order('created_at', { ascending: false });

    if (filters.contractId) query = query.eq('contract_id', filters.contractId);
    if (filters.customerId) query = query.eq('customer_id', filters.customerId);
    if (filters.status) query = query.eq('status', filters.status);

    const { data, error } = await query;
    if (error) throw new InternalServerError(`Failed to list handovers: ${error.message}`);
    return (data ?? []).map((r) => mapRow(r as Record<string, unknown>));
  }

  static async getById(id: string): Promise<Handover> {
    const { data, error } = await client()
      .from('handovers')
      .select(HANDOVER_SELECT)
      .eq('id', id)
      .maybeSingle();

    if (error) throw new InternalServerError(`Failed to fetch handover: ${error.message}`);
    if (!data) throw new NotFoundError('Handover not found');
    return mapRow(data as Record<string, unknown>);
  }

  static async create(input: CreateHandoverInput): Promise<Handover> {
    const db = client();

    const { data, error } = await db
      .from('handovers')
      .insert({
        contract_id: input.contractId,
        manager_id: input.managerId ?? null,
        customer_id: input.customerId,
        handover_at: input.handoverAt ?? new Date().toISOString(),
        notes: input.notes ?? null,
        status: 'pending',
      })
      .select('id')
      .single();

    if (error) throw new InternalServerError(`Failed to create handover: ${error.message}`);

    if (input.items && input.items.length > 0) {
      const { error: itemErr } = await db.from('handover_items').insert(
        input.items.map((i) => ({
          handover_id: (data as { id: string }).id,
          item_name: i.itemName,
          item_condition: i.itemCondition ?? null,
          notes: i.notes ?? null,
        })),
      );
      if (itemErr) throw new InternalServerError(`Failed to insert handover items: ${itemErr.message}`);
    }

    return this.getById((data as { id: string }).id);
  }

  static async complete(id: string, managerId: string): Promise<Handover> {
    const db = client();
    const handover = await this.getById(id);

    if (handover.status !== 'pending') {
      throw new ConflictError('Only pending handovers can be completed');
    }

    const { error } = await db
      .from('handovers')
      .update({ status: 'completed', manager_id: managerId })
      .eq('id', id);
    if (error) throw new InternalServerError(`Failed to complete handover: ${error.message}`);

    // Set room and bed to occupied
    if (handover.contract?.roomId) {
      await db.from('rooms').update({ status: 'occupied' }).eq('id', handover.contract.roomId);
    }
    if (handover.contract?.bedId) {
      await db.from('beds').update({ status: 'occupied' }).eq('id', handover.contract.bedId);
    }

    return this.getById(id);
  }

  static async cancel(id: string): Promise<Handover> {
    const handover = await this.getById(id);

    if (handover.status === 'completed') {
      throw new ConflictError('Completed handovers cannot be cancelled');
    }

    const { error } = await client()
      .from('handovers')
      .update({ status: 'cancelled' })
      .eq('id', id);
    if (error) throw new InternalServerError(`Failed to cancel handover: ${error.message}`);

    return this.getById(id);
  }

  static async addItem(handoverId: string, input: AddHandoverItemInput): Promise<HandoverItem> {
    const { data, error } = await client()
      .from('handover_items')
      .insert({
        handover_id: handoverId,
        item_name: input.itemName,
        item_condition: input.itemCondition ?? null,
        notes: input.notes ?? null,
      })
      .select()
      .single();

    if (error) throw new InternalServerError(`Failed to add handover item: ${error.message}`);

    const row = data as Record<string, unknown>;
    return {
      id: row.id as string,
      handoverId: row.handover_id as string,
      itemName: row.item_name as string,
      itemCondition: row.item_condition as string | null,
      notes: row.notes as string | null,
      createdAt: row.created_at as string,
    };
  }
}
