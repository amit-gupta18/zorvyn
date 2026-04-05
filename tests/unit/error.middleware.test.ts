import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { ZodError, z } from "zod";

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

import { errorMiddleware } from "../../src/middlewares/error.middleware";
import { ApiError } from "../../src/utils/apiError";

function makeResponse() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  } as unknown as Response;

  return res;
}

describe("error middleware", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns ApiError status and details", () => {
    const res = makeResponse();

    errorMiddleware(new ApiError(409, "Conflict", { field: "email" }), {} as Request, res, vi.fn() as NextFunction);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Conflict",
      details: { field: "email" },
    });
  });

  it("formats Zod validation errors", () => {
    const res = makeResponse();
    const schema = z.object({ email: z.string().email() });
    const result = schema.safeParse({ email: "invalid" });

    expect(result.success).toBe(false);

    errorMiddleware(result.error, {} as Request, res, vi.fn() as NextFunction);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Validation failed",
      })
    );
  });

  it("hides generic errors in production", async () => {
    const envModule = await import("../../src/config/env");
    const originalEnv = envModule.env.NODE_ENV;
    envModule.env.NODE_ENV = "production";

    const res = makeResponse();

    errorMiddleware(new Error("Detailed failure"), {} as Request, res, vi.fn() as NextFunction);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal server error",
    });

    envModule.env.NODE_ENV = originalEnv;
  });
});