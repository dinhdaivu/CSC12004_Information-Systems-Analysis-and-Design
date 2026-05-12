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
    // UC2-3: deposit must be at least 2 months' rent
    const monthlyPrice = input.bedId
      ? await DepositRepository.getBedPrice(input.bedId)
      : await DepositRepository.getRoomPrice(input.roomId);

    if (monthlyPrice !== null) {
      const minimum = monthlyPrice * 2;
      if (input.amount < minimum) {
        throw new ValidationError(
          `Deposit amount must be at least 2 months' rent (${minimum.toLocaleString()} VND)`,
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

    return {
      deposit: await this.getDepositById(id),
    };
  }
}
