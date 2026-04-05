import { z } from "zod";

export const authRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const authLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});