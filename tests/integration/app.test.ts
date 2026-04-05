import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

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

vi.mock("../../src/config/db", () => ({
  default: {
    user: {},
    record: {},
    $disconnect: vi.fn(),
  },
}));

vi.mock("../../src/modules/auth/auth.controller", () => ({
  authController: {
    register: async (_req: unknown, res: { json: (value: unknown) => void }) => res.json({ success: true }),
    login: async (_req: unknown, res: { json: (value: unknown) => void }) => res.json({ success: true }),
    me: async (_req: unknown, res: { json: (value: unknown) => void }) => res.json({ success: true }),
  },
}));

import app from "../../src/app";
import { clearRateLimitStore } from "../../src/middlewares/rateLimit.middleware";

describe("app integration", () => {
  beforeEach(() => {
    clearRateLimitStore();
  });

  it("returns health status", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it("returns 404 for unknown routes", async () => {
    const response = await request(app).get("/missing-route");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Route not found");
  });

  it("rate limits auth endpoints", async () => {
    const agent = request(app);

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const response = await agent.post("/api/v1/auth/login").send({ email: "user@example.com", password: "password123" });
      expect(response.status).not.toBe(429);
    }

    const blocked = await agent.post("/api/v1/auth/login").send({ email: "user@example.com", password: "password123" });

    expect(blocked.status).toBe(429);
    expect(blocked.body.message).toBe("Too many authentication attempts");
  });
});