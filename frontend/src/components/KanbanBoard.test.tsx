import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { KanbanBoard } from "./KanbanBoard";

describe("KanbanBoard Unit Tests", () => {
  it("renders exactly 5 initial columns and initial dummy cards", async () => {
    render(<KanbanBoard />);

    await waitFor(() => {
      expect(screen.getByTestId("kanban-board")).toBeInTheDocument();
    });

    const columns = [
      screen.getByTestId("column-col-1"),
      screen.getByTestId("column-col-2"),
      screen.getByTestId("column-col-3"),
      screen.getByTestId("column-col-4"),
      screen.getByTestId("column-col-5"),
    ];

    expect(columns.length).toBe(5);

    // Initial total cards count
    expect(screen.getByTestId("total-cards-count")).toHaveTextContent("10");

    // Check presence of initial cards
    expect(screen.getByText("Neural Interface Driver")).toBeInTheDocument();
    expect(screen.getByText("Core Kernel Patch v4.2")).toBeInTheDocument();
  });

  it("allows renaming a column and saving new title", async () => {
    render(<KanbanBoard />);

    await waitFor(() => {
      expect(screen.getByTestId("kanban-board")).toBeInTheDocument();
    });

    const editBtn = screen.getByTestId("edit-column-title-col-1");
    fireEvent.click(editBtn);

    const input = screen.getByTestId("column-title-input-col-1");
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "Triage & Backlog" } });

    const saveBtn = screen.getByTestId("save-column-title-col-1");
    fireEvent.click(saveBtn);

    expect(screen.getByTestId("column-title-col-1")).toHaveTextContent("Triage & Backlog");
  });

  it("cancels column renaming when cancel button is clicked", async () => {
    render(<KanbanBoard />);

    await waitFor(() => {
      expect(screen.getByTestId("kanban-board")).toBeInTheDocument();
    });

    const editBtn = screen.getByTestId("edit-column-title-col-2");
    fireEvent.click(editBtn);

    const input = screen.getByTestId("column-title-input-col-2");
    fireEvent.change(input, { target: { value: "Changed Name" } });

    const cancelBtn = screen.getByTestId("cancel-column-title-col-2");
    fireEvent.click(cancelBtn);

    expect(screen.getByTestId("column-title-col-2")).toHaveTextContent("Architecture & UI");
  });

  it("adds a new column when add column button is clicked", async () => {
    render(<KanbanBoard />);

    await waitFor(() => {
      expect(screen.getByTestId("kanban-board")).toBeInTheDocument();
    });

    const addColBtn = screen.getByTestId("add-column-button");
    fireEvent.click(addColBtn);

    await waitFor(() => {
      expect(screen.getByText("LANE 6")).toBeInTheDocument();
    });

    expect(screen.getByTestId("grid-lanes-count")).toHaveTextContent("6 LANES");
  });

  it("deletes a column when delete column button is clicked", async () => {
    render(<KanbanBoard />);

    await waitFor(() => {
      expect(screen.getByTestId("kanban-board")).toBeInTheDocument();
    });

    const deleteColBtn = screen.getByTestId("delete-column-col-5");
    fireEvent.click(deleteColBtn);

    await waitFor(() => {
      expect(screen.queryByTestId("column-col-5")).not.toBeInTheDocument();
    });

    expect(screen.getByTestId("grid-lanes-count")).toHaveTextContent("4 LANES");
  });

  it("opens grid calibration HUD and updates grid settings", async () => {
    render(<KanbanBoard />);

    await waitFor(() => {
      expect(screen.getByTestId("kanban-board")).toBeInTheDocument();
    });

    const gridHudBtn = screen.getByTestId("open-grid-settings-btn");
    fireEvent.click(gridHudBtn);

    expect(screen.getByTestId("grid-settings-modal")).toBeInTheDocument();

    // Toggle density to 72px
    const sizeBtn72 = screen.getByTestId("grid-size-btn-72");
    fireEvent.click(sizeBtn72);

    // Change color to magenta
    const colorBtnMagenta = screen.getByTestId("grid-color-btn-magenta");
    fireEvent.click(colorBtnMagenta);

    // Apply settings
    const applyBtn = screen.getByTestId("confirm-grid-settings-btn");
    fireEvent.click(applyBtn);

    await waitFor(() => {
      expect(screen.queryByTestId("grid-settings-modal")).not.toBeInTheDocument();
    });

    // Check status bar reflects updated grid setting
    expect(screen.getByText(/72PX MAGENTA/i)).toBeInTheDocument();
  });

  it("toggles columns per row to eliminate horizontal scroll", async () => {
    render(<KanbanBoard />);

    await waitFor(() => {
      expect(screen.getByTestId("kanban-board")).toBeInTheDocument();
    });

    const board = screen.getByTestId("kanban-board");
    // Initially scroll mode
    expect(board.className).toContain("flex items-start");

    // Click 3 columns per row button
    const btn3 = screen.getByTestId("layout-btn-3");
    fireEvent.click(btn3);

    // Board should now have CSS grid layout
    expect(board.className).toContain("grid");
    expect(board.className).toContain("lg:grid-cols-3");

    // Click Fit button
    const btnFit = screen.getByTestId("layout-btn-fit");
    fireEvent.click(btnFit);

    expect(board.className).toContain("grid-cols-[repeat(auto-fit,minmax(280px,1fr))]");
  });

  it("adds a new card to a column successfully", async () => {
    render(<KanbanBoard />);

    await waitFor(() => {
      expect(screen.getByTestId("kanban-board")).toBeInTheDocument();
    });

    const initialTotal = screen.getByTestId("total-cards-count").textContent;
    const initialColCount = screen.getByTestId("column-card-count-col-1").textContent;

    const addCardBtn = screen.getByTestId("add-card-button-col-1");
    fireEvent.click(addCardBtn);

    const titleInput = screen.getByTestId("new-card-title-input");
    const detailsInput = screen.getByTestId("new-card-details-input");
    const submitBtn = screen.getByTestId("submit-add-card-btn");

    fireEvent.change(titleInput, { target: { value: "Optic Mesh Firmware" } });
    fireEvent.change(detailsInput, { target: { value: "Compile binary payload." } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.queryByTestId("add-card-modal")).not.toBeInTheDocument();
    });

    expect(screen.getByText("Optic Mesh Firmware")).toBeInTheDocument();
    expect(screen.getByText("Compile binary payload.")).toBeInTheDocument();

    expect(Number(screen.getByTestId("total-cards-count").textContent)).toBe(
      Number(initialTotal) + 1
    );
    expect(Number(screen.getByTestId("column-card-count-col-1").textContent)).toBe(
      Number(initialColCount) + 1
    );
  });

  it("deletes a card when delete button is clicked", async () => {
    render(<KanbanBoard />);

    await waitFor(() => {
      expect(screen.getByTestId("kanban-board")).toBeInTheDocument();
    });

    expect(screen.getByText("Neural Interface Driver")).toBeInTheDocument();

    const deleteBtn = screen.getByTestId("delete-card-card-1");
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(screen.queryByText("Neural Interface Driver")).not.toBeInTheDocument();
    });

    expect(screen.getByTestId("total-cards-count")).toHaveTextContent("9");
    expect(screen.getByTestId("column-card-count-col-1")).toHaveTextContent("2");
  });
});
