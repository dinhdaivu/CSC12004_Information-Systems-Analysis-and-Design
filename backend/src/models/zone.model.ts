export interface ZoneRow {
  id: string;
  branch_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Zone {
  id: string;
  branchId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export const mapZone = (row: ZoneRow): Zone => ({
  id: row.id,
  branchId: row.branch_id,
  name: row.name,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});