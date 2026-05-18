import { DisputeService } from "@services/dispute.service";
import { supabaseServiceRole } from "@config/supabase";
import cloudinary from "@config/cloudinary";

jest.mock("@config/supabase", () => ({
  supabaseServiceRole: { from: jest.fn() },
}));

jest.mock("@config/cloudinary", () => ({
  uploader: { upload: jest.fn() },
}));

const mockedSupabase = supabaseServiceRole as NonNullable<typeof supabaseServiceRole> & {
  from: jest.Mock;
};
const mockedUpload = (cloudinary as unknown as { uploader: { upload: jest.Mock } }).uploader.upload;

const disputeRow = {
  id: "d-1",
  settlement_id: "s-1",
  checkout_request_id: "co-1",
  customer_id: "cust-1",
  name: "Jane",
  branch: "Branch A",
  reason: "Incorrect charge",
  evidence_url: null,
  status: "pending",
  resolved_at: null,
  resolved_by: null,
  resolution_note: null,
  created_at: "2026-05-01T00:00:00Z",
  updated_at: "2026-05-01T00:00:00Z",
};

/** Build a self-returning fluent query mock that resolves to `result` when awaited. */
function makeFluentQuery(result: unknown) {
  const q = Object.assign(Promise.resolve(result), {
    select: jest.fn(),
    order: jest.fn(),
    eq: jest.fn(),
  });
  q.select.mockReturnValue(q);
  q.order.mockReturnValue(q);
  q.eq.mockReturnValue(q);
  return q;
}

beforeEach(() => jest.clearAllMocks());

describe("DisputeService.list", () => {
  it("should return all disputes with no filters", async () => {
    const q = makeFluentQuery({ data: [disputeRow], error: null });
    mockedSupabase.from.mockReturnValueOnce(q);

    const result = await DisputeService.list();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("d-1");
  });

  it("should apply customerId filter", async () => {
    const q = makeFluentQuery({ data: [], error: null });
    mockedSupabase.from.mockReturnValueOnce(q);

    await DisputeService.list({ customerId: "cust-1" });
    expect(q.eq).toHaveBeenCalledWith("customer_id", "cust-1");
  });

  it("should apply status filter", async () => {
    const q = makeFluentQuery({ data: [], error: null });
    mockedSupabase.from.mockReturnValueOnce(q);

    await DisputeService.list({ status: "resolved" });
    expect(q.eq).toHaveBeenCalledWith("status", "resolved");
  });

  it("should apply both filters when both provided", async () => {
    const q = makeFluentQuery({ data: [], error: null });
    mockedSupabase.from.mockReturnValueOnce(q);

    await DisputeService.list({ customerId: "cust-1", status: "pending" });
    expect(q.eq).toHaveBeenCalledWith("customer_id", "cust-1");
    expect(q.eq).toHaveBeenCalledWith("status", "pending");
  });

  it("should throw InternalServerError on DB error", async () => {
    const q = makeFluentQuery({ data: null, error: { message: "db error" } });
    mockedSupabase.from.mockReturnValueOnce(q);

    await expect(DisputeService.list()).rejects.toMatchObject({ statusCode: 500 });
  });

  it("should return empty array when data is null", async () => {
    const q = makeFluentQuery({ data: null, error: null });
    mockedSupabase.from.mockReturnValueOnce(q);

    const result = await DisputeService.list();
    expect(result).toEqual([]);
  });

  it("should map null optional fields to null in DTO", async () => {
    const rowWithNulls = {
      ...disputeRow,
      settlement_id: null,
      checkout_request_id: null,
      branch: null,
    };
    const q = makeFluentQuery({ data: [rowWithNulls], error: null });
    mockedSupabase.from.mockReturnValueOnce(q);

    const result = await DisputeService.list();
    expect(result[0].settlementId).toBeNull();
    expect(result[0].checkoutRequestId).toBeNull();
    expect(result[0].branch).toBeNull();
  });
});

