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

test("organization assessment rejects .con and permits correcting the address", async ({ page }) => {
  await page.goto("/organization-intelligence.html");
  await page.locator("#companyName").fill("Fictional Audit Co");
  await page.locator("#email").fill("founder@example.con");
  await page.locator("#industry").fill("Technology");
  await page.locator("#employees").fill("48");
  await page.locator("#organizationForm button[type=submit]").click();
  await expect(page.locator("#email")).toHaveJSProperty("validationMessage", "Enter a valid work email address. Check the spelling of the domain (for example, .com rather than .con).");
  await page.locator("#email").fill("founder@example.com");
  await expect(page.locator("#email")).toHaveJSProperty("validationMessage", "");
});

test("shared email validation rejects common mistakes without blocking corporate domains", async ({ page }) => {
  await page.goto("/organization-intelligence.html");
  const results=await page.evaluate(() => {
    const validate=(window as any).GrowWithHREmailValidation.isValidEmail;
    return ["founder@company.con","founder@company..com","bad@@company.com","founder@company.com","founder+qa@company.co.in","founder@company.tech"].map(validate);
  });
  expect(results).toEqual([false,false,false,true,true,true]);
});

test("organization sample provides editable Mermaid source and a downloadable .mmd", async ({ page }) => {
  await page.goto("/organization-structure-report.html?sample=1");
  const source=page.locator("#orgMermaidSource");
  await expect(source).toBeVisible();
  await expect(source).toHaveValue(/flowchart TD[\s\S]*Founder \/ CEO[\s\S]*Engineering/);
  await source.fill('flowchart TD\nCEO["CEO"] --> A["New function"]');
  const download=page.waitForEvent("download");
  await page.getByRole("button",{name:"Download .mmd"}).click();
  expect((await download).suggestedFilename()).toMatch(/\.mmd$/);
  await page.getByRole("button",{name:"Reset proposal"}).click();
  await expect(source).toHaveValue(/Engineering/);
});

test("shared logo stays bounded during desktop and mobile navigation", async ({ page }) => {
  await page.addInitScript(() => {
    const samples: number[] = [];
    (window as any).__logoWidths = samples;
    function sample() {
      const image = document.querySelector(".site-brand-logo img");
      if (image) samples.push(image.getBoundingClientRect().width);
      requestAnimationFrame(sample);
    }
    requestAnimationFrame(sample);
  });
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/index.html");
    await expect(page.locator(".site-brand-logo img")).toBeVisible();
    await page.locator(".site-brand-logo").hover();
    await expect(page.locator(".site-brand-logo")).toHaveCSS("transform", "none");
    if (width < 900) await page.getByRole("button", { name: "Open navigation" }).click();
    await page.locator('a[data-nav-key="sample"]').click();
    await expect(page).toHaveURL(/sample-reports\.html/);
    const image = page.locator(".site-brand-logo img");
    await expect(image).toBeVisible();
    await expect(image).toHaveAttribute("width", "82");
    await expect(image).toHaveAttribute("height", "82");
    await page.waitForFunction(() => (window as any).__logoWidths.length > 2);
    const peak = await page.evaluate(() => Math.max(...(window as any).__logoWidths));
    expect(peak).toBeLessThanOrEqual(83);
    const stylesheet = await page.locator('link[rel="stylesheet"][href*="styles.css"]').first().getAttribute("href");
    expect(stylesheet).not.toContain("20260915-application-audit");
  }
});

test("incomplete organization report requires acknowledgment without losing answers", async ({ page }) => {
  await page.goto("/organization-intelligence.html");
  await page.locator("#companyName").fill("Fictional Audit Co");
  await page.locator("#email").fill("founder@example.com");
  await page.locator("#industry").fill("Technology");
  await page.locator("#employees").fill("48");
  await page.locator("#organizationForm button[type=submit]").click();
  const dialog=page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("Your report will be incomplete");
  await expect(dialog).toContainText("People managers");
  await dialog.getByRole("button",{name:"Return to assessment"}).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.locator("#companyName")).toHaveValue("Fictional Audit Co");
  await expect(page.locator("#organizationForm button[type=submit]")).toBeEnabled();
});

test("completeness distinguishes zero and explicit no from unknown inputs", async ({ page }) => {
  await page.goto("/organization-intelligence.html");
  const result=await page.evaluate(()=>{
    const api=(window as any).GrowWithHRCompleteness;
    return [0,false,"none","dont-know","",null].map(api.unknown);
  });
  expect(result).toEqual([false,false,false,true,true,true]);
});
