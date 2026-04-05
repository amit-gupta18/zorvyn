import type { Prisma, Record } from "@prisma/client";
import prisma from "../../config/db";

export const recordRepository = {
  create(data: Prisma.RecordCreateInput) {
    return prisma.record.create({ data });
  },

  findById(id: string) {
    return prisma.record.findFirst({ where: { id, deletedAt: null } });
  },

  findMany(args: Prisma.RecordFindManyArgs) {
    return prisma.record.findMany({
      ...args,
      where: {
        deletedAt: null,
        ...(args.where ?? {}),
      },
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

  update(id: string, data: Prisma.RecordUpdateInput) {
    return prisma.record.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.record.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  aggregate(where: Prisma.RecordWhereInput) {
    return prisma.record.aggregate({
      where: {
        deletedAt: null,
        ...where,
      },
      _sum: { amount: true },
    });
  },

  categoryTotals(where: Prisma.RecordWhereInput) {
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

  recentActivity(where: Prisma.RecordWhereInput, take = 5) {
    return prisma.record.findMany({
      where: {
        deletedAt: null,
        ...where,
      },
      orderBy: { createdAt: "desc" },
      take,
    });
  },

  findTrendWindow(where: Prisma.RecordWhereInput, startDate: Date) {
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

  toPlain(record: Record) {
    return {
      ...record,
      amount: Number(record.amount),
    };
  },
};