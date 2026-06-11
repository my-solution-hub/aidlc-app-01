import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";

vi.mock("../request", () => ({
  default: {
    get: vi.fn(() => Promise.resolve({})),
    post: vi.fn(() => Promise.resolve({})),
    put: vi.fn(() => Promise.resolve({})),
    patch: vi.fn(() => Promise.resolve({})),
    delete: vi.fn(() => Promise.resolve({})),
  },
}));

import request from "../request";
import {
  listUserPoints,
  adjustUserPoints,
  getDistributionConfig,
  updateDistributionConfig,
  getPointGrantStats,
} from "./pointAdmin";

const get = request.get as Mock;
const post = request.post as Mock;
const put = request.put as Mock;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("pointAdmin service (matches OpenAPI /api/admin/points/*)", () => {
  it("listUserPoints -> GET /api/admin/points/users with query params (US-020)", async () => {
    await listUserPoints({ page: 2, size: 20, keyword: "张" });
    expect(get).toHaveBeenCalledWith("/api/admin/points/users", {
      params: { page: 2, size: 20, keyword: "张" },
    });
  });

  it("adjustUserPoints -> POST /api/admin/points/adjust with body (US-021)", async () => {
    await adjustUserPoints({ userId: 7, amount: -50, reason: "违规扣减" });
    expect(post).toHaveBeenCalledWith("/api/admin/points/adjust", {
      userId: 7,
      amount: -50,
      reason: "违规扣减",
    });
  });

  it("getDistributionConfig -> GET /api/admin/points/config (US-022)", async () => {
    await getDistributionConfig();
    expect(get).toHaveBeenCalledWith("/api/admin/points/config");
  });

  it("updateDistributionConfig -> PUT /api/admin/points/config with body (US-022)", async () => {
    await updateDistributionConfig({
      amount: 1000,
      cycle: "MONTHLY",
      grantDay: 1,
      enabled: true,
      targetRole: "employee",
    });
    expect(put).toHaveBeenCalledWith("/api/admin/points/config", {
      amount: 1000,
      cycle: "MONTHLY",
      grantDay: 1,
      enabled: true,
      targetRole: "employee",
    });
  });

  it("getPointGrantStats(month) -> GET stats with month param", async () => {
    await getPointGrantStats("2026-06");
    expect(get).toHaveBeenCalledWith("/api/admin/points/config/stats", {
      params: { month: "2026-06" },
    });
  });

  it("getPointGrantStats() -> GET stats with no params", async () => {
    await getPointGrantStats();
    expect(get).toHaveBeenCalledWith("/api/admin/points/config/stats", {
      params: undefined,
    });
  });
});
