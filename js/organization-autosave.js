const FORM_ID = "organizationForm";
const SESSION_KEY = "growwithhr.workspace";
const DRAFT_PREFIX = "growwithhr.organization.draft.v1";
const SAVE_DELAY_MS = 500;

function readWorkspace() {
    try {
        return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
    } catch (_error) {
        return null;
    }
}

function draftKey() {
    const workspace = readWorkspace();
    return workspace?.reportId ? `${DRAFT_PREFIX}:${workspace.reportId}` : `${DRAFT_PREFIX}:local`;
}

function editableFields(form) {
    return Array.from(form.querySelectorAll("input[id], select[id], textarea[id]")).filter((field) => {
        const type = String(field.getAttribute("type") || "").toLowerCase();
        return !["button", "submit", "reset", "hidden", "file"].includes(type);
    });
}

function readDraft(key) {
    try {
        const parsed = JSON.parse(localStorage.getItem(key) || "null");
        return parsed?.version === 1 && parsed.values && typeof parsed.values === "object" ? parsed : null;
    } catch (_error) {
        return null;
    }
}

function writeDraft(key, fields) {
    const values = {};
    fields.forEach((field) => {
        values[field.id] = field.value;
    });
    const savedAt = new Date().toISOString();
    localStorage.setItem(key, JSON.stringify({ version: 1, savedAt, values }));
    return savedAt;
}

function formatSavedTime(savedAt) {
    try {
        return new Date(savedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch (_error) {
        return "just now";
    }
}

function createStatus(form) {
    let status = document.getElementById("organizationAutosaveStatus");
    if (status) return status;

    status = document.createElement("p");
    status.id = "organizationAutosaveStatus";
    status.className = "org-subtle";
    status.setAttribute("aria-live", "polite");
    status.textContent = "Progress is saved automatically in this browser.";

    const intro = form.querySelector(".org-subtle");
    if (intro?.parentNode) intro.insertAdjacentElement("afterend", status);
    else form.prepend(status);
    return status;
}

function restoreDraft(fields, draft) {
    if (!draft) return false;
    let restored = false;
    fields.forEach((field) => {
        if (!Object.prototype.hasOwnProperty.call(draft.values, field.id)) return;
        const value = draft.values[field.id];
        if (value === undefined || value === null) return;
        field.value = String(value);
        restored = true;
    });
    return restored;
}

function waitUntilWorkspacePrefillFinishes(callback, attempts = 0) {
    const notice = document.getElementById("reuseNotice");
    const isRecovering = /recovering/i.test(notice?.textContent || "");
    if (!isRecovering || attempts >= 40) {
        callback();
        return;
    }
    window.setTimeout(() => waitUntilWorkspacePrefillFinishes(callback, attempts + 1), 250);
}

function initAutosave() {
    const form = document.getElementById(FORM_ID);
    if (!form || form.dataset.autosaveReady === "true") return;
    form.dataset.autosaveReady = "true";

    const status = createStatus(form);
    const fields = editableFields(form);
    let activeKey = draftKey();
    const draft = readDraft(activeKey);

    if (restoreDraft(fields, draft)) {
        status.textContent = `Saved progress restored${draft.savedAt ? ` from ${new Date(draft.savedAt).toLocaleString()}` : ""}.`;
    }

    let timer = null;
    const saveNow = () => {
        try {
            const nextKey = draftKey();
            if (nextKey !== activeKey) {
                const current = readDraft(activeKey);
                if (current && !readDraft(nextKey)) localStorage.setItem(nextKey, JSON.stringify(current));
                activeKey = nextKey;
            }
            const savedAt = writeDraft(activeKey, fields);
            status.textContent = `Saved automatically · ${formatSavedTime(savedAt)}`;
        } catch (_error) {
            status.textContent = "Automatic save is temporarily unavailable in this browser.";
        }
    };

    const queueSave = () => {
        status.textContent = "Saving…";
        window.clearTimeout(timer);
        timer = window.setTimeout(saveNow, SAVE_DELAY_MS);
    };

    fields.forEach((field) => {
        field.addEventListener("input", queueSave);
        field.addEventListener("change", queueSave);
    });

    window.addEventListener("pagehide", saveNow);
}

waitUntilWorkspacePrefillFinishes(initAutosave);
