import { z } from "zod";

export const userIdParamSchema = z.object({
  id: z.string().min(1),
});

export const userCreateSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["ADMIN", "ANALYST", "VIEWER"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const userUpdateSchema = userCreateSchema.partial().extend({
  password: z.string().min(8).optional(),
});

export const userListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  search: z.string().trim().optional(),
  role: z.enum(["ADMIN", "ANALYST", "VIEWER"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});