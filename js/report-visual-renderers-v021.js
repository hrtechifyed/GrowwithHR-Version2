/* GrowWithHR v0.21 visual report section renderers */
(() => {
    "use strict";

    const core = window.GrowWithHRVisualReportCore;
    if (!core) throw new Error("GrowWithHR visual report core must load first.");
    const { clean, compact, unique, actionRows, actionId, statusColour, mergeSource, palette, createWriter, addFooter, serialise } = core;
    const INDIA_CODE_URL = "https://www.indiacode.nic.in/";

    function officialSourceFor(row = {}) {
        return clean(
            row.url || row.officialUrl || row.sourceUrl || row.statePortalUrl ||
            row.officialSourceUrl || row.legalSourceUrl,
            INDIA_CODE_URL
        );
    }

    function drawCentredLogo(doc, logo, x = 78, y = 24, size = 54) {
        if (!logo) return;
        try { doc.addImage(logo, "PNG", x, y, size, size, undefined, "FAST"); } catch (_error) {}
    }

    function renderCover(doc, colours, data, theme, logo) {
        doc.setFillColor(...colours.page); doc.rect(0, 0, 210, 297, "F");
        doc.setFillColor(...colours.accent); doc.rect(0, 0, 210, 10, "F");
        drawCentredLogo(doc, logo);
        doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...colours.accent);
        doc.text("HRTECHIFY · GROWWITHHR", 105, 88, { align: "center" });
        doc.setFontSize(25); doc.setTextColor(...colours.heading);
        doc.text("Your People & Compliance", 105, 111, { align: "center" });
        doc.text("Action Brief", 105, 124, { align: "center" });
        doc.setFontSize(15); doc.text(clean(data.companyName, "Your Organisation"), 105, 150, { align: "center", maxWidth: 170 });
        doc.setFont("helvetica", "normal"); doc.setFontSize(9.2); doc.setTextColor(...colours.muted);
        doc.text("Designed for quick decisions—not a legal lecture.", 105, 166, { align: "center" });
        [["1","Understand the position"],["2","Act on priorities"],["3","Recheck as you grow"]].forEach(([number, text], index) => {
            const x = 18 + index * 59;
            doc.setFillColor(...colours.surface); doc.setDrawColor(...colours.line); doc.roundedRect(x, 190, 53, 42, 3, 3, "FD");
            doc.setFillColor(...colours.accent); doc.circle(x + 11, 202, 6, "F");
            doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...colours.page); doc.text(number, x + 11, 204, { align: "center" });
            doc.setTextColor(...colours.heading); doc.setFontSize(8); doc.text(doc.splitTextToSize(text, 37), x + 7, 216, { lineHeightFactor: 1.16, maxWidth: 37 });
        });
        doc.setFont("helvetica", "normal"); doc.setFontSize(7.8); doc.setTextColor(...colours.muted);
        doc.text(`${theme === "dark" ? "Dark" : "Light"} edition · Confidential working document · General guidance only`, 105, 258, { align: "center", maxWidth: 174 });
    }

    function renderContents(doc, colours, sectionPages) {
        doc.setPage(2);
        doc.setFillColor(...colours.page); doc.rect(0, 0, 210, 297, "F");
        doc.setFillColor(...colours.accent); doc.rect(0, 0, 210, 10, "F");
        doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...colours.accent);
        doc.text("REPORT NAVIGATION", 16, 28);
        doc.setFontSize(22); doc.setTextColor(...colours.heading);
        doc.text("Table of Contents", 16, 43);
        doc.setFont("helvetica", "normal"); doc.setFontSize(8.8); doc.setTextColor(...colours.muted);
        doc.text("Use this page to move directly to the decision, action or monitoring section you need.", 16, 54, { maxWidth: 168 });

        const labels = {
            overview: ["At a glance", "What the status counts mean"],
            actions: ["What to do now", "Priority actions and official sources"],
            questions: ["Complete the picture", "Answers that could change the result"],
            roadmap: ["Your 90-day plan", "A simple implementation sequence"],
            watch: ["Watch as you grow", "When to reassess dormant items"],
            profile: ["The profile used", "The inputs behind this brief"],
            end: ["End of Report", "Closing guidance and review rhythm"]
        };
        let y = 72;
        Object.entries(labels).forEach(([key, [title, description]], index) => {
            const page = sectionPages[key];
            if (!page) return;
            const height = 22;
            doc.setFillColor(...(index % 2 ? colours.surface : colours.surfaceAlt));
            doc.setDrawColor(...colours.line);
            doc.roundedRect(16, y, 178, height, 2.5, 2.5, "FD");
            doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(...colours.heading);
            doc.text(title, 23, y + 8);
            doc.setFont("helvetica", "normal"); doc.setFontSize(7.3); doc.setTextColor(...colours.muted);
            doc.text(description, 23, y + 15);
            doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(...colours.accent);
            doc.text(String(page), 186, y + 12, { align: "right" });
            y += height + 5;
        });
    }

    function renderOverview(writer, rows) {
        const actions = actionRows(rows);
        const counts = {
            applicable: rows.filter((row) => row.status === "Applicable").length,
            review: rows.filter((row) => row.status === "Review required").length,
            missing: rows.filter((row) => row.status === "Needs information").length,
            watch: rows.filter((row) => row.status === "Not currently triggered").length
        };
        writer.sectionPage("overview", "At a glance", "A plain-language summary of what the assessment indicates and what still needs confirmation.");
        const top = writer.getY();
        writer.statCard(16, top, 84, counts.applicable || "None", "currently indicated as applicable", writer.colours.green);
        writer.statCard(110, top, 84, counts.review || "None", "need qualified review", writer.colours.amber);
        writer.statCard(16, top + 50, 84, counts.missing || "None", "need more information", writer.colours.red);
        writer.statCard(110, top + 50, 84, counts.watch || "None", "may matter after a change", writer.colours.blue);
        writer.setY(top + 100);

        writer.infoCard("How to read these results", [
            ["Applicable", counts.applicable
                ? `${counts.applicable} People compliance ${counts.applicable === 1 ? "check appears" : "checks appear"} to meet the usual trigger from the answers supplied. Confirm the current legal position and retain evidence.`
                : "No People compliance law is currently indicated as applicable from the answers supplied. This is not a legal exemption or certification."],
            ["Needs review", counts.review
                ? `${counts.review} ${counts.review === 1 ? "item depends" : "items depend"} on state rules, establishment details or professional confirmation before a conclusion is reached.`
                : "No item currently requires a separate qualified review."],
            ["Information needed", counts.missing
                ? `${counts.missing} ${counts.missing === 1 ? "result could" : "results could"} change when the unanswered information is confirmed.`
                : "No unanswered assessment item is currently holding back a result."],
            ["Watch as you grow", counts.watch
                ? `${counts.watch} ${counts.watch === 1 ? "item is" : "items are"} below the usual trigger or not active today, but should be reassessed after a relevant change.`
                : "No additional dormant trigger has been identified for monitoring."]
        ], { accent: writer.colours.blue, maxChars: 220 });

        if (!actions.length) {
            writer.infoCard("No current priority action", [["Meaning", "No contextual law check currently requires an action from the answers supplied. Reassess after a material workforce, state, legal-structure or operating-model change."]], { accent: writer.colours.green, maxChars: 220 });
            return;
        }
        writer.label("Leading priorities", writer.colours.accent);
        actions.slice(0, 3).forEach((row, index) => writer.infoCard(`${actionId(row, index)} · ${clean(row.shortTitle, "Priority item")}`, [["Status", row.status], ["Next move", compact(row.requiredAction, 125)]], { accent: statusColour(row.status, writer.colours), maxChars: 135 }));
    }

    function renderActions(writer, rows) {
        const actions = actionRows(rows);
        if (!actions.length) return;
        writer.sectionPage("actions", "What to do now", "Each card keeps the reason, next move, missing information and official source together.");
        actions.forEach((row, index) => {
            const missing = unique(row.missingQuestions || []).slice(0, 2);
            writer.infoCard(`${actionId(row, index)} · ${clean(row.shortTitle, "Action")}`, [
                ["Status", row.status],
                ["Why this appears", compact(row.thresholdResult?.explanation || row.whyIncluded || "The organisation profile makes this item relevant.", 175)],
                ["Do next", compact(row.requiredAction || "Confirm the position, assign an owner and retain evidence.", 190)],
                ["Still needed", missing.length ? missing.join(" · ") : "No assessment answer is missing."]
            ], {
                accent: statusColour(row.status, writer.colours),
                maxChars: 200,
                link: { label: "Open official source", url: officialSourceFor(row) }
            });
        });
    }

    function renderQuestions(writer, rows, trace) {
        const questions = unique(actionRows(rows).flatMap((row) => row.missingQuestions || []));
        if (!questions.length && !trace?.changes?.length) return;
        writer.sectionPage("questions", "Complete the picture", "Only unanswered items that can change the advice are shown.");
        questions.forEach((question) => writer.checkItem(question));
        if (trace?.changes?.length) {
            writer.label("Changed since last report", writer.colours.amber);
            trace.changes.slice(0, 8).forEach((change) => writer.checkItem(`${change.field}: ${change.before} → ${change.after}`, writer.colours.amber));
        }
    }

    function renderRoadmap(writer, rows) {
        const actions = actionRows(rows);
        if (!actions.length) return;
        const ids = actions.map((row, index) => actionId(row, index));
        writer.sectionPage("roadmap", "Your 90-day plan", "A simple sequence for assigning owners, confirming evidence and closing gaps.");
        writer.timelineCard("0–30", "Confirm and assign", ids.slice(0, 2).join(", ") || "Confirm the current organisation profile.", writer.colours.red);
        writer.timelineCard("31–60", "Document and implement", ids.slice(2, 4).join(", ") || "Create the records and routines identified in the first phase.", writer.colours.amber);
        writer.timelineCard("61–90", "Review and embed", ids.slice(4).join(", ") || "Review completed actions and establish a recurring check-in.", writer.colours.green);
    }

    function renderWatch(writer, rows) {
        const dormant = rows.filter((row) => row.status === "Not currently triggered");
        if (!dormant.length) return;
        writer.sectionPage("watch", "Watch as you grow", "Revisit these items after a relevant workforce or operating change.");
        writer.compactTable(["Item", "Current position", "Recheck when"], dormant.map((row) => [
            clean(row.shortTitle, "Law"),
            compact(row.thresholdResult?.positionText || row.thresholdResult?.label || "Below the usual trigger", 80),
            compact(row.reassessWhen || row.futureTrigger || row.thresholdResult?.triggerText || "Workforce or operations change", 90)
        ]), [56, 58, 64]);
    }

    function renderProfile(writer, data) {
        const sectorApi = window.GrowWithHRSectorContextIntelligence;
        const context = typeof sectorApi?.contextFor === "function" ? sectorApi.contextFor(data) : {};
        writer.sectionPage("profile", "The profile used", "These answers shaped the report. Update them whenever the organisation changes.");
        writer.infoCard("Organisation", [["Name", clean(data.companyName, "Your Organisation")], ["Legal structure", clean(data.entity || data.legalStructure || data.establishmentType, "Not specified")], ["Industry", clean(data.customIndustry || data.industry, "Not specified")], ["Primary state", clean(data.primaryState || data.state, "Not specified")]], { accent: writer.colours.blue });
        writer.infoCard("People and operations", [["Employees", clean(data.employees || data.employeeCount || data.headcount, "0")], ["Workers / contractors", `${clean(data.workers, "0")} / ${clean(data.contractors || data.contractWorkers, "0")}`], ["Working model", clean(data.workModel, "Not specified")], ["Sector profile", clean(context.profile, "Context-led")]], { accent: writer.colours.accent });
        writer.infoCard("Important boundary", [["Use", "General business and people-management guidance."], ["Do not treat as", "Legal certification or proof that a policy, registration, payment, committee or record exists."], ["Before acting", "Confirm current requirements with official sources and qualified professionals."]], { accent: writer.colours.red });
    }

    function renderEnd(writer, data, logo) {
        writer.newPage();
        writer.sectionPages.end = writer.document.getNumberOfPages();
        const doc = writer.document;
        const colours = writer.colours;
        doc.setFillColor(...colours.accent); doc.rect(0, 0, 210, 10, "F");
        drawCentredLogo(doc, logo, 78, 28, 54);
        doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...colours.accent);
        doc.text("HRTECHIFY · GROWWITHHR", 105, 92, { align: "center" });
        doc.setFontSize(25); doc.setTextColor(...colours.heading);
        doc.text("End of Report", 105, 119, { align: "center" });
        doc.setFontSize(15); doc.text(clean(data.companyName, "Your Organisation"), 105, 142, { align: "center", maxWidth: 170 });
        doc.setFillColor(...colours.surface); doc.setDrawColor(...colours.line);
        doc.roundedRect(24, 168, 162, 56, 3, 3, "FD");
        doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(...colours.heading);
        doc.text("What happens next", 105, 184, { align: "center" });
        doc.setFont("helvetica", "normal"); doc.setFontSize(8.6); doc.setTextColor(...colours.text);
        doc.text(doc.splitTextToSize("Assign the priority actions, retain evidence and regenerate this brief after a material workforce, state, legal-structure or operating-model change.", 138), 105, 198, { align: "center", lineHeightFactor: 1.25, maxWidth: 138 });
        doc.setFontSize(7.8); doc.setTextColor(...colours.muted);
        doc.text("Confidential leadership working document · General guidance only", 105, 252, { align: "center" });
    }

    function buildVariant(JsPDF, theme, rows, model, payload, trace, logo) {
        const doc = new JsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true, putOnlyUsedFonts: true });
        const colours = palette(theme);
        const data = mergeSource(payload, model);
        const sectionPages = {};
        renderCover(doc, colours, data, theme, logo);
        doc.addPage();
        doc.addPage();
        const writer = createWriter(doc, colours, sectionPages);
        renderOverview(writer, rows);
        renderActions(writer, rows);
        renderQuestions(writer, rows, trace);
        renderRoadmap(writer, rows);
        renderWatch(writer, rows);
        renderProfile(writer, data);
        renderEnd(writer, data, logo);
        renderContents(doc, colours, sectionPages);
        addFooter(doc, colours, data.companyName);
        return serialise(doc, theme, data);
    }

    window.GrowWithHRVisualReportRenderers = Object.freeze({ renderCover, renderContents, renderOverview, renderActions, renderQuestions, renderRoadmap, renderWatch, renderProfile, renderEnd, buildVariant, officialSourceFor });
})();