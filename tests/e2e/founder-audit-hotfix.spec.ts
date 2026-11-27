import { expect, test } from "@playwright/test";
import fs from "node:fs";

test("organization answers and ownership survive tab reload and can be discarded", async ({ page }) => {
  await page.goto("/organization-intelligence.html");
  await page.locator("#companyName").fill("Fictional Audit Co");
  await page.locator("#email").fill("founder@example.invalid");
  await page.locator("#departments").fill("Engineering, Sales, Operations");
  await page.getByLabel("Ownership for Engineering").selectOption("clear-owner");
  await page.getByLabel("Ownership for Sales").selectOption("shared");
  await page.getByLabel("Ownership for Operations").selectOption("founder");
  await expect(page.locator("#orgDraftStatus")).toHaveText("Draft saved in this browser tab.");
  await page.reload();
  await expect(page.locator("#companyName")).toHaveValue("Fictional Audit Co");
  await expect(page.getByLabel("Ownership for Engineering")).toHaveValue("clear-owner");
  await expect(page.getByLabel("Ownership for Sales")).toHaveValue("shared");
  await expect(page.getByLabel("Ownership for Operations")).toHaveValue("founder");
  await page.locator("#discardOrgDraft").click();
  await expect(page.locator("#companyName")).toHaveValue("");
  await expect(page.getByLabel("Ownership for Engineering")).toHaveCount(0);
});

test("Acme web sample and PDF fixture have the same employee count", async ({ page }) => {
  await page.goto("/sample-advisory-report.html");
  const card = page.locator(".executive-metric-card").filter({ has: page.getByText("Employees", { exact: true }) });
  const displayed = Number(await card.locator(".metric-value").innerText());
  const script = fs.readFileSync("js/sample-advisory-pdf.js", "utf8");
  const count = Number(script.match(/employees:\s*(\d+)/)?.[1]);
  expect(displayed).toBe(42);
  expect(count).toBe(displayed);
});
