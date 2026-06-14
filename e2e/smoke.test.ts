import { test, expect } from "@playwright/test";

test("inventory page loads and renders the header and main panels", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "RPG Inventory System" })).toBeVisible();
  await expect(page.getByRole("main")).toBeVisible();
  await expect(page.getByText("Quartermaster")).toBeVisible();
});
