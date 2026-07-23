/* ==========================================================
   GrowWithHR M4 law transparency layer
   Adds an auditable appendix to the existing advisory PDF.
   No legal-confidence percentage is produced.
   ========================================================== */
(function installGrowWithHRLawTransparency(window) {
    "use strict";

    const currentPdf = window.GrowWithHRPDF;
    if (!currentPdf || typeof currentPdf.buildAdvisoryPdf !== "function") {
        console.warn("GrowWithHR law transparency: PDF service unavailable.");
        return;
    }
    if (currentPdf.lawTransparency) return;

    const VERSION = "0.19.0-m4-law-transparency";
    const PAGE = Object.freeze({ width: 210, height: 297, left: 16, right: 16, top: 24, bottom: 272 });
    const THEMES = Object.freeze({
        light: Object.freeze({ page: [255,255,255], panel: [244,247,251], text: [10,24,48], muted: [53,72,99], heading: [4,28,67], line: [166,181,202], accent: [245,158,11], green: [23,128,73], amber: [184,102,0], red: [180,35,24] }),
        dark: Object.freeze({ page: [7,16,31], panel: [15,29,50], text: [234,240,248], muted: [174,188,207], heading: [255,255,255], line: [61,82,111], accent: [245,158,11], green: [91,214,148], amber: [255,190,75], red: [255,120,110] })
    });

    const LAW_CATALOG = Object.freeze([
        {
            id: "posh",
            title: "Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013",
            shortTitle: "POSH Act, 2013",
            match: /posh|sexual harassment|internal committee|\bicc\b|\bic\b/i,
            url: "https://www.indiacode.nic.in/handle/123456789/2104?locale=en",
            threshold: "Internal Committee required at every office or administrative unit with 10 or more employees.",
            thresholdValue: 10,
            requiredInputs: ["employees", "indiaOperations"],
            why: "Workforce size and India workplace operations determine the Internal Committee trigger."
        },
        {
            id: "maternity",
            title: "Maternity Benefit Act, 1961",
            shortTitle: "Maternity Benefit Act, 1961",
            match: /maternity benefit|maternity|cr[eè]che|creche/i,
            url: "https://www.indiacode.nic.in/handle/123456789/9160?locale=en",
            threshold: "The Act generally applies to covered establishments employing 10 or more persons. The crèche facility requirement is triggered at 50 or more employees, subject to the Act and applicable rules.",
            thresholdValue: 10,
            secondaryThresholdValue: 50,
            requiredInputs: ["employees", "establishmentType", "womenEmployees", "indiaOperations"],
            why: "Establishment type, workforce size and the presence of women employees affect the applicable maternity and crèche duties."
        },
        {
            id: "epf",
            title: "Employees' Provident Funds and Miscellaneous Provisions Act, 1952",
            shortTitle: "EPF & MP Act, 1952",
            match: /provident fund|\bepf\b|pf registration/i,
            url: "https://www.indiacode.nic.in/show-data?actid=AC_CEN_6_6_00038_195219_1517807328217&orderno=1",
            threshold: "Generally applies to covered factories and notified establishments employing 20 or more persons, subject to statutory exceptions and notifications.",
            thresholdValue: 20,
            requiredInputs: ["employees", "establishmentType", "indiaOperations"],
            why: "Employee strength and establishment classification determine the usual EPF coverage trigger."
        },
        {
            id: "esi",
            title: "Employees' State Insurance Act, 1948",
            shortTitle: "ESI Act, 1948",
            match: /employee.? state insurance|\besi\b|esic/i,
            url: "https://www.indiacode.nic.in/handle/123456789/2090?locale=en",
            threshold: "Coverage commonly begins at 10 or more persons in notified establishments, but implementation depends on establishment type, location, notifications and wage eligibility.",
            thresholdValue: 10,
            requiredInputs: ["employees", "establishmentType", "primaryState", "wageBand", "indiaOperations"],
            why: "State implementation, establishment type, workforce size and wage eligibility affect ESI coverage."
        },
        {
            id: "gratuity",
            title: "Payment of Gratuity Act, 1972",
            shortTitle: "Payment of Gratuity Act, 1972",
            match: /gratuity/i,
            url: "https://www.indiacode.nic.in/handle/123456789/12862?locale=en",
            threshold: "Applies to covered establishments in which 10 or more persons are employed, or were employed on any day in the preceding 12 months.",
            thresholdValue: 10,
            requiredInputs: ["employees", "establishmentType", "indiaOperations"],
            why: "Workforce size and establishment category determine the usual applicability trigger."
        },
        {
            id: "bonus",
            title: "Payment of Bonus Act, 1965",
            shortTitle: "Payment of Bonus Act, 1965",
            match: /payment of bonus|statutory bonus|bonus act/i,
            url: "https://www.indiacode.nic.in/handle/123456789/1484?locale=en",
            threshold: "Generally applies to factories and covered establishments employing 20 or more persons, subject to statutory provisions and employee eligibility limits.",
            thresholdValue: 20,
            requiredInputs: ["employees", "establishmentType", "wageBand", "indiaOperations"],
            why: "Workforce size, establishment type and employee eligibility affect statutory bonus duties."
        },
        {
            id: "minimum-wages",
            title: "Code on Wages, 2019",
            shortTitle: "Code on Wages, 2019",
            match: /minimum wage|wage code|code on wages|payment of wages|equal remuneration/i,
            url: "https://www.indiacode.nic.in/handle/123456789/15793?locale=en",
            threshold: "No single universal employee-count threshold. Duties depend on the wage provision, employee category and applicable central or state notifications.",
            thresholdValue: null,
            requiredInputs: ["employees", "primaryState", "industry", "workerCategories", "indiaOperations"],
            why: "State, industry and worker category determine the relevant wage rates and obligations."
        },
        {
            id: "shops",
            title: "Applicable State Shops and Establishments Legislation",
            shortTitle: "Shops and Establishments Law",
            match: /shops? and establishments?|shop act|establishment registration/i,
            url: "",
            threshold: "Thresholds and duties vary by state or union territory. The report must use the exact state law for each declared operating location.",
            thresholdValue: null,
            requiredInputs: ["primaryState", "operatingStates", "establishmentType", "indiaOperations"],
            why: "Each operating state may impose a different registration, leave, working-hours and record-keeping regime."
        },
        {
            id: "contract-labour",
            title: "Contract Labour (Regulation and Abolition) Act, 1970",
            shortTitle: "Contract Labour Act, 1970",
            match: /contract labour|contractor compliance|principal employer/i,
            url: "https://www.indiacode.nic.in/handle/123456789/1490?locale=en",
            threshold: "The central Act generally uses a 20-contract-labour threshold, but state amendments may prescribe a different threshold.",
            thresholdValue: 20,
            countField: "contractors",
            requiredInputs: ["contractors", "primaryState", "establishmentType", "indiaOperations"],
            why: "Contract-labour count, state and establishment type determine registration and licensing duties."
        },
        {
            id: "standing-orders",
            title: "Industrial Employment (Standing Orders) Act, 1946",
            shortTitle: "Industrial Employment (Standing Orders) Act, 1946",
            match: /standing orders/i,
            url: "https://www.indiacode.nic.in/handle/123456789/19411?locale=en",
            threshold: "The central threshold is generally 100 workmen, but several states have amended the threshold and the Industrial Relations Code transition must be checked.",
            thresholdValue: 100,
            countField: "workers",
            requiredInputs: ["workers", "primaryState", "establishmentType", "industry", "indiaOperations"],
            why: "Worker count, state amendments and establishment classification affect standing-orders coverage."
        },
        {
            id: "factories",
            title: "Factories Act, 1948",
            shortTitle: "Factories Act, 1948",
            match: /factories act|factory licence|manufacturing process|factory compliance/i,
            url: "https://www.indiacode.nic.in/handle/123456789/1530?locale=en",
            threshold: "Generally 10 or more workers where power is used, or 20 or more workers where power is not used, subject to the statutory definition and state rules.",
            thresholdValue: 10,
            secondaryThresholdValue: 20,
            countField: "workers",
            requiredInputs: ["workers", "usesPower", "manufacturingOperations", "primaryState", "indiaOperations"],
            why: "Manufacturing activity, power usage, worker count and state rules determine factory coverage."
        }
    ]);

    const FIELD_ALIASES = Object.freeze({
        employees: ["employees", "employeeCount", "headcount", "totalEmployees", "workforceSize"],
        workers: ["workers", "workerCount", "workmen", "totalWorkers", "employees"],
        contractors: ["contractors", "contractorCount", "contractLabour", "contractWorkers"],
        indiaOperations: ["indiaOperations", "country", "countries", "operatingCountries"],
        establishmentType: ["establishmentType", "entityType", "legalEntity", "organisationType"],
        primaryState: ["primaryState", "state", "registeredState"],
        operatingStates: ["operatingStates", "states", "locations"],
        womenEmployees: ["womenEmployees", "femaleEmployees", "hasWomenEmployees"],
        wageBand: ["wageBand", "salaryBand", "eligibleWages"],
        industry: ["industry", "industryCategory"],
        workerCategories: ["workerCategories", "employeeCategories", "workforceCategories"],
        usesPower: ["usesPower", "manufacturingUsesPower"],
        manufacturingOperations: ["manufacturingOperations", "isFactory", "manufacturing"]
    });

    function cleanText(value, fallback = "") {
        const text = String(value ?? "").replace(/\s+/g, " ").trim();
        return text || fallback;
    }

    function flattenSources(payload = {}, model = {}) {
        return Object.assign({}, payload, payload.lead || {}, payload.answers || {}, payload.report || {}, model || {});
    }

    function readField(source, field) {
        const aliases = FIELD_ALIASES[field] || [field];
        for (const alias of aliases) {
            const value = source?.[alias];
            if (value !== undefined && value !== null && cleanText(value) !== "") return value;
        }
        return undefined;
    }

    function isConfirmed(value) {
        if (value === undefined || value === null) return false;
        if (Array.isArray(value)) return value.length > 0;
        const text = cleanText(value).toLowerCase();
        return Boolean(text && !["unknown", "not specified", "n/a", "na", "prefer not to say"].includes(text));
    }

    function numberValue(value) {
        if (typeof value === "number" && Number.isFinite(value)) return value;
        const match = cleanText(value).replace(/,/g, "").match(/\d+(?:\.\d+)?/);
        return match ? Number(match[0]) : null;
    }

    function recommendationText(model = {}) {
        return (model.recommendations || []).map((item) => [item.title, item.observation, item.recommendation, item.law, item.legalBasis].map(cleanText).join(" ")).join("\n");
    }

    function thresholdState(law, source) {
        const field = law.countField || "employees";
        const count = numberValue(readField(source, field));
        if (!Number.isFinite(law.thresholdValue) || count === null) {
            return { state: "needs-information", label: "Needs information", count, explanation: count === null ? `${field} count was not confirmed.` : "This law does not use one universal headcount trigger." };
        }
        if (law.id === "factories") {
            const usesPower = cleanText(readField(source, "usesPower")).toLowerCase();
            const threshold = /^(no|false|without)$/i.test(usesPower) ? law.secondaryThresholdValue : law.thresholdValue;
            if (!usesPower) return { state: "needs-information", label: "Needs information", count, explanation: "Power usage was not confirmed, so the 10-worker or 20-worker trigger cannot yet be selected." };
            return compareCount(count, threshold, field);
        }
        if (law.id === "maternity" && /cr[eè]che|creche/i.test(recommendationText({ recommendations: source.__recommendations || [] }))) {
            return compareCount(count, law.secondaryThresholdValue, field);
        }
        return compareCount(count, law.thresholdValue, field);
    }

    function compareCount(count, threshold, field) {
        if (count >= threshold) return { state: "crossed", label: "Threshold crossed", count, threshold, explanation: `${count} reported ${field}; statutory trigger shown at ${threshold}.` };
        const gap = threshold - count;
        if (gap <= Math.max(2, Math.ceil(threshold * 0.1))) return { state: "near", label: "Approaching threshold", count, threshold, explanation: `${count} reported ${field}; ${gap} below the displayed trigger of ${threshold}.` };
        return { state: "below", label: "Below threshold", count, threshold, explanation: `${count} reported ${field}; below the displayed trigger of ${threshold}.` };
    }

    function buildLawTransparency(payload = {}, model = {}) {
        const source = flattenSources(payload, model);
        source.__recommendations = model.recommendations || [];
        const text = recommendationText(model);
        return LAW_CATALOG.filter((law) => law.match.test(text)).map((law) => {
            const confirmed = law.requiredInputs.filter((field) => isConfirmed(readField(source, field)));
            const missing = law.requiredInputs.filter((field) => !confirmed.includes(field));
            return Object.freeze({
                id: law.id,
                title: law.title,
                shortTitle: law.shortTitle,
                officialUrl: law.url,
                threshold: law.threshold,
                thresholdResult: thresholdState(law, source),
                confirmedInputs: confirmed,
                missingInputs: missing,
                inputCoverage: Object.freeze({ confirmed: confirmed.length, required: law.requiredInputs.length }),
                whyIncluded: law.why,
                confidenceMeaning: `${confirmed.length} of ${law.requiredInputs.length} required assessment inputs confirmed. This is input coverage, not legal certainty.`
            });
        });
    }

    function paintPage(doc, theme) {
        doc.setFillColor(...theme.page); doc.rect(0,0,PAGE.width,PAGE.height,"F");
        doc.setDrawColor(...theme.line); doc.setLineWidth(0.35); doc.rect(5.5,5.5,PAGE.width-11,PAGE.height-11,"S");
    }

    function drawClosingPage(doc, theme) {
        doc.addPage(); paintPage(doc, theme);
        doc.setFont("helvetica","bold"); doc.setFontSize(22); doc.setTextColor(...theme.heading);
        doc.text("End of Report", PAGE.width / 2, 166, { align: "center" });
        doc.setDrawColor(...theme.accent); doc.setLineWidth(0.7); doc.line(67,153,90,153); doc.line(120,153,143,153);
    }

    function appendTransparency(doc, laws, themeName) {
        if (!doc || !laws.length) return;
        const theme = THEMES[themeName] || THEMES.light;
        const hadClosingPage = doc.getNumberOfPages() > 0;
        if (hadClosingPage && typeof doc.deletePage === "function") doc.deletePage(doc.getNumberOfPages());

        let y = PAGE.top;
        const usable = PAGE.width - PAGE.left - PAGE.right;
        const lineHeight = 4.4;
        const newPage = () => { doc.addPage(); paintPage(doc, theme); y = PAGE.top; };
        const ensure = (height) => { if (y + height > PAGE.bottom) newPage(); };
        const lines = (text, width = usable) => doc.splitTextToSize(cleanText(text), width);

        newPage();
        doc.setFont("helvetica","bold"); doc.setFontSize(8); doc.setTextColor(...theme.accent);
        doc.text("M4 TRANSPARENCY ADDITION", PAGE.left, y); y += 8;
        doc.setFontSize(18); doc.setTextColor(...theme.heading); doc.text("Law thresholds and information basis", PAGE.left, y); y += 10;
        doc.setFont("helvetica","normal"); doc.setFontSize(9); doc.setTextColor(...theme.text);
        const intro = lines("This appendix is added to the existing advisory report. It does not replace any existing section. Bars show how many required assessment inputs were confirmed; they do not claim a percentage of legal certainty. Click a law title to open only that law or the exact official source identified for it.");
        doc.text(intro, PAGE.left, y, { lineHeightFactor: 1.35, maxWidth: usable }); y += intro.length * lineHeight + 8;

        laws.forEach((law) => {
            const titleLines = lines(law.shortTitle, usable - 12);
            const missingText = law.missingInputs.length ? `Missing: ${law.missingInputs.join(", ")}.` : "No required assessment inputs are missing.";
            const thresholdLines = lines(`Threshold: ${law.threshold}`, usable - 12);
            const whyLines = lines(`Why included: ${law.whyIncluded}`, usable - 12);
            const resultLines = lines(`Your position: ${law.thresholdResult.label}. ${law.thresholdResult.explanation}`, usable - 12);
            const missingLines = lines(missingText, usable - 12);
            const cardHeight = 18 + (titleLines.length + thresholdLines.length + whyLines.length + resultLines.length + missingLines.length) * lineHeight + 16;
            ensure(cardHeight);

            const top = y - 3;
            doc.setFillColor(...theme.panel); doc.setDrawColor(...theme.line); doc.roundedRect(PAGE.left, top, usable, cardHeight, 2, 2, "FD");
            doc.setFont("helvetica","bold"); doc.setFontSize(11); doc.setTextColor(...theme.heading);
            if (law.officialUrl) {
                titleLines.forEach((line) => { doc.textWithLink(line, PAGE.left + 6, y + 4, { url: law.officialUrl }); y += 5; });
            } else {
                doc.text(titleLines, PAGE.left + 6, y + 4, { lineHeightFactor: 1.2 }); y += titleLines.length * 5;
            }
            y += 3;

            const coverage = law.inputCoverage;
            doc.setFont("helvetica","bold"); doc.setFontSize(7.5); doc.setTextColor(...theme.muted);
            doc.text(`REQUIRED INPUTS CONFIRMED: ${coverage.confirmed} OF ${coverage.required}`, PAGE.left + 6, y); y += 4;
            const barX = PAGE.left + 6, barW = usable - 12, segments = Math.max(coverage.required, 1), segmentW = barW / segments;
            for (let i = 0; i < segments; i += 1) {
                doc.setFillColor(...(i < coverage.confirmed ? theme.green : theme.line));
                doc.roundedRect(barX + i * segmentW, y, Math.max(1, segmentW - 1), 3.5, 0.7, 0.7, "F");
            }
            y += 8;

            doc.setFont("helvetica","normal"); doc.setFontSize(8.4); doc.setTextColor(...theme.text);
            [thresholdLines, resultLines, whyLines, missingLines].forEach((group) => { doc.text(group, PAGE.left + 6, y, { lineHeightFactor: 1.3, maxWidth: usable - 12 }); y += group.length * lineHeight + 2; });
            y = top + cardHeight + 7;
        });

        drawClosingPage(doc, theme);
    }

    function serialise(result) {
        const doc = result?.document;
        if (!doc?.output) return result;
        const dataUri = doc.output("datauristring");
        const buffer = doc.output("arraybuffer");
        return { ...result, dataUri, base64: dataUri.includes(",") ? dataUri.split(",")[1] : dataUri, sizeBytes: buffer.byteLength, pageCount: doc.getNumberOfPages(), lawTransparencyVersion: VERSION };
    }

    const originalBuild = currentPdf.buildAdvisoryPdf.bind(currentPdf);
    async function buildAdvisoryPdf(payload = {}) {
        const result = await originalBuild(payload);
        const model = typeof currentPdf.buildAdvisoryModel === "function" ? currentPdf.buildAdvisoryModel(payload) : (result?.model || {});
        const laws = buildLawTransparency(payload, model);
        if (Array.isArray(result?.pdfs)) {
            const pdfs = result.pdfs.map((variant) => { appendTransparency(variant.document, laws, variant.theme); return serialise(variant); });
            return { ...result, ...pdfs[0], theme: "both", pdfs, documents: pdfs.map((item) => item.document), filenames: pdfs.map((item) => item.filename), lawTransparencyVersion: VERSION, lawTransparency: laws };
        }
        appendTransparency(result?.document, laws, result?.theme);
        return { ...serialise(result), lawTransparencyVersion: VERSION, lawTransparency: laws };
    }

    const enhanced = Object.freeze({ ...currentPdf, lawTransparency: true, lawTransparencyVersion: VERSION, lawCatalog: LAW_CATALOG, buildLawTransparency, buildAdvisoryPdf });
    window.GrowWithHRPDF = enhanced;
    window.GrowWithHRPDFPolishReady = Promise.resolve(enhanced);
    window.GrowWithHRLawTransparency = Object.freeze({ version: VERSION, lawCatalog: LAW_CATALOG, buildLawTransparency, compareCount, isConfirmed, numberValue });
})(window);
