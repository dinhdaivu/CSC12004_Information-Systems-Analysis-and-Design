import request from "supertest";
import express from "express";
import zoneRoutes from "../routes/zone.routes";
import { supabaseServiceRole } from "../config/supabase";

jest.mock("../config/supabase", () => ({
  supabaseServiceRole: { from: jest.fn() },
}));

function createSupabaseMock(resolveValue: any, errorValue: any = null) {
  const chain: any = {
    select: jest.fn(() => chain),
    order: jest.fn(() => chain),
    eq: jest.fn(() => chain),
  };
  chain.then = (onfulfilled: any) => Promise.resolve({ data: resolveValue, error: errorValue }).then(onfulfilled);
  return chain;
}

const app = express();
app.use("/api/zones", zoneRoutes);

describe("Zone API & Service", () => {
  it("GET / should return zones", async () => {
    (supabaseServiceRole!.from as jest.Mock).mockReturnValue(createSupabaseMock([{ id: "z1", name: "Zone 1" }]));
    const res = await request(app).get("/api/zones");
    expect(res.status).toBe(200);
    expect(res.body.data[0].id).toBe("z1");
  });
  
  it("GET / with branch_id should filter zones", async () => {
    const mockChain = createSupabaseMock([{ id: "z2", name: "Zone 2" }]);
    (supabaseServiceRole!.from as jest.Mock).mockReturnValue(mockChain);
    const res = await request(app).get("/api/zones?branch_id=b1");
    expect(res.status).toBe(200);
    expect(mockChain.eq).toHaveBeenCalledWith("branch_id", "b1");
  });
});