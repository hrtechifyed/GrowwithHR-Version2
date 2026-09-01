/* GrowWithHR personalised report access gate.
 * Compliance assessment builds the report locally, shows only a concise glimpse,
 * then requires a matching authenticated customer session before emailing the full PDF.
 */
(() => {
    "use strict";

    const VERSION = "1.0.0";
    const INSTALL_FLAG = "__growwithhrReportAccessGateInstalled";
    const clean = (value, fallback = "") => String(value ?? "").replace(/\s+/g, " ").trim() || fallback;
    const list = (value) => Array.isArray(value) ? value : [];
    const firstEmail = (value) => clean(value).split(/[;,]/).map((item) => item.trim().toLowerCase()).find(Boolean) || "";
    const esc = (value) => clean(value).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");

    function pdfAttachment(pdf = {}) {
        const candidate = pdf?.pdfs?.[0] || pdf?.emailAttachments?.[0] || pdf;
        const base64 = clean(candidate?.base64 || candidate?.dataUri || candidate?.data).replace(/^data:application\/pdf;base64,/i, "");
        if (!base64) throw new Error("The complete PDF is not available in this browser. Generate the report again.");
        return {
            base64,
            filename: clean(candidate?.filename, "GrowWithHR-HR-Compliance-Readiness-Report.pdf"),
            sizeBytes: Number(candidate?.sizeBytes) || undefined
        };
    }

    function currentPayload(app) {
        return {
            report: app.writeReportData(),
            lead: app.writeLeadRecord(),
            answers: { ...app.answers }
        };
    }

    function previewModel(payload) {
        try {
            const service = window.GrowWithHRPDF;
            if (typeof service?.buildAdvisoryModel === "function") {
                return service.buildAdvisoryModel(payload) || {};
            }
        } catch (error) {
            console.warn("GrowWithHR report glimpse could not build the final advisory model.", error);
        }
        return payload.report || {};
    }

    function pickPriorities(model, answers) {
        const candidates = [
            ...list(model?.founderNextActions),
            ...list(model?.priorityActions),
            ...list(model?.recommendations),
            ...list(model?.priorities)
        ];
        const normalised = candidates.map((item) => typeof item === "string"
            ? { title: item, body: "" }
            : { title: clean(item?.title || item?.shortTitle || item?.label), body: clean(item?.body || item?.action || item?.description) }
        ).filter((item) => item.title).slice(0, 3);
        if (normalised.length) return normalised;
        const selected = list(answers?.priorities).filter((item) => clean(item) && item !== "all-of-the-above").slice(0, 3);
        return selected.map((item) => ({ title: clean(item).replace(/-/g," "), body: "This area is included in the complete evidence-backed report." }));
    }

    function statValue(model, keys, fallback = "—") {
        for (const key of keys) {
            const value = model?.[key];
            if (value !== undefined && value !== null && value !== "") return value;
        }
        return fallback;
    }

    function buildGlimpse(app) {
        const payload = currentPayload(app);
        const model = previewModel(payload);
        const priorities = pickPriorities(model, payload.answers);
        const company = clean(payload.answers.companyName || payload.report.companyName, "Your organisation");
        const employees = clean(payload.answers.employees || payload.answers.employeeCount, "Not provided");
        const states = Array.isArray(payload.answers.operatingStates)
            ? payload.answers.operatingStates.length
            : clean(payload.answers.operatingStateCount || payload.answers.locations, "Not provided");
        const complianceCount = Array.isArray(model?.compliance) ? model.compliance.length : statValue(model, ["complianceAreaCount", "applicableCount"], "Generated");
        const changeCount = Array.isArray(payload.report?.inputChanges) ? payload.report.inputChanges.length : 0;
        return `
            <section class="gwh-report-glimpse" id="personalReportGlimpse" aria-labelledby="personalReportGlimpseTitle">
                <div class="gwh-report-glimpse__head">
                    <div><span class="gwh-report-glimpse__label">YOUR REPORT GLIMPSE</span><h3 id="personalReportGlimpseTitle">${esc(company)} · HR Compliance Readiness</h3><p>The complete PDF has been generated from your supplied company facts. Only a concise preview is shown here.</p></div>
                    <span class="gwh-report-glimpse__lock"><i class="fa-solid fa-lock" aria-hidden="true"></i> Full detail email-only</span>
                </div>
                <div class="gwh-report-glimpse__stats">
                    <div class="gwh-report-stat"><strong>${esc(employees)}</strong><span>Employees supplied</span></div>
                    <div class="gwh-report-stat"><strong>${esc(states)}</strong><span>Operating footprint supplied</span></div>
                    <div class="gwh-report-stat"><strong>${esc(complianceCount)}</strong><span>Readiness areas evaluated</span></div>
                    <div class="gwh-report-stat"><strong>${esc(changeCount)}</strong><span>Facts changed since prior baseline</span></div>
                </div>
                <ul class="gwh-report-glimpse__priorities">
                    ${priorities.map((item, index) => `<li><strong>${index + 1}. ${esc(item.title)}</strong>${item.body ? `<br>${esc(item.body)}` : ""}</li>`).join("") || "<li><strong>Executive interpretation prepared.</strong><br>The complete report contains the detailed readiness findings, evidence, missing information and next actions.</li>"}
                </ul>
                <p class="gwh-report-glimpse__footer">The complete emailed PDF contains the detailed deterministic findings, company facts used, missing information, source references, growth reassessment triggers and action plan. It is a readiness tool, not legal certification.</p>
            </section>`;
    }

    function apiEndpoint() {
        return clean(window.GrowWithHREmail?.config?.endpoint, location.origin === "https://hrtechifyed.github.io" ? "https://growwithhr.onrender.com/api/send-advisory" : "/api/send-advisory");
    }

    async function deliverAuthenticated(app, button, status) {
        const expectedEmail = firstEmail(app.lead?.email);
        const auth = window.GrowWithHRCustomerAuth;
        if (!auth) throw new Error("Customer sign-in is still loading. Try again.");
        const session = await auth.requireMatchingSession(expectedEmail);
        const payload = currentPayload(app);
        const attachment = pdfAttachment(app.lastPdfDocument);
        button.disabled = true;
        button.textContent = "Emailing complete report…";
        status.textContent = "Sending your complete PDF securely…";
        status.classList.remove("is-error");
        try {
            const response = await auth.authorizedFetch(apiEndpoint(), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "omit",
                body: JSON.stringify({
                    action: "capture",
                    lead: { ...payload.lead, email: session.user.email },
                    report: { ...payload.report, recipientEmail: session.user.email, recipientEmails: [session.user.email] },
                    answers: payload.answers,
                    pdf: attachment
                })
            }, expectedEmail);
            let body = {};
            try { body = await response.json(); } catch (_error) {}
            if (!response.ok || (body.customerSent !== true && body.customerStatus !== "sent")) {
                throw new Error(body.error || "The report email could not be sent.");
            }
            status.innerHTML = `<span class="gwh-delivery-success">Complete report sent to <strong>${esc(session.user.email)}</strong>. The website keeps only the executive glimpse visible.</span>`;
            button.textContent = "Email complete report again";
            app.writeDeliveryRecord?.({ ...body, customerSent: true, customerStatus: "sent", updatedAt: new Date().toISOString() });
        } catch (error) {
            status.textContent = error.message || "The report email could not be sent.";
            status.classList.add("is-error");
            button.textContent = "Email my complete report";
            throw error;
        } finally {
            button.disabled = false;
        }
    }

    function renderAccess(app) {
        const card = app.elements?.success?.querySelector(".advisory-success-card");
        if (!card) return;
        card.querySelector("#personalReportGlimpse")?.remove();
        card.querySelector("#fullReportAccessGate")?.remove();
        card.querySelectorAll("#viewReportButton,#downloadReportButton,#emailAgainButton").forEach((element) => { element.hidden = true; });
        const heading = card.querySelector(".advisory-panel-heading");
        if (heading) {
            const title = heading.querySelector("h2");
            const paragraph = heading.querySelector("p");
            if (title) title.textContent = "Your report glimpse is ready.";
            if (paragraph) paragraph.textContent = "Your complete HR Compliance Readiness PDF is available by secure email after sign-in.";
        }
        const actions = card.querySelector(".advisory-success-actions");
        actions?.insertAdjacentHTML("beforebegin", buildGlimpse(app));
        const gate = document.createElement("div");
        gate.id = "fullReportAccessGate";
        gate.innerHTML = `<div id="customerAuthMount"></div><div class="gwh-full-report-access"><button id="emailFullReportButton" class="gwh-full-report-button" type="button" disabled>Email my complete report</button><p id="fullReportDeliveryStatus" role="status" aria-live="polite">Sign in with the assessment work email to enable delivery.</p></div>`;
        actions?.insertAdjacentElement("beforebegin", gate);
        const emailButton = gate.querySelector("#emailFullReportButton");
        const deliveryStatus = gate.querySelector("#fullReportDeliveryStatus");
        const expectedEmail = firstEmail(app.lead?.email);
        const mount = gate.querySelector("#customerAuthMount");
        window.GrowWithHRCustomerAuth?.mountGate(mount, {
            expectedEmail,
            title: "Sign in or create an account for the complete PDF",
            onAuthenticated(session) {
                emailButton.disabled = false;
                deliveryStatus.textContent = `Signed in as ${session.user.email}. Your full report will be emailed; it will not be opened as a full website report.`;
            },
            onSignedOut() {
                emailButton.disabled = true;
                deliveryStatus.textContent = "Sign in with the assessment work email to enable delivery.";
            }
        });
        emailButton.addEventListener("click", () => {
            deliverAuthenticated(app, emailButton, deliveryStatus).catch(() => {});
        });
    }

    function install(app) {
        if (!app || app[INSTALL_FLAG] || typeof app.submitLeadAndGenerate !== "function") return false;
        const originalSubmit = app.submitLeadAndGenerate.bind(app);
        const originalBegin = app.beginGeneration?.bind(app);
        if (originalBegin) {
            app.beginGeneration = function gatedBeginGeneration() {
                const result = originalBegin();
                app.configureGenerationLabels?.([
                    "Organising your context",
                    "Building your complete PDF",
                    "Preparing secure report access"
                ]);
                return result;
            };
        }
        app.submitLeadAndGenerate = async function gatedSubmitLeadAndGenerate() {
            const realEmailService = window.GrowWithHREmail;
            const noSendService = Object.freeze({
                ...(realEmailService || {}),
                sendAdvisory: async () => ({
                    ok: true,
                    mode: "authenticated-email-gate",
                    action: "capture",
                    customerStatus: "auth-required",
                    customerSent: false,
                    internalStatus: "not-sent",
                    internalSent: false,
                    updatedAt: new Date().toISOString()
                })
            });
            window.GrowWithHREmail = noSendService;
            try {
                await originalSubmit();
            } finally {
                window.GrowWithHREmail = realEmailService;
            }
            if (app.completed && app.lastPdfDocument) renderAccess(app);
        };
        const originalShowSuccess = app.showSuccess?.bind(app);
        if (originalShowSuccess) {
            app.showSuccess = function gatedShowSuccess() {
                const result = originalShowSuccess();
                window.setTimeout(() => {
                    if (app.lastPdfDocument) renderAccess(app);
                }, 0);
                return result;
            };
        }
        Object.defineProperty(app, INSTALL_FLAG, { value: true });
        return true;
    }

    async function bootstrap() {
        await Promise.resolve(window.GrowWithHRCustomerAuthReady).catch(() => {});
        for (let attempt = 0; attempt < 240; attempt += 1) {
            const app = window.executiveAssessment;
            if (app && window.GrowWithHRCompanyWorkspaceContinuity?.version && install(app)) {
                window.GrowWithHRReportAccessGate = Object.freeze({ version: VERSION, installed: true, install });
                return;
            }
            await new Promise((resolve) => window.setTimeout(resolve, 25));
        }
        console.error("GrowWithHR personalised report access gate could not install.");
    }

    void bootstrap();
})();