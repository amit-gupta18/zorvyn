import type { Prisma } from "@prisma/client";
import prisma from "../../config/db";

export const dashboardRepository = {
  aggregate(where: Prisma.RecordWhereInput, type: "INCOME" | "EXPENSE") {
    return prisma.record.aggregate({
      where: {
        deletedAt: null,
        ...where,
        type,
      },
      _sum: { amount: true },
    });
  },

  categoryAggregation(where: Prisma.RecordWhereInput) {
    return prisma.record.groupBy({
      by: ["category", "type"],
      where: {
        deletedAt: null,
        ...where,
      },
      _sum: { amount: true },
      orderBy: { category: "asc" },
    });
  },

  count(where: Prisma.RecordWhereInput) {
    return prisma.record.count({
      where: {
        deletedAt: null,
        ...where,
      },
    });
  },

  recentActivity(where: Prisma.RecordWhereInput, take = 5) {
    return prisma.record.findMany({
      where: {
        deletedAt: null,
        ...where,
      },
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        amount: true,
        type: true,
        category: true,
        date: true,
        note: true,
        createdAt: true,
      },
    });
  },

  trendWindow(where: Prisma.RecordWhereInput, startDate: Date) {
    return prisma.record.findMany({
      where: {
        deletedAt: null,
        ...where,
        date: {
          gte: startDate,
        },
      },
      select: {
        amount: true,
        type: true,
        date: true,
      },
      orderBy: { date: "asc" },
    });
  },
};