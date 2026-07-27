import { expect, test } from "@playwright/test";

const route = "/m5-compliance-workspace.html";
const workspaceKey = "growwithhr-compliance-workspace-v1";
const protectedKey = "growwithhr-report";

test.describe("M5 Compliance Workspace", () => {
    test("creates, persists and resets only browser-local workspace records", async ({ page }) => {
        await page.addInitScript(({ protectedStorageKey }) => {
            localStorage.setItem(protectedStorageKey, JSON.stringify({ protected: true }));
        }, { protectedStorageKey: protectedKey });

        await page.goto(route, { waitUntil: "domcontentloaded" });
        await expect(page.getByRole("heading", { name: "Compliance Workspace Beta" })).toBeVisible();
        await expect(page.locator("#workspaceSummary")).toContainText("0 tasks");

        await page.locator('#workspaceTaskForm input[name="title"]').fill("Confirm registration position");
        await page.locator('#workspaceTaskForm input[name="owner"]').fill("Founder");
        await page.locator('#workspaceTaskForm input[name="dueDate"]').fill("2026-08-10");
        await page.locator('#workspaceTaskForm select[name="dueDateSource"]').selectOption("internal-target");
        await page.getByRole("button", { name: "Save task locally" }).click();
        await expect(page.locator("#workspaceTaskList")).toContainText("Confirm registration position");

        await page.locator('#workspaceEvidenceForm input[name="label"]').fill("Registration certificate");
        await page.locator('#workspaceEvidenceForm input[name="localFileName"]').fill("certificate.pdf");
        await page.getByRole("button", { name: "Save evidence placeholder" }).click();
        await expect(page.locator("#workspaceEvidenceList")).toContainText("Registration certificate");

        await page.locator('#workspaceCalendarForm input[name="title"]').fill("Review registration");
        await page.locator('#workspaceCalendarForm input[name="date"]').fill("2026-08-10");
        await page.getByRole("button", { name: "Save calendar entry" }).click();
        await expect(page.locator("#workspaceCalendarList")).toContainText("Review registration");

        const saved = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || "null"), workspaceKey);
        expect(saved.tasks).toHaveLength(1);
        expect(saved.evidencePlaceholders).toHaveLength(1);
        expect(saved.calendar).toHaveLength(1);

        await page.reload({ waitUntil: "domcontentloaded" });
        await expect(page.locator("#workspaceTaskList")).toContainText("Confirm registration position");
        await expect(page.locator("#workspaceEvidenceList")).toContainText("Registration certificate");
        await expect(page.locator("#workspaceCalendarList")).toContainText("Review registration");

        page.on("dialog", (dialog) => dialog.accept());
        await page.getByRole("button", { name: "Reset workspace" }).click();
        await expect(page.locator("#workspaceSummary")).toContainText("0 tasks");
        const protectedRecord = await page.evaluate((key) => localStorage.getItem(key), protectedKey);
        expect(protectedRecord).toBe(JSON.stringify({ protected: true }));
    });

    test("remains usable in memory when localStorage writes are blocked", async ({ page }) => {
        await page.addInitScript(({ blockedKey }) => {
            const original = Storage.prototype.setItem;
            Storage.prototype.setItem = function setItem(key: string, value: string) {
                if (key === blockedKey) throw new DOMException("Blocked", "QuotaExceededError");
                return original.call(this, key, value);
            };
        }, { blockedKey: workspaceKey });

        await page.goto(route, { waitUntil: "domcontentloaded" });
        await expect(page.getByRole("heading", { name: "Compliance Workspace Beta" })).toBeVisible();
        await expect(page.locator("#workspaceNotice")).toContainText("Browser storage is unavailable");

        await page.locator('#workspaceTaskForm input[name="title"]').fill("Session-only task");
        await page.getByRole("button", { name: "Save task locally" }).click();
        await expect(page.locator("#workspaceTaskList")).toContainText("Session-only task");
        await expect(page.locator("#workspaceNotice")).toContainText("available for this session");
    });
});