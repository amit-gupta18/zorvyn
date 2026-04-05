import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

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

const recordRepositoryMock = vi.hoisted(() => ({
  create: vi.fn(),
  findById: vi.fn(),
  findMany: vi.fn(),
  count: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  toPlain: vi.fn((record) => ({ ...record, amount: Number(record.amount) })),
}));

vi.mock("../../src/modules/record/record.repository", () => ({
  recordRepository: recordRepositoryMock,
}));

import { recordService } from "../../src/modules/record/record.service";

describe("record service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("creates a record with an optional note", async () => {
    recordRepositoryMock.create.mockResolvedValue({
      id: "record_1",
      amount: 100,
      type: "INCOME",
      category: "Sales",
      date: new Date("2026-04-01T00:00:00.000Z"),
      note: null,
      userId: "user_1",
      createdAt: new Date("2026-04-01T00:00:00.000Z"),
    });

    const result = await recordService.createRecord({
      amount: 100,
      type: "INCOME",
      category: "Sales",
      date: new Date("2026-04-01T00:00:00.000Z"),
      note: null,
      userId: "user_1",
    });

    expect(recordRepositoryMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        note: undefined,
      })
    );
    expect(result.amount).toBe(100);
  });

  it("blocks non-owner access to records", async () => {
    recordRepositoryMock.findById.mockResolvedValue({
      id: "record_1",
      amount: 100,
      type: "EXPENSE",
      category: "Ops",
      date: new Date(),
      note: null,
      userId: "owner_1",
      createdAt: new Date(),
    });

    await expect(
      recordService.getRecord("record_1", { id: "viewer_1", role: "VIEWER" })
    ).rejects.toMatchObject({ message: "Forbidden", statusCode: 403 });
  });

  it("returns 404 when updating a missing record", async () => {
    recordRepositoryMock.findById.mockResolvedValue(null);

    await expect(
      recordService.updateRecord("missing", { id: "user_1", role: "ADMIN" }, { category: "Ops" })
    ).rejects.toMatchObject({ message: "Record not found", statusCode: 404 });
  });

  it("lists records with filters and pagination", async () => {
    recordRepositoryMock.findMany.mockResolvedValue([
      {
        id: "record_1",
        amount: 100,
        type: "INCOME",
        category: "Sales",
        date: new Date(),
        note: null,
        userId: "user_1",
        createdAt: new Date(),
      },
    ]);
    recordRepositoryMock.count.mockResolvedValue(1);

    const result = await recordService.listRecords({
      page: 2,
      limit: 10,
      type: "INCOME",
      category: "Sales",
      startDate: new Date("2026-04-01T00:00:00.000Z"),
      endDate: new Date("2026-04-30T23:59:59.999Z"),
      userId: "user_1",
    });

    expect(recordRepositoryMock.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10,
        orderBy: { date: "desc" },
      })
    );
    expect(result.meta.page).toBe(2);
    expect(result.items).toHaveLength(1);
  });

  it("soft deletes records on remove", async () => {
    recordRepositoryMock.findById.mockResolvedValue({
      id: "record_1",
      amount: 100,
      type: "EXPENSE",
      category: "Ops",
      date: new Date(),
      note: null,
      userId: "user_1",
      createdAt: new Date(),
    });
    recordRepositoryMock.delete.mockResolvedValue({ id: "record_1" });

    const result = await recordService.deleteRecord("record_1", { id: "user_1", role: "ANALYST" });

    expect(recordRepositoryMock.delete).toHaveBeenCalledWith("record_1");
    expect(result).toEqual({ id: "record_1" });
  });
});