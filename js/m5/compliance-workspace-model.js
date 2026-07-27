/* GrowWithHR M5 browser-local compliance workspace model */
(function installComplianceWorkspaceModel(root) {
    "use strict";

    const VERSION = "0.20.0-rc1";
    const SCHEMA_VERSION = "1.0.0";
    const STORAGE_KEY = "growwithhr-compliance-workspace-v1";
    const TASK_STATUSES = Object.freeze([
        "not-started",
        "in-progress",
        "blocked",
        "complete"
    ]);
    const DUE_DATE_SOURCES = Object.freeze([
        "statutory",
        "official-guidance",
        "internal-target",
        "specialist-advice",
        "not-confirmed"
    ]);

    function clean(value, fallback = "") {
        return String(value ?? "").replace(/\s+/g, " ").trim() || fallback;
    }

    function nowIso(clock = Date) {
        return new clock().toISOString();
    }

    function identifier(prefix = "item") {
        const random = Math.random().toString(36).slice(2, 10);
        return `${prefix}-${Date.now().toString(36)}-${random}`;
    }

    function createWorkspace(options = {}) {
        const createdAt = clean(options.createdAt, nowIso());
        return {
            schemaVersion: SCHEMA_VERSION,
            workspaceVersion: VERSION,
            workspaceId: clean(options.workspaceId, identifier("workspace")),
            organisationName: clean(options.organisationName, "Your Organisation"),
            sourceSnapshotId: clean(options.sourceSnapshotId),
            createdAt,
            updatedAt: createdAt,
            tasks: [],
            evidencePlaceholders: [],
            calendar: [],
            audit: [{
                id: identifier("event"),
                type: "workspace-created",
                at: createdAt,
                note: "Browser-local compliance workspace created."
            }]
        };
    }

    function copy(workspace) {
        return JSON.parse(JSON.stringify(workspace));
    }

    function touch(workspace, type, note, at = nowIso()) {
        const next = copy(workspace);
        next.updatedAt = at;
        next.audit.push({ id: identifier("event"), type, at, note: clean(note) });
        return next;
    }

    function addTask(workspace, input = {}) {
        const title = clean(input.title);
        if (!title) throw new Error("Task title is required.");
        const source = clean(input.dueDateSource, "not-confirmed");
        if (!DUE_DATE_SOURCES.includes(source)) throw new Error("Unsupported due-date source.");
        const at = clean(input.createdAt, nowIso());
        const next = touch(workspace, "task-created", title, at);
        next.tasks.push({
            id: clean(input.id, identifier("task")),
            title,
            description: clean(input.description),
            owner: clean(input.owner, "Unassigned"),
            status: "not-started",
            dueDate: clean(input.dueDate),
            dueDateSource: source,
            sourceReference: clean(input.sourceReference),
            createdAt: at,
            updatedAt: at,
            statusHistory: [{ status: "not-started", at, note: "Task created." }]
        });
        return next;
    }

    function updateTaskStatus(workspace, taskId, status, note = "", at = nowIso()) {
        if (!TASK_STATUSES.includes(status)) throw new Error("Unsupported task status.");
        const next = touch(workspace, "task-status-changed", `${taskId}: ${status}`, at);
        const task = next.tasks.find((item) => item.id === taskId);
        if (!task) throw new Error("Task was not found.");
        task.status = status;
        task.updatedAt = at;
        task.statusHistory.push({ status, at, note: clean(note) });
        return next;
    }

    function addEvidencePlaceholder(workspace, input = {}) {
        const label = clean(input.label);
        if (!label) throw new Error("Evidence label is required.");
        const at = clean(input.createdAt, nowIso());
        const next = touch(workspace, "evidence-placeholder-created", label, at);
        next.evidencePlaceholders.push({
            id: clean(input.id, identifier("evidence")),
            taskId: clean(input.taskId),
            label,
            description: clean(input.description),
            state: "placeholder-only",
            localFileName: clean(input.localFileName),
            createdAt: at,
            updatedAt: at
        });
        return next;
    }

    function addCalendarEntry(workspace, input = {}) {
        const title = clean(input.title);
        const date = clean(input.date);
        if (!title || !date) throw new Error("Calendar title and date are required.");
        const at = clean(input.createdAt, nowIso());
        const next = touch(workspace, "calendar-entry-created", title, at);
        next.calendar.push({
            id: clean(input.id, identifier("calendar")),
            taskId: clean(input.taskId),
            title,
            date,
            source: clean(input.source, "internal-target"),
            createdAt: at
        });
        return next;
    }

    function validateWorkspace(value) {
        if (!value || typeof value !== "object" || Array.isArray(value)) return false;
        if (value.schemaVersion !== SCHEMA_VERSION) return false;
        if (!Array.isArray(value.tasks) || !Array.isArray(value.audit)) return false;
        if (!Array.isArray(value.evidencePlaceholders) || !Array.isArray(value.calendar)) return false;
        return value.tasks.every((task) =>
            clean(task.id) && clean(task.title) && TASK_STATUSES.includes(task.status) &&
            DUE_DATE_SOURCES.includes(task.dueDateSource)
        );
    }

    function exportWorkspace(workspace) {
        if (!validateWorkspace(workspace)) throw new Error("Workspace is not valid for export.");
        return JSON.stringify({
            exportType: "growwithhr-compliance-workspace",
            exportedAt: nowIso(),
            workspace: copy(workspace)
        }, null, 2);
    }

    function importWorkspace(serialised) {
        let payload;
        try {
            payload = typeof serialised === "string" ? JSON.parse(serialised) : serialised;
        } catch (_error) {
            throw new Error("Workspace backup is not valid JSON.");
        }
        if (payload?.exportType !== "growwithhr-compliance-workspace") {
            throw new Error("Workspace backup type is not supported.");
        }
        if (!validateWorkspace(payload.workspace)) {
            throw new Error("Workspace backup does not match the supported schema.");
        }
        return copy(payload.workspace);
    }

    const api = Object.freeze({
        version: VERSION,
        schemaVersion: SCHEMA_VERSION,
        storageKey: STORAGE_KEY,
        taskStatuses: TASK_STATUSES,
        dueDateSources: DUE_DATE_SOURCES,
        createWorkspace,
        addTask,
        updateTaskStatus,
        addEvidencePlaceholder,
        addCalendarEntry,
        validateWorkspace,
        exportWorkspace,
        importWorkspace
    });

    if (typeof module !== "undefined" && module.exports) module.exports = api;
    root.GrowWithHRComplianceWorkspace = api;
})(typeof window !== "undefined" ? window : globalThis);
