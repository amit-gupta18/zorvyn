import { describe, expect, it } from "vitest";
import { authLoginSchema, authRegisterSchema } from "../../src/modules/auth/auth.validator";
import { recordCreateSchema } from "../../src/modules/record/record.validator";
import { userCreateSchema } from "../../src/modules/user/user.validator";

describe("module validators", () => {
  it("accepts a valid auth registration payload", () => {
    expect(authRegisterSchema.safeParse({ email: "test@example.com", password: "password123" }).success).toBe(true);
  });

  it("rejects an invalid auth login payload", () => {
    expect(authLoginSchema.safeParse({ email: "not-an-email", password: "" }).success).toBe(false);
  });

  it("validates user creation payloads", () => {
    expect(userCreateSchema.safeParse({ email: "admin@example.com", password: "password123", role: "ADMIN" }).success).toBe(true);
  });

  it("validates record creation payloads", () => {
    expect(
      recordCreateSchema.safeParse({
        amount: 2500,
        type: "INCOME",
        category: "Sales",
        date: new Date().toISOString(),
        note: "Monthly sales",
        userId: "user_1",
      }).success
    ).toBe(true);
  });
});