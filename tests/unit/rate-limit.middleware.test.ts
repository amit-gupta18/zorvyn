import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { clearRateLimitStore, rateLimit } from "../../src/middlewares/rateLimit.middleware";

function buildRequest() {
  return {
    ip: "127.0.0.1",
    baseUrl: "/api/v1/auth",
    path: "/login",
  } as Request;
}

describe("rateLimit middleware", () => {
  beforeEach(() => {
    clearRateLimitStore();
    vi.useRealTimers();
  });

  it("allows requests until the limit is reached", () => {
    const middleware = rateLimit({ windowMs: 60_000, max: 2 });
    const req = buildRequest();
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    middleware(req, res, next);
    middleware(req, res, next);
    middleware(req, res, next);

    expect(next.mock.calls[0]?.[0]).toBeUndefined();
    expect(next.mock.calls[1]?.[0]).toBeUndefined();
    expect((next.mock.calls[2]?.[0] as Error).message).toBe("Too many requests");
  });

  it("resets after the window expires", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-05T00:00:00.000Z"));

    const middleware = rateLimit({ windowMs: 1_000, max: 1 });
    const req = buildRequest();
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    middleware(req, res, next);
    expect(next.mock.calls[0]?.[0]).toBeUndefined();

    vi.setSystemTime(new Date("2026-04-05T00:00:01.500Z"));
    middleware(req, res, next);

    expect(next.mock.calls[1]?.[0]).toBeUndefined();
  });
});