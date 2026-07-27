/* GrowWithHR v0.21 visual report section renderers */
(() => {
    "use strict";

    const core = window.GrowWithHRVisualReportCore;
    if (!core) throw new Error("GrowWithHR visual report core must load first.");
    const { clean, compact, unique, actionRows, actionId, statusColour, mergeSource, palette, createWriter, addFooter, serialise } = core;

    function renderCover(doc, colours, data, theme, logo) {
        doc.setFillColor(...colours.page); doc.rect(0, 0, 210, 297, "F");
        doc.setFillColor(...colours.accent); doc.rect(0, 0, 210, 10, "F");
        if (logo) { try { doc.addImage(logo, "PNG", 18, 22, 28, 28, undefined, "FAST"); } catch (_error) {} }
        doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...colours.accent);
        doc.text("HRTECHIFY · GROWWITHHR", logo ? 52 : 18, 34);
        doc.setFontSize(28); doc.setTextColor(...colours.heading);
        doc.text("Your People & Compliance", 18, 78); doc.text("Action Brief", 18, 91);
        doc.setFontSize(16); doc.text(clean(data.companyName, "Your Organisation"), 18, 118, { maxWidth: 174 });
        doc.setFont("helvetica", "normal"); doc.setFontSize(9.5); doc.setTextColor(...colours.muted);
        doc.text("Designed for quick decisions—not a legal lecture.", 18, 137);
        [["1","See the position"],["2","Act on priorities"],["3","Recheck as you grow"]].forEach(([number, text], index) => {
            const x = 18 + index * 59;
            doc.setFillColor(...colours.surface); doc.setDrawColor(...colours.line); doc.roundedRect(x, 171, 53, 45, 3, 3, "FD");
            doc.setFillColor(...colours.accent); doc.circle(x + 11, 184, 6, "F");
            doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...colours.page); doc.text(number, x + 11, 186, { align: "center" });
            doc.setTextColor(...colours.heading); doc.setFontSize(8.3); doc.text(doc.splitTextToSize(text, 38), x + 7, 199, { lineHeightFactor: 1.18, maxWidth: 38 });
        });
        doc.setFont("helvetica", "normal"); doc.setFontSize(7.8); doc.setTextColor(...colours.muted);
        doc.text(`${theme === "dark" ? "Dark" : "Light"} edition · Confidential working document · General guidance only`, 18, 260, { maxWidth: 174 });
    }

    function renderOverview(writer, rows) {
        const actions = actionRows(rows);
        const counts = {
            applicable: rows.filter((row) => row.status === "Applicable").length,
            review: rows.filter((row) => row.status === "Review required").length,
            missing: rows.filter((row) => row.status === "Needs information").length,
            watch: rows.filter((row) => row.status === "Not currently triggered").length
        };
        writer.sectionPage("At a glance", "The current position in one page.");
        const top = writer.getY();
        writer.statCard(16, top, 84, counts.applicable, "Applicable now", writer.colours.green);
        writer.statCard(110, top, 84, counts.review, "Needs review", writer.colours.amber);
        writer.statCard(16, top + 42, 84, counts.missing, "Information needed", writer.colours.red);
        writer.statCard(110, top + 42, 84, counts.watch, "Watch as you grow", writer.colours.blue);
        writer.setY(top + 88);
        if (!actions.length) {
            writer.infoCard("No immediate priority generated", [["What this means", "No current contextual law check requires action from the answers supplied. Reassess after a material change."]], { accent: writer.colours.green });
            return;
        }
        actions.slice(0, 3).forEach((row, index) => writer.infoCard(`${actionId(row, index)} · ${clean(row.shortTitle, "Priority item")}`, [["Status", row.status], ["Next move", compact(row.requiredAction, 125)]], { accent: statusColour(row.status, writer.colours), maxChars: 135 }));
    }

    function renderActions(writer, rows) {
        const actions = actionRows(rows);
        if (!actions.length) return;
        writer.sectionPage("What to do now", "Each card shows why it appears, what to do and what is still needed.");
        actions.forEach((row, index) => {
            const missing = unique(row.missingQuestions || []).slice(0, 2);
            writer.infoCard(`${actionId(row, index)} · ${clean(row.shortTitle, "Action")}`, [
                ["Status", row.status],
                ["Why", compact(row.thresholdResult?.explanation || row.whyIncluded || "The organisation profile makes this item relevant.", 175)],
                ["Do next", compact(row.requiredAction || "Confirm the position, assign an owner and retain evidence.", 190)],
                ["Need", missing.length ? missing.join(" · ") : "No assessment answer is missing."]
            ], { accent: statusColour(row.status, writer.colours), maxChars: 200 });
            writer.linkChip("Official source", row.url || row.officialUrl || row.sourceUrl, writer.colours.blue);
        });
    }

    function renderQuestions(writer, rows, trace) {
        const questions = unique(actionRows(rows).flatMap((row) => row.missingQuestions || []));
        if (!questions.length && !trace?.changes?.length) return;
        writer.sectionPage("Complete the picture", "Only unanswered items that can change the advice are shown.");
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
        writer.sectionPage("Your 90-day plan", "A simple sequence for assigning owners, confirming evidence and closing gaps.");
        writer.timelineCard("0–30", "Confirm and assign", ids.slice(0, 2).join(", ") || "Confirm the current organisation profile.", writer.colours.red);
        writer.timelineCard("31–60", "Document and implement", ids.slice(2, 4).join(", ") || "Create the records and routines identified in the first phase.", writer.colours.amber);
        writer.timelineCard("61–90", "Review and embed", ids.slice(4).join(", ") || "Review completed actions and establish a recurring check-in.", writer.colours.green);
    }

    function renderWatch(writer, rows) {
        const dormant = rows.filter((row) => row.status === "Not currently triggered");
        if (!dormant.length) return;
        writer.sectionPage("Watch as you grow", "Revisit these items after a relevant workforce or operating change.");
        writer.compactTable(["Item", "Current position", "Recheck when"], dormant.map((row) => [
            clean(row.shortTitle, "Law"),
            compact(row.thresholdResult?.positionText || row.thresholdResult?.label || "Below the usual trigger", 80),
            compact(row.reassessWhen || row.futureTrigger || row.thresholdResult?.triggerText || "Workforce or operations change", 90)
        ]), [56, 58, 64]);
    }

    function renderProfile(writer, data) {
        const sectorApi = window.GrowWithHRSectorContextIntelligence;
        const context = typeof sectorApi?.contextFor === "function" ? sectorApi.contextFor(data) : {};
        writer.sectionPage("The profile used", "These answers shaped the report. Update them whenever the organisation changes.");
        writer.infoCard("Organisation", [["Name", clean(data.companyName, "Your Organisation")], ["Legal structure", clean(data.entity || data.legalStructure || data.establishmentType, "Not specified")], ["Industry", clean(data.customIndustry || data.industry, "Not specified")], ["Primary state", clean(data.primaryState || data.state, "Not specified")]], { accent: writer.colours.blue });
        writer.infoCard("People and operations", [["Employees", clean(data.employees || data.employeeCount || data.headcount, "0")], ["Workers / contractors", `${clean(data.workers, "0")} / ${clean(data.contractors || data.contractWorkers, "0")}`], ["Working model", clean(data.workModel, "Not specified")], ["Sector profile", clean(context.profile, "Context-led")]], { accent: writer.colours.accent });
        writer.infoCard("Important boundary", [["Use", "General business and people-management guidance."], ["Do not treat as", "Legal certification or proof that a policy, registration, payment, committee or record exists."], ["Before acting", "Confirm current requirements with official sources and qualified professionals."]], { accent: writer.colours.red });
    }

    function renderEnd(writer, data, logo) {
        writer.sectionPage("Next step", "Turn the priority cards into owned work, then regenerate the brief after a material change.");
        if (logo) { try { writer.document.addImage(logo, "PNG", 83, 70, 44, 44, undefined, "FAST"); } catch (_error) {} }
        writer.setY(130);
        writer.infoCard(clean(data.companyName, "Your Organisation"), [["Review rhythm", "Revisit after a workforce, state, legal-structure or operating-model change."], ["Share carefully", "This is a confidential leadership working document."]], { accent: writer.colours.accent });
    }

    function buildVariant(JsPDF, theme, rows, model, payload, trace, logo) {
        const doc = new JsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true, putOnlyUsedFonts: true });
        const colours = palette(theme);
        const data = mergeSource(payload, model);
        renderCover(doc, colours, data, theme, logo);
        doc.addPage();
        const writer = createWriter(doc, colours);
        renderOverview(writer, rows);
        renderActions(writer, rows);
        renderQuestions(writer, rows, trace);
        renderRoadmap(writer, rows);
        renderWatch(writer, rows);
        renderProfile(writer, data);
        renderEnd(writer, data, logo);
        addFooter(doc, colours, data.companyName);
        return serialise(doc, theme, data);
    }

    window.GrowWithHRVisualReportRenderers = Object.freeze({ renderCover, renderOverview, renderActions, renderQuestions, renderRoadmap, renderWatch, renderProfile, renderEnd, buildVariant });
})();
