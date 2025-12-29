import {
  normalizeBoolean,
  normalizeLimit,
  normalizePage,
  normalizePaginatedResponse,
  normalizeSortOrder,
  toQueryString,
} from "./pagination";

describe("pagination utils", () => {
  test("toQueryString skips empty values", () => {
    expect(
      toQueryString({
        page: 2,
        search: "",
        limit: null,
        sortBy: "createdAt",
        sortOrder: "desc",
      })
    ).toBe("?page=2&sortBy=createdAt&sortOrder=desc");
  });

  test("normalizePage/normalizeLimit clamp and floor", () => {
    expect(normalizePage("3.9", 1)).toBe(3);
    expect(normalizePage("-1", 1)).toBe(1);
    expect(normalizeLimit("20.1", 10)).toBe(20);
    expect(normalizeLimit(0, 10)).toBe(10);
  });

  test("normalizeBoolean supports string values", () => {
    expect(normalizeBoolean("true")).toBe(true);
    expect(normalizeBoolean("false")).toBe(false);
    expect(normalizeBoolean("nope")).toBeUndefined();
  });

  test("normalizeSortOrder accepts only asc/desc", () => {
    expect(normalizeSortOrder("ASC", "desc")).toBe("asc");
    expect(normalizeSortOrder("nope", "desc")).toBe("desc");
  });

  test("normalizePaginatedResponse supports common shapes", () => {
    const paginated = normalizePaginatedResponse<{ id: number }>(
      {
        items: [{ id: 1 }, { id: 2 }],
        meta: { totalItems: 10, currentPage: 3, itemsPerPage: 2 },
      },
      1,
      10
    );

    expect(paginated.items).toHaveLength(2);
    expect(paginated.total).toBe(10);
    expect(paginated.page).toBe(3);
    expect(paginated.limit).toBe(2);
  });
});

