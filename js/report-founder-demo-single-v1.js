/* GrowWithHR founder-demo single report renderer */
(() => {
    "use strict";

    const baseCore = window.GrowWithHRVisualReportCore;
    const baseRenderers = window.GrowWithHRVisualReportRenderers;
    if (!baseCore || !baseRenderers) {
        throw new Error("GrowWithHR visual report core and renderers must load before the founder-demo single report.");
    }

    const VERSION = "1.0.0-founder-demo-single-report";
    const TEMPLATE_ID = "hrtechify-founder-compliance-growth-v1";
    const LOGO_ASSET = "assets/hrtechify-logo.png";
    const PAGE = Object.freeze({ width: 210, height: 297, left: 18, right: 192, top: 22, bottom: 265 });
    const COLOURS = Object.freeze({
        page: [255, 255, 255],
        heading: [10, 35, 66],
        text: [35, 51, 71],
        muted: [93, 109, 129],
        line: [219, 226, 234],
        surface: [247, 249, 252],
        accent: [217, 119, 6],
        blue: [37, 99, 235],
        green: [21, 128, 61],
        amber: [180, 83, 9],
        red: [185, 28, 28]
    });

    const clean = (value, fallback = "") => String(value ?? "").replace(/\s+/g, " ").trim() || fallback;
    const values = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
    const mergeSource = (payload = {}, model = {}) => Object.assign({}, payload, payload.lead || {}, payload.answers || {}, payload.report || {}, model || {});

    function displayDate(value) {
        const date = value ? new Date(value) : new Date();
        try {
            return new Intl.DateTimeFormat("en-IN", {
                timeZone: "Asia/Kolkata",
                day: "2-digit",
                month: "long",
                year: "numeric"
            }).format(date);
        } catch (_error) {
            return date.toISOString().slice(0, 10);
        }
    }

    function displayTimestamp(value) {
        const date = value ? new Date(value) : new Date();
        try {
            return new Intl.DateTimeFormat("en-IN", {
                timeZone: "Asia/Kolkata",
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
            }).format(date);
        } catch (_error) {
            return date.toISOString();
        }
    }

    function founderStatus(status) {
        if (status === "Applicable") return "Relevant now";
        if (status === "Needs information") return "More information required";
        if (status === "Review required") return "Review needed";
        return "Watch as you grow";
    }

    function statusColour(status) {
        if (status === "Applicable") return COLOURS.green;
        if (status === "Needs information") return COLOURS.red;
        if (status === "Review required") return COLOURS.amber;
        return COLOURS.blue;
    }

    function sourceUrl(row = {}) {
        return clean(row.url || row.officialUrl || row.sourceUrl || row.statePortalUrl || row.officialSourceUrl || row.legalSourceUrl);
    }

    function rowName(row = {}) {
        return clean(row.shortTitle || row.title, "Compliance area");
    }

    function verificationItems(row = {}) {
        const text = `${row.id || ""} ${rowName(row)}`.toLowerCase();
        if (/posh|sexual harassment|internal committee/.test(text)) {
            return [
                "Applicable Internal Committee and governance requirements",
                "Required policy and workplace communication",
                "Awareness and training requirements",
                "Required records and reporting obligations"
            ];
        }
        if (/maternity/.test(text)) {
            return [
                "Applicable leave and benefit administration requirements",
                "Required policy and employee communication",
                "Relevant records and payroll processes",
                "When an individual entitlement needs HR or specialist review"
            ];
        }
        if (/provident|epf|pf /.test(text)) {
            return [
                "Coverage and registration position where applicable",
                "Employee eligibility and payroll information",
                "Contribution administration process",
                "Records used to support the organisation's position"
            ];
        }
        if (/esi|state insurance/.test(text)) {
            return [
                "Establishment coverage and registration position",
                "Relevant wage-eligibility information",
                "Employee and payroll records",
                "Contribution administration process where applicable"
            ];
        }
        if (/shop|establishment/.test(text)) {
            return [
                "Registration or renewal requirements for the relevant establishment",
                "Working-time, leave and workplace notice requirements",
                "Required registers and records",
                "State-specific requirements that need confirmation"
            ];
        }
        if (/contract|contractor/.test(text)) {
            return [
                "Principal-employer and contractor arrangements",
                "Registration or licensing requirements where applicable",
                "Contractor workforce records",
                "Responsibilities that remain with the organisation"
            ];
        }
        if (/gratuity/.test(text)) {
            return ["Applicable eligibility framework", "Nomination and record requirements", "Internal administration process", "When an individual entitlement requires specialist review"];
        }
        if (/wage|bonus/.test(text)) {
            return ["Applicable employee categories", "Current wage or eligibility information", "Payroll administration requirements", "Required records and notices"];
        }
        if (/factory|safety|osh/.test(text)) {
            return ["Establishment and worker classification", "Licensing or registration requirements where applicable", "Health, safety and welfare controls", "Required records and notices"];
        }
        return [
            "The organisational requirements associated with this compliance area",
            "Any policy, process or governance requirements that apply",
            "Relevant records or notices",
            "When specialist review is appropriate"
        ];
    }

    function companyFactRows(data = {}) {
        const operatingStates = Array.isArray(data.operatingStates) ? data.operatingStates.join(", ") : clean(data.operatingStates);
        return [
            ["Company", clean(data.companyName, "Your Organisation")],
            ["Legal structure", clean(data.entity || data.legalStructure || data.establishmentType)],
            ["Industry", clean(data.customIndustry || data.industry)],
            ["Primary State / location", clean(data.primaryState || data.state)],
            ["Operating States", operatingStates],
            ["Employees", clean(data.employees || data.employeeCount || data.headcount)],
            ["Women employees", clean(data.womenEmployees || data.femaleEmployees || data.hasWomenEmployees)],
            ["Contractors", clean(data.contractors || data.contractWorkers || data.contractorCount)],
            ["Workers", clean(data.workers || data.workerCount || data.workmen)],
            ["Working model", clean(data.workModel)],
            ["Planned workforce", clean(data.plannedEmployees || data.plannedHeadcount || data.futureEmployees || data.targetHeadcount)]
        ].filter((row) => row[1] !== "");
    }

    function knownFactsFor(row = {}, data = {}) {
        const facts = [];
        const threshold = row.thresholdResult || {};
        if (clean(threshold.positionText)) facts.push(threshold.positionText);
        const state = clean(data.primaryState || data.state);
        if (state) facts.push(`Primary State / location: ${state}`);
        const entity = clean(data.entity || data.legalStructure || data.establishmentType);
        if (entity) facts.push(`Establishment / legal structure: ${entity}`);
        return [...new Set(facts)].slice(0, 3);
    }

    function reportSummary(rows = []) {
        return {
            relevant: rows.filter((row) => row.status === "Applicable"),
            review: rows.filter((row) => row.status === "Review required"),
            missing: rows.filter((row) => row.status === "Needs information"),
            watch: rows.filter((row) => row.status === "Not currently triggered")
        };
    }

    function buildWriter(doc, logo, data) {
        let y = PAGE.top;
        const split = (value, width = PAGE.right - PAGE.left) => doc.splitTextToSize(clean(value), width);
        const lineHeight = (size, factor = 1.28) => size * 0.3528 * factor;

        function paintPage() {
            doc.setFillColor(...COLOURS.page);
            doc.rect(0, 0, PAGE.width, PAGE.height, "F");
        }

        function newPage() {
            doc.addPage();
            paintPage();
            y = PAGE.top;
        }

        function ensure(height) {
            if (y + height > PAGE.bottom) newPage();
        }

        function text(value, options = {}) {
            const content = clean(value);
            if (!content) return;
            const size = Number(options.size || 9);
            const width = Number(options.width || PAGE.right - PAGE.left);
            const factor = Number(options.factor || 1.3);
            const lines = split(content, width);
            const height = lines.length * lineHeight(size, factor);
            ensure(height + Number(options.after ?? 4));
            doc.setFont("helvetica", options.bold ? "bold" : "normal");
            doc.setFontSize(size);
            doc.setTextColor(...(options.colour || COLOURS.text));
            doc.text(lines, Number(options.x ?? PAGE.left), y, {
                lineHeightFactor: factor,
                maxWidth: width,
                align: options.align || "left"
            });
            y += height + Number(options.after ?? 4);
        }

        function rule() {
            ensure(8);
            doc.setDrawColor(...COLOURS.line);
            doc.setLineWidth(0.35);
            doc.line(PAGE.left, y, PAGE.right, y);
            y += 8;
        }

        function section(title, intro = "") {
            if (y > PAGE.top + 4) newPage();
            text(title.toUpperCase(), { size: 7.5, bold: true, colour: COLOURS.accent, after: 5 });
            text(title, { size: 20, bold: true, colour: COLOURS.heading, factor: 1.12, after: intro ? 5 : 10 });
            if (intro) text(intro, { size: 9, colour: COLOURS.muted, after: 10 });
        }

        function subheading(value, colour = COLOURS.heading) {
            text(value, { size: 11.5, bold: true, colour, after: 5 });
        }

        function label(value, colour = COLOURS.muted) {
            text(value.toUpperCase(), { size: 7, bold: true, colour, after: 3 });
        }

        function bullet(value, colour = COLOURS.text) {
            const content = clean(value);
            if (!content) return;
            const lines = split(content, 162);
            const height = lines.length * lineHeight(8.8, 1.28) + 3;
            ensure(height);
            doc.setFillColor(...COLOURS.accent);
            doc.circle(PAGE.left + 2, y - 1.4, 0.75, "F");
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8.8);
            doc.setTextColor(...colour);
            doc.text(lines, PAGE.left + 7, y, { lineHeightFactor: 1.28, maxWidth: 162 });
            y += height;
        }

        function note(title, body) {
            const titleLines = split(title, 158);
            const bodyLines = split(body, 158);
            const height = 12 + titleLines.length * lineHeight(9.5, 1.2) + bodyLines.length * lineHeight(8.5, 1.3) + 8;
            ensure(height + 6);
            doc.setFillColor(...COLOURS.surface);
            doc.setDrawColor(...COLOURS.line);
            doc.roundedRect(PAGE.left, y - 3, 174, height, 2, 2, "FD");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9.5);
            doc.setTextColor(...COLOURS.heading);
            doc.text(titleLines, PAGE.left + 8, y + 4, { lineHeightFactor: 1.2, maxWidth: 158 });
            const bodyY = y + 7 + titleLines.length * lineHeight(9.5, 1.2);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8.5);
            doc.setTextColor(...COLOURS.text);
            doc.text(bodyLines, PAGE.left + 8, bodyY, { lineHeightFactor: 1.3, maxWidth: 158 });
            y += height + 5;
        }

        function keyValueRows(rows) {
            rows.filter((row) => clean(row?.[1])).forEach(([key, value]) => {
                const valueLines = split(value, 112);
                const height = Math.max(9, valueLines.length * lineHeight(8.5, 1.24) + 4);
                ensure(height + 1);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(7.5);
                doc.setTextColor(...COLOURS.muted);
                doc.text(clean(key).toUpperCase(), PAGE.left, y + 4);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(8.5);
                doc.setTextColor(...COLOURS.text);
                doc.text(valueLines, PAGE.left + 58, y + 4, { lineHeightFactor: 1.24, maxWidth: 112 });
                doc.setDrawColor(...COLOURS.line);
                doc.line(PAGE.left, y + height, PAGE.right, y + height);
                y += height + 2;
            });
            y += 4;
        }

        function link(labelText, url) {
            const href = clean(url);
            if (!href) return;
            ensure(10);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8);
            doc.setTextColor(...COLOURS.blue);
            if (typeof doc.textWithLink === "function") {
                doc.textWithLink(labelText, PAGE.left, y, { url: href });
            } else {
                doc.text(labelText, PAGE.left, y);
            }
            y += 7;
        }

        paintPage();
        return { newPage, ensure, text, rule, section, subheading, label, bullet, note, keyValueRows, link, getY: () => y, setY: (value) => { y = value; } };
    }

    function drawCentredLogo(doc, logo, y = 48, size = 58) {
        if (!logo) return;
        try { doc.addImage(logo, "PNG", (210 - size) / 2, y, size, size, undefined, "FAST"); } catch (_error) {}
    }

    function renderCover(doc, logo, data) {
        doc.setFillColor(...COLOURS.page);
        doc.rect(0, 0, 210, 297, "F");
        drawCentredLogo(doc, logo, 42, 62);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...COLOURS.heading);
        doc.setFontSize(25);
        doc.text("HR COMPLIANCE", 105, 132, { align: "center" });
        doc.text("& GROWTH REPORT", 105, 145, { align: "center" });
        doc.setFontSize(14);
        doc.text(clean(data.companyName, "Your Organisation"), 105, 172, { align: "center", maxWidth: 170 });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...COLOURS.muted);
        doc.text(displayDate(data.generatedAt), 105, 188, { align: "center" });
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(...COLOURS.accent);
        doc.text("POWERED BY GROWWITHHR", 105, 233, { align: "center" });
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...COLOURS.muted);
        doc.text("Research Prototype", 105, 244, { align: "center" });
    }

    function renderCompanyProfile(writer, data) {
        writer.section("Your company profile", "This report is based on the company information supplied in your GrowWithHR assessment. If these facts change, the findings may also change. Missing information has not been inferred.");
        writer.keyValueRows(companyFactRows(data));
        writer.note("Report identity", `Report ID: ${clean(data.reportId, "Not allocated")}\nGenerated: ${displayTimestamp(data.generatedAt)}\nGrowWithHR version: ${clean(window.GROWWITHHR_VERSION || window.APP_VERSION || "v0.20.3-prototype.1")}\nReport type: Research Prototype`);
        writer.subheading("What this report assesses");
        [
            "HR compliance areas relevant to the company profile you supplied",
            "Areas where additional company information is needed before the applicability assessment can be completed",
            "Compliance areas that should be reassessed after material growth or operating changes",
            "Founder-friendly explanations and governed research references for the deterministic result"
        ].forEach((item) => writer.bullet(item));
        writer.subheading("What this report does not assess");
        [
            "Whether your company has already completed every applicable obligation",
            "Whether a committee, policy, filing, registration, process or record has been implemented correctly",
            "Whether statutory payments, payroll calculations or contributions are correct",
            "Whether your company is legally compliant or non-compliant",
            "Individual employee entitlement, dispute, complaint or claim outcomes"
        ].forEach((item) => writer.bullet(item));
    }

    function renderPosition(writer, rows) {
        const summary = reportSummary(rows);
        writer.section("Your HR compliance position", "The report groups results by what the supplied company facts allow GrowWithHR to determine. These are applicability findings, not a compliance score or certification.");

        const groups = [
            ["Relevant to your company now", summary.relevant, "Applicable based on information provided"],
            ["Review needed", summary.review, "The legal or jurisdiction position needs confirmation before a stronger conclusion"],
            ["More information required", summary.missing, "One or more company facts are still needed for a reliable deterministic result"],
            ["Watch as you grow", summary.watch, "Not currently triggered by the supplied facts, but should be reassessed after relevant change"]
        ];
        groups.forEach(([title, groupRows, explanation]) => {
            if (!groupRows.length) return;
            writer.subheading(title, statusColour(groupRows[0].status));
            writer.text(explanation, { size: 8.5, colour: COLOURS.muted, after: 5 });
            groupRows.forEach((row) => {
                const reason = clean(row.thresholdResult?.explanation || row.whyIncluded, "The supplied company facts caused this result.");
                writer.text(`${rowName(row)} — ${founderStatus(row.status)}`, { size: 9.2, bold: true, colour: COLOURS.heading, after: 2 });
                writer.text(reason, { size: 8.4, colour: COLOURS.text, after: 6 });
            });
            writer.rule();
        });

        writer.subheading("What deserves your attention");
        writer.text("First, understand the areas identified as relevant to your current company profile. Second, complete missing company information because it can change unresolved findings. Third, reassess GrowWithHR before or when a material workforce, location or operating change occurs.", { size: 9, after: 2 });
    }

    function renderDetailedFindings(writer, rows, data) {
        const detailRows = rows.filter((row) => ["Applicable", "Review required"].includes(row.status));
        if (!detailRows.length) return;
        writer.section("Compliance areas relevant today", "Each finding shows the company facts behind the deterministic result. GrowWithHR identifies applicability; it does not determine whether your organisation has already implemented every obligation.");
        detailRows.forEach((row, index) => {
            if (index > 0) writer.rule();
            writer.text(rowName(row), { size: 14, bold: true, colour: COLOURS.heading, after: 3 });
            writer.text(founderStatus(row.status), { size: 8, bold: true, colour: statusColour(row.status), after: 7 });
            writer.label("Company facts used");
            knownFactsFor(row, data).forEach((fact) => writer.bullet(fact));
            writer.label("Rule condition");
            writer.text(clean(row.thresholdResult?.triggerText || row.threshold || "The applicable rule depends on the governed company facts for this compliance area."), { size: 8.7, after: 6 });
            writer.label("Why GrowWithHR identified this");
            writer.text(clean(row.thresholdResult?.explanation || row.whyIncluded || "The supplied company facts meet the conditions represented in the deterministic compliance rule."), { size: 8.7, after: 6 });
            writer.label("Result");
            writer.text(`${founderStatus(row.status)}. This is an applicability result based on the information supplied.`, { size: 8.7, bold: true, after: 7 });
            writer.subheading("Things to verify internally");
            verificationItems(row).forEach((item) => writer.bullet(item));
            writer.note("Important boundary", "GrowWithHR has not assessed whether your company has already completed or correctly implemented these requirements. The report does not certify compliance or non-compliance.");
            writer.link("View reference source", sourceUrl(row));
            writer.text("Legal review status: Needs legal review", { size: 7.7, colour: COLOURS.muted, after: 6 });
        });
    }

    function renderMissingInformation(writer, rows) {
        const missingRows = rows.filter((row) => row.status === "Needs information");
        const questions = [...new Set(missingRows.flatMap((row) => values(row.missingQuestions || row.missingInputs).map(clean)).filter(Boolean))];
        if (!missingRows.length && !questions.length) return;
        writer.section("Information that could change this report", "GrowWithHR does not guess missing company facts. Complete the information below in the assessment and generate a fresh report.");
        missingRows.forEach((row) => {
            writer.text(rowName(row), { size: 11, bold: true, colour: COLOURS.heading, after: 3 });
            writer.text(founderStatus(row.status), { size: 8, bold: true, colour: COLOURS.red, after: 4 });
            const rowQuestions = values(row.missingQuestions || row.missingInputs).map(clean).filter(Boolean);
            rowQuestions.forEach((question) => writer.bullet(question));
            writer.text(`Why it matters: ${clean(row.whyIncluded || row.thresholdResult?.explanation, "This information is required before the deterministic rule can produce a reliable result.")}`, { size: 8.5, colour: COLOURS.muted, after: 7 });
        });
        if (!missingRows.length) questions.forEach((question) => writer.bullet(question));
        writer.note("Your next step", "Update these facts in the GrowWithHR company assessment and regenerate the report. Updated facts may change one or more applicability findings.");
    }

    function renderGrowth(writer, rows, data) {
        const watchRows = rows.filter((row) => row.status === "Not currently triggered");
        if (!watchRows.length) return;
        writer.section("Growth compliance radar", "Your compliance position is not static. Workforce size, location, establishment type, contractor arrangements and other company facts can change the assessment.");
        const employees = clean(data.employees || data.employeeCount || data.headcount);
        const planned = clean(data.plannedEmployees || data.plannedHeadcount || data.futureEmployees || data.targetHeadcount);
        if (employees || planned) {
            writer.keyValueRows([["Current workforce", employees], ["Planned workforce", planned]]);
        }
        watchRows.forEach((row) => {
            writer.text(rowName(row), { size: 11.5, bold: true, colour: COLOURS.heading, after: 3 });
            writer.text("Watch as you grow", { size: 8, bold: true, colour: COLOURS.blue, after: 4 });
            writer.keyValueRows([
                ["Current position", clean(row.thresholdResult?.positionText || row.thresholdResult?.label, "Not currently triggered")],
                ["Reassessment point", clean(row.thresholdResult?.triggerText || row.reassessWhen || row.futureTrigger, "Reassess after a relevant company change")],
                ["Why", clean(row.thresholdResult?.explanation || row.whyIncluded)]
            ]);
        });
        writer.subheading("When to run GrowWithHR again");
        [
            "Employee headcount changes materially",
            "Employee wage or workforce-category information changes",
            "Contractor workforce or arrangements change",
            "A new State, office or establishment is added",
            "The establishment activity or operating model changes",
            "Another company fact requested by the assessment changes"
        ].forEach((item) => writer.bullet(item));
        writer.text("A future trigger is a reason to reassess. It is not, by itself, a declaration that a law automatically applies.", { size: 8.5, colour: COLOURS.muted, after: 2 });
    }

    function renderFounderActions(writer, rows) {
        const hasMissing = rows.some((row) => row.status === "Needs information");
        const hasWatch = rows.some((row) => row.status === "Not currently triggered");
        writer.section("Your founder action list", "Use the report as a decision guide, not as a compliance scorecard.");
        writer.subheading("1 — Review what is relevant today");
        writer.text("Review the compliance areas GrowWithHR has identified as relevant to the company profile you supplied. The purpose is to understand what the organisation should be aware of; GrowWithHR has not determined whether those requirements have already been completed.");
        writer.subheading("2 — Verify internally");
        writer.text("For each relevant area, confirm internally whether your organisation has already addressed the applicable governance, policy, process, record or reporting requirements. GrowWithHR does not currently collect or verify evidence of completion.");
        if (hasMissing) {
            writer.subheading("3 — Complete missing company information");
            writer.text("Return to the GrowWithHR assessment and complete the missing facts because they can change unresolved applicability findings.");
        }
        if (hasWatch) {
            writer.subheading(`${hasMissing ? "4" : "3"} — Reassess before material growth`);
            writer.text("Generate a fresh assessment before or when a monitored workforce or operating change occurs.");
        }
        writer.note("Your next best step", "Review the areas identified as relevant today, complete any missing company information, and re-run GrowWithHR whenever the company facts materially change.");
    }

    function renderMethodology(writer) {
        writer.section("How GrowWithHR reached this report", "The applicability decision and the explanation layer have different responsibilities.");
        const steps = [
            ["1. Your company information", "The assessment begins with the facts you provide."],
            ["2. Deterministic compliance rules", "GrowWithHR evaluates those facts against structured applicability rules."],
            ["3. Applicability result", "The deterministic engine produces the compliance-family result."],
            ["4. Governed legal research", "The Legal RAG layer retrieves controlled research relevant to the already-determined result."],
            ["5. Founder-friendly explanation", "GrowWithHR explains why the area appears, what information is missing and when reassessment may be needed."],
            ["6. This report", "The report presents the assessment snapshot in a founder-readable format."]
        ];
        steps.forEach(([title, body]) => {
            writer.text(title, { size: 9.5, bold: true, colour: COLOURS.heading, after: 2 });
            writer.text(body, { size: 8.7, colour: COLOURS.text, after: 6 });
        });
        writer.note("Important AI boundary", "AI / RAG does not decide whether a compliance area applies. The deterministic engine produces the applicability result. usedForDecision: false · applicabilityAuthority: none");
    }

    function renderBasis(writer, data) {
        writer.section("Report basis, scope & limitations");
        writer.keyValueRows([
            ["Report ID", clean(data.reportId)],
            ["Generated", displayTimestamp(data.generatedAt)],
            ["GrowWithHR version", clean(window.GROWWITHHR_VERSION || window.APP_VERSION || "v0.20.3-prototype.1")],
            ["Report type", "Research Prototype"],
            ["Source authority", "Secondary research"],
            ["Verification status", "Prototype researched"],
            ["Legal review status", "Needs legal review"],
            ["AI applicability authority", "None"],
            ["AI used for decision", "No"]
        ]);
        writer.subheading("Assumptions used in this report");
        [
            "Company information supplied by the user is treated as the assessment input",
            "Planned company information is treated as a future scenario, not as the current state",
            "Missing information has not been inferred",
            "The report reflects the supported deterministic rules and research state at the time it was generated"
        ].forEach((item) => writer.bullet(item));
        writer.subheading("Outside the current prototype scope");
        [
            "International / multi-country employment",
            "Unsupported State-specific matters",
            "Individual employment disputes, claims or entitlement decisions",
            "Tax or corporate-law compliance",
            "Payroll contribution arithmetic",
            "Live safeguarding investigations or complaint adjudication",
            "Legal representation or legal certification"
        ].forEach((item) => writer.bullet(item));
        writer.note("Important limitation", "GrowWithHR is a research-grade HR compliance prototype. This report helps founders understand potential HR compliance applicability and growth-related triggers based on the company information supplied. It is not legal advice, a legal opinion, or certification that the company is compliant or non-compliant.");
    }

    function renderEnd(doc, logo, data) {
        doc.addPage();
        doc.setFillColor(...COLOURS.page);
        doc.rect(0, 0, 210, 297, "F");
        drawCentredLogo(doc, logo, 48, 62);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...COLOURS.heading);
        doc.setFontSize(25);
        doc.text("END OF REPORT", 105, 141, { align: "center" });
        doc.setFontSize(14);
        doc.text("GrowWithHR", 105, 168, { align: "center" });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...COLOURS.muted);
        doc.text("HR Compliance for Growth", 105, 181, { align: "center" });
        doc.text(clean(data.companyName, "Your Organisation"), 105, 204, { align: "center", maxWidth: 170 });
        doc.text(displayDate(data.generatedAt), 105, 218, { align: "center" });
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(...COLOURS.accent);
        doc.text("RESEARCH PROTOTYPE", 105, 246, { align: "center" });
    }

    function addFooters(doc, data) {
        const total = doc.getNumberOfPages();
        for (let page = 2; page < total; page += 1) {
            doc.setPage(page);
            doc.setDrawColor(...COLOURS.line);
            doc.line(PAGE.left, 274, PAGE.right, 274);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(6.7);
            doc.setTextColor(...COLOURS.muted);
            doc.text(`GrowWithHR · ${clean(data.reportId, "Research Prototype")}`, PAGE.left, 282, { maxWidth: 135 });
            doc.text(`${page} / ${total}`, PAGE.right, 282, { align: "right" });
        }
    }

    function serialise(doc, data) {
        const dataUri = doc.output("datauristring");
        const buffer = doc.output("arraybuffer");
        const company = clean(data.companyName, "Organisation").replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 45) || "Organisation";
        const reportId = clean(data.reportId, "GWHR-REPORT");
        return {
            document: doc,
            theme: "standard",
            filename: `GrowWithHR-HR-Compliance-Growth-Report-${company}-${reportId}.pdf`,
            dataUri,
            base64: dataUri.includes(",") ? dataUri.split(",")[1] : dataUri,
            sizeBytes: Number(buffer?.byteLength || 0),
            pageCount: Number(doc.getNumberOfPages?.() || 0),
            reportId,
            generatedAt: clean(data.generatedAt),
            reportLayoutVersion: VERSION,
            reportStructureVersion: "founder-demo-single-v1",
            sharedTemplateId: TEMPLATE_ID,
            brandLogoAsset: LOGO_ASSET,
            singleEdition: true
        };
    }

    function buildVariant(JsPDF, _theme, rows, model, payload, _trace, logo) {
        const data = mergeSource(payload, model);
        const doc = new JsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true, putOnlyUsedFonts: true });
        renderCover(doc, logo, data);
        doc.addPage();
        const writer = buildWriter(doc, logo, data);
        renderCompanyProfile(writer, data);
        renderPosition(writer, rows);
        renderDetailedFindings(writer, rows, data);
        renderMissingInformation(writer, rows);
        renderGrowth(writer, rows, data);
        renderFounderActions(writer, rows);
        renderMethodology(writer);
        renderBasis(writer, data);
        renderEnd(doc, logo, data);
        addFooters(doc, data);
        return serialise(doc, data);
    }

    window.GrowWithHRVisualReportCore = Object.freeze({
        ...baseCore,
        VERSION,
        selectedThemes: () => ["standard"],
        palette: () => COLOURS,
        sharedTemplateId: TEMPLATE_ID,
        brandLogoAsset: LOGO_ASSET
    });

    window.GrowWithHRVisualReportRenderers = Object.freeze({
        ...baseRenderers,
        VERSION,
        sharedTemplateId: TEMPLATE_ID,
        brandLogoAsset: LOGO_ASSET,
        buildVariant
    });

    window.GrowWithHRReportBrandTemplate = Object.freeze({
        version: VERSION,
        templateId: TEMPLATE_ID,
        logoAsset: LOGO_ASSET,
        singleEdition: true,
        reportStyle: "clean-standard"
    });

    window.GrowWithHRFounderDemoReport = Object.freeze({
        version: VERSION,
        templateId: TEMPLATE_ID,
        logoAsset: LOGO_ASSET,
        singleEdition: true,
        scorecards: false,
        evidenceUpload: false,
        frontAndEndCover: true,
        reportIdRequired: true
    });
})();
