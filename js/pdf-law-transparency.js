/* GrowWithHR M4 explainable intelligence and integrated report renderer */
(function installGrowWithHRM4(window, document) {
    "use strict";

    const base = window.GrowWithHRPDF;
    if (!base || typeof base.buildAdvisoryPdf !== "function") return;
    if (base.lawTransparencyIntegrated) return;

    const VERSION = "0.20.0-m4-integrated-report";
    const JsPDF = window.jspdf?.jsPDF || window.jsPDF;
    const clean = (value, fallback = "") => String(value ?? "").replace(/\s+/g, " ").trim() || fallback;
    const array = (value) => Array.isArray(value) ? value.map((item) => clean(item)).filter(Boolean) : (clean(value) ? clean(value).split(/[,;|]/).map((item) => item.trim()).filter(Boolean) : []);
    const unique = (values) => [...new Set(values.map((value) => clean(value)).filter(Boolean))];

    if (document.body?.classList.contains("analyze-company-page")) {
        import("./industry-adaptive-assessment.js").catch((error) => console.error("Industry-adaptive assessment could not load.", error));
    }

    const LAW_CATALOG = Object.freeze([
        law("posh", "Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013", "POSH Act, 2013", /posh|sexual harassment|internal committee|\bicc\b|\bic\b/i, "https://www.indiacode.nic.in/handle/123456789/2104?locale=en", "Internal Committee required at every office or administrative unit with 10 or more employees.", 10, ["employees", "indiaOperations"], "Workforce size and India workplace operations determine the Internal Committee trigger.", "Constitute and maintain a compliant Internal Committee, policy, training and redressal process.", "HIGH"),
        law("maternity", "Maternity Benefit Act, 1961", "Maternity Benefit Act, 1961", /maternity benefit|maternity|cr[eè]che|creche/i, "https://www.indiacode.nic.in/handle/123456789/9160?locale=en", "The Act generally applies to covered establishments employing 10 or more persons. The crèche facility requirement is triggered at 50 or more employees, subject to the Act and applicable rules.", 10, ["employees", "establishmentType", "womenEmployees", "indiaOperations"], "Establishment type, workforce size and the presence of women employees affect maternity and crèche duties.", "Review maternity benefits, notices, records and any crèche obligations against the applicable rules.", "MEDIUM", "employees", 50),
        law("epf", "Employees' Provident Funds and Miscellaneous Provisions Act, 1952", "EPF & MP Act, 1952", /provident fund|\bepf\b|pf registration/i, "https://www.indiacode.nic.in/show-data?actid=AC_CEN_6_6_00038_195219_1517807328217&orderno=1", "Generally applies to covered factories and notified establishments employing 20 or more persons, subject to statutory exceptions and notifications.", 20, ["employees", "establishmentType", "indiaOperations"], "Employee strength and establishment classification determine the usual EPF coverage trigger.", "Confirm coverage, registration, eligible employees, contributions and supporting payroll records.", "HIGH"),
        law("esi", "Employees' State Insurance Act, 1948", "ESI Act, 1948", /employee.? state insurance|\besi\b|esic/i, "https://www.indiacode.nic.in/handle/123456789/2090?locale=en", "Coverage commonly begins at 10 or more persons in notified establishments, but implementation depends on establishment type, location, notifications and wage eligibility.", 10, ["employees", "establishmentType", "primaryState", "wageBand", "indiaOperations"], "State implementation, establishment type, workforce size and wage eligibility affect ESI coverage.", "Review ESIC coverage, wage eligibility, registration and contribution records.", "HIGH"),
        law("gratuity", "Payment of Gratuity Act, 1972", "Payment of Gratuity Act, 1972", /gratuity/i, "https://www.indiacode.nic.in/handle/123456789/12862?locale=en", "Applies to covered establishments in which 10 or more persons are employed, or were employed on any day in the preceding 12 months.", 10, ["employees", "establishmentType", "indiaOperations"], "Workforce size and establishment category determine the usual applicability trigger.", "Maintain gratuity eligibility, nomination, funding and settlement controls.", "MEDIUM"),
        law("bonus", "Payment of Bonus Act, 1965", "Payment of Bonus Act, 1965", /payment of bonus|statutory bonus|bonus act/i, "https://www.indiacode.nic.in/handle/123456789/1484?locale=en", "Generally applies to factories and covered establishments employing 20 or more persons, subject to statutory provisions and employee eligibility limits.", 20, ["employees", "establishmentType", "wageBand", "indiaOperations"], "Workforce size, establishment type and employee eligibility affect statutory bonus duties.", "Review employee eligibility, allocable surplus calculations, payment timing and registers.", "MEDIUM"),
        law("minimum-wages", "Code on Wages, 2019", "Code on Wages, 2019", /minimum wage|wage code|code on wages|payment of wages|equal remuneration/i, "https://www.indiacode.nic.in/handle/123456789/15793?locale=en", "No single universal employee-count threshold. Duties depend on the wage provision, employee category and applicable central or state notifications.", null, ["employees", "primaryState", "industry", "workerCategories", "indiaOperations"], "State, industry and worker category determine the relevant wage rates and obligations.", "Validate wage rates, pay timing, deductions, equal remuneration and wage records against current notifications.", "HIGH"),
        law("shops", "Applicable State Shops and Establishments Legislation", "Shops and Establishments Law", /shops? and establishments?|shop act|establishment registration/i, "", "Thresholds and duties vary by state or union territory. The exact state law must be checked for every declared operating state.", null, ["primaryState", "operatingStates", "establishmentType", "indiaOperations"], "Each operating state may impose a different registration, leave, working-hours and record-keeping regime.", "Confirm registration and ongoing duties under the exact law for every operating state.", "HIGH"),
        law("contract-labour", "Contract Labour (Regulation and Abolition) Act, 1970", "Contract Labour Act, 1970", /contract labour|contractor compliance|principal employer/i, "https://www.indiacode.nic.in/handle/123456789/1490?locale=en", "The central Act generally uses a 20-contract-labour threshold, but state amendments may prescribe a different threshold.", 20, ["contractors", "primaryState", "establishmentType", "indiaOperations"], "Contract-labour count, state and establishment type determine registration and licensing duties.", "Confirm principal-employer registration, contractor licensing, wage evidence and statutory oversight.", "HIGH", "contractors"),
        law("standing-orders", "Industrial Employment (Standing Orders) Act, 1946", "Industrial Employment (Standing Orders) Act, 1946", /standing orders/i, "https://www.indiacode.nic.in/handle/123456789/19411?locale=en", "The central threshold is generally 100 workmen, but several states have amended the threshold and the Industrial Relations Code transition must be checked.", 100, ["workers", "primaryState", "establishmentType", "industry", "indiaOperations"], "Worker count, state amendments and establishment classification affect standing-orders coverage.", "Review whether certified or model standing orders apply and maintain the required employment rules.", "MEDIUM", "workers"),
        law("factories", "Factories Act, 1948", "Factories Act, 1948", /factories act|factory licence|manufacturing process|factory compliance/i, "https://www.indiacode.nic.in/handle/123456789/1530?locale=en", "Generally 10 or more workers where power is used, or 20 or more workers where power is not used, subject to the statutory definition and state rules.", 10, ["workers", "usesPower", "manufacturingOperations", "primaryState", "indiaOperations"], "Manufacturing activity, power usage, worker count and state rules determine factory coverage.", "Confirm factory status, licensing, health and safety controls, welfare facilities and statutory registers.", "HIGH", "workers", 20)
    ]);

    function law(id, title, shortTitle, match, url, threshold, thresholdValue, requiredInputs, why, action, defaultPriority, countField = "employees", secondaryThresholdValue = null) {
        return Object.freeze({ id, title, shortTitle, match, url, threshold, thresholdValue, requiredInputs, why, action, defaultPriority, countField, secondaryThresholdValue });
    }

    const ALIASES = Object.freeze({
        employees: ["employees", "employeeCount", "headcount", "totalEmployees", "workforceSize"],
        workers: ["workers", "workerCount", "workmen", "factoryWorkers", "blueCollarWorkers"],
        contractors: ["contractors", "contractWorkers", "contractorCount", "contractLabour"],
        indiaOperations: ["indiaOperations", "country", "countries", "operatingCountries"],
        establishmentType: ["establishmentType", "entity", "entityType", "legalEntity", "organisationType"],
        primaryState: ["primaryState", "state", "registeredState"],
        operatingStates: ["operatingStates", "states"],
        womenEmployees: ["womenEmployees", "femaleEmployees", "hasWomenEmployees"],
        wageBand: ["wageBand", "salaryBand", "eligibleWages"],
        industry: ["industry", "industryCategory", "industryRuleProfile"],
        workerCategories: ["workerCategories", "employeeCategories", "workforceCategories"],
        usesPower: ["usesPower", "manufacturingUsesPower"],
        manufacturingOperations: ["manufacturingOperations", "isFactory", "manufacturing"]
    });
    const LABELS = Object.freeze({ employees: "employee strength", workers: "factory or blue-collar worker strength", contractors: "contractor workforce", indiaOperations: "India operations", establishmentType: "legal establishment type", primaryState: "primary operating state", operatingStates: "operating states", womenEmployees: "women employees", wageBand: "wage eligibility information", industry: "industry", workerCategories: "worker categories", usesPower: "manufacturing power usage", manufacturingOperations: "manufacturing activities" });

    function source(payload = {}, model = {}) { return Object.assign({}, payload, payload.lead || {}, payload.answers || {}, payload.report || {}, model || {}); }
    function read(data, field) { for (const alias of ALIASES[field] || [field]) { const value = data?.[alias]; if (value !== undefined && value !== null && clean(value) !== "") return value; } return undefined; }
    function confirmed(value) { if (value === undefined || value === null) return false; if (Array.isArray(value)) return value.length > 0; const text = clean(value).toLowerCase(); return Boolean(text) && !["unknown", "not specified", "n/a", "na", "prefer not to say", "not sure", "not-sure"].includes(text); }
    function numberValue(value) { const match = clean(value).replace(/,/g, "").match(/\d+(?:\.\d+)?/); return match ? Number(match[0]) : null; }
    function recommendationsText(model = {}) { return (model.recommendations || []).map((item) => [item.title, item.observation, item.recommendation, item.law, item.legalBasis].map(clean).join(" ")).join("\n"); }
    function compareCount(count, threshold, field) { if (count >= threshold) return { state: "crossed", label: "Threshold crossed", count, threshold, explanation: `${count} reported ${field}; statutory trigger shown at ${threshold}.` }; const gap = threshold - count; if (gap <= Math.max(2, Math.ceil(threshold * 0.1))) return { state: "near", label: "Approaching threshold", count, threshold, explanation: `${count} reported ${field}; ${gap} below the displayed trigger of ${threshold}.` }; return { state: "below", label: "Below threshold", count, threshold, explanation: `${count} reported ${field}; below the displayed trigger of ${threshold}.` }; }
    function thresholdState(item, data) {
        const count = numberValue(read(data, item.countField));
        if (!Number.isFinite(item.thresholdValue) || count === null) return { state: "needs-information", label: "Needs information", count, explanation: count === null ? `${LABELS[item.countField] || item.countField} was not confirmed.` : "This law does not use one universal headcount trigger." };
        if (item.id === "factories") {
            const power = clean(read(data, "usesPower")).toLowerCase();
            const manufacturing = clean(read(data, "manufacturingOperations")).toLowerCase();
            if (!power || !manufacturing || /^(no|false)$/.test(manufacturing)) return { state: "needs-information", label: "Needs information", count, explanation: "Manufacturing activity and power usage must be confirmed before selecting the factory threshold." };
            return compareCount(count, /^(no|false)$/.test(power) ? item.secondaryThresholdValue : item.thresholdValue, item.countField);
        }
        return compareCount(count, item.thresholdValue, item.countField);
    }
    function buildRow(item, data) {
        const confirmedInputs = item.requiredInputs.filter((field) => confirmed(read(data, field)));
        const missingInputs = item.requiredInputs.filter((field) => !confirmedInputs.includes(field));
        const thresholdResult = thresholdState(item, data);
        const india = confirmed(read(data, "indiaOperations")) || Number(data.countries) >= 1;
        let status = "Needs information";
        if (india && thresholdResult.state === "crossed") status = "Applicable";
        else if (india && thresholdResult.state === "near") status = "Review required";
        else if (india && thresholdResult.state === "below") status = "Not currently triggered";
        else if (india && item.thresholdValue === null && missingInputs.length <= 1) status = "Review required";
        const priority = status === "Applicable" ? item.defaultPriority : status === "Review required" ? "MEDIUM" : status === "Needs information" ? "REVIEW" : "LOW";
        return Object.freeze({ id: item.id, title: item.title, shortTitle: item.shortTitle, officialUrl: item.url, threshold: item.threshold, thresholdResult, confirmedInputs, missingInputs, inputCoverage: Object.freeze({ confirmed: confirmedInputs.length, required: item.requiredInputs.length }), whyIncluded: item.why, requiredAction: item.action, status, priority, confidenceMeaning: `${confirmedInputs.length} of ${item.requiredInputs.length} required assessment inputs confirmed. This is input coverage, not legal certainty.` });
    }
    function buildLawTransparency(payload = {}, model = {}) { const data = source(payload, model); const text = recommendationsText(model); return LAW_CATALOG.filter((item) => item.match.test(text)).map((item) => buildRow(item, data)); }
    function buildReportLawTransparency(payload = {}, model = {}) { const data = source(payload, model); return LAW_CATALOG.map((item) => buildRow(item, data)); }

    const BLACK_MAP = new Map([
        ["7,16,31", [0, 0, 0]], ["15,29,50", [10, 10, 10]], ["24,43,70", [21, 21, 21]], ["61,82,111", [68, 68, 68]], ["12,38,72", [8, 8, 8]], ["55,41,18", [36, 28, 10]]
    ]);
    function installBlackTranslation() {
        if (!JsPDF || JsPDF.API.__growwithhrBlackTranslation) return () => {};
        const restorers = [];
        for (const method of ["setFillColor", "setDrawColor"]) {
            const original = JsPDF.API[method];
            if (typeof original !== "function") continue;
            JsPDF.API[method] = function translatedColour(...args) {
                const translated = BLACK_MAP.get(args.slice(0, 3).join(","));
                return original.apply(this, translated ? [...translated, ...args.slice(3)] : args);
            };
            restorers.push(() => { JsPDF.API[method] = original; });
        }
        JsPDF.API.__growwithhrBlackTranslation = true;
        return () => { restorers.reverse().forEach((restore) => restore()); delete JsPDF.API.__growwithhrBlackTranslation; };
    }

    function theme(name) { return /dark/i.test(clean(name)) ? { page: [0, 0, 0], panel: [10, 10, 10], alt: [21, 21, 21], text: [238, 238, 238], muted: [184, 184, 184], head: [255, 255, 255], line: [68, 68, 68], accent: [245, 158, 11], green: [91, 214, 148], amber: [255, 190, 75], red: [255, 120, 110], white: [255, 255, 255] } : { page: [255, 255, 255], panel: [244, 247, 251], alt: [232, 239, 248], text: [10, 24, 48], muted: [53, 72, 99], head: [4, 28, 67], line: [166, 181, 202], accent: [245, 158, 11], green: [23, 128, 73], amber: [184, 102, 0], red: [180, 35, 24], white: [255, 255, 255] }; }
    const colour = (doc, method, value) => doc[method](...value);
    function paint(doc, palette) { colour(doc, "setFillColor", palette.page); doc.rect(0, 0, 210, 297, "F"); colour(doc, "setDrawColor", palette.line); doc.setLineWidth(0.35); doc.rect(5.5, 5.5, 199, 286, "S"); }

    function createWriter(doc, palette) {
        let y = 24;
        const lineHeight = (size, factor = 1.32) => size * 0.3528 * factor;
        const split = (text, width = 178) => doc.splitTextToSize(clean(text), width);
        const addPage = () => { doc.addPage(); paint(doc, palette); y = 24; };
        const ensure = (height) => { if (y + height > 270) addPage(); };
        const text = (value, options = {}) => { const size = options.size || 8.5; const lines = split(value, options.width || 178); const height = lines.length * lineHeight(size, options.factor || 1.32); ensure(height + (options.after ?? 3)); doc.setFont("helvetica", options.style || "normal"); doc.setFontSize(size); colour(doc, "setTextColor", options.colour || palette.text); doc.text(lines, options.x || 16, y, { lineHeightFactor: options.factor || 1.32, maxWidth: options.width || 178 }); y += height + (options.after ?? 3); };
        const heading = (eyebrow, title, intro = "") => { addPage(); doc.setFont("helvetica", "bold"); doc.setFontSize(8); colour(doc, "setTextColor", palette.accent); doc.text(eyebrow, 16, y); y += 8; text(title, { size: 19, style: "bold", colour: palette.head, factor: 1.15, after: 6 }); if (intro) text(intro, { colour: palette.muted, after: 7 }); };
        const subheading = (value) => text(value, { size: 11, style: "bold", colour: palette.head, after: 4 });
        const bullet = (value) => { const lines = split(value, 166); const height = lines.length * lineHeight(8.3) + 3; ensure(height); colour(doc, "setFillColor", palette.accent); doc.circle(19, y - 1, 0.8, "F"); doc.setFont("helvetica", "normal"); doc.setFontSize(8.3); colour(doc, "setTextColor", palette.text); doc.text(lines, 25, y, { lineHeightFactor: 1.32, maxWidth: 166 }); y += height; };
        const card = (row) => { const missing = row.missingInputs.map((field) => LABELS[field] || field); const lines = [
            `Your organisation: ${clean(row.thresholdResult.count, "Not confirmed")} ${row.id === "contract-labour" ? "contract workers" : row.id === "factories" || row.id === "standing-orders" ? "factory or blue-collar workers" : "employees"}`,
            `Threshold status: ${row.thresholdResult.label}`,
            `REQUIRED INPUTS CONFIRMED: ${row.inputCoverage.confirmed} OF ${row.inputCoverage.required} · This is input coverage, not legal certainty`,
            `Threshold: ${row.threshold}`,
            `Why this applies or requires review: ${row.whyIncluded}`,
            `Required action: ${row.requiredAction}`,
            `Missing information: ${missing.length ? missing.join(", ") : "none for the governed inputs"}.`
        ];
        ensure(50); colour(doc, "setFillColor", palette.panel); colour(doc, "setDrawColor", palette.line); doc.roundedRect(16, y - 4, 178, 10, 2, 2, "FD"); doc.setFont("helvetica", "bold"); doc.setFontSize(9.5); colour(doc, "setTextColor", palette.head); doc.text(row.shortTitle, 20, y + 2); doc.setFontSize(7.5); colour(doc, "setTextColor", row.status === "Applicable" ? palette.green : row.status === "Review required" ? palette.amber : palette.muted); doc.text(`${row.status.toUpperCase()} · ${row.priority}`, 190, y + 2, { align: "right" }); y += 12; lines.forEach((line, index) => text(line, { size: index === 2 ? 7.6 : 8.1, style: index === 2 ? "bold" : "normal", colour: index === 2 ? palette.accent : palette.text, after: 2 })); if (row.officialUrl) { doc.setFont("helvetica", "bold"); doc.setFontSize(8.3); colour(doc, "setTextColor", palette.accent); doc.textWithLink(`Open official ${row.shortTitle}`, 16, y, { url: row.officialUrl }); y += 8; } else { text("Exact state legislation links will be shown after every operating state is mapped to its applicable enactment.", { size: 8, colour: palette.muted, after: 6 }); } };
        return { heading, subheading, text, bullet, card, addPage, getY: () => y, setY: (value) => { y = value; } };
    }

    function deleteClosingPage(doc) { const count = doc.getNumberOfPages(); if (count > 0) { try { doc.deletePage(count); } catch (_error) {} } }
    function drawClosingPage(doc, palette) { doc.addPage(); paint(doc, palette); doc.setFont("helvetica", "bold"); doc.setFontSize(22); colour(doc, "setTextColor", palette.head); doc.text("End of Report", 105, 166, { align: "center" }); colour(doc, "setDrawColor", palette.accent); doc.line(67, 153, 90, 153); doc.line(120, 153, 143, 153); }

    function appendM4(doc, payload, model, name) {
        const palette = theme(name);
        deleteClosingPage(doc);
        const writer = createWriter(doc, palette);
        const rows = buildReportLawTransparency(payload, model);
        const counts = Object.fromEntries(["Applicable", "Review required", "Needs information", "Not currently triggered"].map((status) => [status, rows.filter((row) => row.status === status).length]));
        const actionable = rows.filter((row) => row.status === "Applicable" || row.status === "Review required");
        const missing = unique(rows.flatMap((row) => row.missingInputs.map((field) => LABELS[field] || field)));

        writer.heading("M4 EXPLAINABLE INTELLIGENCE", "Executive compliance summary", "A transparent view of statutory triggers, organisation position, evidence completeness and missing information. This is general guidance, not legal certification.");
        writer.subheading("Overall status");
        writer.bullet(`${counts.Applicable} applicable laws`); writer.bullet(`${counts["Review required"]} laws require review`); writer.bullet(`${counts["Needs information"]} laws need more information`); writer.bullet(`${counts["Not currently triggered"]} laws are not currently triggered`);
        writer.subheading("Next recommended action"); writer.text(actionable[0]?.requiredAction || "Complete the missing assessment information before relying on statutory recommendations.");
        writer.subheading("Assessment confidence · Why this report is auditable");
        ["Organisation profile completed", "Employee strength confirmed", "Operating states confirmed", "Industry confirmed"].forEach((item) => writer.bullet(`Confirmed: ${item}`));
        missing.slice(0, 6).forEach((item) => writer.bullet(`Missing: ${item}`));
        writer.text("Evidence indicators represent confirmed assessment inputs only. They do not represent legal certainty or a compliance score.", { colour: palette.muted });

        writer.heading("PRIORITY ACTIONS", "Actions requiring leadership attention", "Actions are ordered by statutory position and evidence completeness. Confirm legal interpretation before implementation.");
        actionable.slice(0, 8).forEach((row) => { writer.subheading(`${row.priority} · ${row.shortTitle}`); writer.text(row.requiredAction); writer.text(`Reason: ${row.thresholdResult.explanation}`, { colour: palette.muted }); });

        writer.heading("LAWS APPLICABLE", "Law-by-law explainability", "Every card shows the legal trigger, reported organisation position, resulting status, reasoning, required action, evidence completeness, missing inputs and official source.");
        rows.forEach((row) => writer.card(row));

        writer.heading("UPCOMING COMPLIANCE TRIGGERS", "Prepare before the next threshold", "Upcoming changes use reported workforce counts and general statutory triggers. State amendments and notifications may change the result.");
        rows.filter((row) => row.thresholdResult.state === "near" || row.thresholdResult.state === "below").forEach((row) => writer.bullet(`${row.shortTitle}: ${row.thresholdResult.explanation}`));
        writer.subheading("Missing information"); (missing.length ? missing : ["No governed assessment inputs are missing."]).forEach(writer.bullet);
        writer.subheading("Evidence used"); ["Assessment responses: Used", "Organisation profile: Used", "Uploaded documents: Not connected", "Government registrations: Not connected", "Previous assessments: Used when available"].forEach(writer.bullet);
        writer.subheading("Recommendations roadmap");
        ["Immediate", "Next 30–60 days", "Next quarter"].forEach((label, index) => { writer.text(label, { style: "bold", colour: palette.accent }); const key = ["first30", "next60", "next90"][index]; (model.roadmap?.[key] || []).forEach(writer.bullet); });

        writer.heading("APPENDIX", "Governed law index", "Laws are listed alphabetically. Open Act links point to the official legislation identified for that law.");
        [...rows].sort((a, b) => a.shortTitle.localeCompare(b.shortTitle)).forEach((row) => { writer.text(`${row.shortTitle} · ${row.status} · ${row.thresholdResult.label}`, { style: "bold", after: 1 }); if (row.officialUrl) { doc.setFont("helvetica", "bold"); doc.setFontSize(8); colour(doc, "setTextColor", palette.accent); doc.textWithLink("Open Act", 16, writer.getY(), { url: row.officialUrl }); writer.setY(writer.getY() + 6); } });
        drawClosingPage(doc, palette);
    }

    function pageText(doc, page) { try { return (doc.internal.pages?.[page] || []).join(" "); } catch (_error) { return ""; } }
    function findPage(doc, phrase) { for (let page = 1; page <= doc.getNumberOfPages(); page += 1) if (pageText(doc, page).includes(phrase)) return page; return 0; }
    function moveImportantInformationToEnd(doc) { const important = findPage(doc, "IMPORTANT INFORMATION"); const end = findPage(doc, "End of Report"); if (important && end && important < end - 1 && typeof doc.movePage === "function") { try { doc.movePage(important, end); } catch (_error) {} } }
    function redrawContents(doc, palette) {
        if (doc.getNumberOfPages() < 2) return;
        const labels = ["EXECUTIVE SNAPSHOT", "EXECUTIVE SUMMARY", "POSITIVE FOUNDATIONS", "RECOMMENDED ACTIONS", "COMPLIANCE REVIEW", "0–90 DAYS ROADMAP", "LOOKING AHEAD", "M4 EXPLAINABLE INTELLIGENCE", "PRIORITY ACTIONS", "LAWS APPLICABLE", "UPCOMING COMPLIANCE TRIGGERS", "APPENDIX", "IMPORTANT INFORMATION"];
        const entries = labels.map((label) => ({ label, page: findPage(doc, label) })).filter((entry) => entry.page);
        doc.setPage(2); paint(doc, palette); doc.setFont("helvetica", "bold"); doc.setFontSize(8); colour(doc, "setTextColor", palette.accent); doc.text("REPORT GUIDE", 16, 26); doc.setFontSize(22); colour(doc, "setTextColor", palette.head); doc.text("Table of Contents", 16, 42); doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); colour(doc, "setTextColor", palette.muted); doc.text("The report, M4 explainability section, appendix and disclaimer use one continuous page sequence.", 16, 53, { maxWidth: 178 }); let y = 68; entries.forEach((entry) => { if (y > 270) return; colour(doc, "setFillColor", y % 2 ? palette.panel : palette.alt); doc.roundedRect(16, y - 6, 178, 12, 1.5, 1.5, "F"); doc.setFont("helvetica", "bold"); doc.setFontSize(8.3); colour(doc, "setTextColor", palette.text); doc.text(entry.label.replace("RECOMMENDED ACTIONS", "STRATEGIC RECOMMENDATIONS"), 21, y + 1); colour(doc, "setTextColor", palette.accent); doc.text(String(entry.page - 2), 188, y + 1, { align: "right" }); y += 14; });
    }
    function redrawPageNumbers(doc, palette) { const total = Math.max(0, doc.getNumberOfPages() - 3); for (let page = 3; page < doc.getNumberOfPages(); page += 1) { doc.setPage(page); colour(doc, "setFillColor", palette.page); doc.rect(165, 278, 31, 10, "F"); doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); colour(doc, "setTextColor", palette.muted); doc.text(`Page ${page - 2} of ${total}`, 190, 284, { align: "right" }); } }
    function finalise(doc, name) { const palette = theme(name); moveImportantInformationToEnd(doc); redrawContents(doc, palette); redrawPageNumbers(doc, palette); }

    const originalBuild = base.buildAdvisoryPdf.bind(base);
    const originalModel = base.buildAdvisoryModel?.bind(base);
    async function buildAdvisoryPdf(payload = {}) {
        const restore = installBlackTranslation();
        try {
            const result = await originalBuild(payload);
            const model = originalModel ? originalModel(payload) : (payload.model || {});
            const variants = Array.isArray(result?.pdfs) ? result.pdfs : [result];
            variants.forEach((variant) => {
                if (!variant?.document) return;
                appendM4(variant.document, payload, model, variant.theme || payload.theme || result.theme);
                finalise(variant.document, variant.theme || payload.theme || result.theme);
                const dataUri = variant.document.output("datauristring");
                const buffer = variant.document.output("arraybuffer");
                Object.assign(variant, { dataUri, base64: dataUri.includes(",") ? dataUri.split(",")[1] : dataUri, sizeBytes: buffer.byteLength, pageCount: variant.document.getNumberOfPages(), version: VERSION });
            });
            if (Array.isArray(result?.pdfs)) { result.sizeBytes = result.pdfs.reduce((sum, item) => sum + Number(item.sizeBytes || 0), 0); result.pageCounts = Object.fromEntries(result.pdfs.map((item) => [item.theme, item.pageCount])); }
            return Object.assign(result, { lawTransparency: true, lawTransparencyIntegrated: true, version: VERSION });
        } finally { restore(); }
    }

    window.GrowWithHRPDF = Object.freeze({ ...base, version: VERSION, lawTransparency: true, lawTransparencyIntegrated: true, buildAdvisoryPdf, buildLawTransparency, buildReportLawTransparency });
    window.GrowWithHRPDFPolishReady = Promise.resolve(window.GrowWithHRPDF);
    window.GrowWithHRLawTransparency = Object.freeze({ version: "0.19.0-m4-law-transparency", integrationVersion: VERSION, lawCatalog: LAW_CATALOG, buildLawTransparency, buildReportLawTransparency });
})(window, document);
