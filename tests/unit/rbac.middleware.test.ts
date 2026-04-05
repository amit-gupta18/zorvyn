import type { NextFunction, Request, Response } from "express";
import { Role } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { authorize } from "../../src/middlewares/rbac.middleware";

function createMocks(overrides: Partial<Request> = {}) {
  const req = {
    user: {
      id: "user_1",
      email: "viewer@example.com",
      role: Role.VIEWER,
      status: "ACTIVE",
    },
    ...overrides,
  } as Request;

  const res = {} as Response;
  const next = vi.fn() as NextFunction;

  return { req, res, next };
}

describe("authorize middleware", () => {
  it("allows matching roles", () => {
    const { req, res, next } = createMocks({
      user: {
        id: "user_1",
        email: "admin@example.com",
        role: Role.ADMIN,
        status: "ACTIVE",
      },
    });

    authorize([Role.ADMIN])(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it("rejects unauthorized roles", () => {
    const { req, res, next } = createMocks();

    authorize([Role.ADMIN])(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect((next.mock.calls[0]?.[0] as Error).message).toBe("Forbidden");
  });

  it("rejects inactive users", () => {
    const { req, res, next } = createMocks({
      user: {
        id: "user_1",
        email: "admin@example.com",
        role: Role.ADMIN,
        status: "INACTIVE",
      },
    });

    authorize([Role.ADMIN])(req, res, next);

    expect((next.mock.calls[0]?.[0] as Error).message).toBe("Account is inactive");
  });
});