/* GrowWithHR v0.22 executive-summary and dual-edition report refinement */
(() => {
    "use strict";

    const baseCore = window.GrowWithHRVisualReportCore;
    const baseRenderers = window.GrowWithHRVisualReportRenderers;

    if (!baseCore || !baseRenderers) {
        throw new Error("GrowWithHR visual report modules must load before the executive-summary refinement.");
    }

    const VERSION = "0.22.1-profile-tailored-executive-summary";
    const STRUCTURE_VERSION = "visual-sectioned-v5";

    const {
        clean,
        compact,
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

    function values(value) {
        if (Array.isArray(value)) return value.map((item) => clean(item)).filter(Boolean);
        return clean(value).split(/[;,|]/).map((item) => item.trim()).filter(Boolean);
    }

    function truthy(value) {
        return value === true || ["yes", "true", "1", "active", "planned"].includes(lower(value));
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

    function legalFamily(value) {
        const text = lower(value);
        if (/one person|\bopc\b|sole propriet/.test(text)) return "owner-led";
        if (/partnership|\bllp\b/.test(text)) return "partnership";
        if (/non.?profit|section 8|trust|society|ngo/.test(text)) return "mission-led";
        if (/public limited|listed/.test(text)) return "public-company";
        if (/private limited|company|corporat/.test(text)) return "company";
        return "other";
    }

    function sectorFamily(value) {
        const text = lower(value);
        if (/software|saas|technology|it services|consult|professional|agency/.test(text)) return "knowledge-services";
        if (/retail|e-?commerce|hospitality|restaurant|hotel|travel/.test(text)) return "customer-operations";
        if (/health|hospital|clinic|life science|pharma|education|school|training/.test(text)) return "care-education";
        if (/construction|real estate|logistics|warehouse|transport|delivery/.test(text)) return "site-operations";
        if (/manufactur|factory|industrial|production|semiconductor/.test(text)) return "manufacturing";
        if (/bank|financial|insurance|fintech|investment/.test(text)) return "financial-services";
        if (/media|creative|entertainment|non.?profit|social enterprise/.test(text)) return "creative-mission";
        return "general";
    }

    function workforceStage(total, ownerOnly) {
        if (ownerOnly) return "owner-only";
        if (total <= 0) return "workforce-unconfirmed";
        if (total <= 9) return "micro-team";
        if (total <= 19) return "emerging-team";
        if (total <= 49) return "growing-team";
        if (total <= 99) return "established-team";
        return "scaled-workforce";
    }

    function workforceMix(employees, workers, contractors) {
        if (contractors > 0 && employees === 0 && workers === 0) return "contractor-led";
        if (employees > 0 && (workers > 0 || contractors > 0)) return "mixed-workforce";
        if (workers > 0 && employees === 0) return "worker-led";
        if (employees > 0) return "employee-led";
        return "not-confirmed";
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
        const workers = numberValue(data.workers, data.workerCount, data.blueCollarWorkers);
        const contractors = numberValue(data.contractors, data.contractWorkers, data.consultants);
        const ownerOnly = ownerOnlyProfile(data);
        const totalPeople = ownerOnly ? 0 : employees + workers + contractors;
        const operatingStates = values(data.operatingStates || data.states || data.locations);
        const multiState = /pan.?india|multiple states/.test(lower(state)) || operatingStates.length > 1;
        const shifts = truthy(data.shiftWork || data.nightShift || data.continuousOperations) || /shift|night|24.?7/.test(lower(data.operatingModel));
        const manufacturing = truthy(data.manufacturingProcess || data.manufacturingActivity) || sectorFamily(industry) === "manufacturing";
        const expansion = values(data.expansionPlans || data.hiringPlans || data.growthPlans || data.priorities);
        return {
            companyName,
            legalStructure,
            industry,
            state,
            workModel,
            employees,
            workers,
            contractors,
            totalPeople,
            ownerOnly,
            legalFamily: legalFamily(legalStructure),
            sectorFamily: sectorFamily(industry),
            workforceStage: workforceStage(totalPeople, ownerOnly),
            workforceMix: workforceMix(employees, workers, contractors),
            operatingStates,
            multiState,
            shifts,
            manufacturing,
            expansion
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

    function legalStructureGuidance(profile) {
        const guidance = {
            "owner-led": "Keep the entity, tax, banking and engagement records aligned with the owner-led operating model.",
            partnership: "Keep partner authority, engagement decisions and responsibility for People matters clearly documented.",
            company: "Use clear director or management ownership for People compliance, records and approvals.",
            "public-company": "Use formal governance, documented ownership and an auditable review rhythm across business units.",
            "mission-led": "Keep trustee, board or governing-body oversight aligned with the way staff, volunteers and contractors are engaged.",
            other: "Confirm who is accountable for People decisions and retain the records supporting the organisation structure."
        };
        return guidance[profile.legalFamily];
    }

    function workforceGuidance(profile) {
        const guidance = {
            "owner-only": "The current profile is lean and owner/director-led. Employee-law obligations generally become more relevant when another person begins working with the organisation.",
            "workforce-unconfirmed": "The workforce position is not yet fully confirmed, so the report should be refreshed as soon as employee, worker or contractor numbers are known.",
            "micro-team": "A small team allows simple controls, but appointment terms, attendance, pay records, leave and role ownership should be established early.",
            "emerging-team": "The organisation is approaching common headcount thresholds, so records, payroll controls and workplace responsibilities should become more formal.",
            "growing-team": "The team size can activate additional threshold-based duties. Assign owners, maintain evidence and review applicability before further hiring.",
            "established-team": "A more established workforce needs repeatable controls across hiring, pay, leave, welfare, complaints and statutory records.",
            "scaled-workforce": "A scaled workforce benefits from central standards, local accountability, audit evidence and a scheduled compliance review cycle."
        };
        let text = guidance[profile.workforceStage];
        if (profile.workforceMix === "contractor-led") text += " Contractor classification, scopes of work, invoices and principal-employer responsibilities deserve particular attention.";
        if (profile.workforceMix === "mixed-workforce") text += " Apply consistent rules while keeping employee, worker and contractor records clearly separated.";
        if (profile.workforceMix === "worker-led") text += " Site conditions, working hours, welfare and worker records should be managed as operating controls, not only HR administration.";
        return text;
    }

    function sectorGuidance(profile) {
        const guidance = {
            "knowledge-services": "For knowledge and professional services, keep employment or consultancy terms, remote-work expectations, client-site arrangements and information-handling responsibilities clear.",
            "customer-operations": "For customer-facing operations, monitor establishment locations, opening hours, shifts, temporary staff and seasonal workforce changes.",
            "care-education": "For care or education settings, workforce credentials, safeguarding, shift coverage, outsourced staff and facility-specific responsibilities may need closer review.",
            "site-operations": "For site-based operations, track project or warehouse locations, contractor chains, migrant or agency labour, safety responsibilities and state-specific registrations.",
            manufacturing: "For manufacturing or production, factory status, power use, worker categories, shifts, welfare, safety and site records should be reviewed together.",
            "financial-services": "For financial services, combine People controls with regulated outsourcing, confidentiality, fit-and-proper responsibilities and location-specific operations.",
            "creative-mission": "For creative or mission-led work, distinguish employees, freelancers, volunteers and project staff, and document who owns workplace responsibilities.",
            general: "The report uses the activities, workforce and locations supplied rather than assuming that every law applies to the sector."
        };
        return guidance[profile.sectorFamily];
    }

    function operatingGuidance(profile) {
        const points = [];
        if (profile.multiState) points.push("Because more than one state or a Pan-India footprint is indicated, confirm establishment and state-specific requirements location by location.");
        if (/remote|hybrid/.test(lower(profile.workModel))) points.push("For remote or hybrid work, document the employing location, work location, working-time expectations and equipment or expense arrangements.");
        if (/office|onsite|on-site|site/.test(lower(profile.workModel))) points.push("For workplace-based work, keep establishment, attendance, safety and local operating records aligned to each site.");
        if (profile.shifts) points.push("Shift or night operations can change working-hour, transport, safety and women-worker requirements, so confirm them before scheduling people.");
        if (profile.manufacturing) points.push("Production activity can create a separate factory and worker-compliance pathway; confirm the actual process and site facts before relying on a conclusion.");
        if (!points.length) points.push("Reassess the report when the working model, locations, shifts or business activities change.");
        return points.join(" ");
    }

    function executiveCopy(data = {}, rows = []) {
        const profile = organisationProfile(data);
        const counts = statusCounts(rows);
        const peopleText = profile.ownerOnly
            ? "an owner/director-only operating model"
            : profile.totalPeople
                ? `${profile.totalPeople} people across the reported employee, worker and contractor categories`
                : "a workforce position that still needs confirmation";
        const locationText = profile.state === "location not specified"
            ? "with the primary operating location still to be confirmed"
            : `with ${profile.state} recorded as the primary operating location`;
        const modelText = profile.workModel === "working model not specified" ? "" : ` The reported working model is ${profile.workModel}.`;

        const overview = `${profile.companyName} is described as a ${profile.legalStructure} in ${profile.industry}, ${locationText}, and currently reports ${peopleText}.${modelText}`;

        let currentPosition;
        if (counts.applicable) {
            currentPosition = `${counts.applicable} People-compliance ${counts.applicable === 1 ? "requirement appears" : "requirements appear"} to meet the usual trigger from the answers supplied. Confirm each position through the official source and retain evidence.`;
        } else if (counts.review) {
            currentPosition = `No requirement is currently indicated as directly applicable, but ${counts.review} ${counts.review === 1 ? "item needs" : "items need"} qualified review before that conclusion is relied on.`;
        } else if (counts.missing) {
            currentPosition = "No requirement is currently indicated as directly applicable, but unanswered information could change the result.";
        } else {
            currentPosition = "No People-compliance law is currently indicated as applicable from the answers supplied. This is not a legal exemption or certification.";
        }

        const meaning = `${currentPosition} ${workforceGuidance(profile)} ${legalStructureGuidance(profile)}`;
        const ahead = `${sectorGuidance(profile)} ${operatingGuidance(profile)}${profile.expansion.length ? ` The stated growth priorities—${compact(profile.expansion.slice(0, 3).join(", "), 130)}—should trigger a fresh review before implementation.` : ""}`;
        const nextStep = counts.applicable || counts.review || counts.missing
            ? "Begin with the first action card, confirm the official source, assign an accountable owner and set a target date."
            : profile.ownerOnly
                ? "Keep a simple owner-led compliance file and repeat the assessment before the first employee, regular contractor, new workplace, new state or regulated activity."
                : "Keep the organisation profile and supporting records together, then regenerate the brief before a material workforce, location, shift or activity change.";

        return { profile, counts, overview, meaning, ahead, nextStep };
    }

    function renderExecutiveSummary(writer, rows, data) {
        const copy = executiveCopy(data, rows);
        const profile = copy.profile;
        const peopleProfile = profile.ownerOnly
            ? "Owner/director only; no non-owner workforce reported."
            : `${profile.employees} employees · ${profile.workers} workers · ${profile.contractors} contractors`;
        writer.sectionPage("executive", "Executive summary", copy.overview);
        writer.infoCard(`${profile.companyName} at a glance`, [
            ["Legal structure", profile.legalStructure],
            ["Sector", profile.industry],
            ["People profile", peopleProfile],
            ["Operating context", `${profile.state} · ${profile.workModel}`]
        ], { accent: writer.colours.blue, maxChars: 190 });

        writer.infoCard("What this means for you", [
            ["Current position", copy.meaning],
            ["Why this is useful", "The summary combines legal structure, sector, workforce scale and mix, locations, working model, shifts and activities rather than using one generic message."]
        ], {
            accent: copy.counts.applicable ? writer.colours.green : copy.counts.review ? writer.colours.amber : writer.colours.blue,
            maxChars: 330
        });

        writer.infoCard("What lies ahead", [
            ["Business outlook", copy.ahead],
            ["Best next step", copy.nextStep]
        ], { accent: writer.colours.accent, maxChars: 330 });
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
            "A quick reading of the current People-compliance position. Each status is stated as an outcome, not just a number."
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

    function serialise(doc, theme, data) {
        const dataUri = doc.output("datauristring");
        const buffer = doc.output("arraybuffer");
        const company = clean(data.companyName, "Organisation")
            .replace(/[^a-z0-9]+/gi, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 60) || "Organisation";
        const edition = theme === "dark" ? "Dark" : "Light";
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

    function renderEditionInto(doc, theme, rows, model, payload, trace, logo) {
        const colours = palette(theme);
        const data = mergeSource(payload, model);
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
        const edition = renderEditionInto(doc, theme, rows, model, payload, trace, logo);
        return serialise(doc, theme, edition.data);
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
        executiveCopy
    });

    window.GrowWithHRVisualReportCore = enhancedCore;
    window.GrowWithHRVisualReportRenderers = enhancedRenderers;
    window.GrowWithHRExecutiveSummaryReport = Object.freeze({
        version: VERSION,
        structureVersion: STRUCTURE_VERSION,
        ownerOnlyProfile,
        organisationProfile,
        executiveCopy
    });
})();
