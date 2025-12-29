export type SortOrder = "asc" | "desc";

export type Paginated<TItem> = {
  items: TItem[];
  total: number;
  page: number;
  limit: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readNumber(record: Record<string, unknown>, key: string): number | undefined {
  const value = record[key];
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function readString(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key];
  return typeof value === "string" ? value : undefined;
}

function extractItems<TItem>(data: Record<string, unknown>): TItem[] | null {
  const items = data.items;
  if (Array.isArray(items)) return items as TItem[];

  const nestedData = data.data;
  if (Array.isArray(nestedData)) return nestedData as TItem[];

  const results = data.results;
  if (Array.isArray(results)) return results as TItem[];

  return null;
}

function extractTotal(data: Record<string, unknown>, fallback: number): number {
  const direct = readNumber(data, "total") ?? readNumber(data, "count");
  if (typeof direct === "number") return direct;

  const meta = data.meta;
  if (isRecord(meta)) {
    return (
      readNumber(meta, "totalItems") ??
      readNumber(meta, "total") ??
      readNumber(meta, "itemCount") ??
      fallback
    );
  }

  const pagination = data.pagination;
  if (isRecord(pagination)) {
    return readNumber(pagination, "total") ?? readNumber(pagination, "totalItems") ?? fallback;
  }

  return fallback;
}

function extractPage(data: Record<string, unknown>, fallback: number): number {
  const direct = readNumber(data, "page") ?? readNumber(data, "currentPage");
  if (typeof direct === "number") return direct;

  const meta = data.meta;
  if (isRecord(meta)) {
    return readNumber(meta, "currentPage") ?? fallback;
  }

  return fallback;
}

function extractLimit(data: Record<string, unknown>, fallback: number): number {
  const direct = readNumber(data, "limit") ?? readNumber(data, "perPage");
  if (typeof direct === "number") return direct;

  const meta = data.meta;
  if (isRecord(meta)) {
    return readNumber(meta, "itemsPerPage") ?? fallback;
  }

  return fallback;
}

export function toQueryString(params: Record<string, unknown>): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (typeof value === "string" && value.trim() === "") continue;

    search.set(key, String(value));
  }

  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export function normalizePaginatedResponse<TItem>(
  raw: unknown,
  fallbackPage: number,
  fallbackLimit: number
): Paginated<TItem> {
  if (Array.isArray(raw)) {
    return { items: raw as TItem[], total: raw.length, page: fallbackPage, limit: fallbackLimit };
  }

  if (!isRecord(raw)) {
    return { items: [], total: 0, page: fallbackPage, limit: fallbackLimit };
  }

  const items = extractItems<TItem>(raw);
  if (!items) {
    return { items: [], total: 0, page: fallbackPage, limit: fallbackLimit };
  }

  return {
    items,
    total: extractTotal(raw, items.length),
    page: extractPage(raw, fallbackPage),
    limit: extractLimit(raw, fallbackLimit),
  };
}

export function normalizeSortOrder(value: unknown, fallback: SortOrder): SortOrder {
  const v = typeof value === "string" ? value.toLowerCase() : "";
  if (v === "asc" || v === "desc") return v;
  return fallback;
}

export function normalizeSortField(value: unknown, fallback: string): string {
  const v = typeof value === "string" ? value.trim() : "";
  return v ? v : fallback;
}

export function normalizeSearch(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function normalizeBoolean(
  value: unknown
): boolean | undefined {
  if (value === true || value === false) return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

export function normalizeNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

export function normalizePage(value: unknown, fallback = 1): number {
  const n = normalizeNumber(value);
  return typeof n === "number" && n > 0 ? Math.floor(n) : fallback;
}

export function normalizeLimit(value: unknown, fallback = 10): number {
  const n = normalizeNumber(value);
  return typeof n === "number" && n > 0 ? Math.floor(n) : fallback;
}

export function ensureIsoString(value: Date | string | null | undefined): string | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value.toISOString();
  const str = String(value).trim();
  return str ? str : undefined;
}

export function tryParseDate(value: unknown): Date | null {
  if (!value) return null;
  const str = typeof value === "string" ? value : "";
  if (!str) return null;
  const date = new Date(str);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function normalizeApiError(error: unknown): string {
  if (!isRecord(error)) return "Неизвестная ошибка";

  const maybeResponse = error.response;
  if (!isRecord(maybeResponse)) return "Неизвестная ошибка";

  const data = maybeResponse.data;
  if (typeof data === "string") return data;
  if (!isRecord(data)) return "Ошибка запроса";

  const message = data.message;
  if (typeof message === "string") return message;
  if (Array.isArray(message)) return message.filter((x) => typeof x === "string").join(", ");

  return readString(data, "error") ?? "Ошибка запроса";
}

