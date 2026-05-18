 import { DepositService } from "@services/deposit.service";
import { DepositRepository } from "../repositories/deposit.repository";

jest.mock("@services/email.service", () => ({
  sendDepositConfirmedEmail: jest.fn().mockResolvedValue(undefined),
  sendDepositFailedEmail: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@config/supabase", () => ({
  supabaseServiceRole: null,
}));

jest.mock("../repositories/deposit.repository", () => ({
  DepositRepository: {
    getBedPrice: jest.fn(),
    getRoomPrice: jest.fn(),
    getRoomCapacity: jest.fn(),
    createDeposit: jest.fn(),
    findById: jest.fn(),
    list: jest.fn(),
    updateStatusIfPending: jest.fn(),
    getRoomById: jest.fn(),
    updateRoomStatus: jest.fn(),
    rollbackToPending: jest.fn(),
    createCompletedDepositPayment: jest.fn(),
    updateRentalRequestStatus: jest.fn(),
    countActiveDepositsForRoom: jest.fn(),
  },
}));

const MockRepo = DepositRepository as jest.Mocked<typeof DepositRepository>;

const pendingDeposit = {
  id: "dep-1",
  rentalRequestId: null,
  customerId: "cust-1",
  roomId: "room-1",
  bedId: null,
  bedNumber: null,
  amount: 3000000,
  dueAt: "2026-05-20T00:00:00Z",
  paidAt: null,
  proofImageUrl: null,
  notes: null,
  status: "pending" as const,
  createdAt: "2026-05-01T00:00:00Z",
  updatedAt: "2026-05-01T00:00:00Z",
  customer: { id: "cust-1", fullName: "Jane", email: "jane@example.com", phoneNumber: "0900000000" },
  room: { id: "room-1", roomNumber: "A101", branchId: "branch-1", status: "holding" as const },
};

beforeEach(() => jest.clearAllMocks());

