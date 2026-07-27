/* GrowWithHR M5 browser-local workspace UI */
(function installWorkspaceApp(window, document) {
    "use strict";

    const model = window.GrowWithHRComplianceWorkspace;
    if (!model) return;

    const $ = (selector) => document.querySelector(selector);
    const list = $("#workspaceTaskList");
    const summary = $("#workspaceSummary");
    const notice = $("#workspaceNotice");
    let workspace = load();

    function load() {
        try {
            const stored = JSON.parse(window.localStorage.getItem(model.storageKey) || "null");
            if (model.validateWorkspace(stored)) return stored;
        } catch (_error) {}
        return model.createWorkspace({ organisationName: "Your Organisation" });
    }

    function save() {
        window.localStorage.setItem(model.storageKey, JSON.stringify(workspace));
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

    function render() {
        const complete = workspace.tasks.filter((task) => task.status === "complete").length;
        summary.textContent = `${workspace.tasks.length} tasks · ${complete} complete · ${workspace.evidencePlaceholders.length} evidence placeholders`;
        list.innerHTML = workspace.tasks.length ? workspace.tasks.map((task) => `
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

    $("#workspaceTaskForm").addEventListener("submit", (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        try {
            workspace = model.addTask(workspace, Object.fromEntries(data.entries()));
            save();
            event.currentTarget.reset();
            message("Task saved locally in this browser.");
            render();
        } catch (error) {
            message(error.message, true);
        }
    });

    list.addEventListener("change", (event) => {
        if (!event.target.matches("[data-task-status]")) return;
        try {
            workspace = model.updateTaskStatus(workspace, event.target.closest("[data-task-id]").dataset.taskId, event.target.value);
            save();
            message("Task status updated locally.");
            render();
        } catch (error) {
            message(error.message, true);
        }
    });

    $("#workspaceExport").addEventListener("click", () => {
        const blob = new Blob([model.exportWorkspace(workspace)], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "GrowWithHR-Compliance-Workspace.json";
        link.click();
        URL.revokeObjectURL(link.href);
        message("Local workspace backup exported.");
    });

    $("#workspaceImport").addEventListener("change", async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        try {
            workspace = model.importWorkspace(await file.text());
            save();
            message("Workspace backup imported locally.");
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
        save();
        message("Workspace reset. Assessment and report storage were not changed.");
        render();
    });

    save();
    render();
})(window, document);
