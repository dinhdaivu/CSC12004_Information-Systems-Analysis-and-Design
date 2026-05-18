import { MyBookingService } from "@services/my-booking.service";
import { supabaseServiceRole } from "@config/supabase";

jest.mock("@config/supabase", () => ({
  supabaseServiceRole: { from: jest.fn() },
}));

jest.mock("@services/email.service", () => ({
  sendDepositRejectedEmail: jest.fn().mockResolvedValue(undefined),
  sendDepositTermsAndPaymentEmail: jest.fn().mockResolvedValue(undefined),
  sendDepositSubmittedEmail: jest.fn().mockResolvedValue(undefined),
  sendDepositConfirmedEmail: jest.fn().mockResolvedValue(undefined),
  sendDepositFailedEmail: jest.fn().mockResolvedValue(undefined),
  sendDepositInstructionEmail: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@config/cloudinary", () => ({
  uploader: { upload: jest.fn() },
}));

const mockedSupabase = supabaseServiceRole as NonNullable<typeof supabaseServiceRole> & {
  from: jest.Mock;
};

const bookingRow = {
  id: "req-1",
  customer_id: "cust-1",
  status: "requested",
  rooms: { id: "room-1", room_number: "A101", room_type: "dorm", price_per_month: 1000000, max_capacity: 4, status: "available" },
  beds: null,
  branches: { id: "branch-1", name: "Test Branch", address: "123 St" },
  users: { full_name: "Jane", gender: "female", phone_number: "0900", email: "jane@test.com", identity_number: "123" },
  deposit_requests: [],
};

type FluentQuery = {
  select: jest.Mock;
  eq: jest.Mock;
  order: jest.Mock;
  in: jest.Mock;
  is: jest.Mock;
  update: jest.Mock;
  insert: jest.Mock;
  maybeSingle: jest.Mock;
  single: jest.Mock;
  then: Promise<unknown>["then"];
  catch: Promise<unknown>["catch"];
};

/** Self-returning fluent query that resolves when awaited. */
function makeFluentQuery(result: unknown): FluentQuery {
  const p = Promise.resolve(result);
  const q = {
    select: jest.fn(),
    eq: jest.fn(),
    order: jest.fn(),
    in: jest.fn(),
    is: jest.fn(),
    update: jest.fn(),
    insert: jest.fn(),
    maybeSingle: jest.fn().mockResolvedValue(result),
    single: jest.fn().mockResolvedValue(result),
    then: p.then.bind(p),
    catch: p.catch.bind(p),
  } as FluentQuery;
  q.select.mockReturnValue(q);
  q.eq.mockReturnValue(q);
  q.order.mockReturnValue(q);
  q.in.mockReturnValue(q);
  q.is.mockReturnValue(q);
  q.update.mockReturnValue(q);
  q.insert.mockReturnValue(q);
  return q;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockedSupabase.from.mockReset();
});

