import { describe, expect, it } from "vitest";
import { buildPaginationMeta, getPagination } from "../../src/utils/pagination";

describe("pagination utils", () => {
  it("normalizes page and limit values", () => {
    expect(getPagination({ page: "2", limit: "25" })).toEqual({
      page: 2,
      limit: 25,
      skip: 25,
    });
  });

  it("builds pagination metadata", () => {
    expect(buildPaginationMeta(51, 2, 25)).toEqual({
      page: 2,
      limit: 25,
      total: 51,
      totalPages: 3,
      hasNextPage: true,
      hasPrevPage: true,
    });
  });
});