import { Bed, BedStatus } from "@models/room.model";

export interface CreateBedItemDTO {
  bed_number: string;
  price_per_month?: number | null;
  status?: BedStatus;
}

export interface CreateBedsDTO {
  room_id: string;
  beds: CreateBedItemDTO[];
}

export interface InsertedBedsResponse {
  room_id: string;
  inserted_count: number;
  beds: Bed[];
}

export interface UpdateBedStatusDTO {
  status: BedStatus;
}