describe("MyBookingService.getMyBookings", () => {
  it("should return bookings with no filter", async () => {
    const q = makeFluentQuery({ data: [bookingRow], error: null });
    mockedSupabase.from.mockReturnValueOnce(q);

    const result = await MyBookingService.getMyBookings("cust-1", {});
    expect(result).toHaveLength(1);
    expect((q.in as jest.Mock)).not.toHaveBeenCalled();
  });

  it("should apply pending filter (maps to requested+reviewing)", async () => {
    const q = makeFluentQuery({ data: [], error: null });
    mockedSupabase.from.mockReturnValueOnce(q);

    await MyBookingService.getMyBookings("cust-1", { status: "pending" });
    expect((q.in as jest.Mock)).toHaveBeenCalledWith("status", ["requested", "reviewing"]);
  });

  it("should apply confirmed filter (maps to viewing_scheduled+accepted)", async () => {
    const q = makeFluentQuery({ data: [], error: null });
    mockedSupabase.from.mockReturnValueOnce(q);

    await MyBookingService.getMyBookings("cust-1", { status: "confirmed" });
    expect((q.in as jest.Mock)).toHaveBeenCalledWith("status", ["viewing_scheduled", "accepted"]);
  });

  it("should apply cancelled filter", async () => {
    const q = makeFluentQuery({ data: [], error: null });
    mockedSupabase.from.mockReturnValueOnce(q);

    await MyBookingService.getMyBookings("cust-1", { status: "cancelled" });
    expect((q.in as jest.Mock)).toHaveBeenCalledWith("status", ["cancelled", "rejected"]);
  });

  it("should apply active filter", async () => {
    const q = makeFluentQuery({ data: [], error: null });
    mockedSupabase.from.mockReturnValueOnce(q);

    await MyBookingService.getMyBookings("cust-1", { status: "active" });
    expect((q.eq as jest.Mock)).toHaveBeenCalledWith("status", "active");
  });

  it("should apply completed filter", async () => {
    const q = makeFluentQuery({ data: [], error: null });
    mockedSupabase.from.mockReturnValueOnce(q);

    await MyBookingService.getMyBookings("cust-1", { status: "completed" });
    expect((q.eq as jest.Mock)).toHaveBeenCalledWith("status", "completed");
  });

  it("should apply deposit_pending filter", async () => {
    const q = makeFluentQuery({ data: [], error: null });
    mockedSupabase.from.mockReturnValueOnce(q);

    await MyBookingService.getMyBookings("cust-1", { status: "deposit_pending" });
    expect((q.eq as jest.Mock)).toHaveBeenCalledWith("status", "deposit_pending");
  });

  it("should apply valid enum from default case", async () => {
    const q = makeFluentQuery({ data: [], error: null });
    mockedSupabase.from.mockReturnValueOnce(q);

    await MyBookingService.getMyBookings("cust-1", { status: "requested" });
    expect((q.eq as jest.Mock)).toHaveBeenCalledWith("status", "requested");
  });

  it("should use is(null) for completely invalid status", async () => {
    const q = makeFluentQuery({ data: [], error: null });
    mockedSupabase.from.mockReturnValueOnce(q);

    await MyBookingService.getMyBookings("cust-1", { status: "invalid_xyz" });
    expect((q.is as jest.Mock)).toHaveBeenCalledWith("id", null);
  });

  it("should throw AppError on DB error", async () => {
    const q = makeFluentQuery({ data: null, error: { message: "db fail" } });
    mockedSupabase.from.mockReturnValueOnce(q);

    await expect(
      MyBookingService.getMyBookings("cust-1", {})
    ).rejects.toMatchObject({ statusCode: 500 });
  });
});

