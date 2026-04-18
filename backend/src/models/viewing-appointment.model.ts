export type ViewingAppointmentStatus =
  | "scheduled"
  | "completed"
  | "cancelled"
  | "no_show";

export interface ViewingAppointment {
  id: string;
  rentalRequestId: string;
  customerId: string;
  saleId: string;
  roomId: string;
  bedId: string;
  scheduledAt: string;
  resultNote?: string;
  status: ViewingAppointmentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ViewingAppointmentRow {
  id: string;
  rental_request_id: string;
  customer_id: string;
  sale_id: string;
  room_id: string;
  bed_id: string;
  scheduled_at: string;
  result_note: string | null;
  status: ViewingAppointmentStatus;
  created_at: string;
  updated_at: string;
}

export const mapViewingAppointmentRow = (
  row: ViewingAppointmentRow,
): ViewingAppointment => {
  return {
    id: row.id,
    rentalRequestId: row.rental_request_id,
    customerId: row.customer_id,
    saleId: row.sale_id,
    roomId: row.room_id,
    bedId: row.bed_id,
    scheduledAt: row.scheduled_at,
    resultNote: row.result_note ?? undefined,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};
