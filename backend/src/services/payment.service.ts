import type {
  PaymentListItemDTO,
  PaymentQueryFiltersDTO,
} from "@models/payment-dashboard.model";
import { PaymentRepository } from "../repositories/payment.repository";

export class PaymentService {
  static async getPayments(
    filters: PaymentQueryFiltersDTO,
  ): Promise<PaymentListItemDTO[]> {
    return PaymentRepository.list(filters);
  }
}
