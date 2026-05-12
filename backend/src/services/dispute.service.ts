import { supabaseServiceRole } from '@config/supabase';
import cloudinary from '@config/cloudinary';
import type {
  CreateDisputeInput,
  DisputeDTO,
  DisputeStatus,
  ResolveDisputeInput,
} from '@models/dispute.model';
import { ConflictError, InternalServerError, NotFoundError, ValidationError } from '@utils/errors';

function client() {
  if (!supabaseServiceRole) throw new InternalServerError('Supabase client not configured');
  return supabaseServiceRole;
}

function mapRow(row: Record<string, unknown>): DisputeDTO {
  return {
    id: row.id as string,
    settlementId: (row.settlement_id as string | null) ?? null,
    checkoutRequestId: (row.checkout_request_id as string | null) ?? null,
    customerId: row.customer_id as string,
    name: row.name as string,
    branch: (row.branch as string | null) ?? null,
    reason: row.reason as string,
    evidenceUrl: (row.evidence_url as string | null) ?? null,
    status: row.status as DisputeStatus,
    resolvedAt: (row.resolved_at as string | null) ?? null,
    resolvedBy: (row.resolved_by as string | null) ?? null,
    resolutionNote: (row.resolution_note as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export class DisputeService {
  static async list(filters: { customerId?: string; status?: DisputeStatus } = {}): Promise<DisputeDTO[]> {
    let query = client().from('settlement_disputes').select('*').order('created_at', { ascending: false });
    if (filters.customerId) query = query.eq('customer_id', filters.customerId);
    if (filters.status) query = query.eq('status', filters.status);

    const { data, error } = await query;
    if (error) throw new InternalServerError(`Failed to list disputes: ${error.message}`);
    return ((data as Record<string, unknown>[] | null) ?? []).map(mapRow);
  }

  static async getById(id: string): Promise<DisputeDTO> {
    const { data, error } = await client().from('settlement_disputes').select('*').eq('id', id).maybeSingle();
    if (error) throw new InternalServerError(`Failed to load dispute: ${error.message}`);
    if (!data) throw new NotFoundError('Dispute not found');
    return mapRow(data as Record<string, unknown>);
  }

  static async create(input: CreateDisputeInput): Promise<DisputeDTO> {
    if (!input.name?.trim()) throw new ValidationError('name is required');
    if (!input.reason?.trim()) throw new ValidationError('reason is required');

    // Upload evidence if provided inline (base64)
    let evidenceUrl = input.evidenceUrl ?? null;
    if (!evidenceUrl && input.evidenceBase64) {
      try {
        const result = await cloudinary.uploader.upload(input.evidenceBase64, {
          folder: 'homestay-dorm/disputes',
          resource_type: 'auto',
        });
        evidenceUrl = result.secure_url;
      } catch (err) {
        throw new InternalServerError(
          `Failed to upload evidence: ${err instanceof Error ? err.message : 'unknown error'}`,
        );
      }
    }

    const { data, error } = await client()
      .from('settlement_disputes')
      .insert({
        customer_id: input.customerId,
        settlement_id: input.settlementId ?? null,
        checkout_request_id: input.checkoutRequestId ?? null,
        name: input.name.trim(),
        branch: input.branch ?? null,
        reason: input.reason.trim(),
        evidence_url: evidenceUrl,
        status: 'pending',
      })
      .select('*')
      .single();

    if (error) throw new InternalServerError(`Failed to create dispute: ${error.message}`);
    return mapRow(data as Record<string, unknown>);
  }

  static async resolve(id: string, input: ResolveDisputeInput): Promise<DisputeDTO> {
    const dispute = await this.getById(id);
    if (dispute.status === 'resolved' || dispute.status === 'rejected') {
      throw new ConflictError('Dispute is already finalized');
    }

    const { error } = await client()
      .from('settlement_disputes')
      .update({
        status: input.status,
        resolution_note: input.resolutionNote ?? null,
        resolved_by: input.resolvedBy,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw new InternalServerError(`Failed to resolve dispute: ${error.message}`);
    return this.getById(id);
  }
}
