import { PaymentRepository } from "../repositories/payment.repository";
import { supabaseServiceRole } from "@config/supabase";

jest.mock("@config/supabase", () => ({
  supabaseServiceRole: { from: jest.fn() },
}));

const mockedSupabase = supabaseServiceRole as NonNullable<typeof supabaseServiceRole> & {
  from: jest.Mock;
};

const paymentRow = {
  id: "pay-1",
  user_id: "user-1",
  deposit_request_id: "dep-1",
  amount: 3000000,
  type: "deposit" as const,
  status: "completed" as const,
  payment_method: "bank_transfer" as const,
  created_at: "2026-05-01T00:00:00Z",
  updated_at: "2026-05-01T00:00:00Z",
};

function makeFluentChain(result: unknown) {
  const q = Object.assign(Promise.resolve(result), {
    select: jest.fn(),
    order: jest.fn(),
    eq: jest.fn(),
    gte: jest.fn(),
    lte: jest.fn(),
  });
  q.select.mockReturnValue(q);
  q.order.mockReturnValue(q);
  q.eq.mockReturnValue(q);
  q.gte.mockReturnValue(q);
  q.lte.mockReturnValue(q);
  return q;
}

beforeEach(() => jest.clearAllMocks());

describe("PaymentRepository.list", () => {
  it("should return payments with no filters", async () => {
    const q = makeFluentChain({ data: [paymentRow], error: null });
    mockedSupabase.from.mockReturnValueOnce(q);

    const result = await PaymentRepository.list({});
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("pay-1");
  });

  it("should convert numeric amount directly (toNumber true branch)", async () => {
    const q = makeFluentChain({ data: [{ ...paymentRow, amount: 5000000 }], error: null });
    mockedSupabase.from.mockReturnValueOnce(q);

    const result = await PaymentRepository.list({});
    expect(result[0].amount).toBe(5000000);
  });

  it("should convert string amount to number (toNumber false branch)", async () => {
    const q = makeFluentChain({ data: [{ ...paymentRow, amount: "1500000" }], error: null });
    mockedSupabase.from.mockReturnValueOnce(q);

    const result = await PaymentRepository.list({});
    expect(result[0].amount).toBe(1500000);
  });

  it("should apply fromDate filter when provided", async () => {
    const q = makeFluentChain({ data: [], error: null });
    mockedSupabase.from.mockReturnValueOnce(q);

    await PaymentRepository.list({ fromDate: "2026-05-01T00:00:00Z" });
    expect(q.gte).toHaveBeenCalledWith("created_at", "2026-05-01T00:00:00Z");
  });

  it("should not apply fromDate filter when absent", async () => {
    const q = makeFluentChain({ data: [], error: null });
    mockedSupabase.from.mockReturnValueOnce(q);

    await PaymentRepository.list({});
    expect(q.gte).not.toHaveBeenCalled();
  });

  it("should apply toDate filter when provided", async () => {
    const q = makeFluentChain({ data: [], error: null });
    mockedSupabase.from.mockReturnValueOnce(q);

    await PaymentRepository.list({ toDate: "2026-06-01T00:00:00Z" });
    expect(q.lte).toHaveBeenCalledWith("created_at", "2026-06-01T00:00:00Z");
  });

  it("should not apply toDate filter when absent", async () => {
    const q = makeFluentChain({ data: [], error: null });
    mockedSupabase.from.mockReturnValueOnce(q);

    await PaymentRepository.list({});
    expect(q.lte).not.toHaveBeenCalled();
  });

  it("should apply type filter when provided", async () => {
    const q = makeFluentChain({ data: [], error: null });
    mockedSupabase.from.mockReturnValueOnce(q);

    await PaymentRepository.list({ type: "deposit" as never });
    expect(q.eq).toHaveBeenCalledWith("type", "deposit");
  });

  it("should apply status filter when provided", async () => {
    const q = makeFluentChain({ data: [], error: null });
    mockedSupabase.from.mockReturnValueOnce(q);

    await PaymentRepository.list({ status: "completed" as never });
    expect(q.eq).toHaveBeenCalledWith("status", "completed");
  });

  it("should throw InternalServerError on DB error", async () => {
    const q = makeFluentChain({ data: null, error: { message: "db error" } });
    mockedSupabase.from.mockReturnValueOnce(q);

    await expect(PaymentRepository.list({})).rejects.toMatchObject({ statusCode: 500 });
  });

  it("should return empty array when data is null", async () => {
    const q = makeFluentChain({ data: null, error: null });
    mockedSupabase.from.mockReturnValueOnce(q);

    const result = await PaymentRepository.list({});
    expect(result).toEqual([]);
  });
});
