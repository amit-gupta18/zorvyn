import type { Prisma, User } from "@prisma/client";
import prisma from "../../config/db";

export const authRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  create(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data });
  },

  toPublicUser(user: User) {
    const { password, ...safeUser } = user;
    return safeUser;
  },
};