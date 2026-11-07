import { test, expect } from "@playwright/test";

test.describe("Cyberpunk Kanban Board E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("kanban-board")).toBeVisible();
  });

  test("loads board with exactly 5 columns and initial dummy cards", async ({ page }) => {
    const col1 = page.getByTestId("column-col-1");
    const col2 = page.getByTestId("column-col-2");
    const col3 = page.getByTestId("column-col-3");
    const col4 = page.getByTestId("column-col-4");
    const col5 = page.getByTestId("column-col-5");

    await expect(col1).toBeVisible();
    await expect(col2).toBeVisible();
    await expect(col3).toBeVisible();
    await expect(col4).toBeVisible();
    await expect(col5).toBeVisible();

    await expect(page.getByTestId("total-cards-count")).toHaveText("10");
    await expect(page.getByText("Neural Interface Driver")).toBeVisible();
    await expect(page.getByText("Core Kernel Patch v4.2")).toBeVisible();
  });

  test("allows renaming a column", async ({ page }) => {
    const colTitle = page.getByTestId("column-title-col-1");
    await expect(colTitle).toHaveText("System Backlog");

    await page.getByTestId("column-col-1").hover();
    await page.getByTestId("edit-column-title-col-1").click();

    const input = page.getByTestId("column-title-input-col-1");
    await expect(input).toBeVisible();

    await input.fill("Cyber Backlog");
    await page.getByTestId("save-column-title-col-1").click();

    await expect(colTitle).toHaveText("Cyber Backlog");
  });

  test("allows adding and deleting columns", async ({ page }) => {
    await expect(page.getByTestId("grid-lanes-count")).toHaveText("5 LANES");

    // Add new column
    await page.getByTestId("add-column-button").click();
    await expect(page.getByTestId("grid-lanes-count")).toHaveText("6 LANES");
    await expect(page.getByText("LANE 6")).toBeVisible();

    // Hover column 5 and delete it
    const col5 = page.getByTestId("column-col-5");
    await col5.hover();
    await page.getByTestId("delete-column-col-5").click();

    await expect(col5).not.toBeVisible();
    await expect(page.getByTestId("grid-lanes-count")).toHaveText("5 LANES");
  });

  test("customizes visual grid background via HUD", async ({ page }) => {
    await page.getByTestId("open-grid-settings-btn").click();
    const modal = page.getByTestId("grid-settings-modal");
    await expect(modal).toBeVisible();

    // Select 72px density
    await page.getByTestId("grid-size-btn-72").click();

    // Select Magenta tint
    await page.getByTestId("grid-color-btn-magenta").click();

    // Apply
    await page.getByTestId("confirm-grid-settings-btn").click();
    await expect(modal).not.toBeVisible();

    // Check status line
    await expect(page.getByText(/72PX MAGENTA/i)).toBeVisible();
  });

  test("customizes columns per row to eliminate horizontal scroll", async ({ page }) => {
    const board = page.getByTestId("kanban-board");
    await expect(board).toHaveClass(/flex items-start/);

    // Click 3 columns per row in quick switcher
    await page.getByTestId("layout-btn-3").click();
    await expect(board).toHaveClass(/grid/);
    await expect(board).toHaveClass(/lg:grid-cols-3/);

    // Switch to Fit mode
    await page.getByTestId("layout-btn-fit").click();
    await expect(board).toHaveClass(/grid-cols-\[repeat\(auto-fit,minmax\(280px,1fr\)\)\]/);

    // Switch back to Scroll mode
    await page.getByTestId("layout-btn-scroll").click();
    await expect(board).toHaveClass(/flex items-start/);
  });

  test("adds a new card to a column", async ({ page }) => {
    const initialTotalText = await page.getByTestId("total-cards-count").innerText();
    const initialTotal = parseInt(initialTotalText.trim(), 10);

    await page.getByTestId("add-card-button-col-1").click();
    const modal = page.getByTestId("add-card-modal");
    await expect(modal).toBeVisible();

    await page.getByTestId("new-card-title-input").fill("Neural Firewall v2");
    await page.getByTestId("new-card-details-input").fill("Deploy packet filtering rules.");

    await page.getByTestId("submit-add-card-btn").click();

    await expect(modal).not.toBeVisible();
    await expect(page.getByText("Neural Firewall v2")).toBeVisible();
    await expect(page.getByText("Deploy packet filtering rules.")).toBeVisible();

    await expect(page.getByTestId("total-cards-count")).toHaveText(String(initialTotal + 1));
  });

  test("deletes an existing card", async ({ page }) => {
    const cardToDelete = page.getByTestId("card-card-1");
    await expect(cardToDelete).toBeVisible();

    await page.getByTestId("delete-card-card-1").click();
    await expect(cardToDelete).not.toBeVisible();
    await expect(page.getByTestId("total-cards-count")).toHaveText("9");
  });

  test("drags and drops a card within or across columns", async ({ page }) => {
    const card1Handle = page.getByTestId("drag-handle-card-1");
    const targetCol = page.getByTestId("column-col-2");

    await expect(card1Handle).toBeVisible();
    await expect(targetCol).toBeVisible();

    const sourceBox = await card1Handle.boundingBox();
    const targetBox = await targetCol.boundingBox();

    expect(sourceBox).not.toBeNull();
    expect(targetBox).not.toBeNull();

    if (sourceBox && targetBox) {
      await page.mouse.move(
        sourceBox.x + sourceBox.width / 2,
        sourceBox.y + sourceBox.height / 2
      );
      await page.mouse.down();
      // Move 10px to trigger drag threshold
      await page.mouse.move(
        sourceBox.x + sourceBox.width / 2 + 10,
        sourceBox.y + sourceBox.height / 2 + 10,
        { steps: 5 }
      );
      await page.waitForTimeout(200);
      // Move to middle of target column
      await page.mouse.move(
        targetBox.x + targetBox.width / 2,
        targetBox.y + 150,
        { steps: 20 }
      );
      await page.waitForTimeout(300);
      await page.mouse.up();
    }

    const col2 = page.getByTestId("column-col-2");
    await expect(col2.getByText("Neural Interface Driver")).toBeVisible({ timeout: 5000 });
  });
});
