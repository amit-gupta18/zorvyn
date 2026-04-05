import type { Role } from "@prisma/client";
import { dashboardRepository } from "./dashboard.repository";

function buildScope(actor: { id: string; role: Role }) {
  return actor.role === "ADMIN" ? {} : { userId: actor.id };
}

type CategoryAggregationItem = {
  category: string;
  type: "INCOME" | "EXPENSE";
  _sum: {
    amount: unknown;
  };
};

type ActivityItem = {
  id: string;
  amount: unknown;
  type: "INCOME" | "EXPENSE";
  category: string;
  date: Date;
  note: string | null;
  createdAt: Date;
};

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export const dashboardService = {
  async getSummary(actor: { id: string; role: Role }) {
    const where = buildScope(actor);
    const trendStartDate = new Date();
    trendStartDate.setMonth(trendStartDate.getMonth() - 5);

    const [incomeTotals, expenseTotals, categories, totalRecords, recentActivity, trendWindow] = await Promise.all([
      dashboardRepository.aggregate(where, "INCOME"),
      dashboardRepository.aggregate(where, "EXPENSE"),
      dashboardRepository.categoryAggregation(where),
      dashboardRepository.count(where),
      dashboardRepository.recentActivity(where, 5),
      dashboardRepository.trendWindow(where, trendStartDate),
    ]);

    const totalIncome = Number(incomeTotals._sum.amount ?? 0);
    const totalExpenses = Number(expenseTotals._sum.amount ?? 0);
    const netBalance = totalIncome - totalExpenses;

    const monthlyTrendMap = new Map<string, { month: string; income: number; expenses: number }>();

    for (const item of trendWindow as Array<{ amount: unknown; type: "INCOME" | "EXPENSE"; date: Date }>) {
      const month = getMonthKey(new Date(item.date));
      const current = monthlyTrendMap.get(month) ?? { month, income: 0, expenses: 0 };

      if (item.type === "INCOME") {
        current.income += Number(item.amount ?? 0);
      } else {
        current.expenses += Number(item.amount ?? 0);
      }

      monthlyTrendMap.set(month, current);
    }

    return {
      totalIncome,
      totalExpenses,
      netBalance,
      totalRecords,
      recentActivity: (recentActivity as ActivityItem[]).map((item) => ({
        id: item.id,
        amount: Number(item.amount),
        type: item.type,
        category: item.category,
        date: item.date,
        note: item.note,
        createdAt: item.createdAt,
      })),
      monthlyTrend: Array.from(monthlyTrendMap.values()),
      categoryWise: (categories as CategoryAggregationItem[]).map((item) => ({
        category: item.category,
        type: item.type,
        total: Number(item._sum.amount ?? 0),
      })),
    };
  },
};