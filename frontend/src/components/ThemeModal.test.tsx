import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ThemeModal } from "./ThemeModal";
import { ThemeConfig } from "@/types/theme";

describe("ThemeModal Unit Tests", () => {
  const defaultConfig: ThemeConfig = {
    variant: "cyberpunk",
    mode: "dark",
  };

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <ThemeModal
        isOpen={false}
        themeConfig={defaultConfig}
        language="en"
        onUpdateTheme={vi.fn()}
        onClose={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders modal with all 4 themes and 2 modes", () => {
    render(
      <ThemeModal
        isOpen={true}
        themeConfig={defaultConfig}
        language="en"
        onUpdateTheme={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByTestId("theme-settings-modal")).toBeInTheDocument();
    expect(screen.getByTestId("theme-mode-dark-btn")).toBeInTheDocument();
    expect(screen.getByTestId("theme-mode-light-btn")).toBeInTheDocument();

    expect(screen.getByTestId("theme-variant-cyberpunk")).toBeInTheDocument();
    expect(screen.getByTestId("theme-variant-office")).toBeInTheDocument();
    expect(screen.getByTestId("theme-variant-cozy")).toBeInTheDocument();
    expect(screen.getByTestId("theme-variant-brutal")).toBeInTheDocument();
  });

  it("switches color mode to light mode", () => {
    const handleUpdate = vi.fn();
    render(
      <ThemeModal
        isOpen={true}
        themeConfig={defaultConfig}
        language="en"
        onUpdateTheme={handleUpdate}
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId("theme-mode-light-btn"));
    expect(handleUpdate).toHaveBeenCalledWith({
      variant: "cyberpunk",
      mode: "light",
    });
  });

  it("switches theme variant to office, cozy, and brutal", () => {
    const handleUpdate = vi.fn();
    render(
      <ThemeModal
        isOpen={true}
        themeConfig={defaultConfig}
        language="en"
        onUpdateTheme={handleUpdate}
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId("theme-variant-office"));
    expect(handleUpdate).toHaveBeenCalledWith({
      variant: "office",
      mode: "dark",
    });

    fireEvent.click(screen.getByTestId("theme-variant-cozy"));
    expect(handleUpdate).toHaveBeenCalledWith({
      variant: "cozy",
      mode: "dark",
    });

    fireEvent.click(screen.getByTestId("theme-variant-brutal"));
    expect(handleUpdate).toHaveBeenCalledWith({
      variant: "brutal",
      mode: "dark",
    });
  });

  it("calls onClose when close button or apply button is clicked", () => {
    const handleClose = vi.fn();
    render(
      <ThemeModal
        isOpen={true}
        themeConfig={defaultConfig}
        language="en"
        onUpdateTheme={vi.fn()}
        onClose={handleClose}
      />
    );

    fireEvent.click(screen.getByTestId("close-theme-settings-btn"));
    expect(handleClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId("theme-modal-apply-btn"));
    expect(handleClose).toHaveBeenCalledTimes(2);
  });
});
