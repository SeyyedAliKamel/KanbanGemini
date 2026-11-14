import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AIChatSidebar } from "./AIChatSidebar";

describe("AIChatSidebar Unit Tests", () => {
  it("does not render when isOpen is false", () => {
    const { container } = render(
      <AIChatSidebar
        isOpen={false}
        onClose={vi.fn()}
        language="en"
        onBoardUpdate={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders correctly when isOpen is true", () => {
    render(
      <AIChatSidebar
        isOpen={true}
        onClose={vi.fn()}
        language="en"
        onBoardUpdate={vi.fn()}
      />
    );

    expect(screen.getByTestId("ai-chat-sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("ai-sidebar-title")).toHaveTextContent("AI ASSISTANT");
    expect(screen.getByTestId("ai-input")).toBeInTheDocument();
    expect(screen.getByTestId("ai-send-btn")).toBeInTheDocument();
  });

  it("sends message and displays assistant response", async () => {
    const mockOnBoardUpdate = vi.fn();
    render(
      <AIChatSidebar
        isOpen={true}
        onClose={vi.fn()}
        language="en"
        onBoardUpdate={mockOnBoardUpdate}
      />
    );

    const input = screen.getByTestId("ai-input");
    fireEvent.change(input, { target: { value: "Hello assistant" } });

    const sendBtn = screen.getByTestId("ai-send-btn");
    fireEvent.click(sendBtn);

    // User message should appear immediately
    expect(screen.getByText("Hello assistant")).toBeInTheDocument();

    // Assistant response should appear after mock resolves
    await waitFor(() => {
      expect(screen.getByText("AI Assistant mock response.")).toBeInTheDocument();
    });
  });

  it("triggers prompt when quick action pill is clicked", async () => {
    render(
      <AIChatSidebar
        isOpen={true}
        onClose={vi.fn()}
        language="en"
        onBoardUpdate={vi.fn()}
      />
    );

    const quickPill = screen.getByTestId("quick-prompt-0");
    fireEvent.click(quickPill);

    await waitFor(() => {
      expect(screen.getByText("AI Assistant mock response.")).toBeInTheDocument();
    });
  });

  it("renders actions applied badge and calls onBoardUpdate when actions applied", async () => {
    const mockOnBoardUpdate = vi.fn();
    render(
      <AIChatSidebar
        isOpen={true}
        onClose={vi.fn()}
        language="en"
        onBoardUpdate={mockOnBoardUpdate}
      />
    );

    const input = screen.getByTestId("ai-input");
    fireEvent.change(input, { target: { value: "Please add a task" } });
    fireEvent.click(screen.getByTestId("ai-send-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("ai-actions-badge")).toBeInTheDocument();
    });

    expect(mockOnBoardUpdate).toHaveBeenCalled();
  });

  it("handles error response gracefully", async () => {
    // Override global fetch for this test
    const originalFetch = global.fetch;
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ detail: "AI Server Overloaded" }),
      } as Response)
    );

    render(
      <AIChatSidebar
        isOpen={true}
        onClose={vi.fn()}
        language="en"
        onBoardUpdate={vi.fn()}
      />
    );

    const input = screen.getByTestId("ai-input");
    fireEvent.change(input, { target: { value: "Fail this request" } });
    fireEvent.click(screen.getByTestId("ai-send-btn"));

    await waitFor(() => {
      expect(screen.getByText("AI Server Overloaded")).toBeInTheDocument();
    });

    global.fetch = originalFetch;
  });

  it("clears chat history when reset button is clicked", async () => {
    render(
      <AIChatSidebar
        isOpen={true}
        onClose={vi.fn()}
        language="en"
        onBoardUpdate={vi.fn()}
      />
    );

    const input = screen.getByTestId("ai-input");
    fireEvent.change(input, { target: { value: "Hello" } });
    fireEvent.click(screen.getByTestId("ai-send-btn"));

    await waitFor(() => {
      expect(screen.getByText("Hello")).toBeInTheDocument();
    });

    const clearBtn = screen.getByTestId("ai-clear-chat");
    fireEvent.click(clearBtn);

    expect(screen.queryByText("Hello")).not.toBeInTheDocument();
  });
});
