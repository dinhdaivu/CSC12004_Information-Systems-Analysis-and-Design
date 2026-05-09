import { supabaseServiceRole } from "../config/supabase";
import { Zone, mapZone } from "../models/zone.model";
import { InternalServerError } from "../utils/errors";

export class ZoneService {
  static async getZones(branchId?: string): Promise<Zone[]> {
    try {
      let query = supabaseServiceRole!.from("zones").select("*").order("name", { ascending: true });

      if (branchId) {
        query = query.eq("branch_id", branchId);
      }

      const { data, error } = await query;

      if (error) {
        throw new InternalServerError("Failed to fetch zones");
      }

      return (data || []).map(mapZone);
    } catch (error) {
      if (error instanceof InternalServerError) throw error;
      throw new InternalServerError("An unexpected error occurred while fetching zones");
    }
  }
}