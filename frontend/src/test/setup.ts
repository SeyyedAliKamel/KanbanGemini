import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Global fetch mock for component unit tests
global.fetch = vi.fn((url: string | URL | Request) => {
  const urlStr = url.toString();
  if (urlStr.includes("/api/auth/me")) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ authenticated: true, user: { username: "user" } }),
    } as Response);
  }
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ status: "ok" }),
  } as Response);
}) as unknown as typeof fetch;
