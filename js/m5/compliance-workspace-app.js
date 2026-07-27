/* GrowWithHR M5 browser-local workspace UI */
(function installWorkspaceApp(window, document) {
    "use strict";

    const model = window.GrowWithHRComplianceWorkspace;
    if (!model) return;

    const $ = (selector) => document.querySelector(selector);
    const taskList = $("#workspaceTaskList");
    const evidenceList = $("#workspaceEvidenceList");
    const calendarList = $("#workspaceCalendarList");
    const summary = $("#workspaceSummary");
    const notice = $("#workspaceNotice");
    let persistenceAvailable = true;
    let workspace = load();

    function load() {
        try {
            const stored = JSON.parse(window.localStorage.getItem(model.storageKey) || "null");
            if (model.validateWorkspace(stored)) return stored;
        } catch (_error) {
            persistenceAvailable = false;
        }
        return model.createWorkspace({ organisationName: "Your Organisation" });
    }

    function save() {
        try {
            window.localStorage.setItem(model.storageKey, JSON.stringify(workspace));
            persistenceAvailable = true;
            return true;
        } catch (_error) {
            persistenceAvailable = false;
            return false;
        }
    }

    function savedMessage(successText) {
        if (save()) {
            message(successText);
        } else {
            message("Changes are available for this session, but browser storage is unavailable. Export a backup before leaving this page.", true);
        }
    }

    function message(text, error = false) {
        notice.textContent = text;
        notice.dataset.state = error ? "error" : "ok";
    }

    function escape(value) {
        return String(value ?? "").replace(/[&<>"']/g, (character) => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
        })[character]);
    }

    function taskOptions(selected = "") {
        return `<option value="">No linked task</option>${workspace.tasks.map((task) =>
            `<option value="${escape(task.id)}" ${selected === task.id ? "selected" : ""}>${escape(task.title)}</option>`
        ).join("")}`;
    }

    function renderTasks() {
        taskList.innerHTML = workspace.tasks.length ? workspace.tasks.map((task) => `
            <article class="workspace-task" data-task-id="${escape(task.id)}">
                <div>
                    <h3>${escape(task.title)}</h3>
                    <p>${escape(task.description || "No description")}</p>
                    <small>Owner: ${escape(task.owner)} · Due: ${escape(task.dueDate || "Not set")} · Source: ${escape(task.dueDateSource)}</small>
                </div>
                <label>Status
                    <select data-task-status>
                        ${model.taskStatuses.map((status) => `<option value="${status}" ${task.status === status ? "selected" : ""}>${status.replaceAll("-", " ")}</option>`).join("")}
                    </select>
                </label>
            </article>`).join("") : "<p>No tasks yet. Add the first compliance action below.</p>";
    }

    function renderEvidence() {
        evidenceList.innerHTML = workspace.evidencePlaceholders.length ? workspace.evidencePlaceholders.map((entry) => {
            const task = workspace.tasks.find((item) => item.id === entry.taskId);
            return `<article class="workspace-record"><h3>${escape(entry.label)}</h3><p>${escape(entry.description || "No description")}</p><small>Linked task: ${escape(task?.title || "None")} · State: Placeholder only${entry.localFileName ? ` · Local filename: ${escape(entry.localFileName)}` : ""}</small></article>`;
        }).join("") : "<p>No evidence placeholders yet.</p>";
    }

    function renderCalendar() {
        calendarList.innerHTML = workspace.calendar.length ? [...workspace.calendar]
            .sort((left, right) => left.date.localeCompare(right.date))
            .map((entry) => {
                const task = workspace.tasks.find((item) => item.id === entry.taskId);
                return `<article class="workspace-record"><h3>${escape(entry.title)}</h3><p>${escape(entry.date)} · Source: ${escape(entry.source)}</p><small>Linked task: ${escape(task?.title || "None")}</small></article>`;
            }).join("") : "<p>No calendar entries yet.</p>";
    }

    function render() {
        const complete = workspace.tasks.filter((task) => task.status === "complete").length;
        summary.textContent = `${workspace.tasks.length} tasks · ${complete} complete · ${workspace.evidencePlaceholders.length} evidence placeholders · ${workspace.calendar.length} calendar entries`;
        renderTasks();
        renderEvidence();
        renderCalendar();
        $("#workspaceEvidenceTask").innerHTML = taskOptions();
        $("#workspaceCalendarTask").innerHTML = taskOptions();
    }

    $("#workspaceTaskForm").addEventListener("submit", (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        try {
            workspace = model.addTask(workspace, Object.fromEntries(data.entries()));
            event.currentTarget.reset();
            savedMessage("Task saved locally in this browser.");
            render();
        } catch (error) {
            message(error.message, true);
        }
    });

    $("#workspaceEvidenceForm").addEventListener("submit", (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        try {
            workspace = model.addEvidencePlaceholder(workspace, Object.fromEntries(data.entries()));
            event.currentTarget.reset();
            savedMessage("Evidence placeholder saved locally. No file was uploaded.");
            render();
        } catch (error) {
            message(error.message, true);
        }
    });

    $("#workspaceCalendarForm").addEventListener("submit", (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        try {
            workspace = model.addCalendarEntry(workspace, Object.fromEntries(data.entries()));
            event.currentTarget.reset();
            savedMessage("Calendar entry saved locally in this browser.");
            render();
        } catch (error) {
            message(error.message, true);
        }
    });

    taskList.addEventListener("change", (event) => {
        if (!event.target.matches("[data-task-status]")) return;
        try {
            workspace = model.updateTaskStatus(workspace, event.target.closest("[data-task-id]").dataset.taskId, event.target.value);
            savedMessage("Task status updated locally.");
            render();
        } catch (error) {
            message(error.message, true);
        }
    });

    $("#workspaceExport").addEventListener("click", () => {
        try {
            const blob = new Blob([model.exportWorkspace(workspace)], { type: "application/json" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "GrowWithHR-Compliance-Workspace.json";
            link.click();
            URL.revokeObjectURL(link.href);
            message("Local workspace backup exported.");
        } catch (error) {
            message(error.message, true);
        }
    });

    $("#workspaceImport").addEventListener("change", async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        try {
            const imported = model.importWorkspace(await file.text());
            workspace = imported;
            savedMessage("Workspace backup imported locally.");
            render();
        } catch (error) {
            message(error.message, true);
        } finally {
            event.target.value = "";
        }
    });

    $("#workspaceReset").addEventListener("click", () => {
        if (!window.confirm("Reset the browser-local workspace? This does not affect assessment or report data.")) return;
        workspace = model.createWorkspace({ organisationName: workspace.organisationName });
        savedMessage("Workspace reset. Assessment and report storage were not changed.");
        render();
    });

    render();
    if (!save()) {
        message("Browser storage is unavailable. The workspace will remain usable in memory; export a backup before leaving this page.", true);
    } else if (!persistenceAvailable) {
        message("A new local workspace was created because the previous browser record could not be read.", true);
    }
})(window, document);