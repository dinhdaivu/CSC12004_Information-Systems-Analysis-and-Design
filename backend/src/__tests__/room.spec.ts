import { RoomService } from "../services/room.service";
import { supabaseServiceRole } from "../config/supabase";

// 1. Mocking Supabase Client để không gọi db thật
jest.mock("../config/supabase", () => ({
  supabaseServiceRole: {
    from: jest.fn(),
  },
}));

describe("RoomService - getRooms", () => {
  // 2. Tạo đối tượng mock mô phỏng luồng query chainable của Supabase
  const mockChainable = {
    select: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    data: null as any,
    error: null as any,
    then: function (resolve: any) {
      resolve({ data: this.data, error: this.error });
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (supabaseServiceRole!.from as jest.Mock).mockReturnValue(mockChainable);
  });

  it("should return public-safe mapped rooms successfully without filters", async () => {
    // Giả lập dữ liệu thô (RoomRow) trả về từ Supabase
    const mockRoomsRow = [
      {
        id: "room-1",
        branch_id: "branch-1",
        room_number: "101",
        room_type: "twin",
        max_capacity: 2,
        price_per_month: 2000000,
        amenities: ["AC", "Wifi"],
        images_url: ["img1.png"],
        status: "available",
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
        zones: { id: "zone-1", name: "Zone", branches: { id: "branch-1", name: "Nguyễn Cửu Vân", address: "123 NCV" } },
        beds: [],
      },
    ];
    mockChainable.data = mockRoomsRow;
    mockChainable.error = null;

    const result = await RoomService.getRooms({});

    expect(supabaseServiceRole!.from).toHaveBeenCalledWith("rooms");
    expect(mockChainable.select).toHaveBeenCalled();
    expect(mockChainable.order).toHaveBeenCalledWith("room_number", { ascending: true });
    
    // Kiểm tra tính chất Public-safe của hàm mapRoom
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("room-1");
    expect(result[0].pricePerMonth).toBe(2000000); 
    expect(result[0].branch?.name).toBe("Nguyễn Cửu Vân");
  });

  it("should apply capacity, min_price, and max_price filters correctly to the query", async () => {
    mockChainable.data = [];
    mockChainable.error = null;

    await RoomService.getRooms({
      capacity: 4,
      min_price: 1500000,
      max_price: 3000000,
    });

    // Xác minh các câu lệnh query builder được gọi đúng chuẩn
    expect(mockChainable.eq).toHaveBeenCalledWith("max_capacity", 4);
    expect(mockChainable.gte).toHaveBeenCalledWith("price_per_month", 1500000);
    expect(mockChainable.lte).toHaveBeenCalledWith("price_per_month", 3000000);
  });

  it("should locally filter by search keyword combining room_type, room_number, and branch name", async () => {
    // Giả lập dữ liệu trả về từ query cơ bản để test hàm filter logic Search
    const mockRoomsRow = [
      {
        id: "room-1",
        room_number: "101",
        room_type: "twin",
        zones: { branches: { id: "b1", name: "Branch A", address: "" } },
        beds: []
      },
      {
        id: "room-2",
        room_number: "202",
        room_type: "quad",
        zones: { branches: { id: "b2", name: "Branch B", address: "" } },
        beds: []
      }
    ];
    mockChainable.data = mockRoomsRow;

    // Test search theo loại phòng (room_type)
    const resultType = await RoomService.getRooms({ search: "quad" });
    expect(resultType).toHaveLength(1);
    expect(resultType[0].id).toBe("room-2");

    // Test search theo tên chi nhánh (branch name)
    const resultBranch = await RoomService.getRooms({ search: "branch a" });
    expect(resultBranch).toHaveLength(1);
    expect(resultBranch[0].id).toBe("room-1");
  });
});