import type { Prisma } from "@prisma/client";
import prisma from "../../config/db";

export const userRepository = {
  create(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data });
  },

  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  findMany(args: Prisma.UserFindManyArgs) {
    return prisma.user.findMany(args);
  },

  count(where: Prisma.UserWhereInput) {
    return prisma.user.count({ where });
  },

  update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.user.delete({ where: { id } });
  },
};