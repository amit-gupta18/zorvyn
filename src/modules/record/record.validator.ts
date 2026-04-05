import { z } from "zod";

export const recordIdParamSchema = z.object({
  id: z.string().min(1),
});

export const recordCreateSchema = z.object({
  amount: z.coerce.number().positive(),
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.string().min(1),
  date: z.coerce.date(),
  note: z.string().max(500).optional().nullable(),
  userId: z.string().min(1),
});

export const recordUpdateSchema = recordCreateSchema.partial();

export const recordListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
  category: z.string().trim().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});