describe("DisputeService.getById", () => {
  function mockGetById(data: unknown, error: unknown = null) {
    const maybeSingle = jest.fn().mockResolvedValue({ data, error });
    const eq = jest.fn().mockReturnValue({ maybeSingle });
    const select = jest.fn().mockReturnValue({ eq });
    mockedSupabase.from.mockReturnValueOnce({ select });
  }

  it("should return dispute when found", async () => {
    mockGetById(disputeRow);
    const result = await DisputeService.getById("d-1");
    expect(result.id).toBe("d-1");
    expect(result.name).toBe("Jane");
    expect(result.customerId).toBe("cust-1");
  });

  it("should throw NotFoundError when data is null", async () => {
    mockGetById(null);
    await expect(DisputeService.getById("missing")).rejects.toMatchObject({ statusCode: 404 });
  });

  it("should throw InternalServerError on DB error", async () => {
    mockGetById(null, { message: "fail" });
    await expect(DisputeService.getById("d-1")).rejects.toMatchObject({ statusCode: 500 });
  });
});

describe("DisputeService.create", () => {
  it("should throw ValidationError when name is missing", async () => {
    await expect(
      DisputeService.create({ customerId: "c", name: "", reason: "r" })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("should throw ValidationError when name is only whitespace", async () => {
    await expect(
      DisputeService.create({ customerId: "c", name: "   ", reason: "r" })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("should throw ValidationError when reason is missing", async () => {
    await expect(
      DisputeService.create({ customerId: "c", name: "Jane", reason: "" })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("should throw ValidationError when reason is only whitespace", async () => {
    await expect(
      DisputeService.create({ customerId: "c", name: "Jane", reason: "  " })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("should create dispute without evidence", async () => {
    const single = jest.fn().mockResolvedValue({ data: disputeRow, error: null });
    const select = jest.fn().mockReturnValue({ single });
    const insert = jest.fn().mockReturnValue({ select });
    mockedSupabase.from.mockReturnValueOnce({ insert });

    const result = await DisputeService.create({
      customerId: "cust-1",
      name: "Jane",
      reason: "Incorrect charge",
    });

    expect(result.id).toBe("d-1");
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ status: "pending" }));
    expect(mockedUpload).not.toHaveBeenCalled();
  });

  it("should upload evidence from base64 when evidenceBase64 provided", async () => {
    mockedUpload.mockResolvedValueOnce({ secure_url: "https://cdn/ev.jpg" });

    const single = jest.fn().mockResolvedValue({
      data: { ...disputeRow, evidence_url: "https://cdn/ev.jpg" },
      error: null,
    });
    const select = jest.fn().mockReturnValue({ single });
    const insert = jest.fn().mockReturnValue({ select });
    mockedSupabase.from.mockReturnValueOnce({ insert });

    const result = await DisputeService.create({
      customerId: "cust-1",
      name: "Jane",
      reason: "Incorrect charge",
      evidenceBase64: "data:image/png;base64,abc",
    });

    expect(mockedUpload).toHaveBeenCalledWith(
      "data:image/png;base64,abc",
      expect.objectContaining({ folder: "homestay-dorm/disputes" }),
    );
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ evidence_url: "https://cdn/ev.jpg" }));
    expect(result.evidenceUrl).toBe("https://cdn/ev.jpg");
  });

  it("should skip upload when evidenceUrl is already provided alongside evidenceBase64", async () => {
    const single = jest.fn().mockResolvedValue({
      data: { ...disputeRow, evidence_url: "https://cdn/existing.jpg" },
      error: null,
    });
    const select = jest.fn().mockReturnValue({ single });
    const insert = jest.fn().mockReturnValue({ select });
    mockedSupabase.from.mockReturnValueOnce({ insert });

    await DisputeService.create({
      customerId: "cust-1",
      name: "Jane",
      reason: "r",
      evidenceUrl: "https://cdn/existing.jpg",
      evidenceBase64: "data:image/png;base64,abc",
    });

    expect(mockedUpload).not.toHaveBeenCalled();
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ evidence_url: "https://cdn/existing.jpg" })
    );
  });

  it("should throw InternalServerError when cloudinary upload fails with Error", async () => {
    mockedUpload.mockRejectedValueOnce(new Error("upload failed"));

    await expect(
      DisputeService.create({
        customerId: "c",
        name: "Jane",
        reason: "r",
        evidenceBase64: "data:image/png;base64,abc",
      })
    ).rejects.toMatchObject({ statusCode: 500, message: expect.stringContaining("upload failed") });
  });

  it("should throw InternalServerError when cloudinary upload fails with non-Error", async () => {
    mockedUpload.mockRejectedValueOnce("string error");

    await expect(
      DisputeService.create({
        customerId: "c",
        name: "Jane",
        reason: "r",
        evidenceBase64: "data:image/png;base64,abc",
      })
    ).rejects.toMatchObject({ statusCode: 500 });
  });

  it("should throw InternalServerError on DB insert error", async () => {
    const single = jest.fn().mockResolvedValue({ data: null, error: { message: "insert failed" } });
    const select = jest.fn().mockReturnValue({ single });
    const insert = jest.fn().mockReturnValue({ select });
    mockedSupabase.from.mockReturnValueOnce({ insert });

    await expect(
      DisputeService.create({ customerId: "c", name: "Jane", reason: "r" })
    ).rejects.toMatchObject({ statusCode: 500 });
  });
});

describe("DisputeService.resolve", () => {
  function mockGetById(data: unknown, error: unknown = null) {
    const maybeSingle = jest.fn().mockResolvedValue({ data, error });
    const eq = jest.fn().mockReturnValue({ maybeSingle });
    const select = jest.fn().mockReturnValue({ eq });
    mockedSupabase.from.mockReturnValueOnce({ select });
  }

  it("should throw ConflictError when dispute is already resolved", async () => {
    mockGetById({ ...disputeRow, status: "resolved" });

    await expect(
      DisputeService.resolve("d-1", { status: "resolved", resolvedBy: "staff-1" })
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it("should throw ConflictError when dispute is already rejected", async () => {
    mockGetById({ ...disputeRow, status: "rejected" });

    await expect(
      DisputeService.resolve("d-1", { status: "rejected", resolvedBy: "staff-1" })
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it("should throw InternalServerError on update DB error", async () => {
    // first getById
    mockGetById(disputeRow);
    // update
    const eq = jest.fn().mockResolvedValue({ error: { message: "update failed" } });
    const update = jest.fn().mockReturnValue({ eq });
    mockedSupabase.from.mockReturnValueOnce({ update });

    await expect(
      DisputeService.resolve("d-1", { status: "resolved", resolvedBy: "staff-1" })
    ).rejects.toMatchObject({ statusCode: 500 });
  });

  it("should resolve dispute and return updated record", async () => {
    const resolvedRow = { ...disputeRow, status: "resolved", resolved_by: "staff-1" };

    // first getById
    mockGetById(disputeRow);
    // update
    const eq = jest.fn().mockResolvedValue({ error: null });
    const update = jest.fn().mockReturnValue({ eq });
    mockedSupabase.from.mockReturnValueOnce({ update });
    // second getById
    mockGetById(resolvedRow);

    const result = await DisputeService.resolve("d-1", {
      status: "resolved",
      resolvedBy: "staff-1",
      resolutionNote: "Accepted",
    });

    expect(result.status).toBe("resolved");
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "resolved",
        resolved_by: "staff-1",
        resolution_note: "Accepted",
      })
    );
  });

  it("should resolve with null resolutionNote when not provided", async () => {
    mockGetById(disputeRow);
    const eq = jest.fn().mockResolvedValue({ error: null });
    const update = jest.fn().mockReturnValue({ eq });
    mockedSupabase.from.mockReturnValueOnce({ update });
    mockGetById({ ...disputeRow, status: "resolved" });

    await DisputeService.resolve("d-1", { status: "resolved", resolvedBy: "staff-1" });

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ resolution_note: null })
    );
  });
});
