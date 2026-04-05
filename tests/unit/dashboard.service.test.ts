import { describe, expect, it, vi } from "vitest";

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

describe("dashboard service", () => {
  it("builds totals, recent activity, and monthly trend data", async () => {
    dashboardRepositoryMock.aggregate.mockImplementation((_where, type) =>
      Promise.resolve({
        _sum: { amount: type === "INCOME" ? 1500 : 400 },
      })
    );

    dashboardRepositoryMock.categoryAggregation.mockResolvedValue([
      { category: "Sales", type: "INCOME", _sum: { amount: 1500 } },
      { category: "Ops", type: "EXPENSE", _sum: { amount: 400 } },
    ]);

    dashboardRepositoryMock.count.mockResolvedValue(2);
    dashboardRepositoryMock.recentActivity.mockResolvedValue([
      {
        id: "record_1",
        amount: 1500,
        type: "INCOME",
        category: "Sales",
        date: new Date("2026-04-01T00:00:00.000Z"),
        note: null,
        createdAt: new Date("2026-04-01T00:00:00.000Z"),
      },
    ]);
    dashboardRepositoryMock.trendWindow.mockResolvedValue([
      { amount: 1500, type: "INCOME", date: new Date("2026-04-01T00:00:00.000Z") },
      { amount: 400, type: "EXPENSE", date: new Date("2026-04-02T00:00:00.000Z") },
    ]);

    const result = await dashboardService.getSummary({ id: "user_1", role: "ADMIN" });

    expect(result.totalIncome).toBe(1500);
    expect(result.totalExpenses).toBe(400);
    expect(result.netBalance).toBe(1100);
    expect(result.recentActivity).toHaveLength(1);
    expect(result.monthlyTrend).toEqual([
      {
        month: "2026-04",
        income: 1500,
        expenses: 400,
      },
    ]);
  });
});