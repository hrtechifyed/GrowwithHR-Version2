/* GrowWithHR v0.20 report-selection, branding and contextual-intelligence fixes */
(() => {
    "use strict";

    const VERSION = "0.20.1-report-intelligence-fixes";
    const INSTALL_FLAG = "__growwithhrReportIntelligenceFixesInstalled";
    const REPORT_THEME_KEY = "growwithhr-report-theme";
    const SNAPSHOT_KEY = "growwithhr-report-input-snapshot-v1";
    const PAGE = Object.freeze({ width: 210, height: 297, left: 16, right: 194, top: 24, bottom: 266 });
    const VALID_THEMES = Object.freeze(["light", "dark"]);
    const MANUFACTURING_PATTERN = /manufactur|factory|plant|industrial|production|semiconductor/i;

    const clean = (value, fallback = "") => String(value ?? "").replace(/\s+/g, " ").trim() || fallback;
    const values = (value) => Array.isArray(value)
        ? value.map((item) => clean(item)).filter(Boolean)
        : (clean(value) ? clean(value).split(/[,;|]/).map((item) => item.trim()).filter(Boolean) : []);
    const unique = (items) => [...new Set(items.map((item) => clean(item)).filter(Boolean))];
    const number = (value) => {
        const match = clean(value).replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
        return match ? Number(match[0]) : 0;
    };
    const source = (payload = {}, model = {}) => Object.assign(
        {},
        payload,
        payload.lead || {},
        payload.answers || {},
        payload.report || {},
        model || {}
    );

    function legalStructure(data) {
        return clean(
            data.establishmentType || data.legalStructure || data.entityType ||
            data.organisationType || data.entity,
            "Not specified"
        );
    }

    function contextFor(data = {}) {
        const structure = legalStructure(data);
        const opc = /one person company|\bopc\b/i.test(structure);
        const workforcePresence = clean(
            data.workforcePresence || data.peopleBeyondOwner || data.nonOwnerWorkforce
        ).toLowerCase();
        const employees = number(data.employees || data.employeeCount || data.headcount);
        const workers = number(data.workers || data.workerCount || data.factoryWorkers);
        const contractors = number(data.contractors || data.contractWorkers || data.contractorCount);
        const categories = values(data.workerCategories || data.employeeCategories || data.workforceCategories)
            .map((item) => item.toLowerCase());
        const explicitOwnerOnly = ["owner-only", "only-owner", "no", "none"].includes(workforcePresence);
        const inferredOwnerOnly = opc && workforcePresence !== "other-people" && employees <= 1 && workers === 0 && contractors === 0;
        const ownerOnly = explicitOwnerOnly || inferredOwnerOnly;
        const peoplePresent = !ownerOnly && (
            workforcePresence === "other-people" ||
            employees > 0 || workers > 0 || contractors > 0 ||
            categories.some((item) => !["owner-only", "none", "not-sure"].includes(item))
        );
        const industry = clean(
            data.industryRuleProfile || data.industryCategory || data.customIndustry || data.industry
        );
        const manufacturingAnswer = clean(
            data.manufacturingOperations || data.isFactory || data.manufacturing
        ).toLowerCase();
        const manufacturingIndustry = MANUFACTURING_PATTERN.test(industry);
        const factoryCategory = categories.some((item) => /factory|production|blue-collar/.test(item));
        const manufacturingContext = manufacturingAnswer === "yes" ||
            factoryCategory || workers > 0 ||
            (manufacturingIndustry && !["no", "false"].includes(manufacturingAnswer));
        const industrialContext = manufacturingContext || factoryCategory || workers > 0;
        const contractContext = contractors > 0 || categories.some((item) => /agency-contract-labour|contract labour/.test(item));

        return {
            structure,
            opc,
            workforcePresence,
            employees,
            workers,
            contractors,
            categories,
            ownerOnly,
            peoplePresent,
            industry,
            manufacturingIndustry,
            manufacturingAnswer,
            manufacturingContext,
            industrialContext,
            contractContext
        };
    }

    function selectedThemes(payload = {}) {
        const explicit = values(payload.themes || payload.reportOptions?.themes)
            .map((theme) => theme.toLowerCase())
            .filter((theme) => VALID_THEMES.includes(theme));
        if (explicit.length) return unique(explicit);

        let selected = "";
        try {
            selected = document.querySelector(
                "input[name='advisoryReportTheme']:checked, input[name='reportTheme']:checked"
            )?.value || "";
        } catch (_error) {}

        let stored = "";
        try {
            stored = window.localStorage?.getItem(REPORT_THEME_KEY) || "";
        } catch (_error) {}

        const requested = clean(
            payload.theme || payload.reportTheme || payload.pdfTheme ||
            payload.reportOptions?.theme || selected || stored,
            "light"
        ).toLowerCase();
        const resolved = requested === "both"
            ? ["light", "dark"]
            : [/dark/.test(requested) ? "dark" : "light"];

        try {
            window.localStorage?.setItem(REPORT_THEME_KEY, requested === "both" ? "both" : resolved[0]);
        } catch (_error) {}

        return resolved;
    }

    function contextualiseRows(rows, data = {}) {
        const context = contextFor(data);
        return (Array.isArray(rows) ? rows : []).map((original) => {
            const row = {
                ...original,
                confirmedInputs: [...(original.confirmedInputs || [])],
                missingInputs: [...(original.missingInputs || [])],
                missingQuestions: [...(original.missingQuestions || [])],
                inputCoverage: { ...(original.inputCoverage || {}) },
                thresholdResult: { ...(original.thresholdResult || {}) }
            };

            const irrelevantFields = new Set();
            if (!context.peoplePresent) {
                ["employees", "workers", "contractors", "workerCategories", "womenEmployees", "esiWageEligibility", "bonusWageEligibility"]
                    .forEach((field) => irrelevantFields.add(field));
            }
            if (context.employees < 10) irrelevantFields.add("esiWageEligibility");
            if (context.employees < 20) irrelevantFields.add("bonusWageEligibility");
            if (!context.manufacturingContext) {
                ["workers", "usesPower", "manufacturingOperations"].forEach((field) => irrelevantFields.add(field));
            }

            row.missingInputs = row.missingInputs.filter((field) => !irrelevantFields.has(field));
            row.missingQuestions = row.missingInputs.map((field) => {
                const index = (original.missingInputs || []).indexOf(field);
                return index >= 0 ? original.missingQuestions?.[index] : field;
            }).filter(Boolean);
            row.inputCoverage.required = row.confirmedInputs.length + row.missingInputs.length;
            row.inputCoverage.confirmed = row.confirmedInputs.length;

            if (row.status === "Needs information" && !row.missingInputs.length) {
                if (row.thresholdResult.state === "below") row.status = "Not currently triggered";
                else if (row.thresholdResult.state === "crossed") row.status = "Applicable";
                else row.status = "Review required";
            }

            return row;
        }).filter((row) => {
            if (row.id === "factories") return context.manufacturingContext;
            if (row.id === "standing-orders") return context.industrialContext;
            if (row.id === "contract-labour") return context.contractContext;
            if (["posh", "maternity", "epf", "esi", "gratuity", "bonus", "minimum-wages"].includes(row.id)) {
                return context.peoplePresent;
            }
            return true;
        });
    }

    function stableHash(value) {
        let hash = 2166136261;
        for (let index = 0; index < value.length; index += 1) {
            hash ^= value.charCodeAt(index);
            hash = Math.imul(hash, 16777619);
        }
        return (hash >>> 0).toString(16).padStart(8, "0").toUpperCase();
    }

    function createTrace(data) {
        const context = contextFor(data);
        const record = {
            legalStructure: context.structure,
            workforcePresence: clean(data.workforcePresence, context.ownerOnly ? "owner-only" : "Not specified"),
            employees: String(context.employees),
            workers: String(context.workers),
            contractors: String(context.contractors),
            industry: clean(data.customIndustry || data.industry, "Not specified"),
            primaryState: clean(data.primaryState || data.state, "Not specified"),
            workModel: clean(data.workModel, "Not specified")
        };
        let previous = null;
        try {
            previous = JSON.parse(window.localStorage?.getItem(SNAPSHOT_KEY) || "null");
        } catch (_error) {}
        const labels = {
            legalStructure: "Legal structure",
            workforcePresence: "People beyond the owner/director",
            employees: "Employees",
            workers: "Workers",
            contractors: "Contractors",
            industry: "Industry",
            primaryState: "Primary state",
            workModel: "Working model"
        };
        const changes = previous?.values
            ? Object.keys(record).filter((key) => clean(previous.values[key]) !== clean(record[key])).map((key) => ({
                field: labels[key] || key,
                before: clean(previous.values[key], "Not specified"),
                after: clean(record[key], "Not specified")
            }))
            : [];
        return {
            id: `RPT-${stableHash(JSON.stringify(record))}`,
            values: record,
            changes
        };
    }

    function saveTrace(trace) {
        try {
            window.localStorage?.setItem(SNAPSHOT_KEY, JSON.stringify({
                id: trace.id,
                values: trace.values,
                savedAt: new Date().toISOString()
            }));
        } catch (_error) {}
    }

    let logoPromise = null;
    function loadLogoDataUrl() {
        if (logoPromise) return logoPromise;
        logoPromise = new Promise((resolve) => {
            if (typeof window.Image !== "function" || !document?.createElement) {
                resolve("");
                return;
            }
            const image = new window.Image();
            image.crossOrigin = "anonymous";
            image.onload = () => {
                try {
                    const canvas = document.createElement("canvas");
                    const size = 512;
                    canvas.width = size;
                    canvas.height = size;
                    const context = canvas.getContext("2d");
                    if (!context) throw new Error("Canvas unavailable");
                    context.clearRect(0, 0, size, size);
                    context.drawImage(image, 0, 0, size, size);
                    resolve(canvas.toDataURL("image/png"));
                } catch (_error) {
                    resolve("");
                }
            };
            image.onerror = () => resolve("");
            image.src = new URL("assets/hrtechify-logo.png", window.location.href).href;
        });
        return logoPromise;
    }

    function palette(theme) {
        return theme === "dark"
            ? { page: [0,0,0], panel: [16,16,16], alt: [27,27,27], text: [238,238,238], muted: [184,184,184], head: [255,255,255], line: [75,75,75], accent: [245,158,11], green: [91,214,148], amber: [255,190,75], red: [255,120,110] }
            : { page: [255,255,255], panel: [244,247,251], alt: [232,239,248], text: [10,24,48], muted: [53,72,99], head: [4,28,67], line: [166,181,202], accent: [245,158,11], green: [23,128,73], amber: [184,102,0], red: [180,35,24] };
    }

    function createWriter(doc, colours, sectionPages) {
        let y = PAGE.top;
        let section = "";
        const lineHeight = (size, factor = 1.28) => size * 0.3528 * factor;
        const split = (value, width = 178) => doc.splitTextToSize(clean(value), width);
        const paint = () => {
            doc.setFillColor(...colours.page);
            doc.rect(0, 0, PAGE.width, PAGE.height, "F");
            doc.setDrawColor(...colours.line);
            doc.setLineWidth(0.35);
            doc.rect(5.5, 5.5, 199, 286, "S");
        };
        const addPage = (continuation = false) => {
            doc.addPage();
            paint();
            y = PAGE.top;
            if (continuation && section) {
                doc.setFont("helvetica", "bold");
                doc.setFontSize(7.4);
                doc.setTextColor(...colours.accent);
                doc.text(`${section.toUpperCase()} - CONTINUED`, PAGE.left, y);
                y += 9;
            }
        };
        const ensure = (height) => {
            if (y + height > PAGE.bottom) addPage(true);
        };
        const text = (value, options = {}) => {
            const size = Number(options.size || 8.5);
            const width = Number(options.width || 178);
            const factor = Number(options.factor || 1.28);
            const lines = split(value, width);
            const height = lines.length * lineHeight(size, factor);
            const after = Number(options.after ?? 3);
            ensure(height + after);
            doc.setFont("helvetica", options.style || "normal");
            doc.setFontSize(size);
            doc.setTextColor(...(options.colour || colours.text));
            doc.text(lines, Number(options.x || PAGE.left), y, {
                lineHeightFactor: factor,
                maxWidth: width,
                align: options.align || "left"
            });
            y += height + after;
        };
        const heading = (key, eyebrow, title, intro = "") => {
            section = title;
            addPage(false);
            sectionPages[key] = doc.getNumberOfPages();
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8);
            doc.setTextColor(...colours.accent);
            doc.text(clean(eyebrow).toUpperCase(), PAGE.left, y);
            y += 8;
            text(title, { size: 19, style: "bold", colour: colours.head, factor: 1.15, after: 6 });
            if (intro) text(intro, { colour: colours.muted, after: 7 });
        };
        const subheading = (value) => text(value, { size: 11, style: "bold", colour: colours.head, after: 4 });
        const bullet = (value, colour = colours.accent) => {
            const lines = split(value, 164);
            const height = lines.length * lineHeight(8.2) + 3;
            ensure(height);
            doc.setFillColor(...colour);
            doc.circle(19, y - 1, 0.8, "F");
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8.2);
            doc.setTextColor(...colours.text);
            doc.text(lines, 25, y, { lineHeightFactor: 1.28, maxWidth: 164 });
            y += height;
        };
        const callout = (title, body, options = {}) => {
            const width = Number(options.width || 178);
            const titleLines = split(title, width - 12);
            const bodyLines = split(body, width - 12);
            const height = Math.max(22,
                titleLines.length * lineHeight(9.1, 1.2) +
                bodyLines.length * lineHeight(8.05, 1.28) + 14
            );
            ensure(height + 5);
            doc.setFillColor(...(options.fill || colours.panel));
            doc.setDrawColor(...(options.draw || colours.line));
            doc.roundedRect(PAGE.left, y - 4, width, height, 2, 2, "FD");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9.1);
            doc.setTextColor(...(options.titleColour || colours.head));
            doc.text(titleLines, PAGE.left + 6, y + 3, { lineHeightFactor: 1.2, maxWidth: width - 12 });
            const bodyY = y + 4 + titleLines.length * lineHeight(9.1, 1.2) + 3;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8.05);
            doc.setTextColor(...colours.text);
            doc.text(bodyLines, PAGE.left + 6, bodyY, { lineHeightFactor: 1.28, maxWidth: width - 12 });
            y += height + 5;
        };
        const table = (headers, rows, widths, options = {}) => {
            const size = Number(options.size || 7.2);
            const factor = 1.22;
            const draw = (cells, header = false) => {
                const lines = cells.map((cell, index) => split(cell, widths[index] - 4));
                const height = Math.max(9, ...lines.map((item) => item.length * lineHeight(size, factor) + 4));
                ensure(height + 1);
                let x = PAGE.left;
                cells.forEach((_cell, index) => {
                    doc.setFillColor(...(header ? colours.alt : colours.panel));
                    doc.setDrawColor(...colours.line);
                    doc.rect(x, y - 4, widths[index], height, "FD");
                    doc.setFont("helvetica", header ? "bold" : "normal");
                    doc.setFontSize(size);
                    doc.setTextColor(...(header ? colours.head : colours.text));
                    doc.text(lines[index], x + 2, y, { lineHeightFactor: factor, maxWidth: widths[index] - 4 });
                    x += widths[index];
                });
                y += height;
            };
            draw(headers, true);
            rows.forEach((row) => draw(row));
            y += 4;
        };
        return { colours, paint, addPage, ensure, text, heading, subheading, bullet, callout, table, setY: (value) => { y = value; } };
    }

    function statusColour(status, colours) {
        if (status === "Applicable") return colours.green;
        if (status === "Review required") return colours.amber;
        if (status === "Needs information") return colours.red;
        return colours.muted;
    }

    function priorityRows(rows) {
        return rows.filter((row) => ["Applicable", "Review required", "Needs information"].includes(row.status));
    }

    function actionId(row, index) {
        return clean(row.actionId, `A${index + 1}`);
    }

    function renderCover(doc, colours, data, theme, logo) {
        doc.setFillColor(...colours.page);
        doc.rect(0, 0, 210, 297, "F");
        doc.setDrawColor(...colours.line);
        doc.setLineWidth(0.45);
        doc.rect(7, 7, 196, 283, "S");
        if (logo) {
            try { doc.addImage(logo, "PNG", 18, 22, 28, 28, undefined, "FAST"); } catch (_error) {}
        }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...colours.accent);
        doc.text("HRTECHIFY - GROWWITHHR", logo ? 52 : 18, 34);
        doc.setFontSize(29);
        doc.setTextColor(...colours.head);
        doc.text("Executive Advisory", 18, 84);
        doc.setFontSize(17);
        doc.text(clean(data.companyName, "Your Organisation"), 18, 108, { maxWidth: 174 });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(...colours.muted);
        doc.text("A founder-facing report based only on the organisation details supplied for this assessment.", 18, 130, { maxWidth: 170 });
        doc.setFillColor(...colours.panel);
        doc.setDrawColor(...colours.line);
        doc.roundedRect(18, 176, 174, 45, 3, 3, "FD");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(...colours.head);
        doc.text("REPORT DETAILS", 26, 191);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(...colours.text);
        doc.text(`Legal structure: ${legalStructure(data)}`, 26, 203, { maxWidth: 156 });
        doc.text(`Edition selected: ${theme === "dark" ? "Dark" : "Light"}`, 26, 213);
        doc.setFontSize(8);
        doc.setTextColor(...colours.muted);
        doc.text("Confidential leadership working document. Not legal or regulatory advice.", 18, 258, { maxWidth: 174 });
    }

    function renderAbout(writer, data) {
        const context = contextFor(data);
        writer.heading("about", "PART 1 - YOUR ORGANISATION", "About Your Organisation", "These are the organisation details used to prepare this report.");
        writer.table(
            ["Context", "Value"],
            [
                ["Organisation", clean(data.companyName, "Your Organisation")],
                ["Legal structure", context.structure],
                ["Industry", clean(data.customIndustry || data.industry, "Not specified")],
                ["Reported employees", String(context.employees)],
                ["Workers / contractors", `${context.workers} / ${context.contractors}`],
                ["Primary state", clean(data.primaryState || data.state, "Not specified")],
                ["Working model", clean(data.workModel, "Not specified")]
            ],
            [52, 126],
            { size: 8 }
        );
        writer.callout("How this report changes", "The recommendations update when the organisation profile, workforce, operating state or business activity changes.");
    }

    function renderBrief(writer, rows, data) {
        const actions = priorityRows(rows);
        const counts = Object.fromEntries(["Applicable", "Review required", "Needs information", "Not currently triggered"]
            .map((status) => [status, rows.filter((row) => row.status === status).length]));
        writer.heading("brief", "PART 1 - EXECUTIVE VIEW", "Founder Brief", "A concise view of the current position and the items that merit attention.");
        writer.callout(
            "Current position",
            `${clean(data.companyName, "The organisation")} has ${counts.Applicable} applicable ${counts.Applicable === 1 ? "law" : "laws"}, ${counts["Review required"]} requiring review and ${counts["Needs information"]} needing additional information.`
        );
        if (actions.length) {
            writer.subheading("Priority references");
            actions.slice(0, 3).forEach((row, index) => writer.bullet(`${actionId(row, index)} - ${row.shortTitle} (${row.status}).`));
        } else {
            writer.callout("No immediate legal action generated", "No contextual law check is currently marked applicable, review required or needs information. Reassess when the organisation or workforce changes.");
        }
    }

    function renderStatus(writer, rows) {
        const groups = ["Applicable", "Review required", "Needs information", "Not currently triggered"]
            .map((status) => [status, rows.filter((row) => row.status === status)])
            .filter(([, group]) => group.length > 0);
        if (!groups.length) return;
        writer.heading("status", "PART 2 - INTERPRETATION", "Current Legal Position", "Only status groups containing relevant laws are shown.");
        const explanations = {
            Applicable: "The current answers indicate that the usual trigger is met. Confirm the current legal position and retain evidence.",
            "Review required": "State rules or establishment details require a qualified review before a conclusion is reached.",
            "Needs information": "A relevant question remains unanswered or uncertain.",
            "Not currently triggered": "The reported position is below the usual trigger or the relevant activity is not currently present."
        };
        groups.forEach(([status, group]) => writer.callout(
            `${group.length} ${group.length === 1 ? "law" : "laws"} - ${status}`,
            `${explanations[status]}\n\n${group.map((row) => row.shortTitle).join(", ")}.`,
            { titleColour: statusColour(status, writer.colours) }
        ));
    }

    function renderEvidence(writer, rows, trace) {
        const actions = priorityRows(rows);
        const questions = unique(actions.flatMap((row) => row.missingQuestions || []));
        if (!questions.length && !trace.changes.length) return;
        writer.heading("evidence", "PART 2 - INPUT QUALITY", "Information Still Needed", "Only questions relevant to the organisation profile and the current law checks are listed.");
        if (questions.length) {
            writer.subheading("Relevant unanswered questions");
            questions.forEach((question) => writer.bullet(question, writer.colours.red));
        }
        if (trace.changes.length) {
            writer.subheading("Changes since the previous browser-generated report");
            trace.changes.forEach((change) => writer.bullet(`${change.field}: ${change.before} to ${change.after}.`, writer.colours.amber));
        }
        writer.callout("Evidence boundary", "Assessment answers guide the report, but they do not prove that a registration, payment, committee, policy or statutory record exists.");
    }

    function renderPriority(writer, rows) {
        const actions = priorityRows(rows);
        if (!actions.length) return;
        writer.heading("priority", "PART 3 - ACTION", "Priority Actions", "Each action appears once with a stable reference for follow-up.");
        actions.forEach((row, index) => {
            const missing = unique(row.missingQuestions || []);
            const why = clean(row.thresholdResult?.explanation || row.whyIncluded, "The current organisation profile makes this law relevant.");
            writer.callout(
                `${actionId(row, index)} - ${row.shortTitle} - ${row.status}`,
                `Why this appears: ${why}\nWhat to confirm: ${missing.length ? missing.join("; ") : "No assessment answer is missing."}\nAction: ${clean(row.requiredAction, "Confirm the current legal position, assign an owner and retain evidence.")}`,
                { titleColour: statusColour(row.status, writer.colours) }
            );
        });
    }

    function renderStrategic(writer, rows, model) {
        const actions = priorityRows(rows);
        if (!actions.length) return;
        const recommendations = Array.isArray(model.recommendations) ? model.recommendations.slice(0, 3) : [];
        if (!recommendations.length) return;
        writer.heading("strategic", "PART 3 - ACTION", "Strategic Recommendations", "These business recommendations support the legal actions without repeating them.");
        recommendations.forEach((item, index) => writer.callout(
            `S${index + 1} - ${clean(item.title, `Recommendation ${index + 1}`)}`,
            clean(item.recommendation, "Assign an owner, define evidence and establish a regular review rhythm.")
        ));
    }

    function renderRoadmap(writer, rows) {
        const actions = priorityRows(rows);
        if (!actions.length) return;
        const ids = actions.map((row, index) => actionId(row, index));
        writer.heading("roadmap", "PART 3 - ACTION", "0-90 Day Roadmap", "Use the action references below to plan ownership and timing.");
        writer.table(
            ["Window", "Action references"],
            [
                ["0-30 days", ids.slice(0, 2).join(", ") || "None"],
                ["31-60 days", ids.slice(2, 4).join(", ") || "None"],
                ["61-90 days", ids.slice(4).join(", ") || "None"]
            ],
            [52, 126],
            { size: 9 }
        );
    }

    function renderFuture(writer, rows) {
        const dormant = rows.filter((row) => row.status === "Not currently triggered");
        if (!dormant.length) return;
        writer.heading("future", "PART 4 - MONITOR", "Future Reassessment Triggers", "These laws are relevant to the organisation profile but their usual trigger is not currently met.");
        writer.table(
            ["Law", "Current position", "Reassess when"],
            dormant.map((row) => [
                clean(row.shortTitle),
                clean(row.thresholdResult?.positionText || row.thresholdResult?.label, "Current position recorded"),
                clean(row.reassessWhen || row.futureTrigger || row.thresholdResult?.triggerText, "Workforce or operations change")
            ]),
            [54, 58, 66],
            { size: 6.8 }
        );
    }

    function renderDisclaimer(writer) {
        writer.heading("disclaimer", "IMPORTANT", "Confidentiality & Disclaimer", "Read this page before sharing or acting on the report.");
        writer.subheading("Confidentiality");
        writer.text("This is a confidential leadership working document prepared from information supplied by the user.");
        writer.subheading("Advisory limitation");
        writer.text("It provides general business and people-management guidance and is not legal, tax, accounting, employment-law or regulatory advice. Verify current requirements with qualified professionals and official sources.");
    }

    function renderEnd(writer, data, logo) {
        writer.heading("end", "HRTECHIFY - GROWWITHHR", "End of Report", "");
        if (logo) {
            try { writer.ensure(44); writer.setY(76); writer.text("", { after: 0 }); writer.colours; } catch (_error) {}
        }
        const doc = writer.document;
        if (doc && logo) {
            try { doc.addImage(logo, "PNG", 83, 72, 44, 44, undefined, "FAST"); } catch (_error) {}
        }
        writer.setY(130);
        writer.text(clean(data.companyName, "Your Organisation"), { size: 15, style: "bold", align: "center", x: 105, width: 160 });
        writer.text("Regenerate this report after a material workforce, state, legal-structure or operating-model change.", { size: 9, align: "center", x: 105, width: 160 });
    }

    function addBrandFooter(doc, colours, companyName) {
        const total = doc.getNumberOfPages();
        for (let page = 1; page <= total; page += 1) {
            doc.setPage(page);
            doc.setFillColor(...colours.page);
            doc.rect(0, 272, 210, 25, "F");
            doc.setDrawColor(...colours.line);
            doc.setLineWidth(0.35);
            doc.line(16, 277, 194, 277);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(7.5);
            doc.setTextColor(...colours.accent);
            doc.text("HRTechify · GrowWithHR", 16, 284);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(6.8);
            doc.setTextColor(...colours.muted);
            doc.text(`Confidential advisory · ${clean(companyName, "Your Organisation")}`, 16, 289, { maxWidth: 145 });
            doc.text(`Page ${page} of ${total}`, 194, 284, { align: "right" });
        }
    }

    function redrawContents(doc, colours, sectionPages) {
        doc.setPage(2);
        doc.setFillColor(...colours.page);
        doc.rect(0, 0, 210, 297, "F");
        doc.setDrawColor(...colours.line);
        doc.setLineWidth(0.35);
        doc.rect(5.5, 5.5, 199, 286, "S");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(...colours.accent);
        doc.text("REPORT NAVIGATION", 16, 24);
        doc.setFontSize(22);
        doc.setTextColor(...colours.head);
        doc.text("Table of Contents", 16, 40);
        let y = 60;
        Object.entries(sectionPages).forEach(([key, page], index) => {
            const labels = {
                about: "About Your Organisation",
                brief: "Founder Brief",
                status: "Current Legal Position",
                evidence: "Information Still Needed",
                priority: "Priority Actions",
                strategic: "Strategic Recommendations",
                roadmap: "0-90 Day Roadmap",
                future: "Future Reassessment Triggers",
                disclaimer: "Confidentiality & Disclaimer",
                end: "End of Report"
            };
            if (!labels[key]) return;
            doc.setFillColor(...(index % 2 ? colours.panel : colours.alt));
            doc.roundedRect(16, y - 6, 178, 9, 1.5, 1.5, "F");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(7.6);
            doc.setTextColor(...colours.text);
            doc.text(labels[key], 21, y);
            doc.setTextColor(...colours.accent);
            doc.text(String(page), 188, y, { align: "right" });
            y += 10;
        });
    }

    function serialise(doc, theme, data) {
        const dataUri = doc.output("datauristring");
        const buffer = doc.output("arraybuffer");
        const company = clean(data.companyName, "Organisation")
            .replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "Organisation";
        return {
            document: doc,
            theme,
            filename: `GrowWithHR-Advisory-${company}-${theme === "dark" ? "Dark" : "Light"}.pdf`,
            dataUri,
            base64: dataUri.includes(",") ? dataUri.split(",")[1] : dataUri,
            sizeBytes: buffer.byteLength,
            pageCount: doc.getNumberOfPages()
        };
    }

    function buildVariant(JsPDF, theme, rows, model, payload, trace, logo) {
        const doc = new JsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true, putOnlyUsedFonts: true });
        const colours = palette(theme);
        const data = source(payload, model);
        const sections = {};
        renderCover(doc, colours, data, theme, logo);
        doc.addPage();
        const writer = createWriter(doc, colours, sections);
        writer.document = doc;
        writer.paint();
        renderAbout(writer, data);
        renderBrief(writer, rows, data);
        renderStatus(writer, rows);
        renderEvidence(writer, rows, trace);
        renderPriority(writer, rows);
        renderStrategic(writer, rows, model);
        renderRoadmap(writer, rows);
        renderFuture(writer, rows);
        renderDisclaimer(writer);
        renderEnd(writer, data, logo);
        redrawContents(doc, colours, sections);
        addBrandFooter(doc, colours, data.companyName);
        return serialise(doc, theme, data);
    }

    function application() {
        return window.executiveAssessment || window.GrowWithHRExecutiveAssessment || window.assessmentApp || null;
    }

    function answersFor(app) {
        return app?.answers || app?.stateModel?.answers || app?.state?.answers || {};
    }

    function setAnswer(app, name, value) {
        const answers = answersFor(app);
        const current = answers[name];
        if (JSON.stringify(current) === JSON.stringify(value)) return false;
        if (typeof app?.stateModel?.setAnswer === "function") app.stateModel.setAnswer(name, value);
        else answers[name] = value;
        return true;
    }

    function ensureOpcGate(app, section, data) {
        if (!contextFor(data).opc) return null;
        let gate = section.querySelector('[data-field-wrapper="workforcePresence"]');
        if (gate) return gate;
        gate = document.createElement("fieldset");
        gate.className = "advisory-choice-fieldset industry-adaptive-field";
        gate.dataset.fieldWrapper = "workforcePresence";
        gate.innerHTML = '<legend>Does anyone other than the owner/director currently work for or with the organisation? <span aria-hidden="true">*</span></legend><p class="advisory-field-help">Only relevant workforce and payroll questions will appear after this answer.</p><div class="advisory-choice-pills"><label class="advisory-choice-pill"><input type="radio" name="workforcePresence" value="owner-only"><span>No - only the owner/director</span></label><label class="advisory-choice-pill"><input type="radio" name="workforcePresence" value="other-people"><span>Yes - other people work with the organisation</span></label></div><p class="advisory-field-error" id="workforcePresenceError" hidden></p>';
        section.querySelector(".advisory-field-group")?.prepend(gate);
        return gate;
    }

    function toggleQuestion(app, section, name, visible, neutralValue) {
        const wrapper = section.querySelector(`[data-field-wrapper="${name}"]`);
        if (!wrapper) return;
        wrapper.hidden = !visible;
        wrapper.querySelectorAll("input, select, textarea").forEach((input) => {
            input.disabled = !visible;
            input.required = Boolean(visible && input.dataset.contextRequired === "true");
        });
        if (!visible && neutralValue !== undefined) setAnswer(app, name, neutralValue);
    }

    function syncAssessmentQuestions(app = application()) {
        if (!app || Number(app.currentMoment ?? app.stateModel?.currentMoment) !== 2) return false;
        const section = document.querySelector("[data-industry-adaptive]");
        if (!section) return false;
        const data = answersFor(app);
        const context = contextFor(data);
        const gate = ensureOpcGate(app, section, data);
        if (gate) {
            gate.querySelectorAll("input").forEach((input) => {
                input.checked = input.value === clean(data.workforcePresence);
            });
        }

        const peopleQuestionsVisible = context.peoplePresent && (!context.opc || context.workforcePresence === "other-people");
        toggleQuestion(app, section, "workerCategories", peopleQuestionsVisible, context.ownerOnly ? ["owner-only"] : []);
        toggleQuestion(app, section, "womenEmployees", peopleQuestionsVisible, "no");
        toggleQuestion(app, section, "esiWageEligibility", peopleQuestionsVisible && context.employees >= 10, "no");
        toggleQuestion(app, section, "bonusWageEligibility", peopleQuestionsVisible && context.employees >= 20, "no");

        const profile = section.dataset.industryAdaptive || "";
        if (profile === "manufacturing") {
            toggleQuestion(app, section, "manufacturingOperations", peopleQuestionsVisible, context.ownerOnly ? "no" : undefined);
            const productionQuestionsVisible = peopleQuestionsVisible && context.manufacturingAnswer === "yes";
            toggleQuestion(app, section, "workers", productionQuestionsVisible, "0");
            toggleQuestion(app, section, "usesPower", productionQuestionsVisible, "no");
            toggleQuestion(app, section, "shiftPattern", productionQuestionsVisible, "not-sure");
            toggleQuestion(app, section, "nightShifts", productionQuestionsVisible, "no");
            toggleQuestion(app, section, "womenNightShifts", productionQuestionsVisible && clean(data.womenEmployees) === "yes" && clean(data.nightShifts) === "yes", "not-applicable");
        } else if (profile === "bpo") {
            toggleQuestion(app, section, "shiftPattern", peopleQuestionsVisible, "not-sure");
            toggleQuestion(app, section, "nightShifts", peopleQuestionsVisible, "no");
            toggleQuestion(app, section, "womenNightShifts", peopleQuestionsVisible && clean(data.womenEmployees) === "yes" && clean(data.nightShifts) === "yes", "not-applicable");
            toggleQuestion(app, section, "nightTransport", peopleQuestionsVisible && clean(data.nightShifts) === "yes", "not-applicable");
            toggleQuestion(app, section, "nightSecurity", peopleQuestionsVisible && clean(data.nightShifts) === "yes", "not-applicable");
        }

        if (context.ownerOnly) {
            setAnswer(app, "workers", "0");
            setAnswer(app, "contractors", "0");
            setAnswer(app, "contractWorkers", "0");
            setAnswer(app, "manufacturingOperations", "no");
        }
        app.persist?.();
        app.saveNow?.();
        return true;
    }

    function installAssessmentIntelligence(app = application()) {
        if (!app || app.__growwithhrContextualQuestionIntelligence) return false;
        Object.defineProperty(app, "__growwithhrContextualQuestionIntelligence", { value: VERSION });
        const originalRender = app.renderCurrentMoment?.bind(app);
        if (originalRender) {
            app.renderCurrentMoment = function contextualQuestionRender(...args) {
                const result = originalRender(...args);
                queueMicrotask(() => syncAssessmentQuestions(this));
                return result;
            };
        }
        const form = app.elements?.storyForm || document.getElementById("storyForm");
        form?.addEventListener("submit", (event) => {
            if (Number(app.currentMoment ?? app.stateModel?.currentMoment) !== 2) return;
            syncAssessmentQuestions(app);
            const data = answersFor(app);
            const context = contextFor(data);
            let message = "";
            if (context.opc && !["owner-only", "other-people"].includes(clean(data.workforcePresence))) {
                message = "Please confirm whether anyone other than the owner/director works with the organisation.";
            } else if (context.manufacturingIndustry && context.peoplePresent && !["yes", "no", "not-sure"].includes(clean(data.manufacturingOperations))) {
                message = "Please confirm whether the organisation carries out a manufacturing process.";
            }
            if (!message) return;
            event.preventDefault();
            event.stopImmediatePropagation();
            const error = document.getElementById(context.opc && !clean(data.workforcePresence) ? "workforcePresenceError" : "manufacturingOperationsError");
            if (error) {
                error.hidden = false;
                error.textContent = message;
            }
            app.announce?.(message, true);
        }, true);
        document.addEventListener("input", () => queueMicrotask(() => syncAssessmentQuestions(app)), true);
        document.addEventListener("change", () => queueMicrotask(() => syncAssessmentQuestions(app)), true);
        queueMicrotask(() => syncAssessmentQuestions(app));
        return true;
    }

    async function installReportIntelligence() {
        const service = window.GrowWithHRPDF;
        const JsPDF = window.jspdf?.jsPDF || window.jsPDF;
        if (!service || !JsPDF || service[INSTALL_FLAG]) return false;
        if (typeof service.buildAdvisoryModel !== "function" || typeof service.buildReportLawTransparency !== "function") return false;

        const buildModel = service.buildAdvisoryModel.bind(service);
        const buildRows = service.buildReportLawTransparency.bind(service);
        const logo = await loadLogoDataUrl();

        async function buildAdvisoryPdf(payload = {}) {
            const model = buildModel(payload);
            const data = source(payload, model);
            const rows = contextualiseRows(buildRows(payload, model), data);
            const trace = createTrace(data);
            const themes = selectedThemes(payload);
            const pdfs = themes.map((theme) => buildVariant(JsPDF, theme, rows, model, payload, trace, logo));
            const first = pdfs[0];
            saveTrace(trace);
            return {
                ...first,
                pdfs,
                pageCounts: Object.fromEntries(pdfs.map((item) => [item.theme, item.pageCount])),
                totalSizeBytes: pdfs.reduce((sum, item) => sum + Number(item.sizeBytes || 0), 0),
                generatedAt: new Date().toISOString(),
                companyName: clean(data.companyName, "Your Organisation"),
                acceptanceReportVersion: VERSION,
                reportStructureVersion: "contextual-single-tier-v2",
                inputSnapshotId: trace.id,
                inputChanges: trace.changes,
                selectedThemes: themes,
                dualThemeDelivery: themes.length === 2
            };
        }

        const enhanced = Object.freeze({
            ...service,
            [INSTALL_FLAG]: true,
            reportIntelligenceFixVersion: VERSION,
            reportStructureVersion: "contextual-single-tier-v2",
            buildReportLawTransparency(payload = {}, model = {}) {
                return contextualiseRows(buildRows(payload, model), source(payload, model));
            },
            buildAdvisoryPdf
        });
        window.GrowWithHRPDF = enhanced;
        window.GrowWithHRPDFPolishReady = Promise.resolve(enhanced);
        window.GrowWithHRReportIntelligenceFixes = Object.freeze({
            version: VERSION,
            installed: true,
            selectedThemes,
            contextFor,
            contextualiseRows,
            syncAssessmentQuestions,
            installAssessmentIntelligence
        });
        return true;
    }

    window.addEventListener("growwithhr:assessment-modules-ready", (event) => {
        installAssessmentIntelligence(event.detail?.application);
    });
    installAssessmentIntelligence();
    installReportIntelligence().catch((error) => {
        console.error("GrowWithHR report intelligence fixes could not install.", error);
    });
})();
