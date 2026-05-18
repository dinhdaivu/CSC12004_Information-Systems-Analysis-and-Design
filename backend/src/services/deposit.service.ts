import type {
  DepositActionResultDTO,
  DepositDetailDTO,
  DepositListItemDTO,
  DepositQueryFiltersDTO,
} from "@models/deposit-dashboard.model";
import { DepositRepository } from "../repositories/deposit.repository";
import {
  ConflictError,
  InternalServerError,
  NotFoundError,
  ValidationError,
} from "@utils/errors";
import {
  sendDepositConfirmedEmail,
  sendDepositFailedEmail,
} from "./email.service";

export class DepositService {
  static async createDeposit(input: {
    rentalRequestId?: string;
    customerId: string;
    roomId: string;
    bedId?: string;
    amount: number;
    dueAt?: string;
    notes?: string;
  }): Promise<DepositDetailDTO> {
    // UC2-3 (spec §3.1.2): deposit = monthly_rent × 2 × number_of_beds_rented.
    // For per-bed rental: number_of_beds = 1.
    // For whole-room rental (bedId is null): number_of_beds = room.max_capacity.
    const monthlyPrice = input.bedId
      ? await DepositRepository.getBedPrice(input.bedId)
      : await DepositRepository.getRoomPrice(input.roomId);

    let bedsCount = 1;
    if (!input.bedId) {
      const capacity = await DepositRepository.getRoomCapacity(input.roomId);
      if (capacity && capacity > 0) bedsCount = capacity;
    }

    if (monthlyPrice !== null) {
      const minimum = monthlyPrice * 2 * bedsCount;
      if (input.amount < minimum) {
        throw new ValidationError(
          `Deposit amount must be at least 2 months' rent × ${bedsCount} bed(s) (${minimum.toLocaleString()} VND)`,
        );
      }
    }

    const id = await DepositRepository.createDeposit(input);
    const deposit = await DepositRepository.findById(id);
    if (!deposit) throw new InternalServerError("Deposit not found after creation");
    return deposit;
  }

  static async getDeposits(
    filters: DepositQueryFiltersDTO,
  ): Promise<DepositListItemDTO[]> {
    return DepositRepository.list(filters);
  }

  static async getDepositById(id: string): Promise<DepositDetailDTO> {
    const deposit = await DepositRepository.findById(id);

    if (!deposit) {
      throw new NotFoundError("Deposit request not found");
    }

    return deposit;
  }

  static async confirmDeposit(
    id: string,
    actorId: string,
  ): Promise<DepositActionResultDTO> {
    const currentDeposit = await this.getDepositById(id);

    if (currentDeposit.status !== "pending") {
      throw new ConflictError("Only pending deposits can be confirmed");
    }

    const room = await DepositRepository.getRoomById(currentDeposit.roomId);
    if (!room) {
      throw new NotFoundError("Room not found");
    }

    const paidAt = new Date().toISOString();
    const updated = await DepositRepository.updateStatusIfPending(
      id,
      "paid",
      paidAt,
    );

    if (!updated) {
      throw new ConflictError("Deposit request is no longer pending");
    }

    const roomUpdated = await DepositRepository.updateRoomStatus(
      currentDeposit.roomId,
      "deposited",
    );

    if (!roomUpdated) {
      await DepositRepository.rollbackToPending(id);
      throw new InternalServerError(
        "Failed to update room status while confirming deposit",
      );
    }

    await DepositRepository.createCompletedDepositPayment({
      userId: actorId,
      depositRequestId: id,
      amount: currentDeposit.amount,
    });

    if (currentDeposit.rentalRequestId) {
      await DepositRepository.updateRentalRequestStatus(
        currentDeposit.rentalRequestId,
        "accepted",
      );
    }

    if (currentDeposit.customer?.email) {
      // Best-effort fetch for branch name
      let branchName = "Homestay Dorm";
      try {
        const { data: branch } = await DepositRepository.getRoomById(currentDeposit.roomId).then(async (r) => {
          if (!r) return { data: null };
          const client = (await import("@config/supabase")).supabaseServiceRole;
          if (!client) return { data: null };
          return client.from("branches").select("name").eq("id", r.branchId).single();
        });
        if (branch) branchName = branch.name;
      } catch { /* best-effort */ }

      await sendDepositConfirmedEmail({
        toEmail: currentDeposit.customer.email,
        customerName: currentDeposit.customer.fullName,
        roomLabel: currentDeposit.bedId ? `Giường ${currentDeposit.bedNumber || ''}` : `Phòng ${room.roomNumber}`,
        branchName
      }).catch(console.error);
    }

    return {
      deposit: await this.getDepositById(id),
    };
  }

  static async cancelDeposit(id: string): Promise<DepositActionResultDTO> {
    const currentDeposit = await this.getDepositById(id);

    if (currentDeposit.status !== "pending") {
      throw new ConflictError("Only pending deposits can be cancelled");
    }

    const room = await DepositRepository.getRoomById(currentDeposit.roomId);
    if (!room) {
      throw new NotFoundError("Room not found");
    }

    const updated = await DepositRepository.updateStatusIfPending(
      id,
      "cancelled",
    );

    if (!updated) {
      throw new ConflictError("Deposit request is no longer pending");
    }

    const activeDepositCount =
      await DepositRepository.countActiveDepositsForRoom(
        currentDeposit.roomId,
        id,
      );

    if (activeDepositCount === 0) {
      const roomUpdated = await DepositRepository.updateRoomStatus(
        currentDeposit.roomId,
        "available",
      );

      if (!roomUpdated) {
        throw new InternalServerError(
          "Failed to update room status while cancelling deposit",
        );
      }
    }

    if (currentDeposit.customer?.email) {
      await sendDepositFailedEmail({
        toEmail: currentDeposit.customer.email,
        customerName: currentDeposit.customer.fullName,
        reason: "Admin rejected your payment proof."
      }).catch(console.error);
    }

    return {
      deposit: await this.getDepositById(id),
    };
  }
}
