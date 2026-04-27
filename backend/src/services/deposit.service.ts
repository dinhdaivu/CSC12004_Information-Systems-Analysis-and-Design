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
} from "@utils/errors";

export class DepositService {
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
