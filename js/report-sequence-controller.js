/* GrowWithHR founder-first report sequencing and working-model locks */
(() => {
    "use strict";

    const VERSION = "0.23.0-founder-first-report";
    const INSTALL_FLAG = "__growwithhrReportSequenceInstalled";
    const WORK_MODEL_LOCK_FLAG = "__growwithhrWorkModelLockInstalled";

    const REPORT_ORDER = Object.freeze([
        "snapshot",
        "summary",
        "understanding",
        "evidence",
        "positive",
        "compliance",
        "strategic",
        "priority",
        "upcoming",
        "roadmap",
        "looking",
        "law",
        "index",
        "important",
        "end"
    ]);

    const SECTION_ANCHORS = Object.freeze({
        snapshot: ["EXECUTIVE SNAPSHOT", "ABOUT YOUR ORGANISATION"],
        summary: ["EXECUTIVE SUMMARY", "WHAT MATTERS NEXT"],
        understanding: ["UNDERSTANDING INTELLIGENCE ENGINE", "M4 EXPLAINABLE INTELLIGENCE"],
        evidence: ["EVIDENCE AND MISSING INFORMATION"],
        positive: ["POSITIVE FOUNDATIONS"],
        compliance: ["COMPLIANCE REVIEW", "WHAT YOU SHOULD REVIEW", "HOW TO KEEP COMPLIANCE UNDER CONTROL"],
        strategic: ["STRATEGIC RECOMMENDATIONS", "RECOMMENDED ACTIONS"],
        priority: ["PRIORITY COMPLIANCE ACTIONS", "PRIORITY ACTIONS"],
        upcoming: ["UPCOMING COMPLIANCE TRIGGERS"],
        roadmap: ["ROADMAP - 0 TO 90 DAYS", "0–90 DAYS ROADMAP", "0-90 DAYS ROADMAP", "EXECUTIVE IMPLEMENTATION ROADMAP"],
        looking: ["LOOKING AHEAD", "PREPARING FOR THE NEXT STAGE OF GROWTH"],
        law: ["LAW-BY-LAW UNDERSTANDING", "LAWS APPLICABLE"],
        index: ["GOVERNED LAW INDEX", "APPENDIX"],
        important: ["IMPORTANT INFORMATION", "CONFIDENTIALITY, PRIVACY AND DISCLAIMER"],
        end: ["END OF REPORT"]
    });

    const TOC_ITEMS = Object.freeze([
        ["Executive Snapshot", "snapshot"],
        ["Executive Summary", "summary"],
        ["Understanding Intelligence Engine", "understanding"],
        ["Evidence and Missing Information", "evidence"],
        ["Positive Foundations", "positive"],
        ["Compliance Review", "compliance"],
        ["Strategic Recommendations", "strategic"],
        ["Priority Compliance Actions", "priority"],
        ["Upcoming Compliance Triggers", "upcoming"],
        ["Roadmap - 0 to 90 days", "roadmap"],
        ["Looking Ahead", "looking"],
        ["ANNEXURE", "group"],
        ["Law-by-Law Understanding", "law"],
        ["Governed Law Index", "index"],
        ["Important Information", "important"]
    ]);

    const STATUS_ORDER = Object.freeze([
        "Applicable",
        "Review required",
        "Needs information",
        "Not currently triggered"
    ]);

    const STATUS_EXPLANATIONS = Object.freeze({
        "Applicable": "The reported organisation position crosses the displayed general trigger and the governed inputs needed for this conclusion were confirmed. Confirm the current legal position and maintain the required controls.",
        "Review required": "The law may affect the organisation, but the answer depends on state rules, workforce categories or a trigger that does not use one universal headcount threshold. Review it before deciding that no action is needed.",
        "Needs information": "The assessment cannot yet reach a reliable governed conclusion because one or more specific inputs are missing or were answered as Not sure.",
        "Not currently triggered": "The displayed general trigger is not currently reached based on the information supplied. Reassess when workforce size, worker type, location or operations change."
    });

    const FIELD_LABELS = Object.freeze({
        employees: "employee strength",
        workers: "factory or blue-collar worker strength",
        contractors: "contractor workforce",
        indiaOperations: "India operations",
        establishmentType: "legal establishment type",
        primaryState: "primary operating state",
        operatingStates: "operating states",
        womenEmployees: "whether women are employed",
        esiWageEligibility: "ESI wage eligibility",
        bonusWageEligibility: "statutory bonus eligibility",
        wageBand: "wage eligibility information",
        industry: "industry",
        workerCategories: "worker categories",
        usesPower: "manufacturing power usage",
        manufacturingOperations: "manufacturing activities"
    });

    const FIELD_QUESTIONS = Object.freeze({
        workerCategories: "Which types of people work with your organisation?",
        womenEmployees: "Are women employed by the organisation?",
        esiWageEligibility: "Are any employees likely to fall within the current ESI wage-eligibility limit?",
        bonusWageEligibility: "Are any employees likely to fall within the statutory bonus eligibility limit?",
        wageBand: "Confirm ESI and statutory bonus wage eligibility.",
        employees: "Roughly how many employees are on the team today?",
        workers: "How many factory, production or blue-collar workers are engaged?",
        contractors: "How many contract and outsourced workers are engaged?",
        indiaOperations: "Does the organisation operate in India?",
        establishmentType: "How is the organisation legally structured?",
        primaryState: "What is the primary operating state?",
        operatingStates: "In which states does the organisation operate?",
        industry: "Which industry best describes the organisation?",
        usesPower: "Is power used in the manufacturing process?",
        manufacturingOperations: "Does the organisation carry out a manufacturing process?"
    });

    const clean = (value, fallback = "") => String(value ?? "").replace(/\s+/g, " ").trim() || fallback;
    const unique = (values) => [...new Set(values.map((value) => clean(value)).filter(Boolean))];
    const asArray = (value) => Array.isArray(value)
        ? value.map((item) => clean(item)).filter(Boolean)
        : (clean(value) ? [clean(value)] : []);

    function palette(name) {
        return /dark/i.test(clean(name))
            ? {
                page: [0, 0, 0],
                panel: [10, 10, 10],
                alt: [21, 21, 21],
                text: [238, 238, 238],
                muted: [184, 184, 184],
                head: [255, 255, 255],
                line: [68, 68, 68],
                accent: [245, 158, 11],
                green: [91, 214, 148],
                amber: [255, 190, 75],
                red: [255, 120, 110]
            }
            : {
                page: [255, 255, 255],
                panel: [244, 247, 251],
                alt: [232, 239, 248],
                text: [10, 24, 48],
                muted: [53, 72, 99],
                head: [4, 28, 67],
                line: [166, 181, 202],
                accent: [245, 158, 11],
                green: [23, 128, 73],
                amber: [184, 102, 0],
                red: [180, 35, 24]
            };
    }

    const colour = (doc, method, value) => doc[method](...value);

    function paintPage(doc, colours) {
        colour(doc, "setFillColor", colours.page);
        doc.rect(0, 0, 210, 297, "F");
        colour(doc, "setDrawColor", colours.line);
        doc.setLineWidth(0.35);
        doc.rect(5.5, 5.5, 199, 286, "S");
    }

    function statusColour(status, colours) {
        if (status === "Applicable") return colours.green;
        if (status === "Review required") return colours.amber;
        if (status === "Needs information") return colours.red;
        return colours.muted;
    }

    function fieldLabel(field) {
        return FIELD_LABELS[field] || clean(field);
    }

    function fieldQuestion(field) {
        return FIELD_QUESTIONS[field] || fieldLabel(field);
    }

    function shortText(value, max = 130) {
        const text = clean(value);
        if (text.length <= max) return text;
        return `${text.slice(0, Math.max(0, max - 1)).trim()}…`;
    }

    function cleanRecommendation(value) {
        return clean(value)
            .replace(/^(Selected by you|Company DNA suggestion)\s*[-–:]\s*/i, "")
            .replace(/^(Selected by you|Company DNA suggestion)\s*/i, "");
    }

    function createWriter(doc, colours) {
        let y = 24;
        let sectionTitle = "";
        const lineHeight = (size, factor = 1.32) => size * 0.3528 * factor;
        const split = (value, width = 178) => doc.splitTextToSize(clean(value), width);

        function addPage(continuation = false) {
            doc.addPage();
            paintPage(doc, colours);
            y = 24;
            if (continuation && sectionTitle) {
                doc.setFont("helvetica", "bold");
                doc.setFontSize(7.5);
                colour(doc, "setTextColor", colours.accent);
                doc.text(`${sectionTitle.toUpperCase()} · CONTINUED`, 16, y);
                y += 9;
            }
        }

        function ensure(height) {
            if (y + height > 270) addPage(true);
        }

        function text(value, options = {}) {
            const size = Number(options.size || 8.5);
            const width = Number(options.width || 178);
            const factor = Number(options.factor || 1.32);
            const lines = split(value, width);
            const height = lines.length * lineHeight(size, factor);
            ensure(height + Number(options.after ?? 3));
            doc.setFont("helvetica", options.style || "normal");
            doc.setFontSize(size);
            colour(doc, "setTextColor", options.colour || colours.text);
            doc.text(lines, Number(options.x || 16), y, { lineHeightFactor: factor, maxWidth: width });
            y += height + Number(options.after ?? 3);
        }

        function heading(eyebrow, title, intro = "") {
            sectionTitle = title;
            addPage(false);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8);
            colour(doc, "setTextColor", colours.accent);
            doc.text(clean(eyebrow).toUpperCase(), 16, y);
            y += 8;
            text(title, { size: 19, style: "bold", colour: colours.head, factor: 1.15, after: 6 });
            if (intro) text(intro, { colour: colours.muted, after: 7 });
        }

        function subheading(value) {
            text(value, { size: 11, style: "bold", colour: colours.head, after: 4 });
        }

        function bullet(value, bulletColour = colours.accent) {
            const lines = split(value, 166);
            const height = lines.length * lineHeight(8.3) + 3;
            ensure(height);
            colour(doc, "setFillColor", bulletColour);
            doc.circle(19, y - 1, 0.8, "F");
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8.3);
            colour(doc, "setTextColor", colours.text);
            doc.text(lines, 25, y, { lineHeightFactor: 1.32, maxWidth: 166 });
            y += height;
        }

        function callout(title, body, options = {}) {
            const width = Number(options.width || 178);
            const x = Number(options.x || 16);
            const titleLines = split(title, width - 12);
            const bodyLines = split(body, width - 12);
            const height = Math.max(22, titleLines.length * lineHeight(9.2, 1.2) + bodyLines.length * lineHeight(8.1, 1.3) + 14);
            ensure(height + 5);
            colour(doc, "setFillColor", options.fill || colours.panel);
            colour(doc, "setDrawColor", options.draw || colours.line);
            doc.roundedRect(x, y - 4, width, height, 2, 2, "FD");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9.2);
            colour(doc, "setTextColor", options.titleColour || colours.head);
            doc.text(titleLines, x + 6, y + 3, { lineHeightFactor: 1.2, maxWidth: width - 12 });
            const bodyY = y + 4 + titleLines.length * lineHeight(9.2, 1.2) + 3;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8.1);
            colour(doc, "setTextColor", options.bodyColour || colours.text);
            doc.text(bodyLines, x + 6, bodyY, { lineHeightFactor: 1.3, maxWidth: width - 12 });
            y += height + 5;
        }

        function statusSummary(status, rows) {
            const count = rows.length;
            const title = `${count} ${count === 1 ? "law" : "laws"} · ${status}`;
            const laws = rows.length ? rows.map((row) => row.shortTitle).join(", ") : "No laws in this category.";
            callout(title, `${STATUS_EXPLANATIONS[status]}\n\nIncluded here: ${laws}`, {
                titleColour: statusColour(status, colours),
                fill: colours.panel
            });
        }

        function progressBar(confirmed, required, missingQuestions = []) {
            const safeRequired = Math.max(0, Number(required) || 0);
            const safeConfirmed = Math.min(safeRequired, Math.max(0, Number(confirmed) || 0));
            ensure(24 + missingQuestions.length * 7);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8.1);
            colour(doc, "setTextColor", colours.head);
            doc.text(`Required inputs confirmed · ${safeConfirmed} of ${safeRequired}`, 16, y);
            y += 6;
            const segments = 10;
            const filled = safeRequired ? Math.round((safeConfirmed / safeRequired) * segments) : segments;
            for (let index = 0; index < segments; index += 1) {
                colour(doc, "setFillColor", index < filled ? colours.accent : colours.alt);
                colour(doc, "setDrawColor", colours.line);
                doc.roundedRect(16 + index * 12.8, y - 3.5, 10.7, 4.5, 0.8, 0.8, "FD");
            }
            y += 7;
            if (missingQuestions.length) {
                doc.setFont("helvetica", "bold");
                doc.setFontSize(8);
                colour(doc, "setTextColor", colours.red);
                doc.text("Still needed:", 16, y);
                y += 5;
                missingQuestions.forEach((question) => bullet(question, colours.red));
            } else {
                text("All governed inputs for this law were confirmed. This shows input coverage, not legal certainty.", { size: 7.8, colour: colours.muted, after: 4 });
            }
        }

        function lawCard(row, actionId = "") {
            const missingQuestions = row.missingQuestions?.length
                ? row.missingQuestions
                : (row.missingInputs || []).map(fieldQuestion);
            ensure(68);
            colour(doc, "setFillColor", colours.panel);
            colour(doc, "setDrawColor", colours.line);
            doc.roundedRect(16, y - 4, 178, 12, 2, 2, "FD");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9.4);
            colour(doc, "setTextColor", colours.head);
            doc.text(clean(row.shortTitle), 20, y + 3, { maxWidth: 115 });
            doc.setFontSize(7.1);
            colour(doc, "setTextColor", statusColour(row.status, colours));
            doc.text(`${clean(row.status).toUpperCase()} · ${clean(row.priority)}`, 190, y + 3, { align: "right" });
            y += 15;

            text(clean(row.thresholdResult?.explanation, row.thresholdResult?.label), {
                size: 8.6,
                style: "bold",
                colour: colours.head,
                after: 5
            });

            subheading("What this means");
            const meaning = row.status === "Applicable"
                ? "The displayed general trigger has been crossed and the governed inputs used for this conclusion were confirmed. Confirm the current legal position and maintain the relevant controls."
                : row.status === "Review required"
                    ? "This law may affect the organisation, but the conclusion depends on state rules, workforce categories or a non-universal trigger. Review is required before treating it as not applicable."
                    : row.status === "Needs information"
                        ? "The assessment cannot yet reach a governed conclusion because specific information is missing or was answered as Not sure."
                        : "The displayed general trigger is not currently reached. Reassess when the organisation changes.";
            text(meaning);

            subheading("What to do now");
            text(`${actionId ? `${actionId} · ` : ""}${clean(row.requiredAction)}`, { style: "bold" });

            subheading("Your position versus the displayed trigger");
            callout(
                clean(row.thresholdResult?.positionText, "Organisation position not confirmed"),
                `Displayed trigger: ${clean(row.thresholdResult?.triggerText, row.threshold)}\nCurrent result: ${clean(row.thresholdResult?.label, row.status)}`,
                { fill: colours.alt }
            );

            progressBar(row.inputCoverage?.confirmed, row.inputCoverage?.required, missingQuestions);

            text(`Why this law is included: ${clean(row.whyIncluded)}`, { size: 8, colour: colours.muted, after: 4 });
            if (row.officialUrl) {
                ensure(8);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(8.2);
                colour(doc, "setTextColor", colours.accent);
                doc.textWithLink(`Open official ${clean(row.shortTitle)}`, 16, y, { url: row.officialUrl });
                y += 9;
            } else {
                text("Exact state legislation link requires the confirmed operating state and enactment.", { size: 8, colour: colours.muted, after: 7 });
            }
        }

        function tableHeader(columns) {
            ensure(13);
            colour(doc, "setFillColor", colours.head);
            doc.rect(16, y - 5, 178, 12, "F");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(7.1);
            colour(doc, "setTextColor", [255, 255, 255]);
            let x = 16;
            columns.forEach((column) => {
                doc.text(column.label, x + 3, y + 1, { maxWidth: column.width - 6 });
                x += column.width;
            });
            y += 12;
        }

        function lawIndexTable(rows) {
            const columns = [
                { label: "LAW & STATUS", width: 55 },
                { label: "GENERAL TRIGGER", width: 41 },
                { label: "YOUR CURRENT STATE", width: 41 },
                { label: "NEXT STEP", width: 41 }
            ];
            tableHeader(columns);

            rows.forEach((row, index) => {
                const cells = [
                    `${clean(row.shortTitle)}\n${clean(row.status)}`,
                    clean(row.thresholdResult?.triggerText, row.threshold),
                    `${clean(row.thresholdResult?.positionText, "Not confirmed")}\n${clean(row.thresholdResult?.label)}`,
                    shortText(row.requiredAction, 180)
                ];
                const lineCounts = cells.map((cell, cellIndex) => split(cell, columns[cellIndex].width - 6).length);
                const rowHeight = Math.max(18, Math.max(...lineCounts) * lineHeight(6.8, 1.25) + 7);
                if (y + rowHeight > 270) {
                    addPage(true);
                    tableHeader(columns);
                }
                colour(doc, "setFillColor", index % 2 ? colours.panel : colours.alt);
                colour(doc, "setDrawColor", colours.line);
                doc.rect(16, y - 5, 178, rowHeight, "FD");
                let x = 16;
                cells.forEach((cell, cellIndex) => {
                    doc.setFont("helvetica", cellIndex === 0 ? "bold" : "normal");
                    doc.setFontSize(6.8);
                    colour(doc, "setTextColor", cellIndex === 0 ? colours.head : colours.text);
                    const lines = split(cell, columns[cellIndex].width - 6);
                    doc.text(lines, x + 3, y + 1, { lineHeightFactor: 1.25, maxWidth: columns[cellIndex].width - 6 });
                    x += columns[cellIndex].width;
                });
                y += rowHeight;
                if (row.officialUrl) {
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(6.5);
                    colour(doc, "setTextColor", colours.accent);
                    doc.textWithLink("Open Act", 19, y - 4, { url: row.officialUrl });
                }
            });
            y += 5;
        }

        return {
            heading,
            subheading,
            text,
            bullet,
            callout,
            statusSummary,
            progressBar,
            lawCard,
            lawIndexTable,
            addPage,
            ensure,
            getY: () => y,
            setY: (value) => { y = Number(value); }
        };
    }

    function pageText(doc, page) {
        try {
            return (doc.internal.pages?.[page] || []).join(" ").toUpperCase();
        } catch (_error) {
            return "";
        }
    }

    function findSectionPage(doc, key) {
        const anchors = SECTION_ANCHORS[key] || [];
        for (let page = 3; page <= doc.getNumberOfPages(); page += 1) {
            const content = pageText(doc, page);
            if (anchors.some((anchor) => content.includes(anchor.toUpperCase()))) return page;
        }
        return 0;
    }

    function locateSectionBlocks(doc) {
        const starts = Object.keys(SECTION_ANCHORS)
            .map((key) => ({ key, start: findSectionPage(doc, key) }))
            .filter((entry) => entry.start)
            .sort((left, right) => left.start - right.start);

        const seenPages = new Set();
        const uniqueStarts = starts.filter((entry) => {
            if (seenPages.has(entry.start)) return false;
            seenPages.add(entry.start);
            return true;
        });

        return uniqueStarts.map((entry, index) => ({
            key: entry.key,
            start: entry.start,
            end: index + 1 < uniqueStarts.length ? uniqueStarts[index + 1].start - 1 : doc.getNumberOfPages()
        }));
    }

    function deleteSectionBlocks(doc, keys) {
        const targets = locateSectionBlocks(doc)
            .filter((block) => keys.includes(block.key))
            .flatMap((block) => Array.from({ length: block.end - block.start + 1 }, (_value, index) => block.start + index))
            .sort((left, right) => right - left);
        [...new Set(targets)].forEach((page) => {
            if (page >= 1 && page <= doc.getNumberOfPages()) doc.deletePage(page);
        });
    }

    function source(payload = {}, model = {}) {
        return Object.assign({}, payload, payload.lead || {}, payload.answers || {}, payload.report || {}, model || {});
    }

    function assignActionIds(rows) {
        const rank = { "Applicable": 0, "Needs information": 1, "Review required": 2, "Not currently triggered": 3 };
        const priority = { HIGH: 0, REVIEW: 1, MEDIUM: 2, LOW: 3 };
        return [...rows]
            .filter((row) => row.status !== "Not currently triggered")
            .sort((left, right) => (rank[left.status] ?? 9) - (rank[right.status] ?? 9) || (priority[left.priority] ?? 9) - (priority[right.priority] ?? 9) || clean(left.shortTitle).localeCompare(clean(right.shortTitle)))
            .reduce((map, row, index) => map.set(row.id, `A${index + 1}`), new Map());
    }

    function actionRows(rows, actionIds) {
        return [...actionIds.entries()].map(([id, actionId]) => ({
            row: rows.find((row) => row.id === id),
            actionId
        })).filter((item) => item.row);
    }

    function ownerForLaw(row) {
        if (["epf", "esi", "bonus", "gratuity", "minimum-wages"].includes(row.id)) return "Suggested owner: Finance/Payroll with People or HR";
        if (["factories", "standing-orders", "contract-labour"].includes(row.id)) return "Suggested owner: Operations/Plant with People or HR and Legal";
        if (row.id === "posh") return "Suggested owner: Founder/Leadership with the Internal Committee and People or HR";
        return "Suggested owner: Founder/Leadership with People or HR and qualified advice";
    }

    function renderUnderstanding(doc, colours, rows, actionIds) {
        const writer = createWriter(doc, colours);
        writer.heading(
            "PRESENT · UNDERSTAND",
            "Understanding Intelligence Engine",
            "This section answers four founder questions: what appears to apply now, what needs review, what information is missing, and what is not currently triggered. It is general guidance, not legal certification."
        );

        writer.callout(
            "Your report in one sentence",
            "Start with the applicable and review-required laws, close any missing-information questions, then use the 0–90-day roadmap to assign owners and retain evidence."
        );

        STATUS_ORDER.forEach((status) => writer.statusSummary(status, rows.filter((row) => row.status === status)));

        const firstActions = actionRows(rows, actionIds).slice(0, 3);
        writer.subheading("The first three leadership decisions");
        if (!firstActions.length) {
            writer.bullet("No immediate governed action was generated. Reassess after a material change in workforce or operations.", colours.green);
        } else {
            firstActions.forEach(({ row, actionId }) => {
                writer.bullet(`${actionId} · ${row.shortTitle}: ${row.requiredAction}`, statusColour(row.status, colours));
            });
        }

        writer.callout(
            "What this means for you",
            "The status count is a navigation aid, not a score. A low number of applicable laws does not mean the organisation is compliant, and a high number does not mean it is non-compliant."
        );
    }

    function renderEvidence(doc, colours, rows, payload, model) {
        const writer = createWriter(doc, colours);
        const data = source(payload, model);
        const missingFields = unique(rows.flatMap((row) => row.missingInputs || []));
        const allMissingQuestions = rows.flatMap((row) => row.missingQuestions || []);
        const missingQuestions = unique(allMissingQuestions.length ? allMissingQuestions : missingFields.map(fieldQuestion));

        writer.heading(
            "PRESENT · COMPLETE THE PICTURE",
            "Evidence and Missing Information",
            "The report should never blame a user for information the assessment did not ask. The workforce step now asks universal worker-category, women-employment, ESI wage-eligibility and statutory-bonus eligibility questions."
        );

        writer.subheading("Information still needed");
        if (!missingQuestions.length) {
            writer.callout("No governed assessment inputs are missing", "The report has the assessment inputs it requires for the displayed conclusions. Documents and registrations are still not independently verified.", { titleColour: colours.green });
        } else {
            missingQuestions.forEach((question) => {
                writer.callout(
                    question,
                    "Where to answer: Story 3 — Your people → Workforce and statutory eligibility. Choose Not sure when payroll or operations needs to confirm the answer.",
                    { titleColour: colours.red }
                );
            });
        }

        writer.subheading("Evidence used by this report");
        const evidence = [
            ["Assessment responses", true],
            ["Organisation profile", true],
            ["Uploaded documents", Boolean(data.uploadedDocuments || data.evidenceDocuments)],
            ["Government registrations", Boolean(data.governmentRegistrations)],
            ["Previous assessments", Boolean(data.previousAssessments || data.generatedAt)]
        ];
        evidence.forEach(([label, used]) => writer.bullet(`${label}: ${used ? "Used" : "Not connected"}`, used ? colours.green : colours.muted));
        writer.callout(
            "Evidence boundary",
            "Input coverage shows which assessment questions were confirmed. It is not proof that a registration exists, a payment was made, a committee is operating or a statutory record is complete."
        );
    }

    function renderComplianceReview(doc, colours, model) {
        const writer = createWriter(doc, colours);
        writer.heading(
            "PRESENT · GOVERN",
            "Compliance Review",
            "A founder does not need to personally perform every compliance task. The founder does need a simple operating rhythm that makes ownership, evidence, review and escalation visible."
        );

        const compliance = asArray(model.compliance).slice(0, 5);
        if (compliance.length) {
            writer.subheading("Current review prompts");
            compliance.forEach((item) => writer.bullet(cleanRecommendation(item)));
        }

        const rhythms = [
            ["R1 · Assign an owner", "One person is accountable for each law, policy or recurring obligation. They may delegate the work, but they remain responsible for completion and escalation. Typical owners include the founder, People/HR, Finance/Payroll, Operations/Plant and an external adviser."],
            ["R2 · Retain evidence", "Keep proof that the task was completed and communicated. Examples include registration certificates, payment confirmations, committee constitution records, training attendance, wage registers, contractor licences and review minutes."],
            ["R3 · Review on a cadence", "Monthly: payroll, wage, EPF, ESI and contractor evidence. Quarterly: workforce thresholds, policy controls, POSH and leadership exceptions. Annually: registrations, committee structures, training and major policies. Event-triggered: new state, new location, headcount growth, manufacturing, night shifts or a new worker category."],
            ["R4 · Escalate exceptions", "Overdue, incomplete or high-risk items should appear in a regular leadership forum. Compliance should not remain invisible inside HR, payroll or an external vendor."],
            ["R5 · Reassess after change", "Run the assessment again when workforce size, worker type, location, operating model, manufacturing activity, shift pattern or ownership materially changes."]
        ];
        rhythms.forEach(([title, body]) => writer.callout(title, body));

        writer.callout(
            "What this means for you",
            "A simple rhythm is stronger than a long policy library with no owner, evidence or review date. Start with the highest-priority actions and make completion visible."
        );
    }

    function renderStrategic(doc, colours, model) {
        const writer = createWriter(doc, colours);
        const recommendations = Array.isArray(model.recommendations) ? model.recommendations : [];
        writer.heading(
            "ACT · BUILD THE BUSINESS",
            "Strategic Recommendations",
            "These recommendations connect the organisation profile with practical people capabilities. They are presented as one leadership agenda rather than separate selected and suggested blocks."
        );

        if (!recommendations.length) {
            writer.bullet("No strategic recommendation was available from the advisory model.");
            return;
        }

        recommendations.slice(0, 7).forEach((item, index) => {
            const title = cleanRecommendation(item.title || `Priority ${index + 1}`);
            const observation = cleanRecommendation(item.observation || item.suggestionReason || "This area affects the organisation's ability to scale with clarity and consistency.");
            const recommendation = cleanRecommendation(item.recommendation || "Define a practical owner, minimum repeatable process and evidence of progress.");
            writer.callout(`S${index + 1} · ${title}`, `Why it matters: ${observation}\n\nRecommended move: ${recommendation}`);
        });

        writer.callout(
            "What this means for you",
            "Do not launch every recommendation at once. Choose the actions that protect business momentum, assign an owner and place them into the 0–90-day roadmap."
        );
    }

    function renderPriority(doc, colours, rows, actionIds) {
        const writer = createWriter(doc, colours);
        const actions = actionRows(rows, actionIds);
        writer.heading(
            "ACT · COMPLIANCE PRIORITIES",
            "Priority Compliance Actions",
            "Each action is connected to the Act and threshold reasoning that produced it. The same action ID appears in the roadmap and detailed law card."
        );

        if (!actions.length) {
            writer.bullet("No applicable, review-required or missing-information law produced an immediate action.", colours.green);
            return;
        }

        actions.slice(0, 10).forEach(({ row, actionId }) => {
            writer.callout(
                `${actionId} · ${row.shortTitle}`,
                `${row.thresholdResult?.explanation || row.thresholdResult?.label}\n\nDo now: ${row.requiredAction}\n${ownerForLaw(row)}\nDetailed reference: Law-by-Law Understanding.`,
                { titleColour: statusColour(row.status, colours) }
            );
        });
    }

    function renderUpcoming(doc, colours, rows) {
        const writer = createWriter(doc, colours);
        const upcoming = rows.filter((row) => ["near", "below"].includes(row.thresholdResult?.state));
        writer.heading(
            "FUTURE · WATCH THE TRIGGERS",
            "Upcoming Compliance Triggers",
            "This is the future view: what change in workforce or operations could change the report's conclusion. State amendments and notifications may alter the displayed general triggers."
        );

        if (!upcoming.length) {
            writer.callout("No approaching or below-threshold item was identified", "Reassess after a material change in headcount, worker type, location, manufacturing activity or working model.", { titleColour: colours.green });
        } else {
            upcoming.forEach((row) => {
                writer.callout(
                    row.shortTitle,
                    `Current position: ${row.thresholdResult?.positionText || row.thresholdResult?.explanation}\nDisplayed trigger: ${row.thresholdResult?.triggerText || row.threshold}\nReassess when: the relevant workforce count, state, worker category or operating model changes.`,
                    { titleColour: colours.amber }
                );
            });
        }
    }

    function renderRoadmap(doc, colours, rows, model, actionIds) {
        const writer = createWriter(doc, colours);
        const actions = actionRows(rows, actionIds);
        const cleanList = (items) => unique(asArray(items).map(cleanRecommendation));
        const first30 = unique([
            ...actions.slice(0, 3).map(({ row, actionId }) => `${actionId} · ${row.requiredAction}`),
            ...cleanList(model.roadmap?.first30)
        ]).slice(0, 7);
        const next60 = unique([
            ...actions.slice(3, 6).map(({ row, actionId }) => `${actionId} · ${row.requiredAction}`),
            ...cleanList(model.roadmap?.next60)
        ]).slice(0, 7);
        const next90 = unique([
            ...actions.slice(6, 9).map(({ row, actionId }) => `${actionId} · ${row.requiredAction}`),
            ...cleanList(model.roadmap?.next90)
        ]).slice(0, 7);

        writer.heading(
            "ACT · SEQUENCE THE WORK",
            "Roadmap - 0 to 90 days",
            "The roadmap keeps the report crisp by sequencing work. All three time periods use the same neutral visual treatment; priority comes from the action ID and wording, not from unrelated colours."
        );

        const stage = (label, purpose, items) => {
            writer.callout(label, purpose, { fill: colours.panel });
            (items.length ? items : ["No additional action was generated for this period."]).forEach((item) => writer.bullet(item));
        };
        stage("0–30 DAYS · Create clarity", "Confirm the highest-risk legal positions, assign owners and gather the evidence that already exists.", first30);
        stage("31–60 DAYS · Build consistency", "Close priority gaps, standardise recurring processes and make review dates visible.", next60);
        stage("61–90 DAYS · Embed and review", "Test whether the controls are operating, close exceptions and establish the next recurring review.", next90);

        writer.callout(
            "Founder checkpoint at day 90",
            "Ask: Which actions are complete? What evidence proves completion? Which exceptions remain? What business or workforce change requires the report to be refreshed?"
        );
    }

    function renderLawUnderstanding(doc, colours, rows, actionIds) {
        const writer = createWriter(doc, colours);
        writer.heading(
            "ANNEXURE · DETAILED REFERENCE",
            "Law-by-Law Understanding",
            "Use this annexure after reading the founder brief. Every card starts with why the Act is being shown, then explains the meaning, action, threshold comparison, input coverage, missing questions and official source."
        );
        rows.forEach((row) => writer.lawCard(row, actionIds.get(row.id) || ""));
    }

    function renderLawIndex(doc, colours, rows) {
        const writer = createWriter(doc, colours);
        writer.heading(
            "ANNEXURE · QUICK REFERENCE",
            "Governed Law Index",
            "The table gives a compact view of each law, its present status, the displayed general trigger, the organisation's current state and the next leadership step."
        );
        writer.lawIndexTable([...rows].sort((left, right) => clean(left.shortTitle).localeCompare(clean(right.shortTitle))));
    }

    let logoPromise = null;
    function loadLogoDataUrl() {
        if (logoPromise) return logoPromise;
        if (typeof document === "undefined" || typeof Image !== "function") return Promise.resolve("");
        logoPromise = new Promise((resolve) => {
            const image = new Image();
            image.decoding = "async";
            image.crossOrigin = "anonymous";
            image.onload = () => {
                try {
                    const canvas = document.createElement("canvas");
                    const size = 320;
                    canvas.width = size;
                    canvas.height = size;
                    const context = canvas.getContext("2d");
                    if (!context) return resolve("");
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

    function drawClosingPage(doc, colours, logoDataUrl, payload, model) {
        doc.addPage();
        paintPage(doc, colours);
        if (logoDataUrl) {
            try {
                doc.addImage(logoDataUrl, "PNG", 88, 80, 34, 34, undefined, "FAST");
            } catch (_error) {}
        }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        colour(doc, "setTextColor", colours.accent);
        doc.text("HRTECHIFY · GROWWITHHR", 105, 128, { align: "center" });
        doc.setFontSize(22);
        colour(doc, "setTextColor", colours.head);
        doc.text("End of Report", 105, 154, { align: "center" });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        colour(doc, "setTextColor", colours.muted);
        const data = source(payload, model);
        doc.text(clean(data.companyName, "Your Organisation"), 105, 168, { align: "center", maxWidth: 160 });
        doc.text("Revisit this advisory when workforce, locations or the operating model materially change.", 105, 184, { align: "center", maxWidth: 155 });
        colour(doc, "setDrawColor", colours.accent);
        doc.line(67, 139, 90, 139);
        doc.line(120, 139, 143, 139);
    }

    function appendRequestedSections(doc, colours, rows, payload, model, actionIds, logoDataUrl) {
        renderUnderstanding(doc, colours, rows, actionIds);
        renderEvidence(doc, colours, rows, payload, model);
        renderComplianceReview(doc, colours, model);
        renderStrategic(doc, colours, model);
        renderPriority(doc, colours, rows, actionIds);
        renderUpcoming(doc, colours, rows);
        renderRoadmap(doc, colours, rows, model, actionIds);
        renderLawUnderstanding(doc, colours, rows, actionIds);
        renderLawIndex(doc, colours, rows);
        drawClosingPage(doc, colours, logoDataUrl, payload, model);
    }

    function reorderPageReferences(doc, desiredPages) {
        if (typeof doc.movePage !== "function") return false;
        for (let target = 1; target < desiredPages.length; target += 1) {
            const reference = desiredPages[target];
            const current = doc.internal.pages.findIndex((page, index) => index > 0 && page === reference);
            if (current > 0 && current !== target) doc.movePage(current, target);
        }
        return true;
    }

    function reorderSections(doc) {
        const blocks = locateSectionBlocks(doc);
        const firstSection = Math.min(...blocks.map((block) => block.start));
        if (!Number.isFinite(firstSection)) return false;

        const pageRefs = doc.internal.pages;
        const prefix = [];
        for (let page = 1; page < firstSection; page += 1) prefix.push(pageRefs[page]);

        const blockRefs = new Map(blocks.map((block) => [
            block.key,
            Array.from({ length: block.end - block.start + 1 }, (_value, index) => pageRefs[block.start + index])
        ]));
        const claimed = new Set(prefix);
        blockRefs.forEach((refs) => refs.forEach((ref) => claimed.add(ref)));
        const unknown = [];
        for (let page = firstSection; page <= doc.getNumberOfPages(); page += 1) {
            if (!claimed.has(pageRefs[page])) unknown.push(pageRefs[page]);
        }

        const desired = [null, ...prefix];
        REPORT_ORDER.forEach((key) => {
            if (key === "important" && unknown.length) desired.push(...unknown);
            desired.push(...(blockRefs.get(key) || []));
        });
        return reorderPageReferences(doc, desired);
    }

    function redrawContents(doc, colours) {
        if (doc.getNumberOfPages() < 2) return;
        doc.setPage(2);
        paintPage(doc, colours);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        colour(doc, "setTextColor", colours.accent);
        doc.text("REPORT GUIDE", 16, 24);
        doc.setFontSize(22);
        colour(doc, "setTextColor", colours.head);
        doc.text("Table of Contents", 16, 39);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.2);
        colour(doc, "setTextColor", colours.muted);
        doc.text("Read the founder brief first: present position → meaning → action → future triggers. Use the annexure for detailed legal reference.", 16, 49, { maxWidth: 178 });

        let y = 63;
        TOC_ITEMS.forEach(([label, key], index) => {
            if (key === "group") {
                doc.setFont("helvetica", "bold");
                doc.setFontSize(7.5);
                colour(doc, "setTextColor", colours.accent);
                doc.text(label, 20, y + 1);
                y += 9;
                return;
            }
            const page = findSectionPage(doc, key);
            if (!page || y > 267) return;
            colour(doc, "setFillColor", index % 2 ? colours.panel : colours.alt);
            doc.roundedRect(16, y - 6, 178, 10.5, 1.5, 1.5, "F");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(7.8);
            colour(doc, "setTextColor", colours.text);
            doc.text(label, ["law", "index", "important"].includes(key) ? 27 : 21, y + 0.5);
            colour(doc, "setTextColor", colours.accent);
            doc.text(String(Math.max(1, page - 2)), 188, y + 0.5, { align: "right" });
            y += 11.5;
        });
    }

    function redrawPageNumbers(doc, colours) {
        const total = Math.max(0, doc.getNumberOfPages() - 3);
        for (let page = 3; page < doc.getNumberOfPages(); page += 1) {
            doc.setPage(page);
            colour(doc, "setFillColor", colours.page);
            doc.rect(158, 278, 38, 10, "F");
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7.5);
            colour(doc, "setTextColor", colours.muted);
            doc.text(`Page ${page - 2} of ${total}`, 190, 284, { align: "right" });
        }
    }

    function rebuildVariant(doc, themeName, rows, payload, model, logoDataUrl) {
        if (!doc || !Array.isArray(rows)) return;
        const colours = palette(themeName);
        deleteSectionBlocks(doc, [
            "understanding",
            "evidence",
            "compliance",
            "strategic",
            "priority",
            "upcoming",
            "roadmap",
            "law",
            "index",
            "end"
        ]);
        const actionIds = assignActionIds(rows);
        appendRequestedSections(doc, colours, rows, payload, model, actionIds, logoDataUrl);
        reorderSections(doc);
        redrawContents(doc, colours);
        redrawPageNumbers(doc, colours);
    }

    function serialiseVariant(variant) {
        if (!variant?.document?.output) return variant;
        const dataUri = variant.document.output("datauristring");
        const buffer = variant.document.output("arraybuffer");
        Object.assign(variant, {
            dataUri,
            base64: dataUri.includes(",") ? dataUri.split(",")[1] : dataUri,
            sizeBytes: buffer.byteLength,
            pageCount: variant.document.getNumberOfPages(),
            reportSequenceVersion: VERSION
        });
        return variant;
    }

    function installReportSequence() {
        const service = window.GrowWithHRPDF;
        if (!service || typeof service.buildAdvisoryPdf !== "function" || service[INSTALL_FLAG]) return false;
        const originalBuild = service.buildAdvisoryPdf.bind(service);
        const originalModel = typeof service.buildAdvisoryModel === "function" ? service.buildAdvisoryModel.bind(service) : null;

        async function buildAdvisoryPdf(payload = {}) {
            const result = await originalBuild(payload);
            const model = originalModel ? originalModel(payload) : (payload.model || result?.model || {});
            const rows = typeof service.buildReportLawTransparency === "function"
                ? service.buildReportLawTransparency(payload, model)
                : [];
            const logoDataUrl = await loadLogoDataUrl();
            const variants = Array.isArray(result?.pdfs) ? result.pdfs : [result];
            variants.forEach((variant) => {
                if (!variant?.document) return;
                rebuildVariant(variant.document, variant.theme || payload.theme || result.theme, rows, payload, model, logoDataUrl);
                serialiseVariant(variant);
            });
            if (Array.isArray(result?.pdfs)) {
                result.sizeBytes = result.pdfs.reduce((sum, variant) => sum + Number(variant.sizeBytes || 0), 0);
                result.pageCounts = Object.fromEntries(result.pdfs.map((variant) => [variant.theme, variant.pageCount]));
                const first = result.pdfs[0];
                if (first) Object.assign(result, { dataUri: first.dataUri, base64: first.base64, pageCount: first.pageCount });
            }
            return Object.assign(result, { reportSequenceVersion: VERSION });
        }

        const enhanced = Object.freeze({
            ...service,
            [INSTALL_FLAG]: true,
            reportSequenceVersion: VERSION,
            buildAdvisoryPdf
        });
        window.GrowWithHRPDF = enhanced;
        window.GrowWithHRPDFPolishReady = Promise.resolve(enhanced);
        return true;
    }

    function applicationAnswers(application) {
        return application?.answers || application?.stateModel?.answers || application?.state?.answers || {};
    }

    function setAnswer(application, name, value) {
        if (typeof application?.stateModel?.setAnswer === "function") {
            application.stateModel.setAnswer(name, value);
            return;
        }
        applicationAnswers(application)[name] = value;
    }

    function findApplication() {
        return window.executiveAssessment || window.GrowWithHRExecutiveAssessment || window.assessmentApp || null;
    }

    function resolveRemoteBand(workModel) {
        const value = clean(workModel).toLowerCase().replace(/[_-]+/g, " ");
        if (["office based", "full onsite", "fully onsite", "full on site", "fully on site"].includes(value)) return "0";
        if (["remote", "full remote", "fully remote"].includes(value)) return "100";
        return "";
    }

    function syncWorkingModel(application) {
        if (!document?.querySelectorAll) return;
        const answers = applicationAnswers(application);
        const selectedWorkModel = document.querySelector('input[name="workModel"]:checked')?.value || answers.workModel;
        const target = resolveRemoteBand(selectedWorkModel);
        const controls = Array.from(document.querySelectorAll('input[name="remoteBand"]'));
        if (!controls.length) return;

        controls.forEach((input) => {
            const locked = Boolean(target) && input.value !== target;
            input.disabled = locked;
            input.setAttribute("aria-disabled", locked ? "true" : "false");
            input.closest("label")?.classList.toggle("is-work-model-locked", locked);
            if (locked) input.checked = false;
        });

        if (target) {
            const selected = controls.find((input) => input.value === target);
            if (selected) {
                selected.disabled = false;
                selected.checked = true;
                selected.removeAttribute("aria-disabled");
                selected.closest("label")?.classList.remove("is-work-model-locked");
            }
            setAnswer(application, "remoteBand", target);
            setAnswer(application, "remoteWorkforce", target === "100" ? "Fully remote" : "None");
            setAnswer(application, "remoteExact", "");
            const exactField = document.getElementById("remoteExactField");
            if (exactField) exactField.hidden = true;
            application?.persist?.();
            application?.saveProgress?.();
            application?.saveNow?.();
        }
    }

    function installWorkModelLock(application) {
        if (!application || application[WORK_MODEL_LOCK_FLAG]) return false;
        Object.defineProperty(application, WORK_MODEL_LOCK_FLAG, { value: true });
        document.addEventListener("change", (event) => {
            if (event.target?.name === "workModel") queueMicrotask(() => syncWorkingModel(application));
        }, true);
        const story = document.getElementById("storyContainer");
        if (story && typeof MutationObserver === "function") {
            new MutationObserver(() => queueMicrotask(() => syncWorkingModel(application)))
                .observe(story, { childList: true, subtree: true });
        }
        queueMicrotask(() => syncWorkingModel(application));
        return true;
    }

    function installAll(application = findApplication()) {
        installReportSequence();
        installWorkModelLock(application);
    }

    window.addEventListener?.("growwithhr:assessment-modules-ready", (event) => installAll(event.detail?.application));
    installAll();

    let attempts = 0;
    const timer = window.setInterval?.(() => {
        attempts += 1;
        installAll();
        if ((window.GrowWithHRPDF?.[INSTALL_FLAG] && findApplication()?.[WORK_MODEL_LOCK_FLAG]) || attempts >= 100) {
            window.clearInterval?.(timer);
        }
    }, 100);

    window.GrowWithHRReportSequenceController = Object.freeze({
        version: VERSION,
        reportOrder: REPORT_ORDER,
        tocItems: TOC_ITEMS,
        fieldQuestions: FIELD_QUESTIONS,
        resolveRemoteBand,
        reorderPageReferences,
        installReportSequence,
        syncWorkingModel,
        cleanRecommendation,
        assignActionIds
    });
})();
