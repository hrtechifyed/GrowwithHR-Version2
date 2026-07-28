/* GrowWithHR v0.22 executive-summary and dual-edition report refinement */
(() => {
    "use strict";

    const baseCore = window.GrowWithHRVisualReportCore;
    const baseRenderers = window.GrowWithHRVisualReportRenderers;

    if (!baseCore || !baseRenderers) {
        throw new Error("GrowWithHR visual report modules must load before the executive-summary refinement.");
    }

    const VERSION = "0.22.0-executive-summary-report";
    const STRUCTURE_VERSION = "visual-sectioned-v5";

    const {
        clean,
        compact,
        values,
        mergeSource,
        palette,
        createWriter,
        actionRows,
        statusColour
    } = baseCore;

    function ensureStylesheet() {
        if (document.querySelector('link[data-growwithhr-v022-story-polish]')) return;
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = new URL("css/22-story-visual-polish.css", window.location.href).href;
        link.dataset.growwithhrV022StoryPolish = VERSION;
        document.head.appendChild(link);
    }

    function numberValue(...candidates) {
        for (const candidate of candidates) {
            const value = Number(candidate);
            if (Number.isFinite(value) && value >= 0) return value;
        }
        return 0;
    }

    function lower(value) {
        return clean(value).toLowerCase();
    }

    function ownerOnlyProfile(data = {}) {
        const workforcePresence = lower(data.workforcePresence || data.peoplePresence || data.teamPresence);
        const legalStructure = lower(data.entity || data.legalStructure || data.establishmentType);
        const employeeCount = numberValue(data.employees, data.employeeCount, data.headcount);
        const workerCount = numberValue(data.workers, data.workerCount);
        const contractorCount = numberValue(data.contractors, data.contractWorkers, data.consultants);
        const explicitOwnerOnly = [
            "owner-only",
            "founder-only",
            "director-only",
            "solo",
            "no-other-people"
        ].some((value) => workforcePresence.includes(value));
        const opcLeanProfile = /one person|\bopc\b/.test(legalStructure) && employeeCount <= 1;
        return (explicitOwnerOnly || opcLeanProfile) && workerCount === 0 && contractorCount === 0;
    }

    function organisationProfile(data = {}) {
        const companyName = clean(data.companyName, "Your Organisation");
        const legalStructure = clean(
            data.entity || data.legalStructure || data.establishmentType,
            "legal structure not specified"
        );
        const industry = clean(data.customIndustry || data.industry, "sector not specified");
        const state = clean(data.primaryState || data.state, "location not specified");
        const workModel = clean(data.workModel || data.workingModel, "working model not specified");
        const employees = numberValue(data.employees, data.employeeCount, data.headcount);
        const workers = numberValue(data.workers, data.workerCount);
        const contractors = numberValue(data.contractors, data.contractWorkers, data.consultants);
        const ownerOnly = ownerOnlyProfile(data);
        return {
            companyName,
            legalStructure,
            industry,
            state,
            workModel,
            employees,
            workers,
            contractors,
            ownerOnly
        };
    }

    function statusCounts(rows = []) {
        return {
            applicable: rows.filter((row) => row.status === "Applicable").length,
            review: rows.filter((row) => row.status === "Review required").length,
            missing: rows.filter((row) => row.status === "Needs information").length,
            watch: rows.filter((row) => row.status === "Not currently triggered").length
        };
    }

    function executiveCopy(data = {}, rows = []) {
        const profile = organisationProfile(data);
        const counts = statusCounts(rows);
        const locationText = profile.state === "location not specified"
            ? "with the operating location still to be confirmed"
            : `with ${profile.state} recorded as the primary operating location`;
        const modelText = profile.workModel === "working model not specified"
            ? ""
            : ` The reported working model is ${profile.workModel}.`;

        let overview;
        let meaning;
        let ahead;
        let nextStep;

        if (profile.ownerOnly) {
            overview = `${profile.companyName} is described as a ${profile.legalStructure} in ${profile.industry}, ${locationText}. The answers indicate an owner/director-led organisation without a non-owner workforce.${modelText}`;
            meaning = "The answers do not currently indicate a People-law trigger arising from employees or other workers. That supports continuing with a lean owner-led setup while company records, contracts, registrations and sector-specific obligations are maintained separately. This report is not a legal exemption or certification.";
            ahead = "The position should be reassessed before hiring the first employee, regularly engaging contractors, opening a workplace, operating in another state, introducing shifts or beginning a new regulated activity. Those changes can activate payroll, welfare, workplace, registration and record-keeping duties.";
            nextStep = "Keep a simple owner-led compliance file, record the current operating model and revisit this assessment before another person starts working with the organisation.";
        } else {
            const peopleSummary = [
                profile.employees ? `${profile.employees} employee${profile.employees === 1 ? "" : "s"}` : "no confirmed employee count",
                profile.workers ? `${profile.workers} worker${profile.workers === 1 ? "" : "s"}` : "",
                profile.contractors ? `${profile.contractors} contractor${profile.contractors === 1 ? "" : "s"}` : ""
            ].filter(Boolean).join(", ");
            overview = `${profile.companyName} is described as a ${profile.legalStructure} in ${profile.industry}, ${locationText}. The current people profile records ${peopleSummary}.${modelText}`;
            meaning = counts.applicable
                ? `${counts.applicable} People-compliance ${counts.applicable === 1 ? "check appears" : "checks appear"} to meet the usual trigger from the answers supplied. The practical focus is to confirm the current legal position, assign ownership and retain evidence.`
                : counts.review
                    ? `No People-compliance law is currently indicated as directly applicable, but ${counts.review} ${counts.review === 1 ? "item needs" : "items need"} qualified review before that conclusion is relied on.`
                    : "No current People-law trigger is indicated from the answers supplied. The organisation should still maintain basic records and reassess after a material workforce or operating change.";
            ahead = counts.missing
                ? `${counts.missing} unanswered ${counts.missing === 1 ? "item can" : "items can"} change the result. Confirming those answers is the fastest way to improve the reliability of the brief.`
                : counts.watch
                    ? `${counts.watch} future ${counts.watch === 1 ? "trigger has" : "triggers have"} been identified. Growth in headcount, locations, shifts, worker categories or business activities may make those requirements relevant.`
                    : "The current profile is complete for this assessment. Reassess before a material change in headcount, location, legal structure, worker mix or operating model.";
            nextStep = counts.applicable || counts.review || counts.missing
                ? "Start with the first action card, confirm the official source and assign an accountable owner and target date."
                : "Keep the current profile and supporting records together, then regenerate the brief when the organisation changes.";
        }

        return { profile, counts, overview, meaning, ahead, nextStep };
    }

    function renderExecutiveSummary(writer, rows, data) {
        const copy = executiveCopy(data, rows);
        const profile = copy.profile;
        writer.sectionPage(
            "executive",
            "Executive summary",
            copy.overview
        );
        writer.infoCard(`${profile.companyName} at a glance`, [
            ["Legal structure", profile.legalStructure],
            ["Sector", profile.industry],
            ["People profile", profile.ownerOnly
                ? "Owner/director only; no non-owner workforce reported."
                : `${profile.employees} employees · ${profile.workers} workers · ${profile.contractors} contractors`],
            ["Operating context", `${profile.state} · ${profile.workModel}`]
        ], { accent: writer.colours.blue, maxChars: 190 });

        writer.infoCard("What this means for you", [
            ["Current position", copy.meaning],
            ["Why this is useful", "It identifies the decisions to take now and the business changes that should trigger a fresh review."]
        ], {
            accent: copy.counts.applicable ? writer.colours.green : copy.counts.review ? writer.colours.amber : writer.colours.blue,
            maxChars: 245
        });

        writer.infoCard("What lies ahead", [
            ["Growth outlook", copy.ahead],
            ["Best next step", copy.nextStep]
        ], { accent: writer.colours.accent, maxChars: 245 });
    }

    function overviewValue(count, singularLabel, zeroLabel) {
        if (count > 0) return `${count} ${count === 1 ? singularLabel : `${singularLabel}s`}`;
        return zeroLabel;
    }

    function renderOverview(writer, rows) {
        const counts = statusCounts(rows);
        const actions = actionRows(rows);
        writer.sectionPage(
            "overview",
            "At a glance",
            "A quick reading of the current People-compliance position. The wording below explains what each status means for this organisation."
        );
        const top = writer.getY();
        writer.statCard(16, top, 84, overviewValue(counts.applicable, "current trigger", "No current trigger"), "usual threshold appears met", writer.colours.green);
        writer.statCard(110, top, 84, overviewValue(counts.review, "review item", "No review item"), "needs legal, state or specialist confirmation", writer.colours.amber);
        writer.statCard(16, top + 50, 84, overviewValue(counts.missing, "missing input", "All key inputs given"), "an answer could change the result", writer.colours.red);
        writer.statCard(110, top + 50, 84, overviewValue(counts.watch, "future trigger", "No watch item"), "may become relevant after a change", writer.colours.blue);
        writer.setY(top + 100);

        const currentPosition = counts.applicable
            ? `${counts.applicable} People-compliance ${counts.applicable === 1 ? "requirement appears" : "requirements appear"} to meet the usual trigger from the answers supplied. Confirm the current legal position and keep evidence.`
            : counts.review
                ? `No requirement is currently indicated as directly applicable, but ${counts.review} ${counts.review === 1 ? "item needs" : "items need"} qualified review before relying on that conclusion.`
                : counts.missing
                    ? "No requirement is currently indicated as directly applicable, but unanswered information could change the result."
                    : "No People-compliance law is currently indicated as applicable from the answers supplied. This is not a legal exemption or certification; reassess after a material change.";

        writer.infoCard("How to interpret this page", [
            ["Current position", currentPosition],
            ["Review item", "A result depends on state rules, establishment details or professional confirmation."],
            ["Missing input", "An unanswered fact could change the assessment result."],
            ["Future trigger", "The requirement is not active today but may become relevant as the organisation grows or changes."]
        ], { accent: writer.colours.blue, maxChars: 220 });

        if (!actions.length) {
            writer.infoCard("What to do now", [
                ["Action", "No immediate People-law action was generated from the current profile."],
                ["Keep ready", "Maintain basic company, engagement and operating records, and repeat the assessment before a material change."]
            ], { accent: writer.colours.green, maxChars: 220 });
            return;
        }

        writer.label("Leading priorities", writer.colours.accent);
        actions.slice(0, 3).forEach((row, index) => writer.infoCard(
            `${clean(row.actionId, `A${index + 1}`)} · ${clean(row.shortTitle, "Priority item")}`,
            [["Status", row.status], ["Next move", compact(row.requiredAction, 125)]],
            { accent: statusColour(row.status, writer.colours), maxChars: 135 }
        ));
    }

    function renderContentsAt(doc, colours, sectionPages, pageNumber) {
        doc.setPage(pageNumber);
        doc.setFillColor(...colours.page);
        doc.rect(0, 0, 210, 297, "F");
        doc.setFillColor(...colours.accent);
        doc.rect(0, 0, 210, 10, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(...colours.accent);
        doc.text("REPORT NAVIGATION", 16, 28);
        doc.setFontSize(22);
        doc.setTextColor(...colours.heading);
        doc.text("Table of Contents", 16, 43);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.8);
        doc.setTextColor(...colours.muted);
        doc.text("Move directly to the personalised summary, current position, actions or monitoring section you need.", 16, 54, { maxWidth: 168 });

        const labels = {
            executive: ["Executive summary", "Your organisation, current position and what lies ahead"],
            overview: ["At a glance", "What the status results mean"],
            actions: ["What to do now", "Priority actions and official sources"],
            questions: ["Complete the picture", "Answers that could change the result"],
            roadmap: ["Your 90-day plan", "A simple implementation sequence"],
            watch: ["Watch as you grow", "When to reassess future triggers"],
            profile: ["The profile used", "The inputs behind this brief"],
            end: ["End of Report", "Closing guidance and review rhythm"]
        };

        let y = 69;
        Object.entries(labels).forEach(([key, [title, description]], index) => {
            const page = sectionPages[key];
            if (!page) return;
            const height = 20;
            doc.setFillColor(...(index % 2 ? colours.surface : colours.surfaceAlt));
            doc.setDrawColor(...colours.line);
            doc.roundedRect(16, y, 178, height, 2.5, 2.5, "FD");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8.7);
            doc.setTextColor(...colours.heading);
            doc.text(title, 23, y + 7.5);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7);
            doc.setTextColor(...colours.muted);
            doc.text(description, 23, y + 14);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9.5);
            doc.setTextColor(...colours.accent);
            doc.text(String(page), 186, y + 11, { align: "right" });
            y += height + 4;
        });
    }

    function addFooterRange(doc, colours, companyName, startPage, endPage) {
        const total = doc.getNumberOfPages();
        for (let page = startPage; page <= endPage; page += 1) {
            doc.setPage(page);
            doc.setFillColor(...colours.page);
            doc.rect(0, 270, 210, 27, "F");
            doc.setDrawColor(...colours.line);
            doc.line(16, 276, 194, 276);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(7.2);
            doc.setTextColor(...colours.accent);
            doc.text("HRTechify · GrowWithHR", 16, 284);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(6.5);
            doc.setTextColor(...colours.muted);
            doc.text(`Confidential · ${clean(companyName, "Your Organisation")}`, 16, 290, { maxWidth: 145 });
            doc.text(`${page} / ${total}`, 194, 284, { align: "right" });
        }
    }

    function serialise(doc, theme, data, suffix = "") {
        const dataUri = doc.output("datauristring");
        const buffer = doc.output("arraybuffer");
        const company = clean(data.companyName, "Organisation")
            .replace(/[^a-z0-9]+/gi, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 60) || "Organisation";
        const edition = suffix || (theme === "dark" ? "Dark" : theme === "both" ? "Light-and-Dark" : "Light");
        return {
            document: doc,
            theme,
            filename: `GrowWithHR-Action-Brief-${company}-${edition}.pdf`,
            dataUri,
            base64: dataUri.includes(",") ? dataUri.split(",")[1] : dataUri,
            sizeBytes: buffer.byteLength,
            pageCount: doc.getNumberOfPages(),
            reportLayoutVersion: VERSION,
            reportStructureVersion: STRUCTURE_VERSION
        };
    }

    function renderEditionInto(doc, theme, rows, model, payload, trace, logo, startOnNewPage = false) {
        const colours = palette(theme);
        const data = mergeSource(payload, model);
        if (startOnNewPage) doc.addPage();
        const startPage = doc.getNumberOfPages();
        baseRenderers.renderCover(doc, colours, data, theme, logo);
        doc.addPage();
        const contentsPage = doc.getNumberOfPages();
        doc.addPage();
        const sectionPages = {};
        const writer = createWriter(doc, colours, sectionPages);
        renderExecutiveSummary(writer, rows, data);
        renderOverview(writer, rows);
        baseRenderers.renderActions(writer, rows);
        baseRenderers.renderQuestions(writer, rows, trace);
        baseRenderers.renderRoadmap(writer, rows);
        baseRenderers.renderWatch(writer, rows);
        baseRenderers.renderProfile(writer, data);
        baseRenderers.renderEnd(writer, data, logo);
        const endPage = doc.getNumberOfPages();
        renderContentsAt(doc, colours, sectionPages, contentsPage);
        addFooterRange(doc, colours, data.companyName, startPage, endPage);
        return { startPage, endPage, contentsPage, sectionPages, colours, data };
    }

    function buildVariant(JsPDF, theme, rows, model, payload, trace, logo) {
        const doc = new JsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true, putOnlyUsedFonts: true });
        const edition = renderEditionInto(doc, theme, rows, model, payload, trace, logo, false);
        return serialise(doc, theme, edition.data);
    }

    function buildBundleVariant(JsPDF, themes, rows, model, payload, trace, logo) {
        const selected = values(themes).length ? values(themes) : ["light", "dark"];
        const doc = new JsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true, putOnlyUsedFonts: true });
        let data = mergeSource(payload, model);
        const editions = selected.map((theme, index) => {
            const edition = renderEditionInto(doc, theme, rows, model, payload, trace, logo, index > 0);
            data = edition.data;
            return edition;
        });
        editions.forEach((edition) => {
            addFooterRange(doc, edition.colours, edition.data.companyName, edition.startPage, edition.endPage);
        });
        return {
            ...serialise(doc, "both", data, "Light-and-Dark"),
            bundledThemes: selected,
            oneEmailBundle: true
        };
    }

    ensureStylesheet();

    const enhancedCore = Object.freeze({
        ...baseCore,
        VERSION,
        reportStructureVersion: STRUCTURE_VERSION
    });

    const enhancedRenderers = Object.freeze({
        ...baseRenderers,
        VERSION,
        STRUCTURE_VERSION,
        renderExecutiveSummary,
        renderOverview,
        renderContentsAt,
        buildVariant,
        buildBundleVariant,
        executiveCopy
    });

    window.GrowWithHRVisualReportCore = enhancedCore;
    window.GrowWithHRVisualReportRenderers = enhancedRenderers;
    window.GrowWithHRExecutiveSummaryReport = Object.freeze({
        version: VERSION,
        structureVersion: STRUCTURE_VERSION,
        ownerOnlyProfile,
        executiveCopy,
        buildBundleVariant
    });
})();
