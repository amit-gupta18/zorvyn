import bcrypt from "bcrypt";
import type { Role, Status } from "@prisma/client";
import { env } from "../../config/env";
import { ApiError } from "../../utils/apiError";
import { buildPaginationMeta, getPagination } from "../../utils/pagination";
import { userRepository } from "./user.repository";

function publicUser(user: {
  id: string;
  email: string;
  role: Role;
  status: Status;
  createdAt: Date;
}) {
  return user;
}

export const userService = {
  async createUser(input: { email: string; password: string; role?: Role; status?: Status }) {
    const existingUser = await userRepository.findByEmail(input.email);

    if (existingUser) {
      throw new ApiError(409, "Email already in use");
    }

    const password = await bcrypt.hash(input.password, env.BCRYPT_SALT_ROUNDS);

    const user = await userRepository.create({
      email: input.email,
      password,
      role: input.role,
      status: input.status,
    });

    return publicUser(user);
  },

  async getUser(id: string) {
    const user = await userRepository.findById(id);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return publicUser(user);
  },

  async listUsers(query: { page?: number; limit?: number; search?: string; role?: Role; status?: Status }) {
    const { page, limit, skip } = getPagination(query);

    const where = {
      ...(query.role ? { role: query.role } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            email: {
              contains: query.search,
              mode: "insensitive" as const,
            },
          }
        : {}),
    };

    const [users, total] = await Promise.all([
      userRepository.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }),
      userRepository.count(where),
    ]);

    return {
      items: users.map(publicUser),
      meta: buildPaginationMeta(total, page, limit),
    };
  },

  async updateUser(id: string, input: { email?: string; password?: string; role?: Role; status?: Status }) {
    const existingUser = await userRepository.findById(id);

    if (!existingUser) {
      throw new ApiError(404, "User not found");
    }

    const data: {
      email?: string;
      password?: string;
      role?: Role;
      status?: Status;
    } = {};

    if (input.email) {
      data.email = input.email;
    }

    if (input.password) {
      data.password = await bcrypt.hash(input.password, env.BCRYPT_SALT_ROUNDS);
    }

    if (input.role) {
      data.role = input.role;
    }

    if (input.status) {
      data.status = input.status;
    }

    const updatedUser = await userRepository.update(id, data);

    return publicUser(updatedUser);
  },

  async deleteUser(id: string) {
    const existingUser = await userRepository.findById(id);

    if (!existingUser) {
      throw new ApiError(404, "User not found");
    }

    await userRepository.delete(id);

    return { id };
  },
};