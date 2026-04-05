import { describe, expect, it, vi } from "vitest";

const updateMock = vi.hoisted(() => vi.fn());

vi.mock("../../src/config/db", () => ({
  default: {
    record: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      update: updateMock,
      aggregate: vi.fn(),
      groupBy: vi.fn(),
    },
  },
}));

import { recordRepository } from "../../src/modules/record/record.repository";

describe("record repository", () => {
  it("soft deletes records by setting deletedAt", async () => {
    await recordRepository.delete("record_1");

    expect(updateMock).toHaveBeenCalledWith({
      where: { id: "record_1" },
      data: { deletedAt: expect.any(Date) },
    });
  });
});