import assert from "node:assert/strict";
import { createRequire } from "node:module";
import fs from "node:fs";

const require = createRequire(import.meta.url);
const model = require("../js/m5/compliance-workspace-model.js");

assert.equal(model.version, "0.20.0-rc2");
assert.equal(model.storageKey, "growwithhr-compliance-workspace-v1");
assert.ok(model.taskStatuses.includes("complete"));
assert.ok(model.dueDateSources.includes("not-confirmed"));

let workspace = model.createWorkspace({
    workspaceId: "workspace-test",
    organisationName: "Example Private Limited",
    sourceSnapshotId: "RPT-TEST",
    createdAt: "2026-07-27T00:00:00.000Z"
});

workspace = model.addTask(workspace, {
    id: "task-a1",
    title: "Confirm registration position",
    owner: "Founder",
    dueDate: "2026-08-10",
    dueDateSource: "internal-target",
    sourceReference: "Founder decision",
    createdAt: "2026-07-27T00:01:00.000Z"
});

assert.equal(workspace.tasks.length, 1);
assert.equal(workspace.tasks[0].status, "not-started");
assert.equal(workspace.tasks[0].dueDateSource, "internal-target");

workspace = model.updateTaskStatus(
    workspace,
    "task-a1",
    "in-progress",
    "Owner assigned.",
    "2026-07-27T00:02:00.000Z"
);
assert.equal(workspace.tasks[0].status, "in-progress");
assert.equal(workspace.tasks[0].statusHistory.length, 2);

workspace = model.addEvidencePlaceholder(workspace, {
    id: "evidence-a1",
    taskId: "task-a1",
    label: "Registration certificate",
    localFileName: "certificate.pdf",
    createdAt: "2026-07-27T00:03:00.000Z"
});
assert.equal(workspace.evidencePlaceholders[0].state, "placeholder-only");

workspace = model.addCalendarEntry(workspace, {
    id: "calendar-a1",
    taskId: "task-a1",
    title: "Review registration",
    date: "2026-08-10",
    source: "internal-target",
    createdAt: "2026-07-27T00:04:00.000Z"
});
assert.equal(workspace.calendar.length, 1);

const backup = model.exportWorkspace(workspace);
const restored = model.importWorkspace(backup);
assert.deepEqual(restored, workspace);
assert.equal(model.validateWorkspace(restored), true);
assert.throws(() => model.importWorkspace("{}"), /type is not supported/);
assert.throws(() => model.addTask(workspace, { title: "Bad", dueDateSource: "server" }), /Unsupported/);
assert.throws(() => model.addCalendarEntry(workspace, { title: "Bad", date: "2026-08-10", source: "server" }), /Unsupported/);

const malformed = JSON.parse(backup);
delete malformed.workspace.tasks[0].statusHistory;
assert.equal(model.validateWorkspace(malformed.workspace), false);
assert.throws(() => model.importWorkspace(JSON.stringify(malformed)), /supported schema/);

const malformedEvidence = JSON.parse(backup);
delete malformedEvidence.workspace.evidencePlaceholders[0].state;
assert.equal(model.validateWorkspace(malformedEvidence.workspace), false);

const malformedCalendar = JSON.parse(backup);
malformedCalendar.workspace.calendar[0].source = "unknown";
assert.equal(model.validateWorkspace(malformedCalendar.workspace), false);

const html = fs.readFileSync(new URL("../m5-compliance-workspace.html", import.meta.url), "utf8");
const app = fs.readFileSync(new URL("../js/m5/compliance-workspace-app.js", import.meta.url), "utf8");
assert.match(html, /noindex,nofollow/);
assert.match(html, /Nothing on this page is uploaded to a server/);
assert.match(html, /Export backup/);
assert.match(html, /Import backup/);
assert.match(html, /workspaceEvidenceForm/);
assert.match(html, /workspaceCalendarForm/);
assert.match(app, /addEvidencePlaceholder/);
assert.match(app, /addCalendarEntry/);
assert.match(app, /Browser storage is unavailable/);
assert.match(app, /window\.localStorage/);
assert.doesNotMatch(app, /\bfetch\s*\(/);
assert.doesNotMatch(app, /XMLHttpRequest|axios|sendBeacon/);

console.log("M5 compliance workspace contract checks passed.");