describe("DepositService.createDeposit", () => {
  it("should create deposit for a bed booking", async () => {
    MockRepo.getBedPrice.mockResolvedValue(1000000);
    MockRepo.createDeposit.mockResolvedValue("dep-new");
    MockRepo.findById.mockResolvedValue({ ...pendingDeposit, id: "dep-new" });

    const result = await DepositService.createDeposit({
      customerId: "cust-1",
      roomId: "room-1",
      bedId: "bed-1",
      amount: 2000000, // >= 1000000 * 2 * 1
    });

    expect(MockRepo.getBedPrice).toHaveBeenCalledWith("bed-1");
    expect(MockRepo.getRoomCapacity).not.toHaveBeenCalled();
    expect(result.id).toBe("dep-new");
  });

  it("should create deposit for a whole-room booking with capacity", async () => {
    MockRepo.getRoomPrice.mockResolvedValue(1000000);
    MockRepo.getRoomCapacity.mockResolvedValue(3);
    MockRepo.createDeposit.mockResolvedValue("dep-new");
    MockRepo.findById.mockResolvedValue({ ...pendingDeposit, id: "dep-new" });

    const result = await DepositService.createDeposit({
      customerId: "cust-1",
      roomId: "room-1",
      amount: 6000000, // >= 1000000 * 2 * 3
    });

    expect(MockRepo.getRoomPrice).toHaveBeenCalledWith("room-1");
    expect(MockRepo.getRoomCapacity).toHaveBeenCalledWith("room-1");
    expect(result.id).toBe("dep-new");
  });

  it("should use bedsCount=1 when capacity is 0", async () => {
    MockRepo.getRoomPrice.mockResolvedValue(1000000);
    MockRepo.getRoomCapacity.mockResolvedValue(0);
    MockRepo.createDeposit.mockResolvedValue("dep-new");
    MockRepo.findById.mockResolvedValue({ ...pendingDeposit, id: "dep-new" });

    await DepositService.createDeposit({
      customerId: "cust-1",
      roomId: "room-1",
      amount: 2000000,
    });

    expect(MockRepo.createDeposit).toHaveBeenCalled();
  });

  it("should use bedsCount=1 when capacity is null", async () => {
    MockRepo.getRoomPrice.mockResolvedValue(1000000);
    MockRepo.getRoomCapacity.mockResolvedValue(null);
    MockRepo.createDeposit.mockResolvedValue("dep-new");
    MockRepo.findById.mockResolvedValue({ ...pendingDeposit, id: "dep-new" });

    await DepositService.createDeposit({
      customerId: "cust-1",
      roomId: "room-1",
      amount: 2000000,
    });

    expect(MockRepo.createDeposit).toHaveBeenCalled();
  });

  it("should throw ValidationError when amount is below minimum for bed", async () => {
    MockRepo.getBedPrice.mockResolvedValue(1000000);

    await expect(
      DepositService.createDeposit({
        customerId: "cust-1",
        roomId: "room-1",
        bedId: "bed-1",
        amount: 1000000, // < 1000000 * 2 * 1 = 2000000
      })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("should throw ValidationError when amount is below minimum for room", async () => {
    MockRepo.getRoomPrice.mockResolvedValue(1500000);
    MockRepo.getRoomCapacity.mockResolvedValue(2);

    await expect(
      DepositService.createDeposit({
        customerId: "cust-1",
        roomId: "room-1",
        amount: 4000000, // < 1500000 * 2 * 2 = 6000000
      })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("should skip validation when monthlyPrice is null", async () => {
    MockRepo.getRoomPrice.mockResolvedValue(null);
    MockRepo.getRoomCapacity.mockResolvedValue(1);
    MockRepo.createDeposit.mockResolvedValue("dep-new");
    MockRepo.findById.mockResolvedValue({ ...pendingDeposit, id: "dep-new" });

    await expect(
      DepositService.createDeposit({
        customerId: "cust-1",
        roomId: "room-1",
        amount: 0, // Would fail validation if price was set
      })
    ).resolves.toBeDefined();
  });

  it("should throw InternalServerError when deposit not found after creation", async () => {
    MockRepo.getRoomPrice.mockResolvedValue(null);
    MockRepo.getRoomCapacity.mockResolvedValue(1);
    MockRepo.createDeposit.mockResolvedValue("dep-new");
    MockRepo.findById.mockResolvedValue(null);

    await expect(
      DepositService.createDeposit({
        customerId: "cust-1",
        roomId: "room-1",
        amount: 0,
      })
    ).rejects.toMatchObject({ statusCode: 500 });
  });
});

describe("DepositService.getDepositById", () => {
  it("should return deposit when found", async () => {
    MockRepo.findById.mockResolvedValue(pendingDeposit);

    const result = await DepositService.getDepositById("dep-1");
    expect(result.id).toBe("dep-1");
  });

  it("should throw NotFoundError when deposit not found", async () => {
    MockRepo.findById.mockResolvedValue(null);

    await expect(DepositService.getDepositById("missing")).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("DepositService.getDeposits", () => {
  it("should return list of deposits", async () => {
    MockRepo.list.mockResolvedValue([]);

    const result = await DepositService.getDeposits({});
    expect(result).toEqual([]);
    expect(MockRepo.list).toHaveBeenCalledWith({});
  });
});

describe("DepositService.confirmDeposit", () => {
  it("should throw ConflictError when deposit is not pending", async () => {
    MockRepo.findById.mockResolvedValue({ ...pendingDeposit, status: "paid" as const });

    await expect(
      DepositService.confirmDeposit("dep-1", "staff-1")
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it("should throw NotFoundError when room not found", async () => {
    MockRepo.findById.mockResolvedValue(pendingDeposit);
    MockRepo.getRoomById.mockResolvedValue(null);

    await expect(
      DepositService.confirmDeposit("dep-1", "staff-1")
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it("should throw ConflictError when updateStatusIfPending returns false", async () => {
    MockRepo.findById.mockResolvedValue(pendingDeposit);
    MockRepo.getRoomById.mockResolvedValue({ id: "room-1", roomNumber: "A101", branchId: "branch-1", status: "holding" as const });
    MockRepo.updateStatusIfPending.mockResolvedValue(false);

    await expect(
      DepositService.confirmDeposit("dep-1", "staff-1")
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it("should rollback and throw when room update fails", async () => {
    MockRepo.findById.mockResolvedValue(pendingDeposit);
    MockRepo.getRoomById.mockResolvedValue({ id: "room-1", roomNumber: "A101", branchId: "branch-1", status: "holding" as const });
    MockRepo.updateStatusIfPending.mockResolvedValue(true);
    MockRepo.updateRoomStatus.mockResolvedValue(false);
    MockRepo.rollbackToPending.mockResolvedValue(undefined);

    await expect(
      DepositService.confirmDeposit("dep-1", "staff-1")
    ).rejects.toMatchObject({ statusCode: 500 });

    expect(MockRepo.rollbackToPending).toHaveBeenCalledWith("dep-1");
  });

  it("should confirm deposit without rentalRequestId", async () => {
    const paidDeposit = { ...pendingDeposit, status: "paid" as const, paidAt: "2026-05-10T00:00:00Z" };
    MockRepo.findById
      .mockResolvedValueOnce(pendingDeposit)
      .mockResolvedValueOnce(paidDeposit);
    MockRepo.getRoomById.mockResolvedValue({ id: "room-1", roomNumber: "A101", branchId: "branch-1", status: "holding" as const });
    MockRepo.updateStatusIfPending.mockResolvedValue(true);
    MockRepo.updateRoomStatus.mockResolvedValue(true);
    MockRepo.createCompletedDepositPayment.mockResolvedValue(undefined);

    const result = await DepositService.confirmDeposit("dep-1", "staff-1");

    expect(MockRepo.updateRentalRequestStatus).not.toHaveBeenCalled();
    expect(result.deposit.status).toBe("paid");
  });

  it("should update rental request status when rentalRequestId is set", async () => {
    const depositWithRental = { ...pendingDeposit, rentalRequestId: "req-1" };
    const paidDeposit = { ...depositWithRental, status: "paid" as const };
    MockRepo.findById
      .mockResolvedValueOnce(depositWithRental)
      .mockResolvedValueOnce(paidDeposit);
    MockRepo.getRoomById.mockResolvedValue({ id: "room-1", roomNumber: "A101", branchId: "branch-1", status: "holding" as const });
    MockRepo.updateStatusIfPending.mockResolvedValue(true);
    MockRepo.updateRoomStatus.mockResolvedValue(true);
    MockRepo.createCompletedDepositPayment.mockResolvedValue(undefined);
    MockRepo.updateRentalRequestStatus.mockResolvedValue(undefined);

    const result = await DepositService.confirmDeposit("dep-1", "staff-1");

    expect(MockRepo.updateRentalRequestStatus).toHaveBeenCalledWith("req-1", "accepted");
    expect(result.deposit.status).toBe("paid");
  });

  it("should confirm deposit with no customer email (skip email)", async () => {
    const depositNoEmail = {
      ...pendingDeposit,
      customer: { ...pendingDeposit.customer, email: null },
    };
    const paidDeposit = { ...depositNoEmail, status: "paid" as const };
    MockRepo.findById
      .mockResolvedValueOnce(depositNoEmail)
      .mockResolvedValueOnce(paidDeposit);
    MockRepo.getRoomById.mockResolvedValue({ id: "room-1", roomNumber: "A101", branchId: "branch-1", status: "holding" as const });
    MockRepo.updateStatusIfPending.mockResolvedValue(true);
    MockRepo.updateRoomStatus.mockResolvedValue(true);
    MockRepo.createCompletedDepositPayment.mockResolvedValue(undefined);

    const result = await DepositService.confirmDeposit("dep-1", "staff-1");
    expect(result).toBeDefined();
  });
});

describe("DepositService.cancelDeposit", () => {
  it("should throw ConflictError when deposit is not pending", async () => {
    MockRepo.findById.mockResolvedValue({ ...pendingDeposit, status: "cancelled" as const });

    await expect(
      DepositService.cancelDeposit("dep-1")
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it("should throw NotFoundError when room not found", async () => {
    MockRepo.findById.mockResolvedValue(pendingDeposit);
    MockRepo.getRoomById.mockResolvedValue(null);

    await expect(
      DepositService.cancelDeposit("dep-1")
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it("should throw ConflictError when updateStatusIfPending returns false", async () => {
    MockRepo.findById.mockResolvedValue(pendingDeposit);
    MockRepo.getRoomById.mockResolvedValue({ id: "room-1", roomNumber: "A101", branchId: "branch-1", status: "holding" as const });
    MockRepo.updateStatusIfPending.mockResolvedValue(false);

    await expect(
      DepositService.cancelDeposit("dep-1")
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it("should cancel deposit and update room to available when no other active deposits", async () => {
    const cancelledDeposit = { ...pendingDeposit, status: "cancelled" as const };
    MockRepo.findById
      .mockResolvedValueOnce(pendingDeposit)
      .mockResolvedValueOnce(cancelledDeposit);
    MockRepo.getRoomById.mockResolvedValue({ id: "room-1", roomNumber: "A101", branchId: "branch-1", status: "holding" as const });
    MockRepo.updateStatusIfPending.mockResolvedValue(true);
    MockRepo.countActiveDepositsForRoom.mockResolvedValue(0);
    MockRepo.updateRoomStatus.mockResolvedValue(true);

    const result = await DepositService.cancelDeposit("dep-1");
    expect(MockRepo.updateRoomStatus).toHaveBeenCalledWith("room-1", "available");
    expect(result.deposit.status).toBe("cancelled");
  });

  it("should cancel deposit but NOT update room when other active deposits exist", async () => {
    const cancelledDeposit = { ...pendingDeposit, status: "cancelled" as const };
    MockRepo.findById
      .mockResolvedValueOnce(pendingDeposit)
      .mockResolvedValueOnce(cancelledDeposit);
    MockRepo.getRoomById.mockResolvedValue({ id: "room-1", roomNumber: "A101", branchId: "branch-1", status: "holding" as const });
    MockRepo.updateStatusIfPending.mockResolvedValue(true);
    MockRepo.countActiveDepositsForRoom.mockResolvedValue(2);

    const result = await DepositService.cancelDeposit("dep-1");
    expect(MockRepo.updateRoomStatus).not.toHaveBeenCalled();
    expect(result.deposit.status).toBe("cancelled");
  });

  it("should throw InternalServerError when room status update fails", async () => {
    MockRepo.findById.mockResolvedValue(pendingDeposit);
    MockRepo.getRoomById.mockResolvedValue({ id: "room-1", roomNumber: "A101", branchId: "branch-1", status: "holding" as const });
    MockRepo.updateStatusIfPending.mockResolvedValue(true);
    MockRepo.countActiveDepositsForRoom.mockResolvedValue(0);
    MockRepo.updateRoomStatus.mockResolvedValue(false);

    await expect(
      DepositService.cancelDeposit("dep-1")
    ).rejects.toMatchObject({ statusCode: 500 });
  });

  it("should cancel deposit with no customer email (skip email)", async () => {
    const depositNoEmail = {
      ...pendingDeposit,
      customer: { ...pendingDeposit.customer, email: null },
    };
    const cancelledDeposit = { ...depositNoEmail, status: "cancelled" as const };
    MockRepo.findById
      .mockResolvedValueOnce(depositNoEmail)
      .mockResolvedValueOnce(cancelledDeposit);
    MockRepo.getRoomById.mockResolvedValue({ id: "room-1", roomNumber: "A101", branchId: "branch-1", status: "holding" as const });
    MockRepo.updateStatusIfPending.mockResolvedValue(true);
    MockRepo.countActiveDepositsForRoom.mockResolvedValue(0);
    MockRepo.updateRoomStatus.mockResolvedValue(true);

    const result = await DepositService.cancelDeposit("dep-1");
    expect(result).toBeDefined();
  });
});
