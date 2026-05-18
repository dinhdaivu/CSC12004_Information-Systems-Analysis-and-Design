import { supabaseServiceRole } from '@config/supabase';
import type {
  CreateDefaultHandoverItemInput,
  DefaultHandoverItemDTO,
  ResolvedHandoverItem,
  UpdateDefaultHandoverItemInput,
} from '@models/default-handover-item.model';
import { InternalServerError, NotFoundError, ValidationError } from '@utils/errors';

function client() {
  if (!supabaseServiceRole) throw new InternalServerError('Supabase client not configured');
  return supabaseServiceRole;
}

function mapRow(row: Record<string, unknown>): DefaultHandoverItemDTO {
  return {
    id: row.id as string,
    roomTypeMatch: row.room_type_match as string,
    itemName: row.item_name as string,
    defaultCondition: row.default_condition as string,
    sortOrder: Number(row.sort_order ?? 0),
    active: Boolean(row.active),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export class DefaultHandoverItemService {
  static async list(activeOnly = false): Promise<DefaultHandoverItemDTO[]> {
    let query = client()
      .from('default_handover_items')
      .select('*')
      .order('room_type_match', { ascending: true })
      .order('sort_order', { ascending: true });
    if (activeOnly) query = query.eq('active', true);

    const { data, error } = await query;
    if (error) throw new InternalServerError(`Failed to list default items: ${error.message}`);
    return ((data as Record<string, unknown>[] | null) ?? []).map(mapRow);
  }

  /**
   * Resolve the set of default items for a specific room type. Always includes
   * the global ('*') items plus any rows whose room_type_match is a substring
   * of the given roomType (case-insensitive).
   */
  static async resolveForRoomType(roomType: string | null | undefined): Promise<ResolvedHandoverItem[]> {
    const all = await this.list(true);
    const needle = (roomType ?? '').toLowerCase();

    const matched = all.filter((item) => {
      if (item.roomTypeMatch === '*') return true;
      if (!needle) return false;
      return needle.includes(item.roomTypeMatch.toLowerCase());
    });

    // Stable order: global items first, then type-specific, by sort_order.
    matched.sort((a, b) => {
      if (a.roomTypeMatch === '*' && b.roomTypeMatch !== '*') return -1;
      if (a.roomTypeMatch !== '*' && b.roomTypeMatch === '*') return 1;
      return a.sortOrder - b.sortOrder;
    });

    return matched.map((item) => ({
      itemName: item.itemName,
      itemCondition: item.defaultCondition,
      notes: '',
      sortOrder: item.sortOrder,
    }));
  }

  static async create(input: CreateDefaultHandoverItemInput): Promise<DefaultHandoverItemDTO> {
    if (!input.itemName?.trim()) throw new ValidationError('itemName is required');
    if (!input.roomTypeMatch?.trim()) throw new ValidationError('roomTypeMatch is required');

    const { data, error } = await client()
      .from('default_handover_items')
      .insert({
        room_type_match: input.roomTypeMatch.trim(),
        item_name: input.itemName.trim(),
        default_condition: input.defaultCondition?.trim() || 'Good',
        sort_order: input.sortOrder ?? 0,
        active: input.active ?? true,
      })
      .select('*')
      .single();

    if (error) throw new InternalServerError(`Failed to create default item: ${error.message}`);
    return mapRow(data as Record<string, unknown>);
  }

  static async update(id: string, input: UpdateDefaultHandoverItemInput): Promise<DefaultHandoverItemDTO> {
    const payload: Record<string, unknown> = {};
    if (input.roomTypeMatch !== undefined) payload.room_type_match = input.roomTypeMatch;
    if (input.itemName !== undefined) payload.item_name = input.itemName;
    if (input.defaultCondition !== undefined) payload.default_condition = input.defaultCondition;
    if (input.sortOrder !== undefined) payload.sort_order = input.sortOrder;
    if (input.active !== undefined) payload.active = input.active;
    if (Object.keys(payload).length === 0) throw new ValidationError('Nothing to update');

    const { data, error } = await client()
      .from('default_handover_items')
      .update(payload)
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error) throw new InternalServerError(`Failed to update default item: ${error.message}`);
    if (!data) throw new NotFoundError('Default item not found');
    return mapRow(data as Record<string, unknown>);
  }

  static async remove(id: string): Promise<void> {
    const { data, error } = await client()
      .from('default_handover_items')
      .delete()
      .eq('id', id)
      .select('id');
    if (error) throw new InternalServerError(`Failed to delete default item: ${error.message}`);
    if (!data || data.length === 0) throw new NotFoundError('Default item not found');
  }
}