describe("MyBookingService.getBookingById", () => {
  it("should return booking when found", async () => {
    const q = makeFluentQuery({ data: bookingRow, error: null });
    mockedSupabase.from.mockReturnValueOnce(q);

    const result = await MyBookingService.getBookingById("cust-1", "req-1");
    expect((result as typeof bookingRow).id).toBe("req-1");
  });

  it("should throw NotFoundError when booking not found", async () => {
    const q = makeFluentQuery({ data: null, error: null });
    mockedSupabase.from.mockReturnValueOnce(q);

    await expect(
      MyBookingService.getBookingById("cust-1", "missing")
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it("should throw AppError on DB error", async () => {
    const q = makeFluentQuery({ data: null, error: { message: "db fail" } });
    mockedSupabase.from.mockReturnValueOnce(q);

    await expect(
      MyBookingService.getBookingById("cust-1", "req-1")
    ).rejects.toMatchObject({ statusCode: 500 });
  });
});

describe("MyBookingService.handleAction", () => {
  it("should cancel booking in allowed state", async () => {
    // getBookingById
    const getQ = makeFluentQuery({ data: bookingRow, error: null });
    mockedSupabase.from.mockReturnValueOnce(getQ);
    // update
    const updateQ = makeFluentQuery({ data: { ...bookingRow, status: "cancelled" }, error: null });
    mockedSupabase.from.mockReturnValueOnce(updateQ);

    const result = await MyBookingService.handleAction("cust-1", "req-1", "cancel");
    expect((result as typeof bookingRow).status).toBe("cancelled");
  });

  it("should throw ConflictError when status is not cancellable", async () => {
    const getQ = makeFluentQuery({ data: { ...bookingRow, status: "accepted" }, error: null });
    mockedSupabase.from.mockReturnValueOnce(getQ);

    await expect(
      MyBookingService.handleAction("cust-1", "req-1", "cancel")
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it("should throw AppError on cancel DB update error", async () => {
    const getQ = makeFluentQuery({ data: bookingRow, error: null });
    mockedSupabase.from.mockReturnValueOnce(getQ);
    const updateQ = makeFluentQuery({ data: null, error: { message: "update fail" } });
    mockedSupabase.from.mockReturnValueOnce(updateQ);

    await expect(
      MyBookingService.handleAction("cust-1", "req-1", "cancel")
    ).rejects.toMatchObject({ statusCode: 500 });
  });

  it("should throw AppError for unsupported action", async () => {
    const getQ = makeFluentQuery({ data: bookingRow, error: null });
    mockedSupabase.from.mockReturnValueOnce(getQ);

    await expect(
      MyBookingService.handleAction("cust-1", "req-1", "approve")
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});

describe("MyBookingService.checkAvailability", () => {
  it("should return true when room is available", async () => {
    const getQ = makeFluentQuery({ data: bookingRow, error: null });
    mockedSupabase.from.mockReturnValueOnce(getQ);

    const result = await MyBookingService.checkAvailability("cust-1", "req-1");
    expect(result).toBe(true);
  });

  it("should return true and skip email when available with no deposit_requests", async () => {
    const q = makeFluentQuery({ data: { ...bookingRow, deposit_requests: [] }, error: null });
    mockedSupabase.from.mockReturnValueOnce(q);

    const result = await MyBookingService.checkAvailability("cust-1", "req-1");
    expect(result).toBe(true);
  });

  it("should return true when bed is available", async () => {
    const bookingWithBed = {
      ...bookingRow,
      beds: { id: "bed-1", bed_number: "1", price_per_month: 1000000, status: "available" },
    };
    const q = makeFluentQuery({ data: bookingWithBed, error: null });
    mockedSupabase.from.mockReturnValueOnce(q);

    const result = await MyBookingService.checkAvailability("cust-1", "req-1");
    expect(result).toBe(true);
  });

  it("should return false and update status when room is not available", async () => {
    const unavailableBooking = {
      ...bookingRow,
      rooms: { ...bookingRow.rooms, status: "occupied" },
    };
    // getBookingById
    const getQ = makeFluentQuery({ data: unavailableBooking, error: null });
    mockedSupabase.from.mockReturnValueOnce(getQ);
    // update rental_request status
    const updateQ = makeFluentQuery({ data: null, error: null });
    mockedSupabase.from.mockReturnValueOnce(updateQ);

    const result = await MyBookingService.checkAvailability("cust-1", "req-1");
    expect(result).toBe(false);
    expect((updateQ.update as jest.Mock)).toHaveBeenCalledWith({ status: "rejected" });
  });

  it("should also cancel pending deposit when room not available", async () => {
    const unavailableBooking = {
      ...bookingRow,
      rooms: { ...bookingRow.rooms, status: "occupied" },
      deposit_requests: [{ id: "dep-1", status: "pending", amount: 2000000 }],
    };
    const getQ = makeFluentQuery({ data: unavailableBooking, error: null });
    mockedSupabase.from.mockReturnValueOnce(getQ);
    // update rental_request
    const rentalUpdateQ = makeFluentQuery({ data: null, error: null });
    mockedSupabase.from.mockReturnValueOnce(rentalUpdateQ);
    // update deposit_request
    const depositUpdateQ = makeFluentQuery({ data: null, error: null });
    mockedSupabase.from.mockReturnValueOnce(depositUpdateQ);

    const result = await MyBookingService.checkAvailability("cust-1", "req-1");
    expect(result).toBe(false);
    expect((depositUpdateQ.update as jest.Mock)).toHaveBeenCalledWith({ status: "cancelled" });
  });

  it("should return false when bed is not available", async () => {
    const unavailableBooking = {
      ...bookingRow,
      beds: { id: "bed-1", bed_number: "1", price_per_month: 1000000, status: "occupied" },
    };
    const getQ = makeFluentQuery({ data: unavailableBooking, error: null });
    mockedSupabase.from.mockReturnValueOnce(getQ);
    const updateQ = makeFluentQuery({ data: null, error: null });
    mockedSupabase.from.mockReturnValueOnce(updateQ);

    const result = await MyBookingService.checkAvailability("cust-1", "req-1");
    expect(result).toBe(false);
  });

  it("should return false when neither beds nor rooms (isAvailable stays false)", async () => {
    const noRoomBooking = { ...bookingRow, rooms: null, beds: null };
    const getQ = makeFluentQuery({ data: noRoomBooking, error: null });
    mockedSupabase.from.mockReturnValueOnce(getQ);
    const updateQ = makeFluentQuery({ data: null, error: null });
    mockedSupabase.from.mockReturnValueOnce(updateQ);

    const result = await MyBookingService.checkAvailability("cust-1", "req-1");
    expect(result).toBe(false);
  });
});

describe("MyBookingService.submitDepositProof", () => {
  const cloudinaryMock = require("@config/cloudinary") as { uploader: { upload: jest.Mock } };

  it("should submit proof for existing pending deposit", async () => {
    const bookingWithDeposit = {
      ...bookingRow,
      deposit_requests: [{ id: "dep-1", status: "pending", amount: 2000000, due_at: "2026-05-20T00:00:00Z" }],
    };
    cloudinaryMock.uploader.upload.mockResolvedValue({ secure_url: "https://cdn/proof.jpg" });

    // getBookingById (first)
    const getQ1 = makeFluentQuery({ data: bookingWithDeposit, error: null });
    mockedSupabase.from.mockReturnValueOnce(getQ1);
    // update deposit proof
    const updateQ = makeFluentQuery({ data: null, error: null });
    mockedSupabase.from.mockReturnValueOnce(updateQ);
    // getBookingById (final return)
    const getQ2 = makeFluentQuery({ data: bookingWithDeposit, error: null });
    mockedSupabase.from.mockReturnValueOnce(getQ2);

    const result = await MyBookingService.submitDepositProof("cust-1", "req-1", "data:image/png;base64,abc");
    expect(cloudinaryMock.uploader.upload).toHaveBeenCalled();
    expect((updateQ.update as jest.Mock)).toHaveBeenCalledWith({ proof_image_url: "https://cdn/proof.jpg" });
    expect(result).toBeDefined();
  });

  it("should auto-create deposit when none exists", async () => {
    cloudinaryMock.uploader.upload.mockResolvedValue({ secure_url: "https://cdn/proof.jpg" });

    const newDeposit = { id: "dep-new", status: "pending", amount: 2000000, due_at: "2026-05-20T00:00:00Z" };
    // getBookingById (first)
    const getQ1 = makeFluentQuery({ data: bookingRow, error: null });
    mockedSupabase.from.mockReturnValueOnce(getQ1);
    // insert new deposit
    const insertQ = makeFluentQuery({ data: newDeposit, error: null });
    mockedSupabase.from.mockReturnValueOnce(insertQ);
    // update deposit proof
    const updateQ = makeFluentQuery({ data: null, error: null });
    mockedSupabase.from.mockReturnValueOnce(updateQ);
    // getBookingById (final)
    const getQ2 = makeFluentQuery({ data: bookingRow, error: null });
    mockedSupabase.from.mockReturnValueOnce(getQ2);

    const result = await MyBookingService.submitDepositProof("cust-1", "req-1", "data:image/png;base64,abc");
    expect((insertQ.insert as jest.Mock)).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it("should throw ConflictError when no deposit and no room assigned", async () => {
    const bookingNoRoom = { ...bookingRow, rooms: null };
    const getQ = makeFluentQuery({ data: bookingNoRoom, error: null });
    mockedSupabase.from.mockReturnValueOnce(getQ);

    await expect(
      MyBookingService.submitDepositProof("cust-1", "req-1", "data:image/png;base64,abc")
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it("should throw AppError when deposit auto-create fails", async () => {
    const getQ = makeFluentQuery({ data: bookingRow, error: null });
    mockedSupabase.from.mockReturnValueOnce(getQ);
    const insertQ = makeFluentQuery({ data: null, error: { message: "insert fail" } });
    mockedSupabase.from.mockReturnValueOnce(insertQ);

    await expect(
      MyBookingService.submitDepositProof("cust-1", "req-1", "data:image/png;base64,abc")
    ).rejects.toMatchObject({ statusCode: 500 });
  });

  it("should throw AppError when cloudinary upload fails", async () => {
    const bookingWithDeposit = {
      ...bookingRow,
      deposit_requests: [{ id: "dep-1", status: "pending", amount: 2000000 }],
    };
    cloudinaryMock.uploader.upload.mockRejectedValue(new Error("upload fail"));

    const getQ = makeFluentQuery({ data: bookingWithDeposit, error: null });
    mockedSupabase.from.mockReturnValueOnce(getQ);

    await expect(
      MyBookingService.submitDepositProof("cust-1", "req-1", "data:image/png;base64,abc")
    ).rejects.toMatchObject({ statusCode: 500 });
  });

  it("should throw AppError when proof_image_url DB update fails", async () => {
    const bookingWithDeposit = {
      ...bookingRow,
      deposit_requests: [{ id: "dep-1", status: "pending", amount: 2000000 }],
    };
    cloudinaryMock.uploader.upload.mockResolvedValue({ secure_url: "https://cdn/proof.jpg" });

    const getQ = makeFluentQuery({ data: bookingWithDeposit, error: null });
    mockedSupabase.from.mockReturnValueOnce(getQ);
    const updateQ = makeFluentQuery({ data: null, error: { message: "update fail" } });
    mockedSupabase.from.mockReturnValueOnce(updateQ);

    await expect(
      MyBookingService.submitDepositProof("cust-1", "req-1", "data:image/png;base64,abc")
    ).rejects.toMatchObject({ statusCode: 500 });
  });
});
