import type { RecordType, Role } from "@prisma/client";
import { ApiError } from "../../utils/apiError";
import { buildPaginationMeta, getPagination } from "../../utils/pagination";
import { recordRepository } from "./record.repository";

function buildWhere(input: {
  userId?: string;
  type?: RecordType;
  category?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  return {
    ...(input.userId ? { userId: input.userId } : {}),
    ...(input.type ? { type: input.type } : {}),
    ...(input.category
      ? {
          category: {
            contains: input.category,
            mode: "insensitive" as const,
          },
        }
      : {}),
    ...(input.startDate || input.endDate
      ? {
          date: {
            ...(input.startDate ? { gte: input.startDate } : {}),
            ...(input.endDate ? { lte: input.endDate } : {}),
          },
        }
      : {}),
  };
}

export const recordService = {
  async createRecord(input: { amount: number; type: RecordType; category: string; date: Date; note?: string | null; userId: string }) {
    const record = await recordRepository.create({
      amount: input.amount,
      type: input.type,
      category: input.category,
      date: input.date,
      note: input.note ?? undefined,
      user: {
        connect: { id: input.userId },
      },
    });

    return recordRepository.toPlain(record);
  },

  async getRecord(id: string, actor: { id: string; role: Role }) {
    const record = await recordRepository.findById(id);

    if (!record) {
      throw new ApiError(404, "Record not found");
    }

    if (actor.role !== "ADMIN" && record.userId !== actor.id) {
      throw new ApiError(403, "Forbidden");
    }

    return recordRepository.toPlain(record);
  },

  async listRecords(query: { page?: number; limit?: number; type?: RecordType; category?: string; startDate?: Date; endDate?: Date; userId?: string }) {
    const { page, limit, skip } = getPagination(query);
    const where = buildWhere(query);

    const [records, total] = await Promise.all([
      recordRepository.findMany({ where, skip, take: limit, orderBy: { date: "desc" } }),
      recordRepository.count(where),
    ]);

    return {
      items: records.map(recordRepository.toPlain),
      meta: buildPaginationMeta(total, page, limit),
    };
  },

  async updateRecord(id: string, actor: { id: string; role: Role }, input: Partial<{ amount: number; type: RecordType; category: string; date: Date; note?: string | null }>) {
    const existingRecord = await recordRepository.findById(id);

    if (!existingRecord) {
      throw new ApiError(404, "Record not found");
    }

    if (actor.role !== "ADMIN" && existingRecord.userId !== actor.id) {
      throw new ApiError(403, "Forbidden");
    }

    const updatedRecord = await recordRepository.update(id, {
      ...(input.amount !== undefined ? { amount: input.amount } : {}),
      ...(input.type ? { type: input.type } : {}),
      ...(input.category ? { category: input.category } : {}),
      ...(input.date ? { date: input.date } : {}),
      ...(input.note !== undefined ? { note: input.note } : {}),
    });

    return recordRepository.toPlain(updatedRecord);
  },

  async deleteRecord(id: string, actor: { id: string; role: Role }) {
    const existingRecord = await recordRepository.findById(id);

    if (!existingRecord) {
      throw new ApiError(404, "Record not found");
    }

    if (actor.role !== "ADMIN" && existingRecord.userId !== actor.id) {
      throw new ApiError(403, "Forbidden");
    }

    await recordRepository.delete(id);

    return { id };
  },
};