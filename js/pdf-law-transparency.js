/* GrowWithHR explainable law intelligence and integrated report renderer */
(function installGrowWithHRLawTransparency(window, document) {
    "use strict";

    const base = window.GrowWithHRPDF;
    if (!base || typeof base.buildAdvisoryPdf !== "function") return;
    if (base.lawTransparencyIntegrated) return;

    const VERSION = "0.23.0-founder-law-intelligence";
    const JsPDF = window.jspdf?.jsPDF || window.jsPDF;
    const clean = (value, fallback = "") => String(value ?? "").replace(/\s+/g, " ").trim() || fallback;
    const array = (value) => Array.isArray(value)
        ? value.map((item) => clean(item)).filter(Boolean)
        : (clean(value) ? clean(value).split(/[,;|]/).map((item) => item.trim()).filter(Boolean) : []);
    const unique = (values) => [...new Set(values.map((value) => clean(value)).filter(Boolean))];

    if (document.body?.classList.contains("analyze-company-page")) {
        import("./industry-adaptive-assessment.js").catch((error) => {
            console.error("Industry-adaptive assessment could not load.", error);
        });
    }

    function law(id, title, shortTitle, match, url, threshold, thresholdValue, requiredInputs, why, action, defaultPriority, countField = "employees", secondaryThresholdValue = null) {
        return Object.freeze({
            id,
            title,
            shortTitle,
            match,
            url,
            threshold,
            thresholdValue,
            requiredInputs: Object.freeze(requiredInputs),
            why,
            action,
            defaultPriority,
            countField,
            secondaryThresholdValue
        });
    }

    const LAW_CATALOG = Object.freeze([
        law("posh", "Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013", "POSH Act, 2013", /posh|sexual harassment|internal committee|\bicc\b|\bic\b/i, "https://www.indiacode.nic.in/handle/123456789/2104?locale=en", "Internal Committee required at every office or administrative unit with 10 or more employees.", 10, ["employees", "indiaOperations"], "Workforce size and India workplace operations determine the Internal Committee trigger.", "Constitute and maintain a compliant Internal Committee, policy, training and redressal process.", "HIGH"),
        law("maternity", "Maternity Benefit Act, 1961", "Maternity Benefit Act, 1961", /maternity benefit|maternity|cr[eè]che|creche/i, "https://www.indiacode.nic.in/handle/123456789/9160?locale=en", "The Act generally applies to covered establishments employing 10 or more persons. The crèche facility requirement is triggered at 50 or more employees, subject to the Act and applicable rules.", 10, ["employees", "establishmentType", "womenEmployees", "indiaOperations"], "Establishment type, workforce size and the presence of women employees affect maternity and crèche duties.", "Review maternity benefits, notices, records and any crèche obligations against the applicable rules.", "MEDIUM", "employees", 50),
        law("epf", "Employees' Provident Funds and Miscellaneous Provisions Act, 1952", "EPF & MP Act, 1952", /provident fund|\bepf\b|pf registration/i, "https://www.indiacode.nic.in/show-data?actid=AC_CEN_6_6_00038_195219_1517807328217&orderno=1", "Generally applies to covered factories and notified establishments employing 20 or more persons, subject to statutory exceptions and notifications.", 20, ["employees", "establishmentType", "indiaOperations"], "Employee strength and establishment classification determine the usual EPF coverage trigger.", "Confirm coverage, registration, eligible employees, contributions and supporting payroll records.", "HIGH"),
        law("esi", "Employees' State Insurance Act, 1948", "ESI Act, 1948", /employee.? state insurance|\besi\b|esic/i, "https://www.indiacode.nic.in/handle/123456789/2090?locale=en", "Coverage commonly begins at 10 or more persons in notified establishments, but implementation depends on establishment type, location, notifications and wage eligibility.", 10, ["employees", "establishmentType", "primaryState", "esiWageEligibility", "indiaOperations"], "State implementation, establishment type, workforce size and ESI wage eligibility affect coverage.", "Review ESIC coverage, wage eligibility, registration and contribution records.", "HIGH"),
        law("gratuity", "Payment of Gratuity Act, 1972", "Payment of Gratuity Act, 1972", /gratuity/i, "https://www.indiacode.nic.in/handle/123456789/12862?locale=en", "Applies to covered establishments in which 10 or more persons are employed, or were employed on any day in the preceding 12 months.", 10, ["employees", "establishmentType", "indiaOperations"], "Workforce size and establishment category determine the usual applicability trigger.", "Maintain gratuity eligibility, nomination, funding and settlement controls.", "MEDIUM"),
        law("bonus", "Payment of Bonus Act, 1965", "Payment of Bonus Act, 1965", /payment of bonus|statutory bonus|bonus act/i, "https://www.indiacode.nic.in/handle/123456789/1484?locale=en", "Generally applies to factories and covered establishments employing 20 or more persons, subject to statutory provisions and employee eligibility limits.", 20, ["employees", "establishmentType", "bonusWageEligibility", "indiaOperations"], "Workforce size, establishment type and statutory bonus eligibility affect the duties.", "Review employee eligibility, allocable surplus calculations, payment timing and registers.", "MEDIUM"),
        law("minimum-wages", "Code on Wages, 2019", "Code on Wages, 2019", /minimum wage|wage code|code on wages|payment of wages|equal remuneration/i, "https://www.indiacode.nic.in/handle/123456789/15793?locale=en", "No single universal employee-count threshold. Duties depend on the wage provision, employee category and applicable central or state notifications.", null, ["employees", "primaryState", "industry", "workerCategories", "indiaOperations"], "State, industry and worker category determine the relevant wage rates and obligations.", "Validate wage rates, pay timing, deductions, equal remuneration and wage records against current notifications.", "HIGH"),
        law("shops", "Applicable State Shops and Establishments Legislation", "Shops and Establishments Law", /shops? and establishments?|shop act|establishment registration/i, "", "Thresholds and duties vary by state or union territory. The exact state law must be checked for every declared operating state.", null, ["primaryState", "establishmentType", "indiaOperations"], "Each operating state may impose a different registration, leave, working-hours and record-keeping regime.", "Confirm registration and ongoing duties under the exact law for every operating state.", "HIGH"),
        law("contract-labour", "Contract Labour (Regulation and Abolition) Act, 1970", "Contract Labour Act, 1970", /contract labour|contractor compliance|principal employer/i, "https://www.indiacode.nic.in/handle/123456789/1490?locale=en", "The central Act generally uses a 20-contract-labour threshold, but state amendments may prescribe a different threshold.", 20, ["contractors", "primaryState", "establishmentType", "indiaOperations"], "Contract-labour count, state and establishment type determine registration and licensing duties.", "Confirm principal-employer registration, contractor licensing, wage evidence and statutory oversight.", "HIGH", "contractors"),
        law("standing-orders", "Industrial Employment (Standing Orders) Act, 1946", "Industrial Employment (Standing Orders) Act, 1946", /standing orders/i, "https://www.indiacode.nic.in/handle/123456789/19411?locale=en", "The central threshold is generally 100 workmen, but several states have amended the threshold and the Industrial Relations Code transition must be checked.", 100, ["workers", "primaryState", "establishmentType", "industry", "indiaOperations"], "Worker count, state amendments and establishment classification affect standing-orders coverage.", "Review whether certified or model standing orders apply and maintain the required employment rules.", "MEDIUM", "workers"),
        law("factories", "Factories Act, 1948", "Factories Act, 1948", /factories act|factory licence|manufacturing process|factory compliance/i, "https://www.indiacode.nic.in/handle/123456789/1530?locale=en", "Generally 10 or more workers where power is used, or 20 or more workers where power is not used, subject to the statutory definition and state rules.", 10, ["workers", "usesPower", "manufacturingOperations", "primaryState", "indiaOperations"], "Manufacturing activity, power usage, worker count and state rules determine factory coverage.", "Confirm factory status, licensing, health and safety controls, welfare facilities and statutory registers.", "HIGH", "workers", 20)
    ]);

    const ALIASES = Object.freeze({
        employees: ["employees", "employeeCount", "headcount", "totalEmployees", "workforceSize"],
        workers: ["workers", "workerCount", "workmen", "factoryWorkers", "blueCollarWorkers"],
        contractors: ["contractors", "contractWorkers", "contractorCount", "contractLabour"],
        indiaOperations: ["indiaOperations", "country", "countries", "operatingCountries"],
        establishmentType: ["establishmentType", "entity", "entityType", "legalEntity", "organisationType"],
        primaryState: ["primaryState", "state", "registeredState"],
        operatingStates: ["operatingStates", "states", "primaryState"],
        womenEmployees: ["womenEmployees", "femaleEmployees", "hasWomenEmployees"],
        esiWageEligibility: ["esiWageEligibility", "wageBand", "salaryBand", "eligibleWages"],
        bonusWageEligibility: ["bonusWageEligibility", "wageBand", "salaryBand", "eligibleWages"],
        industry: ["industry", "industryCategory", "industryRuleProfile"],
        workerCategories: ["workerCategories", "employeeCategories", "workforceCategories"],
        usesPower: ["usesPower", "manufacturingUsesPower"],
        manufacturingOperations: ["manufacturingOperations", "isFactory", "manufacturing"]
    });

    const LABELS = Object.freeze({
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
        industry: "industry",
        workerCategories: "worker categories",
        usesPower: "manufacturing power usage",
        manufacturingOperations: "manufacturing activities"
    });

    const QUESTIONS = Object.freeze({
        workerCategories: "Which types of people work with your organisation?",
        womenEmployees: "Are women employed by the organisation?",
        esiWageEligibility: "Are any employees likely to fall within the current ESI wage-eligibility limit?",
        bonusWageEligibility: "Are any employees likely to fall within the statutory bonus eligibility limit?",
        employees: "Roughly how many employees are on the team today?",
        workers: "How many factory, production or blue-collar workers are engaged?",
        contractors: "How many contract and outsourced workers are engaged?",
        indiaOperations: "Does the organisation operate in India?",
        establishmentType: "How is the organisation legally structured?",
        primaryState: "What is the primary operating state?",
        industry: "Which industry best describes the organisation?",
        usesPower: "Is power used in the manufacturing process?",
        manufacturingOperations: "Does the organisation carry out a manufacturing process?"
    });

    function source(payload = {}, model = {}) {
        return Object.assign({}, payload, payload.lead || {}, payload.answers || {}, payload.report || {}, model || {});
    }

    function read(data, field) {
        for (const alias of ALIASES[field] || [field]) {
            const value = data?.[alias];
            if (value !== undefined && value !== null && clean(value) !== "") return value;
        }
        return undefined;
    }

    function confirmed(value) {
        if (value === undefined || value === null) return false;
        if (Array.isArray(value)) return value.length > 0 && !value.every((item) => clean(item).toLowerCase() === "not-sure");
        const text = clean(value).toLowerCase();
        return Boolean(text) && !["unknown", "not specified", "n/a", "na", "prefer not to say", "not sure", "not-sure"].includes(text);
    }

    function numberValue(value) {
        const match = clean(value).replace(/,/g, "").match(/\d+(?:\.\d+)?/);
        return match ? Number(match[0]) : null;
    }

    function recommendationsText(model = {}) {
        return (model.recommendations || [])
            .map((item) => [item.title, item.observation, item.recommendation, item.law, item.legalBasis].map(clean).join(" "))
            .join("\n");
    }

    function countNoun(field, count) {
        if (field === "contractors") return count === 1 ? "contract worker" : "contract workers";
        if (field === "workers") return count === 1 ? "factory or blue-collar worker" : "factory or blue-collar workers";
        return count === 1 ? "employee" : "employees";
    }

    function countPosition(count, field) {
        return `${count} reported ${countNoun(field, count)}`;
    }

    function compareCount(count, threshold, field) {
        const position = countPosition(count, field);
        if (count >= threshold) {
            return {
                state: "crossed",
                label: "Threshold crossed",
                count,
                threshold,
                positionText: position,
                triggerText: `${threshold} ${countNoun(field, threshold)}`,
                explanation: `${position}; statutory trigger shown at ${threshold}.`
            };
        }
        const gap = threshold - count;
        if (gap <= Math.max(2, Math.ceil(threshold * 0.1))) {
            return {
                state: "near",
                label: "Approaching threshold",
                count,
                threshold,
                positionText: position,
                triggerText: `${threshold} ${countNoun(field, threshold)}`,
                explanation: `${position}; ${gap} below the displayed trigger of ${threshold}.`
            };
        }
        return {
            state: "below",
            label: "Below threshold",
            count,
            threshold,
            positionText: position,
            triggerText: `${threshold} ${countNoun(field, threshold)}`,
            explanation: `${position}; below the displayed trigger of ${threshold}.`
        };
    }

    function thresholdState(item, data) {
        const count = numberValue(read(data, item.countField));
        if (item.id === "factories") {
            const manufacturing = clean(read(data, "manufacturingOperations")).toLowerCase();
            if (/^(no|false)$/.test(manufacturing)) {
                return {
                    state: "below",
                    label: "Not triggered by reported operations",
                    count: count ?? 0,
                    threshold: null,
                    positionText: "No manufacturing process reported",
                    triggerText: "Manufacturing activity plus the relevant worker threshold",
                    explanation: "No manufacturing process was reported, so the displayed factory threshold is not currently triggered."
                };
            }
            const power = clean(read(data, "usesPower")).toLowerCase();
            if (!confirmed(manufacturing) || !confirmed(power) || count === null) {
                return {
                    state: "needs-information",
                    label: "Needs information",
                    count,
                    threshold: null,
                    positionText: count === null ? "Factory-worker count not confirmed" : countPosition(count, item.countField),
                    triggerText: "10 workers with power / 20 without power",
                    explanation: "Manufacturing activity, power usage and factory-worker count must be confirmed before selecting the factory threshold."
                };
            }
            return compareCount(count, /^(no|false)$/.test(power) ? item.secondaryThresholdValue : item.thresholdValue, item.countField);
        }

        if (!Number.isFinite(item.thresholdValue)) {
            return {
                state: "review",
                label: "No single headcount trigger",
                count,
                threshold: null,
                positionText: count === null ? "Depends on organisation profile" : countPosition(count, item.countField),
                triggerText: "Depends on the applicable provision, state and workforce category",
                explanation: "This law does not use one universal headcount trigger."
            };
        }

        if (count === null) {
            return {
                state: "needs-information",
                label: "Needs information",
                count,
                threshold: item.thresholdValue,
                positionText: `${LABELS[item.countField] || item.countField} not confirmed`,
                triggerText: `${item.thresholdValue} ${countNoun(item.countField, item.thresholdValue)}`,
                explanation: `${LABELS[item.countField] || item.countField} was not confirmed.`
            };
        }

        return compareCount(count, item.thresholdValue, item.countField);
    }

    function buildRow(item, data) {
        const confirmedInputs = item.requiredInputs.filter((field) => confirmed(read(data, field)));
        const missingInputs = item.requiredInputs.filter((field) => !confirmedInputs.includes(field));
        const thresholdResult = thresholdState(item, data);
        const india = confirmed(read(data, "indiaOperations")) || Number(data.countries) >= 1;
        let status = "Needs information";

        if (!india) {
            status = "Needs information";
        } else if (thresholdResult.state === "below") {
            status = "Not currently triggered";
        } else if (missingInputs.length) {
            status = "Needs information";
        } else if (thresholdResult.state === "crossed") {
            status = "Applicable";
        } else if (thresholdResult.state === "near" || thresholdResult.state === "review") {
            status = "Review required";
        }

        const priority = status === "Applicable"
            ? item.defaultPriority
            : status === "Review required"
                ? "MEDIUM"
                : status === "Needs information"
                    ? "REVIEW"
                    : "LOW";

        return Object.freeze({
            id: item.id,
            title: item.title,
            shortTitle: item.shortTitle,
            officialUrl: item.url,
            threshold: item.threshold,
            thresholdResult,
            confirmedInputs,
            missingInputs,
            missingQuestions: missingInputs.map((field) => QUESTIONS[field] || LABELS[field] || field),
            inputCoverage: Object.freeze({ confirmed: confirmedInputs.length, required: item.requiredInputs.length }),
            whyIncluded: item.why,
            requiredAction: item.action,
            status,
            priority,
            confidenceMeaning: `${confirmedInputs.length} of ${item.requiredInputs.length} required assessment inputs confirmed. This is input coverage, not legal certainty.`
        });
    }

    function buildLawTransparency(payload = {}, model = {}) {
        const data = source(payload, model);
        const text = recommendationsText(model);
        return LAW_CATALOG.filter((item) => item.match.test(text)).map((item) => buildRow(item, data));
    }

    function buildReportLawTransparency(payload = {}, model = {}) {
        const data = source(payload, model);
        return LAW_CATALOG.map((item) => buildRow(item, data));
    }

    const BLACK_MAP = new Map([
        ["7,16,31", [0, 0, 0]],
        ["15,29,50", [10, 10, 10]],
        ["24,43,70", [21, 21, 21]],
        ["61,82,111", [68, 68, 68]],
        ["12,38,72", [8, 8, 8]],
        ["55,41,18", [36, 28, 10]]
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
        return () => {
            restorers.reverse().forEach((restore) => restore());
            delete JsPDF.API.__growwithhrBlackTranslation;
        };
    }

    function palette(name) {
        return /dark/i.test(clean(name))
            ? { page: [0, 0, 0], panel: [10, 10, 10], text: [238, 238, 238], muted: [184, 184, 184], head: [255, 255, 255], line: [68, 68, 68], accent: [245, 158, 11], green: [91, 214, 148], amber: [255, 190, 75], red: [255, 120, 110] }
            : { page: [255, 255, 255], panel: [244, 247, 251], text: [10, 24, 48], muted: [53, 72, 99], head: [4, 28, 67], line: [166, 181, 202], accent: [245, 158, 11], green: [23, 128, 73], amber: [184, 102, 0], red: [180, 35, 24] };
    }

    const colour = (doc, method, value) => doc[method](...value);

    function paint(doc, colours) {
        colour(doc, "setFillColor", colours.page);
        doc.rect(0, 0, 210, 297, "F");
        colour(doc, "setDrawColor", colours.line);
        doc.setLineWidth(0.35);
        doc.rect(5.5, 5.5, 199, 286, "S");
    }

    function createWriter(doc, colours) {
        let y = 24;
        const lineHeight = (size, factor = 1.32) => size * 0.3528 * factor;
        const split = (text, width = 178) => doc.splitTextToSize(clean(text), width);
        const addPage = () => { doc.addPage(); paint(doc, colours); y = 24; };
        const ensure = (height) => { if (y + height > 270) addPage(); };
        const text = (value, options = {}) => {
            const size = options.size || 8.5;
            const lines = split(value, options.width || 178);
            const height = lines.length * lineHeight(size, options.factor || 1.32);
            ensure(height + (options.after ?? 3));
            doc.setFont("helvetica", options.style || "normal");
            doc.setFontSize(size);
            colour(doc, "setTextColor", options.colour || colours.text);
            doc.text(lines, options.x || 16, y, { lineHeightFactor: options.factor || 1.32, maxWidth: options.width || 178 });
            y += height + (options.after ?? 3);
        };
        const heading = (eyebrow, title, intro = "") => {
            addPage();
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8);
            colour(doc, "setTextColor", colours.accent);
            doc.text(clean(eyebrow).toUpperCase(), 16, y);
            y += 8;
            text(title, { size: 19, style: "bold", colour: colours.head, factor: 1.15, after: 6 });
            if (intro) text(intro, { colour: colours.muted, after: 7 });
        };
        const subheading = (value) => text(value, { size: 11, style: "bold", colour: colours.head, after: 4 });
        const bullet = (value) => {
            const lines = split(value, 166);
            const height = lines.length * lineHeight(8.3) + 3;
            ensure(height);
            colour(doc, "setFillColor", colours.accent);
            doc.circle(19, y - 1, 0.8, "F");
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8.3);
            colour(doc, "setTextColor", colours.text);
            doc.text(lines, 25, y, { lineHeightFactor: 1.32, maxWidth: 166 });
            y += height;
        };
        return { heading, subheading, text, bullet, getY: () => y, setY: (value) => { y = value; } };
    }

    function deleteClosingPage(doc) {
        const count = doc.getNumberOfPages();
        if (!count) return;
        try { doc.deletePage(count); } catch (_error) {}
    }

    function drawClosingPage(doc, colours) {
        doc.addPage();
        paint(doc, colours);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        colour(doc, "setTextColor", colours.head);
        doc.text("End of Report", 105, 166, { align: "center" });
        colour(doc, "setDrawColor", colours.accent);
        doc.line(67, 153, 90, 153);
        doc.line(120, 153, 143, 153);
    }

    function appendInterimIntelligence(doc, payload, model, name) {
        const colours = palette(name);
        deleteClosingPage(doc);
        const writer = createWriter(doc, colours);
        const rows = buildReportLawTransparency(payload, model);
        const counts = Object.fromEntries(["Applicable", "Review required", "Needs information", "Not currently triggered"]
            .map((status) => [status, rows.filter((row) => row.status === status).length]));
        const actionable = rows.filter((row) => row.status === "Applicable" || row.status === "Review required" || row.status === "Needs information");
        const missing = unique(rows.flatMap((row) => row.missingQuestions));

        writer.heading("UNDERSTANDING INTELLIGENCE ENGINE", "Executive compliance summary", "A transparent view of statutory triggers, organisation position, evidence completeness and missing information. This is general guidance, not legal certification.");
        writer.subheading("Present position");
        writer.bullet(`${counts.Applicable} laws assessed as applicable`);
        writer.bullet(`${counts["Review required"]} laws require review`);
        writer.bullet(`${counts["Needs information"]} laws need more information`);
        writer.bullet(`${counts["Not currently triggered"]} laws are not currently triggered`);
        writer.subheading("Next recommended action");
        writer.text(actionable[0]?.requiredAction || "Complete the missing assessment information before relying on statutory recommendations.");
        writer.subheading("Missing information");
        (missing.length ? missing : ["No governed assessment inputs are missing."]).forEach(writer.bullet);
        writer.text("Required inputs confirmed represents assessment input coverage, not legal certainty or a compliance score.", { colour: colours.muted });

        writer.heading("PRIORITY ACTIONS", "Actions requiring leadership attention", "Each action is connected to the law and threshold that created it.");
        actionable.slice(0, 8).forEach((row, index) => {
            writer.subheading(`A${index + 1} · ${row.shortTitle}`);
            writer.text(row.thresholdResult.explanation, { style: "bold" });
            writer.text(row.requiredAction);
        });

        writer.heading("LAWS APPLICABLE", "Law-by-law understanding", "The founder-first report sequence controller will replace this interim section with detailed law cards, coverage bars and official sources.");
        rows.forEach((row) => {
            writer.subheading(row.shortTitle);
            writer.text(row.thresholdResult.explanation, { style: "bold" });
            writer.text(`${row.status} · ${row.inputCoverage.confirmed} of ${row.inputCoverage.required} required inputs confirmed.`);
        });

        writer.heading("UPCOMING COMPLIANCE TRIGGERS", "Prepare before the next threshold", "Future changes use reported workforce counts and general statutory triggers. State amendments and notifications may change the result.");
        rows.filter((row) => ["near", "below"].includes(row.thresholdResult.state))
            .forEach((row) => writer.bullet(`${row.shortTitle}: ${row.thresholdResult.explanation}`));

        writer.heading("APPENDIX", "Governed law index", "Laws are listed alphabetically with their present status and official source.");
        [...rows].sort((a, b) => a.shortTitle.localeCompare(b.shortTitle)).forEach((row) => {
            writer.text(`${row.shortTitle} · ${row.status} · ${row.thresholdResult.label}`, { style: "bold", after: 1 });
            if (row.officialUrl) {
                doc.setFont("helvetica", "bold");
                doc.setFontSize(8);
                colour(doc, "setTextColor", colours.accent);
                doc.textWithLink("Open Act", 16, writer.getY(), { url: row.officialUrl });
                writer.setY(writer.getY() + 6);
            }
        });
        drawClosingPage(doc, colours);
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
            version: VERSION
        });
        return variant;
    }

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
                appendInterimIntelligence(variant.document, payload, model, variant.theme || payload.theme || result.theme);
                serialiseVariant(variant);
            });
            if (Array.isArray(result?.pdfs)) {
                result.sizeBytes = result.pdfs.reduce((sum, item) => sum + Number(item.sizeBytes || 0), 0);
                result.pageCounts = Object.fromEntries(result.pdfs.map((item) => [item.theme, item.pageCount]));
            }
            return Object.assign(result, { lawTransparency: true, lawTransparencyIntegrated: true, version: VERSION });
        } finally {
            restore();
        }
    }

    window.GrowWithHRPDF = Object.freeze({
        ...base,
        version: VERSION,
        lawTransparency: true,
        lawTransparencyIntegrated: true,
        buildAdvisoryPdf,
        buildLawTransparency,
        buildReportLawTransparency
    });
    window.GrowWithHRPDFPolishReady = Promise.resolve(window.GrowWithHRPDF);
    window.GrowWithHRLawTransparency = Object.freeze({
        version: "0.23.0-law-transparency",
        integrationVersion: VERSION,
        lawCatalog: LAW_CATALOG,
        labels: LABELS,
        questions: QUESTIONS,
        buildLawTransparency,
        buildReportLawTransparency
    });
})(window, document);
