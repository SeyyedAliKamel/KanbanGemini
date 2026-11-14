import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";
import { INITIAL_COLUMNS } from "@/data/initialData";

// Global fetch mock for component unit tests
global.fetch = vi.fn((url: string | URL | Request, init?: RequestInit) => {
  const urlStr = url.toString();
  if (urlStr.includes("/api/auth/me")) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ authenticated: true, user: { username: "user" } }),
    } as Response);
  }
  if (urlStr.includes("/api/board") && !urlStr.includes("/columns") && !urlStr.includes("/cards")) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ id: "brd-test", title: "Test Board", columns: INITIAL_COLUMNS }),
    } as Response);
  }

  let bodyData: any = {};
  try {
    if (init?.body && typeof init.body === "string") {
      bodyData = JSON.parse(init.body);
    }
  } catch {
    // Ignore JSON parse errors
  }

  if (urlStr.includes("/api/board/cards")) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          id: `card-${Date.now()}`,
          title: bodyData.title || "Card",
          details: bodyData.details || "",
          column_id: bodyData.column_id || "col-1",
          position: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
    } as Response);
  }

  if (urlStr.includes("/api/board/columns")) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          id: `col-${Date.now()}`,
          title: bodyData.title || "Column",
          position: 5,
          cards: [],
        }),
    } as Response);
  }

  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ status: "ok" }),
  } as Response);
}) as unknown as typeof fetch;
