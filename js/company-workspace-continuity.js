(() => {
    "use strict";

    const SESSION_KEY = "growwithhr.workspace";
    const INSTALL_FLAG = "__growwithhrCompanyWorkspaceContinuityInstalled";
    const runtime = { workspace: null, justIssuedAccessKey: "", warning: "" };

    const clean = (value, fallback = "") => String(value ?? "").trim() || fallback;
    const object = (value) => value && typeof value === "object" && !Array.isArray(value) ? value : {};

    function readSession() {
        try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null"); }
        catch (_error) { return null; }
    }

    function writeSession(value) {
        try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(value)); return true; }
        catch (_error) { return false; }
    }

    function formatDate(value) {
        try {
            return new Intl.DateTimeFormat("en-IN", {
                day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata"
            }).format(new Date(value));
        } catch (_error) { return clean(value); }
    }

    function buildCompanyData(app) {
        const answers = { ...object(app?.answers) };
        const lead = { ...object(app?.lead) };
        return {
            shared: {
                companyName: clean(answers.companyName),
                email: clean(lead.email),
                industry: clean(answers.customIndustry || answers.industry),
                employees: Number(answers.employees) || 0,
                primaryState: clean(answers.primaryState || answers.state),
                locations: Number(answers.locations) || 0,
                entity: clean(answers.entity),
                workModel: clean(answers.workModel),
                fundingStage: clean(answers.fundingStage),
                peopleFunction: clean(answers.peopleFunction)
            },
            compliance: {
                answers,
                confirmedAt: new Date().toISOString()
            }
        };
    }

    function reuseFacts(app, recovered) {
        if (!app || !recovered) return;
        const data = object(recovered.companyData);
        const shared = object(data.shared || data);
        const compliance = object(data.compliance);
        const prior = object(compliance.answers || compliance);
        Object.assign(app.answers, prior);

        const map = {
            companyName: recovered.companyName || shared.companyName,
            industry: shared.industry,
            employees: shared.employees,
            primaryState: shared.primaryState,
            locations: shared.locations,
            entity: shared.entity,
            workModel: shared.workModel,
            fundingStage: shared.fundingStage,
            peopleFunction: shared.peopleFunction
        };
        Object.entries(map).forEach(([key, value]) => {
            if (value !== undefined && value !== null && clean(value) !== "") app.answers[key] = value;
        });
        if (clean(recovered.email || shared.email)) app.lead.email = clean(recovered.email || shared.email);
        try { app.saveNow?.(); app.populateLeadForm?.(); } catch (_error) {}
    }

    function addDisclosure() {
        const anchor = document.querySelector(".advisory-privacy-note");
        if (!anchor || document.getElementById("companyWorkspaceRetentionDisclosure")) return;
        const node = document.createElement("p");
        node.id = "companyWorkspaceRetentionDisclosure";
        node.className = "advisory-privacy-note";
        node.innerHTML = "<strong>Returning to GrowWithHR:</strong> reusable company information from this completed intelligence analysis is encrypted and stored in the GrowWithHR database for six months from your latest completed analysis. We email you seven days before scheduled deletion and again after deletion.";
        anchor.insertAdjacentElement("afterend", node);
    }

    function mergeSession(previous, workspace, companyData, accessKey = "") {
        return {
            reportId: clean(workspace?.reportId, previous?.reportId),
            reportIds: workspace?.reportIds || previous?.reportIds || [],
            accessKey: clean(accessKey, previous?.accessKey),
            email: clean(workspace?.email, previous?.email),
            companyName: clean(workspace?.companyName, previous?.companyName),
            completedEngines: workspace?.completedEngines || previous?.completedEngines || [],
            expiresAt: clean(workspace?.expiresAt, previous?.expiresAt),
            companyData: workspace?.companyData || companyData || previous?.companyData || {}
        };
    }

    async function saveWorkspace(app, result, payload) {
        const api = window.GrowWithHRCompanyWorkspace;
        if (!api) throw new Error("Company Workspace service is unavailable.");
        const reportId = clean(result?.pdf?.reportId || result?.reportId);
        if (!reportId) throw new Error("The completed report did not provide a Report ID.");

        const prior = readSession();
        const companyData = buildCompanyData(app);
        const companyName = clean(app?.answers?.companyName);
        const email = clean(payload?.lead?.email || app?.lead?.email);

        if (prior?.reportId && prior?.accessKey) {
            const response = await api.complete({
                reportId: prior.reportId,
                newReportId: reportId,
                accessKey: prior.accessKey,
                companyName,
                companyData,
                completedEngine: "compliance"
            });
            const next = mergeSession(prior, response.workspace, response.workspace?.companyData || companyData);
            writeSession(next);
            runtime.workspace = next;
            runtime.justIssuedAccessKey = "";
            return;
        }

        const response = await api.create({
            reportId,
            email,
            companyName,
            companyData,
            completedEngine: "compliance"
        });
        const accessKey = clean(response.workspace?.accessKey);
        const next = mergeSession({}, response.workspace, companyData, accessKey);
        writeSession(next);
        runtime.workspace = next;
        runtime.justIssuedAccessKey = accessKey;
    }

    function renderPanel(app) {
        const card = app?.elements?.success?.querySelector(".advisory-success-card");
        if (!card) return;
        let panel = document.getElementById("companyWorkspaceContinuityPanel");
        if (!panel) {
            panel = document.createElement("section");
            panel.id = "companyWorkspaceContinuityPanel";
            panel.style.cssText = "margin-top:20px;padding:18px 20px;border:1px solid #d8dfe8;border-left:4px solid #d97706;background:#fff7ed;color:#334155;line-height:1.55;text-align:left";
            card.appendChild(panel);
        }

        const workspace = runtime.workspace || readSession();
        if (!workspace) {
            panel.hidden = !runtime.warning;
            panel.textContent = runtime.warning;
            return;
        }

        const access = runtime.justIssuedAccessKey
            ? `<p><strong>Workspace Recovery Code:</strong> <code>${runtime.justIssuedAccessKey}</code><br><small>Save this code now and keep it separate from your Report ID.</small></p>`
            : "";
        const warning = runtime.warning ? `<p><strong>Workspace notice:</strong> ${runtime.warning}</p>` : "";
        panel.hidden = false;
        panel.innerHTML = `<h3 style="margin:0 0 10px;color:#0a2342">Use this company information again</h3><p><strong>Report ID:</strong> <code>${clean(workspace.reportId)}</code></p>${access}<p>Your reusable company information is stored in the GrowWithHR database until <strong>${formatDate(workspace.expiresAt)}</strong>. We will email you seven days before scheduled deletion and again after deletion.</p>${warning}<p style="margin-bottom:0"><a href="intelligence-hub.html" style="font-weight:800;color:#0a2342">Return to Analyze My Company →</a></p>`;
    }

    function install(app) {
        if (!app || app[INSTALL_FLAG] || !app.deliveryService?.prepareAndSend) return false;
        const recovered = readSession();
        runtime.workspace = recovered;
        reuseFacts(app, recovered);
        addDisclosure();

        const originalPrepare = app.deliveryService.prepareAndSend.bind(app.deliveryService);
        app.deliveryService.prepareAndSend = async function workspaceAwarePrepare(payload = {}) {
            const current = readSession();
            const previousReportId = clean(current?.reportId);
            const enriched = {
                ...payload,
                report: {
                    ...object(payload.report),
                    ...(previousReportId ? { previousReportId } : {})
                }
            };
            const result = await originalPrepare(enriched);
            runtime.warning = "";
            try { await saveWorkspace(app, result, enriched); }
            catch (error) {
                console.error("GrowWithHR Company Workspace could not be saved.", error);
                runtime.warning = "Your report is ready, but reusable Company Workspace data could not be saved. Keep your downloaded report and try continuity again later.";
            }
            return result;
        };

        const originalShowSuccess = app.showSuccess.bind(app);
        app.showSuccess = function workspaceAwareSuccess() {
            const result = originalShowSuccess();
            setTimeout(() => renderPanel(app), 0);
            return result;
        };

        Object.defineProperty(app, INSTALL_FLAG, { value: true });
        return true;
    }

    window.addEventListener("growwithhr:assessment-modules-ready", (event) => {
        install(event?.detail?.application || window.executiveAssessment);
    });

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => install(window.executiveAssessment), { once: true });
    } else {
        install(window.executiveAssessment);
    }

    window.GrowWithHRCompanyWorkspaceContinuity = Object.freeze({ version: "1.0.0", install, readSession });
})();
