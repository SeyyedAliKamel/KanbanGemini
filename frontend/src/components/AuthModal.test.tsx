import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthModal } from "./AuthModal";

describe("AuthModal Unit Tests", () => {
  const onSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render when isOpen is false", () => {
    render(<AuthModal isOpen={false} language="en" onSuccess={onSuccess} />);
    expect(screen.queryByTestId("auth-modal")).not.toBeInTheDocument();
  });

  it("renders form elements when isOpen is true", () => {
    render(<AuthModal isOpen={true} language="en" onSuccess={onSuccess} />);
    expect(screen.getByTestId("auth-modal")).toBeInTheDocument();
    expect(screen.getByTestId("username-input")).toBeInTheDocument();
    expect(screen.getByTestId("password-input")).toBeInTheDocument();
    expect(screen.getByTestId("login-submit-btn")).toBeInTheDocument();
  });

  it("displays error message on invalid credentials", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ detail: "Invalid username or password" }),
    });

    render(<AuthModal isOpen={true} language="en" onSuccess={onSuccess} />);

    fireEvent.change(screen.getByTestId("username-input"), { target: { value: "wrong" } });
    fireEvent.change(screen.getByTestId("password-input"), { target: { value: "wrong" } });
    fireEvent.click(screen.getByTestId("login-submit-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("auth-error-msg")).toBeInTheDocument();
    });

    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("calls onSuccess on successful authentication", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ status: "ok", user: { username: "user" } }),
    });

    render(<AuthModal isOpen={true} language="en" onSuccess={onSuccess} />);

    fireEvent.change(screen.getByTestId("username-input"), { target: { value: "user" } });
    fireEvent.change(screen.getByTestId("password-input"), { target: { value: "password" } });
    fireEvent.click(screen.getByTestId("login-submit-btn"));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith("user");
    });
  });
});
