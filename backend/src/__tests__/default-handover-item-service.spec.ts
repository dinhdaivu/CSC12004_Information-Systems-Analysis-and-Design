import { DefaultHandoverItemService } from "@services/default-handover-item.service";
import { supabaseServiceRole } from "@config/supabase";

jest.mock("@config/supabase", () => ({
  supabaseServiceRole: { from: jest.fn() },
}));

const mockedSupabase = supabaseServiceRole as NonNullable<typeof supabaseServiceRole> & {
  from: jest.Mock;
};

const itemRow = {
  id: "item-1",
  room_type_match: "*",
  item_name: "Light Bulb",
  default_condition: "Good",
  sort_order: 1,
  active: true,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

const dormItemRow = {
  ...itemRow,
  id: "item-2",
  room_type_match: "dorm",
  item_name: "Mattress",
  sort_order: 2,
};

/** Self-returning fluent query mock that resolves to `result` when awaited. */
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

function mockListQuery(rows: unknown[], error: unknown = null) {
  const q = makeFluentQuery({ data: rows, error });
  mockedSupabase.from.mockReturnValueOnce(q);
  return q;
}

beforeEach(() => jest.clearAllMocks());

describe("DefaultHandoverItemService.list", () => {
  it("should return all items without activeOnly filter", async () => {
    const q = mockListQuery([itemRow, dormItemRow]);

    const result = await DefaultHandoverItemService.list();
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("item-1");
    expect(q.eq).not.toHaveBeenCalled();
  });

  it("should apply activeOnly filter", async () => {
    const q = mockListQuery([itemRow]);

    const result = await DefaultHandoverItemService.list(true);
    expect(q.eq).toHaveBeenCalledWith("active", true);
    expect(result).toHaveLength(1);
  });

  it("should throw InternalServerError on DB error", async () => {
    mockListQuery([], { message: "db error" });

    await expect(DefaultHandoverItemService.list()).rejects.toMatchObject({ statusCode: 500 });
  });

  it("should return empty array when data is null", async () => {
    const q = makeFluentQuery({ data: null, error: null });
    mockedSupabase.from.mockReturnValueOnce(q);

    const result = await DefaultHandoverItemService.list();
    expect(result).toEqual([]);
  });
});

describe("DefaultHandoverItemService.resolveForRoomType", () => {
  it("should return global items when roomType is null", async () => {
    mockListQuery([itemRow]);

    const result = await DefaultHandoverItemService.resolveForRoomType(null);
    expect(result).toHaveLength(1);
    expect(result[0].itemName).toBe("Light Bulb");
  });

  it("should return global items when roomType is undefined", async () => {
    mockListQuery([itemRow]);

    const result = await DefaultHandoverItemService.resolveForRoomType(undefined);
    expect(result).toHaveLength(1);
  });

  it("should return only global items when roomType is empty string", async () => {
    mockListQuery([itemRow, dormItemRow]);

    const result = await DefaultHandoverItemService.resolveForRoomType("");
    expect(result).toHaveLength(1);
    expect(result[0].itemName).toBe("Light Bulb");
  });

  it("should return global and matching type-specific items", async () => {
    mockListQuery([itemRow, dormItemRow]);

    const result = await DefaultHandoverItemService.resolveForRoomType("dorm_single");
    expect(result).toHaveLength(2);
    // Global items sorted first
    expect(result[0].itemName).toBe("Light Bulb");
    expect(result[1].itemName).toBe("Mattress");
  });

  it("should return only global items when roomType does not match any specific item", async () => {
    mockListQuery([itemRow, dormItemRow]);

    const result = await DefaultHandoverItemService.resolveForRoomType("studio");
    expect(result).toHaveLength(1);
    expect(result[0].itemName).toBe("Light Bulb");
  });

  it("should return empty array when no items exist", async () => {
    mockListQuery([]);

    const result = await DefaultHandoverItemService.resolveForRoomType("dorm");
    expect(result).toEqual([]);
  });

  it("should map items to ResolvedHandoverItem shape", async () => {
    mockListQuery([itemRow]);

    const result = await DefaultHandoverItemService.resolveForRoomType("any");
    expect(result[0]).toEqual({
      itemName: "Light Bulb",
      itemCondition: "Good",
      notes: "",
      sortOrder: 1,
    });
  });

  it("should sort global items before type-specific items", async () => {
    const typeItem = { ...dormItemRow, sort_order: 0 };
    mockListQuery([typeItem, itemRow]);

    const result = await DefaultHandoverItemService.resolveForRoomType("dorm");
    expect(result[0].itemName).toBe("Light Bulb"); // global (*) first
    expect(result[1].itemName).toBe("Mattress");
  });

  it("should sort by sortOrder when both items have the same roomTypeMatch", async () => {
    const itemRow2 = { ...itemRow, id: "item-3", item_name: "Lamp", sort_order: 2 };
    mockListQuery([itemRow2, itemRow]); // both roomTypeMatch: '*', different sort_order

    const result = await DefaultHandoverItemService.resolveForRoomType("any");
    expect(result[0].itemName).toBe("Light Bulb"); // sort_order 1 first
    expect(result[1].itemName).toBe("Lamp");        // sort_order 2 second
  });
});

describe("DefaultHandoverItemService.create", () => {
  it("should throw ValidationError when itemName is missing", async () => {
    await expect(
      DefaultHandoverItemService.create({ itemName: "", roomTypeMatch: "*", defaultCondition: "Good" })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("should throw ValidationError when itemName is only whitespace", async () => {
    await expect(
      DefaultHandoverItemService.create({ itemName: "  ", roomTypeMatch: "*" })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("should throw ValidationError when roomTypeMatch is missing", async () => {
    await expect(
      DefaultHandoverItemService.create({ itemName: "Bulb", roomTypeMatch: "" })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("should throw ValidationError when roomTypeMatch is only whitespace", async () => {
    await expect(
      DefaultHandoverItemService.create({ itemName: "Bulb", roomTypeMatch: "  " })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("should create item with defaults for condition and active", async () => {
    const single = jest.fn().mockResolvedValue({ data: itemRow, error: null });
    const select = jest.fn().mockReturnValue({ single });
    const insert = jest.fn().mockReturnValue({ select });
    mockedSupabase.from.mockReturnValueOnce({ insert });

    const result = await DefaultHandoverItemService.create({
      itemName: "Light Bulb",
      roomTypeMatch: "*",
    });

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ default_condition: "Good", active: true, sort_order: 0 })
    );
    expect(result.id).toBe("item-1");
  });

  it("should use provided defaultCondition and sortOrder", async () => {
    const customRow = { ...itemRow, default_condition: "Excellent", sort_order: 3 };
    const single = jest.fn().mockResolvedValue({ data: customRow, error: null });
    const select = jest.fn().mockReturnValue({ single });
    const insert = jest.fn().mockReturnValue({ select });
    mockedSupabase.from.mockReturnValueOnce({ insert });

    await DefaultHandoverItemService.create({
      itemName: "Fan",
      roomTypeMatch: "dorm",
      defaultCondition: "Excellent",
      sortOrder: 3,
      active: false,
    });

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ default_condition: "Excellent", sort_order: 3, active: false })
    );
  });

  it("should use 'Good' when defaultCondition is empty string", async () => {
    const single = jest.fn().mockResolvedValue({ data: itemRow, error: null });
    const select = jest.fn().mockReturnValue({ single });
    const insert = jest.fn().mockReturnValue({ select });
    mockedSupabase.from.mockReturnValueOnce({ insert });

    await DefaultHandoverItemService.create({ itemName: "Bulb", roomTypeMatch: "*", defaultCondition: "" });

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ default_condition: "Good" })
    );
  });

  it("should throw InternalServerError on DB error", async () => {
    const single = jest.fn().mockResolvedValue({ data: null, error: { message: "insert failed" } });
    const select = jest.fn().mockReturnValue({ single });
    const insert = jest.fn().mockReturnValue({ select });
    mockedSupabase.from.mockReturnValueOnce({ insert });

    await expect(
      DefaultHandoverItemService.create({ itemName: "Fan", roomTypeMatch: "dorm" })
    ).rejects.toMatchObject({ statusCode: 500 });
  });
});

describe("DefaultHandoverItemService.update", () => {
  it("should throw ValidationError when no fields provided", async () => {
    await expect(
      DefaultHandoverItemService.update("item-1", {})
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("should update item successfully", async () => {
    const updatedRow = { ...itemRow, item_name: "Updated Bulb" };
    const maybeSingle = jest.fn().mockResolvedValue({ data: updatedRow, error: null });
    const select = jest.fn().mockReturnValue({ maybeSingle });
    const eq = jest.fn().mockReturnValue({ select });
    const update = jest.fn().mockReturnValue({ eq });
    mockedSupabase.from.mockReturnValueOnce({ update });

    const result = await DefaultHandoverItemService.update("item-1", { itemName: "Updated Bulb" });
    expect(update).toHaveBeenCalledWith({ item_name: "Updated Bulb" });
    expect(result.itemName).toBe("Updated Bulb");
  });

  it("should throw NotFoundError when item does not exist", async () => {
    const maybeSingle = jest.fn().mockResolvedValue({ data: null, error: null });
    const select = jest.fn().mockReturnValue({ maybeSingle });
    const eq = jest.fn().mockReturnValue({ select });
    const update = jest.fn().mockReturnValue({ eq });
    mockedSupabase.from.mockReturnValueOnce({ update });

    await expect(
      DefaultHandoverItemService.update("missing", { itemName: "X" })
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it("should throw InternalServerError on DB error", async () => {
    const maybeSingle = jest.fn().mockResolvedValue({ data: null, error: { message: "update failed" } });
    const select = jest.fn().mockReturnValue({ maybeSingle });
    const eq = jest.fn().mockReturnValue({ select });
    const update = jest.fn().mockReturnValue({ eq });
    mockedSupabase.from.mockReturnValueOnce({ update });

    await expect(
      DefaultHandoverItemService.update("item-1", { active: false })
    ).rejects.toMatchObject({ statusCode: 500 });
  });

  it("should update all provided fields", async () => {
    const maybeSingle = jest.fn().mockResolvedValue({ data: itemRow, error: null });
    const select = jest.fn().mockReturnValue({ maybeSingle });
    const eq = jest.fn().mockReturnValue({ select });
    const update = jest.fn().mockReturnValue({ eq });
    mockedSupabase.from.mockReturnValueOnce({ update });

    await DefaultHandoverItemService.update("item-1", {
      itemName: "New",
      roomTypeMatch: "dorm",
      defaultCondition: "Fair",
      sortOrder: 5,
      active: false,
    });

    expect(update).toHaveBeenCalledWith({
      item_name: "New",
      room_type_match: "dorm",
      default_condition: "Fair",
      sort_order: 5,
      active: false,
    });
  });
});

describe("DefaultHandoverItemService.remove", () => {
  it("should delete item successfully", async () => {
    const select = jest.fn().mockResolvedValue({ data: [{ id: "item-1" }], error: null });
    const eq = jest.fn().mockReturnValue({ select });
    const del = jest.fn().mockReturnValue({ eq });
    mockedSupabase.from.mockReturnValueOnce({ delete: del });

    await expect(DefaultHandoverItemService.remove("item-1")).resolves.toBeUndefined();
  });

  it("should throw NotFoundError when item does not exist (empty array)", async () => {
    const select = jest.fn().mockResolvedValue({ data: [], error: null });
    const eq = jest.fn().mockReturnValue({ select });
    const del = jest.fn().mockReturnValue({ eq });
    mockedSupabase.from.mockReturnValueOnce({ delete: del });

    await expect(DefaultHandoverItemService.remove("missing")).rejects.toMatchObject({ statusCode: 404 });
  });

  it("should throw NotFoundError when data is null", async () => {
    const select = jest.fn().mockResolvedValue({ data: null, error: null });
    const eq = jest.fn().mockReturnValue({ select });
    const del = jest.fn().mockReturnValue({ eq });
    mockedSupabase.from.mockReturnValueOnce({ delete: del });

    await expect(DefaultHandoverItemService.remove("missing")).rejects.toMatchObject({ statusCode: 404 });
  });

  it("should throw InternalServerError on DB error", async () => {
    const select = jest.fn().mockResolvedValue({ data: null, error: { message: "delete failed" } });
    const eq = jest.fn().mockReturnValue({ select });
    const del = jest.fn().mockReturnValue({ eq });
    mockedSupabase.from.mockReturnValueOnce({ delete: del });

    await expect(DefaultHandoverItemService.remove("item-1")).rejects.toMatchObject({ statusCode: 500 });
  });
});
