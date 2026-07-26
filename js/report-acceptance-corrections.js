/* GrowWithHR single-tier report assembler and founder-only workforce guard */
(() => {
    "use strict";

    const VERSION = "0.25.0-single-tier-report";
    const INSTALL_FLAG = "__growwithhrSingleTierReportInstalled";
    const SNAPSHOT_STORAGE_KEY = "growwithhr-report-input-snapshot-v1";
    const PAGE = Object.freeze({ width: 210, height: 297, left: 16, right: 194, top: 24, bottom: 268 });
    const THEMES = Object.freeze(["light", "dark"]);
    const LAW_ORDER = Object.freeze([
        "posh", "maternity", "epf", "esi", "gratuity", "bonus",
        "minimum-wages", "shops", "contract-labour", "standing-orders", "factories"
    ]);
    const ACTION_IDS = Object.freeze(Object.fromEntries(LAW_ORDER.map((id, index) => [id, `A${index + 1}`])));

    const clean = (value, fallback = "") => String(value ?? "")
        .replace(/[→›]/g, " - ")
        .replace(/!['’]/g, " - ")
        .replace(/\s+/g, " ")
        .trim() || fallback;
    const list = (value) => Array.isArray(value)
        ? value.map((item) => clean(item)).filter(Boolean)
        : (clean(value) ? [clean(value)] : []);
    const unique = (values) => [...new Set(values.map((value) => clean(value)).filter(Boolean))];
    const number = (value) => {
        const match = clean(value).replace(/,/g, "").match(/\d+(?:\.\d+)?/);
        return match ? Number(match[0]) : 0;
    };
    const orderOf = (id) => {
        const index = LAW_ORDER.indexOf(id);
        return index === -1 ? 999 : index;
    };

    const OFFICIAL_URLS = Object.freeze({
        posh: "https://www.indiacode.nic.in/handle/123456789/2104?locale=en",
        maternity: "https://www.indiacode.nic.in/handle/123456789/9160?locale=en",
        epf: "https://www.epfindia.gov.in/site_en/Acts%26Manuals.php",
        esi: "https://esic.gov.in/Publications/ESIAct1948Amendedupto010610.htm",
        gratuity: "https://www.indiacode.nic.in/handle/123456789/12862?locale=en",
        bonus: "https://www.indiacode.nic.in/handle/123456789/1484?locale=en",
        "minimum-wages": "https://www.indiacode.nic.in/handle/123456789/15793?locale=en",
        "contract-labour": "https://www.indiacode.nic.in/handle/123456789/1490?locale=en",
        "standing-orders": "https://www.indiacode.nic.in/handle/123456789/19411?locale=en",
        factories: "https://www.labour.gov.in/documents/acts-and-policies/industrial-safety-health-kDOxMTMtQWa?-Health=&pageTitle=Industrial-Safety-"
    });

    const STATE_LABOUR_PORTALS = Object.freeze({
        haryana: "https://hrylabour.gov.in/",
        delhi: "https://labour.delhi.gov.in/",
        maharashtra: "https://mahakamgar.maharashtra.gov.in/",
        karnataka: "https://labour.karnataka.gov.in/",
        tamilnadu: "https://labour.tn.gov.in/",
        telangana: "https://labour.telangana.gov.in/",
        gujarat: "https://labour.gujarat.gov.in/",
        rajasthan: "https://labour.rajasthan.gov.in/",
        kerala: "https://lc.kerala.gov.in/",
        "uttar pradesh": "https://uplabour.gov.in/"
    });

    const STATUS_COPY = Object.freeze({
        Applicable: "This law appears to apply based on the answers used for this report. Confirm the current legal position and keep evidence of compliance.",
        "Review required": "The answer depends on state rules or details that cannot be decided from headcount alone. Get a qualified review before assuming the law does not apply.",
        "Needs information": "One or more answers needed for this check are missing or marked Not sure. Complete those answers before relying on the result.",
        "Not currently triggered": "Your current workforce or operating position is below the usual legal threshold. Recheck when the stated condition changes."
    });

    function palette(name) {
        return /dark/i.test(clean(name))
            ? { page: [0,0,0], panel: [15,15,15], alt: [25,25,25], text: [238,238,238], muted: [184,184,184], head: [255,255,255], line: [75,75,75], accent: [245,158,11], green: [91,214,148], amber: [255,190,75], red: [255,120,110] }
            : { page: [255,255,255], panel: [244,247,251], alt: [232,239,248], text: [10,24,48], muted: [53,72,99], head: [4,28,67], line: [166,181,202], accent: [245,158,11], green: [23,128,73], amber: [184,102,0], red: [180,35,24] };
    }

    function source(payload = {}, model = {}) {
        return Object.assign({}, payload, payload.lead || {}, payload.answers || {}, payload.report || {}, model || {});
    }

    function legalStructure(data) {
        return clean(
            data.establishmentType || data.legalStructure || data.entityType ||
            data.organisationType || data.entity,
            "Not specified"
        );
    }

    function isOpc(data) {
        return /one person company|\bopc\b/i.test(legalStructure(data));
    }

    function isOwnerOnly(data) {
        const explicit = clean(data.workforcePresence || data.peopleBeyondOwner || data.nonOwnerWorkforce).toLowerCase();
        return ["owner-only", "only-owner", "no", "none"].includes(explicit);
    }

    function statePortal(data) {
        const state = clean(data.primaryState || data.state || data.registeredState).toLowerCase();
        return STATE_LABOUR_PORTALS[state] || "";
    }

    function normaliseRows(rows, data) {
        const ownerOnly = isOwnerOnly(data);
        return (Array.isArray(rows) ? rows : []).map((original) => {
            const row = {
                ...original,
                thresholdResult: { ...(original.thresholdResult || {}) },
                inputCoverage: { ...(original.inputCoverage || {}) }
            };
            row.officialUrl = row.id === "shops"
                ? statePortal(data)
                : (OFFICIAL_URLS[row.id] || row.officialUrl || "");
            if (ownerOnly && ["factories", "standing-orders", "contract-labour"].includes(row.id)) {
                row.status = "Not currently triggered";
                row.priority = "LOW";
                row.missingInputs = [];
                row.missingQuestions = [];
                row.inputCoverage.confirmed = row.inputCoverage.required;
                row.thresholdResult = {
                    ...row.thresholdResult,
                    state: "below",
                    label: "No non-owner workforce reported",
                    positionText: "Owner/director only",
                    explanation: "No person other than the owner/director was reported as working with the organisation. Recheck before engaging employees, workers or contractors."
                };
            }
            return row;
        }).sort((a, b) => orderOf(a.id) - orderOf(b.id) || clean(a.shortTitle).localeCompare(clean(b.shortTitle)));
    }

    function statusColour(status, colours) {
        if (status === "Applicable") return colours.green;
        if (status === "Review required") return colours.amber;
        if (status === "Needs information") return colours.red;
        return colours.muted;
    }

    function stableHash(value) {
        let hash = 2166136261;
        for (let index = 0; index < value.length; index += 1) {
            hash ^= value.charCodeAt(index);
            hash = Math.imul(hash, 16777619);
        }
        return (hash >>> 0).toString(16).padStart(8, "0").toUpperCase();
    }

    function trackedInputs(data) {
        return {
            legalStructure: legalStructure(data),
            workforcePresence: clean(data.workforcePresence, "Not specified"),
            employees: String(number(data.employees || data.employeeCount || data.headcount)),
            workers: String(number(data.workers)),
            contractors: String(number(data.contractors || data.contractWorkers)),
            industry: clean(data.customIndustry || data.industry, "Not specified"),
            primaryState: clean(data.primaryState || data.state, "Not specified"),
            workModel: clean(data.workModel, "Not specified")
        };
    }

    function readPreviousSnapshot() {
        try {
            const raw = window.localStorage?.getItem(SNAPSHOT_STORAGE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (_error) {
            return null;
        }
    }

    function createInputTrace(data) {
        const values = trackedInputs(data);
        const id = `RPT-${stableHash(JSON.stringify(values))}`;
        const previous = readPreviousSnapshot();
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
            ? Object.keys(values).filter((key) => clean(previous.values[key]) !== clean(values[key])).map((key) => ({
                field: labels[key] || key,
                before: clean(previous.values[key], "Not specified"),
                after: clean(values[key], "Not specified")
            }))
            : [];
        return {
            id,
            values,
            changes,
            previousId: clean(previous?.id),
            generatedAt: clean(data.generatedAt || data.capturedAt, new Date().toISOString())
        };
    }

    function saveInputTrace(trace) {
        try {
            window.localStorage?.setItem(SNAPSHOT_STORAGE_KEY, JSON.stringify({
                id: trace.id,
                values: trace.values,
                savedAt: new Date().toISOString()
            }));
        } catch (_error) {
            // Report generation must not fail because browser storage is unavailable.
        }
    }

    function actionRows(rows) {
        return rows.filter((row) => ["Review required", "Needs information"].includes(row.status));
    }

    function actionId(row) {
        return ACTION_IDS[row.id] || `A-${clean(row.id, "REVIEW").toUpperCase()}`;
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
        const bullet = (value, bulletColour = colours.accent) => {
            const lines = split(value, 164);
            const height = lines.length * lineHeight(8.2) + 3;
            ensure(height);
            doc.setFillColor(...bulletColour);
            doc.circle(19, y - 1, 0.8, "F");
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8.2);
            doc.setTextColor(...colours.text);
            doc.text(lines, 25, y, { lineHeightFactor: 1.28, maxWidth: 164 });
            y += height;
        };
        const callout = (title, body, options = {}) => {
            const width = Number(options.width || 178);
            const x = Number(options.x || PAGE.left);
            const titleLines = split(title, width - 12);
            const bodyLines = split(body, width - 12);
            const height = Math.max(22,
                titleLines.length * lineHeight(9.1, 1.2) +
                bodyLines.length * lineHeight(8.05, 1.28) + 14
            );
            ensure(height + 5);
            doc.setFillColor(...(options.fill || colours.panel));
            doc.setDrawColor(...(options.draw || colours.line));
            doc.roundedRect(x, y - 4, width, height, 2, 2, "FD");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9.1);
            doc.setTextColor(...(options.titleColour || colours.head));
            doc.text(titleLines, x + 6, y + 3, { lineHeightFactor: 1.2, maxWidth: width - 12 });
            const bodyY = y + 4 + titleLines.length * lineHeight(9.1, 1.2) + 3;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8.05);
            doc.setTextColor(...(options.bodyColour || colours.text));
            doc.text(bodyLines, x + 6, bodyY, { lineHeightFactor: 1.28, maxWidth: width - 12 });
            y += height + 5;
        };
        const table = (headers, rows, widths, options = {}) => {
            const fontSize = Number(options.size || 7.2);
            const factor = 1.22;
            const totalWidth = widths.reduce((sum, width) => sum + width, 0);
            const drawRow = (cells, header = false) => {
                const lines = cells.map((cell, index) => split(cell, widths[index] - 4));
                const height = Math.max(9, ...lines.map((value) => value.length * lineHeight(fontSize, factor) + 4));
                ensure(height + 1);
                let x = PAGE.left;
                cells.forEach((_cell, index) => {
                    doc.setFillColor(...(header ? colours.alt : colours.panel));
                    doc.setDrawColor(...colours.line);
                    doc.rect(x, y - 4, widths[index], height, "FD");
                    doc.setFont("helvetica", header ? "bold" : "normal");
                    doc.setFontSize(fontSize);
                    doc.setTextColor(...(header ? colours.head : colours.text));
                    doc.text(lines[index], x + 2, y, { lineHeightFactor: factor, maxWidth: widths[index] - 4 });
                    x += widths[index];
                });
                y += height;
            };
            if (Math.abs(totalWidth - 178) > 0.1) throw new Error("Report table widths must total 178mm.");
            drawRow(headers, true);
            rows.forEach((row) => drawRow(row, false));
            y += 4;
        };
        const link = (label, url) => {
            if (!url) {
                text("Official source not resolved. Confirm the correct authority before relying on this entry.", { size: 7.5, colour: colours.muted });
                return;
            }
            const safeLabel = clean(label);
            const lines = split(safeLabel, 170);
            const height = lines.length * lineHeight(7.7, 1.2);
            ensure(height + 5);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(7.7);
            doc.setTextColor(...colours.accent);
            doc.text(lines, PAGE.left, y, { lineHeightFactor: 1.2, maxWidth: 170 });
            const measured = Number(doc.getTextWidth?.(safeLabel));
            const linkWidth = Number.isFinite(measured) ? Math.min(170, Math.max(20, measured)) : 170;
            doc.setDrawColor(...colours.accent);
            doc.line(PAGE.left, y + 1, PAGE.left + linkWidth, y + 1);
            if (typeof doc.link === "function") doc.link(PAGE.left, y - 4, linkWidth, Math.max(5, height + 2), { url });
            y += height + 5;
        };
        return { colours, paint, addPage, ensure, text, heading, subheading, bullet, callout, table, link, setY: (value) => { y = value; } };
    }

    function resetDocument(doc) {
        while (doc.getNumberOfPages() > 1) {
            doc.deletePage(doc.getNumberOfPages());
        }
        doc.addPage();
        doc.deletePage(1);
        doc.setPage(1);
    }

    function renderCover(doc, colours, data, themeName, trace) {
        doc.setFillColor(...colours.page);
        doc.rect(0, 0, 210, 297, "F");
        doc.setDrawColor(...colours.line);
        doc.setLineWidth(0.45);
        doc.rect(7, 7, 196, 283, "S");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...colours.accent);
        doc.text("HRTECHIFY - GROWWITHHR", 18, 30);
        doc.setFontSize(30);
        doc.setTextColor(...colours.head);
        doc.text("Executive Advisory", 18, 76);
        doc.setFontSize(17);
        doc.text(clean(data.companyName, "Your Organisation"), 18, 100, { maxWidth: 174 });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(...colours.muted);
        doc.text("A concise founder-facing report built from one recorded assessment snapshot.", 18, 122, { maxWidth: 170 });
        doc.setFillColor(...colours.panel);
        doc.setDrawColor(...colours.line);
        doc.roundedRect(18, 174, 174, 52, 3, 3, "FD");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(...colours.head);
        doc.text("REPORT INPUT RECORD", 26, 190);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(...colours.text);
        doc.text(`Snapshot: ${trace.id}`, 26, 202);
        doc.text(`Legal structure used: ${legalStructure(data)}`, 26, 212, { maxWidth: 156 });
        doc.text(`Edition: ${/dark/i.test(themeName) ? "Dark" : "Light"}`, 26, 222);
        doc.setFontSize(8);
        doc.setTextColor(...colours.muted);
        doc.text("Confidential leadership working document. Not legal or regulatory advice.", 18, 270, { maxWidth: 174 });
    }

    function renderAbout(writer, data, trace) {
        writer.heading("about", "PART 1 - SNAPSHOT", "About Your Organisation", "These are the exact organisation details used to prepare this report.");
        writer.table(
            ["Context", "Value"],
            [
                ["Organisation", clean(data.companyName, "Your Organisation")],
                ["Legal structure", legalStructure(data)],
                ["Industry", clean(data.customIndustry || data.industry, "Not specified")],
                ["Employees", String(number(data.employees || data.employeeCount || data.headcount))],
                ["Workers / contractors", `${number(data.workers)} / ${number(data.contractors || data.contractWorkers)}`],
                ["Primary state", clean(data.primaryState || data.state, "Not specified")],
                ["Working model", clean(data.workModel, "Not specified")],
                ["Hiring direction", clean(data.hiringDirection || data.hiringPlans, "Not specified")],
                ["Assessment snapshot", trace.id]
            ],
            [52, 126],
            { size: 8 }
        );
        writer.callout("Why the snapshot matters", "A later report can change when any of these answers changes. The snapshot ID makes each run traceable rather than silently reusing a previous state.");
    }

    function buildSwot(rows, model, data) {
        const actionable = actionRows(rows);
        const dormant = rows.filter((row) => row.status === "Not currently triggered");
        return {
            strength: clean(data.peopleFunction || data.peopleSupport || data.hrSupport, "The organisation context has been recorded."),
            weakness: actionable[0] ? `${actionId(actionable[0])} needs attention.` : "No review or information gap is currently highlighted.",
            opportunity: clean(model.recommendations?.[0]?.title || model.priorities?.[0], "Build a repeatable people operating system before growth accelerates."),
            threat: dormant[0] ? `${dormant[0].shortTitle} may need reassessment after the next relevant change.` : "A workforce or operating change may alter legal obligations."
        };
    }

    function renderBrief(writer, rows, model, data) {
        const actions = actionRows(rows);
        const swot = buildSwot(rows, model, data);
        const applicable = rows.filter((row) => row.status === "Applicable").length;
        const review = rows.filter((row) => row.status === "Review required").length;
        const missing = rows.filter((row) => row.status === "Needs information").length;
        writer.heading("brief", "PART 1 - SNAPSHOT", "Founder Brief", "A two-minute view of the current position and the few items that need attention.");
        writer.callout(
            "Position in one line",
            `${clean(data.companyName, "The organisation")} reports ${number(data.employees || data.employeeCount || data.headcount)} employees. ${applicable} laws appear applicable, ${review} need review and ${missing} need more information.`
        );
        writer.subheading("Top three action references");
        if (!actions.length) {
            writer.bullet("No laws are currently marked Review required or Needs information.");
        } else {
            actions.slice(0, 3).forEach((row) => writer.bullet(`${actionId(row)} - ${row.shortTitle}. See Priority Actions.`));
        }
        writer.subheading("One-line SWOT");
        writer.bullet(`Strength: ${swot.strength}`);
        writer.bullet(`Weakness: ${swot.weakness}`);
        writer.bullet(`Opportunity: ${swot.opportunity}`);
        writer.bullet(`Threat: ${swot.threat}`);
        writer.callout(
            "IF YOU READ NOTHING ELSE",
            actions.length
                ? `Open Priority Actions and complete ${actions.slice(0, 3).map(actionId).join(", ")}. Keep evidence and regenerate the report after any material workforce, state or legal-structure change.`
                : "Keep the recorded evidence and regenerate the report after any material workforce, state or legal-structure change.",
            { titleColour: writer.colours.red }
        );
    }

    function renderStatus(writer, rows) {
        writer.heading("status", "PART 2 - WHY", "Status Explained", "The four labels below are written in plain language and use the actual law counts in this report.");
        ["Applicable", "Review required", "Needs information", "Not currently triggered"].forEach((status) => {
            const group = rows.filter((row) => row.status === status);
            const names = group.length ? group.map((row) => row.shortTitle).join(", ") : "None";
            writer.callout(
                `${group.length} ${group.length === 1 ? "law" : "laws"} - ${status}`,
                `${STATUS_COPY[status]}\n\nIncluded: ${names}.`,
                { titleColour: statusColour(status, writer.colours) }
            );
        });
    }

    function renderEvidence(writer, rows, trace) {
        const missingQuestions = unique(rows.flatMap((row) => row.missingQuestions || []));
        writer.heading("evidence", "PART 2 - WHY", "Evidence & Gaps", "This page shows what is missing, what the report can and cannot prove, and whether tracked answers changed since the previous run.");
        writer.subheading("Answers still needed");
        if (!missingQuestions.length) {
            writer.bullet("No assessment question used by these checks is currently missing.");
        } else {
            missingQuestions.forEach((question) => writer.bullet(question, writer.colours.red));
        }
        actionRows(rows).forEach((row) => {
            const confirmed = Number(row.inputCoverage?.confirmed || 0);
            const required = Number(row.inputCoverage?.required || 0);
            writer.bullet(`${actionId(row)}: You answered ${confirmed} of ${required} questions needed for this check.`);
        });
        writer.callout(
            "Evidence boundary",
            "The report uses assessment answers and organisation context. It does not independently prove that a registration exists, a payment was made, a committee operates or a statutory record is complete."
        );
        writer.subheading("Run-to-run trace");
        writer.bullet(`This report used snapshot ${trace.id}.`);
        writer.bullet(`Legal structure used: ${trace.values.legalStructure}.`);
        if (!trace.previousId) {
            writer.bullet("No earlier report snapshot was found in this browser.");
        } else if (!trace.changes.length) {
            writer.bullet(`No tracked answers changed since ${trace.previousId}.`);
        } else {
            trace.changes.forEach((change) => writer.bullet(`${change.field}: ${change.before} -> ${change.after}.`, writer.colours.red));
        }
    }

    function rowDetail(row) {
        const explanation = clean(row.thresholdResult?.explanation || row.thresholdResult?.label, STATUS_COPY[row.status]);
        const missing = unique(row.missingQuestions || []);
        return [
            `Why it needs attention: ${explanation}`,
            `What is missing or uncertain: ${missing.length ? missing.join("; ") : "No assessment answer is missing; the point still needs review."}`,
            `Action: ${clean(row.requiredAction, "Confirm the current legal position, assign an owner and retain evidence.")}`
        ].join("\n");
    }

    function renderPriority(writer, rows) {
        const actions = actionRows(rows);
        writer.heading("priority", "PART 3 - WHAT TO DO", "Priority Actions", "Full action wording appears only here. Other sections refer back to these stable IDs.");
        if (!actions.length) {
            writer.callout("No priority actions generated", "No law is currently marked Review required or Needs information. Continue to monitor the reassessment conditions on the Not Currently Triggered page.");
            return;
        }
        actions.forEach((row) => writer.callout(
            `${actionId(row)} - ${row.shortTitle} - ${row.status}`,
            rowDetail(row),
            { titleColour: statusColour(row.status, writer.colours) }
        ));
    }

    function renderStrategic(writer, rows, model) {
        const actions = actionRows(rows);
        const actionRefs = actions.map(actionId);
        const recommendations = Array.isArray(model.recommendations) ? model.recommendations.slice(0, 3) : [];
        writer.heading("strategic", "PART 3 - WHAT TO DO", "Strategic Recommendations", "These recommendations support the priority actions without repeating their full wording.");
        if (!recommendations.length) {
            writer.callout("S1 - Build a repeatable people operating system", `Related action IDs: ${actionRefs.join(", ") || "None at present"}. Define ownership, evidence and a regular review rhythm.`);
            return;
        }
        recommendations.forEach((item, index) => {
            const related = actionRefs.length
                ? actionRefs.filter((_id, actionIndex) => actionIndex % recommendations.length === index).join(", ") || actionRefs[0]
                : "None at present";
            writer.callout(
                `S${index + 1} - ${clean(item.title, `Strategic recommendation ${index + 1}`)}`,
                `${clean(item.recommendation, "Define a practical owner, repeatable process and evidence of progress.")}\n\nRelated action IDs: ${related}.`
            );
        });
    }

    function renderRoadmap(writer, rows) {
        const ids = actionRows(rows).map(actionId);
        const first = ids.slice(0, 2);
        const second = ids.slice(2, 3);
        const third = ids.slice(3);
        writer.heading("roadmap", "PART 3 - WHAT TO DO", "0-90 Day Roadmap", "The roadmap sequences the same action IDs. It does not create another version of the action wording.");
        writer.table(
            ["Window", "Action IDs"],
            [
                ["0-30 days", first.join(", ") || "None"],
                ["31-60 days", second.join(", ") || "None"],
                ["61-90 days", third.join(", ") || "None"]
            ],
            [52, 126],
            { size: 9 }
        );
        writer.callout("How to use this page", "Open Priority Actions for the full wording. Record an owner, due date and evidence against each ID in your own action tracker.");
    }

    function currentGap(row) {
        const threshold = Number(row.thresholdResult?.threshold || 0);
        const current = Number(row.thresholdResult?.count || 0);
        if (threshold > current) return `${threshold - current} below the usual threshold`;
        return clean(row.thresholdResult?.positionText || row.thresholdResult?.label, "Current position recorded in the assessment");
    }

    function renderDormant(writer, rows) {
        const dormant = rows.filter((row) => row.status === "Not currently triggered");
        writer.heading("dormant", "PART 3 - WHAT TO DO", "Not Currently Triggered", "Dormant laws are compressed into one page so current priorities receive more attention.");
        if (!dormant.length) {
            writer.callout("No dormant laws", "Every governed law is currently in another status category.");
            return;
        }
        writer.table(
            ["Law", "Usual trigger", "Current gap", "Recheck when"],
            dormant.map((row) => [
                clean(row.shortTitle),
                clean(row.thresholdResult?.triggerText || row.threshold, "See official source"),
                currentGap(row),
                clean(row.reassessWhen || row.futureTrigger || "Workforce size, worker type, location or operations change")
            ]),
            [44, 50, 40, 44],
            { size: 6.5 }
        );
    }

    function renderAnnexure(writer, rows) {
        writer.heading("annexure", "OPTIONAL ANNEXURE", "Law-by-Law Reference", "This detailed section is included only when the report is generated with the annexure option.");
        rows.forEach((row) => {
            const ref = ["Review required", "Needs information"].includes(row.status) ? actionId(row) : "No priority action ID";
            writer.callout(
                `${row.shortTitle} - ${row.status}`,
                `Action reference: ${ref}.\nUsual legal threshold: ${clean(row.thresholdResult?.triggerText || row.threshold, "Confirm from the official source")}.\nYour recorded position: ${clean(row.thresholdResult?.positionText || row.thresholdResult?.label, "Not specified")}.\nWhy it is included: ${clean(row.whyIncluded, "Included in the governed law catalogue for this assessment.")}`
            );
            writer.link(`Open official source for ${row.shortTitle}`, row.officialUrl);
        });
    }

    function renderDisclaimer(writer) {
        writer.heading("disclaimer", "IMPORTANT INFORMATION", "Confidentiality & Disclaimer", "Read this page before sharing or acting on the report.");
        writer.subheading("Confidentiality notice");
        writer.text("This advisory is a confidential leadership working document prepared from information supplied by the user. Share it only with appropriate stakeholders.");
        writer.subheading("Advisory disclaimer");
        writer.text("It provides general business and people-management guidance and is not legal, tax, accounting, employment-law or regulatory advice. Verify requirements with qualified professionals and current official sources.");
    }

    function renderEnd(writer, data) {
        writer.heading("end", "HRTECHIFY - GROWWITHHR", "End of Report", "");
        writer.setY(122);
        writer.text(clean(data.companyName, "Your Organisation"), { size: 15, style: "bold", align: "center", x: 105, width: 160 });
        writer.text("Regenerate this report after a material workforce, state, legal-structure or operating-model change.", { size: 9, align: "center", x: 105, width: 160 });
    }

    function redrawContents(doc, colours, sectionPages, totalPages, includeAnnexure) {
        doc.setPage(2);
        doc.setFillColor(...colours.page);
        doc.rect(0, 0, 210, 297, "F");
        doc.setDrawColor(...colours.line);
        doc.setLineWidth(0.35);
        doc.rect(5.5, 5.5, 199, 286, "S");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(...colours.accent);
        doc.text("FRONT MATTER", 16, 24);
        doc.setFontSize(22);
        doc.setTextColor(...colours.head);
        doc.text("Table of Contents", 16, 40);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.4);
        doc.setTextColor(...colours.muted);
        doc.text(`One structure. One page count. This edition contains ${totalPages} pages including the cover.`, 16, 52, { maxWidth: 178 });
        const items = [
            ["PART 1 - SNAPSHOT", "group"],
            ["About Your Organisation", "about"],
            ["Founder Brief", "brief"],
            ["PART 2 - WHY", "group"],
            ["Status Explained", "status"],
            ["Evidence & Gaps", "evidence"],
            ["PART 3 - WHAT TO DO", "group"],
            ["Priority Actions", "priority"],
            ["Strategic Recommendations", "strategic"],
            ["0-90 Day Roadmap", "roadmap"],
            ["Not Currently Triggered", "dormant"],
            ...(includeAnnexure ? [["OPTIONAL ANNEXURE", "group"], ["Law-by-Law Reference", "annexure"]] : []),
            ["Confidentiality & Disclaimer", "disclaimer"],
            ["End of Report", "end"]
        ];
        let y = 68;
        items.forEach(([label, key], index) => {
            if (key === "group") {
                doc.setFont("helvetica", "bold");
                doc.setFontSize(7.3);
                doc.setTextColor(...colours.accent);
                doc.text(label, 20, y);
                y += 8;
                return;
            }
            const page = sectionPages[key];
            if (!page) return;
            doc.setFillColor(...(index % 2 ? colours.panel : colours.alt));
            doc.roundedRect(16, y - 6, 178, 9, 1.5, 1.5, "F");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(7.6);
            doc.setTextColor(...colours.text);
            doc.text(label, 21, y);
            doc.setTextColor(...colours.accent);
            doc.text(String(page), 188, y, { align: "right" });
            y += 10;
        });
    }

    function redrawPagination(doc, colours) {
        const total = doc.getNumberOfPages();
        for (let page = 1; page <= total; page += 1) {
            doc.setPage(page);
            doc.setFillColor(...colours.page);
            doc.rect(0, 274, 210, 23, "F");
            if (page === 1) continue;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7.5);
            doc.setTextColor(...colours.muted);
            doc.text(`Page ${page} of ${total}`, 190, 285, { align: "right" });
        }
    }

    function serialise(doc, theme, data) {
        const dataUri = doc.output("datauristring");
        const buffer = doc.output("arraybuffer");
        const company = clean(data.companyName, "Organisation").replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "Organisation";
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

    function buildVariant(JsPDF, themeName, rows, model, payload, trace, includeAnnexure) {
        const doc = new JsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true, putOnlyUsedFonts: true });
        const colours = palette(themeName);
        const data = source(payload, model);
        const sectionPages = {};
        resetDocument(doc);
        renderCover(doc, colours, data, themeName, trace);
        doc.addPage();
        const writer = createWriter(doc, colours, sectionPages);
        writer.paint();
        renderAbout(writer, data, trace);
        renderBrief(writer, rows, model, data);
        renderStatus(writer, rows);
        renderEvidence(writer, rows, trace);
        renderPriority(writer, rows);
        renderStrategic(writer, rows, model);
        renderRoadmap(writer, rows);
        renderDormant(writer, rows);
        if (includeAnnexure) renderAnnexure(writer, rows);
        renderDisclaimer(writer);
        renderEnd(writer, data);
        redrawContents(doc, colours, sectionPages, doc.getNumberOfPages(), includeAnnexure);
        redrawPagination(doc, colours);
        return serialise(doc, themeName, data);
    }

    function resolveThemes(payload) {
        const requested = list(payload.themes || payload.reportOptions?.themes).map((theme) => theme.toLowerCase());
        const valid = requested.filter((theme) => THEMES.includes(theme));
        return valid.length ? unique(valid) : [...THEMES];
    }

    function installReport() {
        const service = window.GrowWithHRPDF;
        if (!service || service[INSTALL_FLAG]) return false;
        const JsPDF = window.jspdf?.jsPDF || window.jsPDF;
        if (!JsPDF) return false;
        const buildModel = typeof service.buildAdvisoryModel === "function"
            ? service.buildAdvisoryModel.bind(service)
            : (payload) => payload.model || payload.report || {};
        const buildRows = typeof service.buildReportLawTransparency === "function"
            ? service.buildReportLawTransparency.bind(service)
            : () => [];

        async function buildAdvisoryPdf(payload = {}) {
            const model = buildModel(payload);
            const data = source(payload, model);
            const rows = normaliseRows(buildRows(payload, model), data);
            const trace = createInputTrace(data);
            const includeAnnexure = payload.includeAnnexure === true ||
                payload.reportOptions?.includeAnnexure === true ||
                clean(payload.detailLevel).toLowerCase() === "annexure";
            const variants = resolveThemes(payload).map((theme) =>
                buildVariant(JsPDF, theme, rows, model, payload, trace, includeAnnexure)
            );
            const first = variants.find((item) => item.theme === "light") || variants[0];
            saveInputTrace(trace);
            return {
                ...first,
                pdfs: variants,
                pageCounts: Object.fromEntries(variants.map((item) => [item.theme, item.pageCount])),
                sizeBytes: Number(first?.sizeBytes || 0),
                totalSizeBytes: variants.reduce((sum, item) => sum + Number(item.sizeBytes || 0), 0),
                generatedAt: new Date().toISOString(),
                companyName: clean(data.companyName, "Your Organisation"),
                acceptanceReportVersion: VERSION,
                reportStructureVersion: "single-tier-v1",
                inputSnapshotId: trace.id,
                inputChanges: trace.changes,
                annexureIncluded: includeAnnexure
            };
        }

        const enhanced = Object.freeze({
            ...service,
            [INSTALL_FLAG]: true,
            acceptanceReportVersion: VERSION,
            reportStructureVersion: "single-tier-v1",
            buildAdvisoryPdf
        });
        window.GrowWithHRPDF = enhanced;
        window.GrowWithHRPDFPolishReady = Promise.resolve(enhanced);
        return true;
    }

    function application() {
        return window.executiveAssessment || window.GrowWithHRExecutiveAssessment || window.assessmentApp || null;
    }

    function answers(app) {
        return app?.answers || app?.stateModel?.answers || app?.state?.answers || {};
    }

    function setAnswer(app, name, value) {
        if (typeof app?.stateModel?.setAnswer === "function") app.stateModel.setAnswer(name, value);
        else answers(app)[name] = value;
    }

    function workforceGuard(app = application()) {
        if (!app || Number(app.currentMoment ?? app.stateModel?.currentMoment) !== 2) return false;
        const data = answers(app);
        const section = document.querySelector("[data-industry-adaptive]");
        if (!section || !isOpc(data)) return false;
        let field = section.querySelector('[data-field-wrapper="workforcePresence"]');
        if (!field) {
            field = document.createElement("fieldset");
            field.className = "advisory-choice-fieldset industry-adaptive-field";
            field.dataset.fieldWrapper = "workforcePresence";
            field.innerHTML = '<legend>Does anyone other than the owner/director currently work for or with the organisation?</legend><p class="advisory-field-help">This controls whether employee, worker and payroll-eligibility questions are relevant for a One Person Company.</p><div class="advisory-choice-pills"><label class="advisory-choice-pill"><input type="radio" name="workforcePresence" value="owner-only"><span>No - only the owner/director</span></label><label class="advisory-choice-pill"><input type="radio" name="workforcePresence" value="other-people"><span>Yes - other people work with the organisation</span></label><label class="advisory-choice-pill"><input type="radio" name="workforcePresence" value="not-sure"><span>Not sure</span></label></div>';
            section.querySelector(".advisory-field-group")?.prepend(field);
        }
        const current = clean(data.workforcePresence);
        field.querySelectorAll("input").forEach((input) => { input.checked = input.value === current; });
        const ownerOnly = current === "owner-only";
        const dependent = ["workerCategories", "womenEmployees", "esiWageEligibility", "bonusWageEligibility", "workers", "usesPower", "shiftPattern", "nightShifts", "womenNightShifts"];
        dependent.forEach((name) => {
            const wrapper = section.querySelector(`[data-field-wrapper="${name}"]`);
            if (!wrapper) return;
            wrapper.hidden = ownerOnly;
            wrapper.querySelectorAll("input").forEach((input) => { input.disabled = ownerOnly; });
        });
        if (ownerOnly) {
            setAnswer(app, "workerCategories", ["owner-only"]);
            setAnswer(app, "workers", "0");
            setAnswer(app, "contractors", "0");
            setAnswer(app, "esiWageEligibility", "no");
            setAnswer(app, "bonusWageEligibility", "no");
        }
        return true;
    }

    document.addEventListener("change", (event) => {
        if (event.target?.name === "workforcePresence") {
            const app = application();
            setAnswer(app, "workforcePresence", event.target.value);
            app?.saveNow?.();
            workforceGuard(app);
        }
    }, true);
    window.addEventListener("growwithhr:assessment-modules-ready", (event) => queueMicrotask(() => workforceGuard(event.detail?.application)));
    document.addEventListener("change", () => queueMicrotask(() => workforceGuard()), true);

    let attempts = 0;
    const timer = window.setInterval(() => {
        attempts += 1;
        const reportReady = installReport();
        workforceGuard();
        if (reportReady || attempts >= 200) window.clearInterval(timer);
    }, 50);

    window.GrowWithHRAcceptanceCorrections = Object.freeze({
        version: VERSION,
        installReport,
        workforceGuard,
        normaliseRows,
        actionIds: ACTION_IDS,
        officialUrls: OFFICIAL_URLS,
        stateLabourPortals: STATE_LABOUR_PORTALS
    });
})();
