import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/config/env", () => ({
  env: {
    NODE_ENV: "test",
    PORT: 3000,
    DATABASE_URL: "postgresql://test",
    JWT_SECRET: "test-secret",
    JWT_EXPIRES_IN: "1d",
    BCRYPT_SALT_ROUNDS: 10,
  },
}));

vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn(async () => "hashed-password"),
    compare: vi.fn(async () => true),
  },
}));

const authRepositoryMock = vi.hoisted(() => ({
  findByEmail: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  toPublicUser: vi.fn((user) => ({
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
  })),
}));

vi.mock("../../src/modules/auth/auth.repository", () => ({
  authRepository: authRepositoryMock,
}));

import { authService } from "../../src/modules/auth/auth.service";

describe("auth service", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("rejects register when email already exists", async () => {
    authRepositoryMock.findByEmail.mockResolvedValue({
      id: "user_1",
      email: "admin@example.com",
      password: "hashed",
      role: "VIEWER",
      status: "ACTIVE",
      createdAt: new Date(),
    });

    await expect(
      authService.register({ email: "admin@example.com", password: "password123" })
    ).rejects.toMatchObject({ message: "Email already in use", statusCode: 409 });
  });

  it("rejects login for missing user", async () => {
    authRepositoryMock.findByEmail.mockResolvedValue(null);

    await expect(
      authService.login({ email: "missing@example.com", password: "password123" })
    ).rejects.toMatchObject({ message: "Invalid credentials", statusCode: 401 });
  });

  it("rejects login for inactive user", async () => {
    authRepositoryMock.findByEmail.mockResolvedValue({
      id: "user_3",
      email: "inactive@example.com",
      password: "hashed-password",
      role: "ANALYST",
      status: "INACTIVE",
      createdAt: new Date(),
    });

    await expect(
      authService.login({ email: "inactive@example.com", password: "password123" })
    ).rejects.toMatchObject({ message: "Account is inactive", statusCode: 403 });
  });

  it("rejects me when the user is missing", async () => {
    authRepositoryMock.findById.mockResolvedValue(null);

    await expect(authService.me("missing-user")).rejects.toMatchObject({ message: "User not found", statusCode: 404 });
  });

  it("registers a new user and returns a token", async () => {
    authRepositoryMock.findByEmail.mockResolvedValue(null);
    authRepositoryMock.create.mockResolvedValue({
      id: "user_1",
      email: "admin@example.com",
      password: "hashed",
      role: "VIEWER",
      status: "ACTIVE",
      createdAt: new Date("2026-04-05T00:00:00.000Z"),
    });

    const result = await authService.register({
      email: "admin@example.com",
      password: "password123",
    });

    expect(authRepositoryMock.create).toHaveBeenCalledOnce();
    expect(result.user.email).toBe("admin@example.com");
    expect(result.token).toBeTypeOf("string");
  });

  it("logs a user in with a valid password", async () => {
    authRepositoryMock.findByEmail.mockResolvedValue({
      id: "user_2",
      email: "analyst@example.com",
      password: "$2b$10$7N7O5rYJ4M1U6F8p3eQ5ZO7A4y2E3u4x8m1rVq8yP2p1Gz6W8w1y2",
      role: "ANALYST",
      status: "ACTIVE",
      createdAt: new Date("2026-04-05T00:00:00.000Z"),
    });

    const result = await authService.login({
      email: "analyst@example.com",
      password: "password123",
    });

    expect(result.user.email).toBe("analyst@example.com");
    expect(result.token).toBeTypeOf("string");
  });
});