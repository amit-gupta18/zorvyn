import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { Role } from "@prisma/client";
import { env } from "../../config/env";
import { ApiError } from "../../utils/apiError";
import { authRepository } from "./auth.repository";

function createToken(payload: { id: string; email: string; role: Role; status: string }) {
  return jwt.sign(
    { email: payload.email, role: payload.role, status: payload.status },
    env.JWT_SECRET,
    {
      subject: payload.id,
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    }
  );
}

export const authService = {
  async register(input: { email: string; password: string }) {
    const existingUser = await authRepository.findByEmail(input.email);

    if (existingUser) {
      throw new ApiError(409, "Email already in use");
    }

    const hashedPassword = await bcrypt.hash(input.password, env.BCRYPT_SALT_ROUNDS);

    const user = await authRepository.create({
      email: input.email,
      password: hashedPassword,
    });

    const token = createToken({
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    });

    return {
      user: authRepository.toPublicUser(user),
      token,
    };
  },

  async login(input: { email: string; password: string }) {
    const user = await authRepository.findByEmail(input.email);

    if (!user) {
      throw new ApiError(401, "Invalid credentials");
    }

    const passwordMatches = await bcrypt.compare(input.password, user.password);

    if (!passwordMatches) {
      throw new ApiError(401, "Invalid credentials");
    }

    if (user.status !== "ACTIVE") {
      throw new ApiError(403, "Account is inactive");
    }

    const token = createToken({
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    });

    return {
      user: authRepository.toPublicUser(user),
      token,
    };
  },

  async me(userId: string) {
    const user = await authRepository.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return authRepository.toPublicUser(user);
  },
};