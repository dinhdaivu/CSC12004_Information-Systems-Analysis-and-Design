import { RentalRequestService } from "@services/rental-request.service";
import { supabaseServiceRole } from "@config/supabase";
import type { CreateRentalRequestDTO } from "@models/rental-request.model";

jest.mock("@services/email.service", () => ({
  sendViewingApprovedEmail: jest.fn().mockResolvedValue(undefined),
  sendViewingDeclinedEmail: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@config/supabase", () => ({
  supabaseServiceRole: {
    from: jest.fn(),
  },
}));

const mockedSupabase = supabaseServiceRole as NonNullable<typeof supabaseServiceRole> & {
  from: jest.Mock;
};

const BASE_DTO: CreateRentalRequestDTO = {
  customer_id: "cust-1",
  expected_move_in_date: "2026-06-01",
  rental_duration_months: 6,
  people_count: 1,
};

function mockBedQuery(data: { status: string } | null, error: unknown = null) {
  const single = jest.fn().mockResolvedValue({ data, error });
  const eq = jest.fn().mockReturnValue({ single });
  const select = jest.fn().mockReturnValue({ eq });
  mockedSupabase.from.mockReturnValueOnce({ select });
}

function mockRoomQuery(data: { status: string } | null, error: unknown = null) {
  const single = jest.fn().mockResolvedValue({ data, error });
  const eq = jest.fn().mockReturnValue({ single });
  const select = jest.fn().mockReturnValue({ eq });
  mockedSupabase.from.mockReturnValueOnce({ select });
}

function mockInsertQuery(data: unknown, error: unknown = null) {
  const single = jest.fn().mockResolvedValue({ data, error });
  const select = jest.fn().mockReturnValue({ single });
  const insert = jest.fn().mockReturnValue({ select });
  mockedSupabase.from.mockReturnValueOnce({ insert });
}

describe("RentalRequestService.createRequest", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a rental request without bed_id or room_id", async () => {
    const newRequest = {
      id: "req-1",
      customer_id: "cust-1",
      room_id: null,
      bed_id: null,
      status: "requested",
    };
    mockInsertQuery(newRequest);

    const result = await RentalRequestService.createRequest("cust-1", {
      ...BASE_DTO,
      preferred_room_type: "dorm",
      note: "Looking for a dorm",
    });

    expect(result).toEqual(newRequest);
  });

  it("should create a rental request with room_id when room is available", async () => {
    mockRoomQuery({ status: "available" });
    const newRequest = {
      id: "req-2",
      customer_id: "cust-1",
      room_id: "room-1",
      bed_id: null,
      status: "requested",
    };
    mockInsertQuery(newRequest);

    const result = await RentalRequestService.createRequest("cust-1", {
      ...BASE_DTO,
      room_id: "room-1",
    });

    expect(result).toEqual(newRequest);
  });

  it("should create a rental request with bed_id when bed is available", async () => {
    mockBedQuery({ status: "available" });
    const newRequest = {
      id: "req-3",
      customer_id: "cust-1",
      room_id: "room-1",
      bed_id: "bed-1",
      status: "requested",
    };
    mockInsertQuery(newRequest);

    const result = await RentalRequestService.createRequest("cust-1", {
      ...BASE_DTO,
      bed_id: "bed-1",
      room_id: "room-1",
    });

    expect(result).toEqual(newRequest);
  });

  it("should throw NotFoundError when bed does not exist (error)", async () => {
    mockBedQuery(null, { message: "not found" });

    await expect(
      RentalRequestService.createRequest("cust-1", {
        ...BASE_DTO,
        bed_id: "nonexistent-bed",
      }),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it("should throw NotFoundError when bed data is null (no error)", async () => {
    mockBedQuery(null, null);

    await expect(
      RentalRequestService.createRequest("cust-1", {
        ...BASE_DTO,
        bed_id: "bed-1",
      }),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it("should throw ConflictError when bed is not available", async () => {
    mockBedQuery({ status: "occupied" });

    await expect(
      RentalRequestService.createRequest("cust-1", {
        ...BASE_DTO,
        bed_id: "bed-1",
      }),
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it("should throw NotFoundError when room does not exist (error)", async () => {
    mockRoomQuery(null, { message: "not found" });

    await expect(
      RentalRequestService.createRequest("cust-1", {
        ...BASE_DTO,
        room_id: "nonexistent-room",
      }),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it("should throw NotFoundError when room data is null (no error)", async () => {
    mockRoomQuery(null, null);

    await expect(
      RentalRequestService.createRequest("cust-1", {
        ...BASE_DTO,
        room_id: "room-1",
      }),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it("should throw ConflictError when room is not available", async () => {
    mockRoomQuery({ status: "occupied" });

    await expect(
      RentalRequestService.createRequest("cust-1", {
        ...BASE_DTO,
        room_id: "room-1",
      }),
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it("should throw InternalServerError when insert fails", async () => {
    mockInsertQuery(null, { message: "insert error" });

    await expect(
      RentalRequestService.createRequest("cust-1", BASE_DTO),
    ).rejects.toMatchObject({ statusCode: 500 });
  });

  it("should pass branch_id, budget_min, budget_max to insert", async () => {
    const newRequest = {
      id: "req-5",
      customer_id: "cust-1",
      branch_id: "branch-1",
      status: "requested",
    };
    mockInsertQuery(newRequest);

    const result = await RentalRequestService.createRequest("cust-1", {
      ...BASE_DTO,
      branch_id: "branch-1",
      budget_min: 500000,
      budget_max: 2000000,
      note: "near campus",
    });

    expect(result).toEqual(newRequest);
  });
});
