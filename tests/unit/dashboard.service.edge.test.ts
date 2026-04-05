import { describe, expect, it, vi, beforeEach } from "vitest";

const dashboardRepositoryMock = vi.hoisted(() => ({
  aggregate: vi.fn(),
  categoryAggregation: vi.fn(),
  count: vi.fn(),
  recentActivity: vi.fn(),
  trendWindow: vi.fn(),
}));

vi.mock("../../src/modules/dashboard/dashboard.repository", () => ({
  dashboardRepository: dashboardRepositoryMock,
}));

import { dashboardService } from "../../src/modules/dashboard/dashboard.service";

describe("dashboard service edge cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns zeros and empty arrays when no records exist", async () => {
    dashboardRepositoryMock.aggregate.mockResolvedValue({ _sum: { amount: null } });
    dashboardRepositoryMock.categoryAggregation.mockResolvedValue([]);
    dashboardRepositoryMock.count.mockResolvedValue(0);
    dashboardRepositoryMock.recentActivity.mockResolvedValue([]);
    dashboardRepositoryMock.trendWindow.mockResolvedValue([]);

    const result = await dashboardService.getSummary({ id: "viewer_1", role: "VIEWER" });

    expect(result).toEqual({
      totalIncome: 0,
      totalExpenses: 0,
      netBalance: 0,
      totalRecords: 0,
      recentActivity: [],
      monthlyTrend: [],
      categoryWise: [],
    });
  });

  it("scopes non-admin summaries to the current user", async () => {
    dashboardRepositoryMock.aggregate.mockResolvedValue({ _sum: { amount: 10 } });
    dashboardRepositoryMock.categoryAggregation.mockResolvedValue([]);
    dashboardRepositoryMock.count.mockResolvedValue(1);
    dashboardRepositoryMock.recentActivity.mockResolvedValue([]);
    dashboardRepositoryMock.trendWindow.mockResolvedValue([]);

    await dashboardService.getSummary({ id: "analyst_1", role: "ANALYST" });

    expect(dashboardRepositoryMock.aggregate).toHaveBeenNthCalledWith(1, { userId: "analyst_1" }, "INCOME");
    expect(dashboardRepositoryMock.aggregate).toHaveBeenNthCalledWith(2, { userId: "analyst_1" }, "EXPENSE");
  });
});