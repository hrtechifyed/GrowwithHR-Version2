/* ==========================================================
   GrowWithHR / HRTechify
   File: js/pdf.js

   Responsibilities
   1. Generate branded, searchable, selectable A4 advisory PDFs.
   2. Support both personalised and illustrative sample advisories.
   3. Preserve the legacy PDF modal hooks used by older pages.
   4. Expose one shared API for the assessment and EmailJS delivery.

   Email delivery remains the responsibility of js/email-service.js.
========================================================== */

(function initialiseGrowWithHRPDF(global) {
    "use strict";

    const BRAND = Object.freeze({
        navy: [10, 24, 48],
        navySoft: [31, 48, 77],
        orange: [245, 158, 11],
        orangeSoft: [255, 244, 218],
        text: [35, 41, 52],
        muted: [92, 101, 116],
        line: [214, 218, 225],
        white: [255, 255, 255]
    });

    const PAGE = Object.freeze({
        width: 210,
        height: 297,
        marginLeft: 20,
        marginRight: 20,
        marginTop: 24,
        marginBottom: 24,
        footerHeight: 18,
        headerHeight: 12
    });

    const PDF_VERSION = "2.1.0";
    const DEFAULT_FILENAME = "GrowWithHR-Executive-Advisory.pdf";
    const REPORT_STORAGE_KEY = "growwithhr-report";
    const LAST_DOWNLOAD_KEY = "growwithhrLastReportDownload";

    let activePDFReportData = null;
    let cachedLogoDataUrl = null;
    let logoRequest = null;

    /* ----------------------------------------------------------
       General helpers
    ---------------------------------------------------------- */

    function cleanText(value, fallback = "") {
        if (value === null || value === undefined) {
            return fallback;
        }

        const normalised = String(value)
            .replace(/\s+/g, " ")
            .trim();

        return normalised || fallback;
    }

    function cleanMultiline(value, fallback = "") {
        if (value === null || value === undefined) {
            return fallback;
        }

        const normalised = String(value)
            .replace(/\r\n/g, "\n")
            .replace(/[\t ]+/g, " ")
            .replace(/\n{3,}/g, "\n\n")
            .trim();

        return normalised || fallback;
    }

    function escapeFilename(value) {
        const safe = cleanText(value, "Organisation")
            .replace(/[^a-z0-9]+/gi, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 70);

        return safe || "Organisation";
    }

    function toArray(value) {
        if (Array.isArray(value)) {
            return value
                .map((item) => cleanText(item))
                .filter(Boolean);
        }

        const source = cleanText(value);

        if (!source) {
            return [];
        }

        return source
            .split(/[,;|]/)
            .map((item) => item.trim())
            .filter(Boolean);
    }

    function unique(values) {
        return Array.from(new Set(values.filter(Boolean)));
    }

    function asNumber(value, fallback = 0) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    }

    function pluralise(value, singular, plural = `${singular}s`) {
        return `${value} ${value === 1 ? singular : plural}`;
    }

    function formatDate(value = new Date()) {
        const date = value instanceof Date ? value : new Date(value);
        const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;

        return new Intl.DateTimeFormat("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric"
        }).format(safeDate);
    }

    function sentenceList(items) {
        const values = unique(toArray(items));

        if (!values.length) {
            return "not specified";
        }

        if (values.length === 1) {
            return values[0];
        }

        if (values.length === 2) {
            return `${values[0]} and ${values[1]}`;
        }

        return `${values.slice(0, -1).join(", ")}, and ${values[values.length - 1]}`;
    }

    function employeeBand(value) {
        const employees = asNumber(value);

        if (employees <= 0) return "an early-stage or unconfirmed workforce";
        if (employees < 25) return "a small, closely connected workforce";
        if (employees < 100) return "a growing small-to-mid-sized workforce";
        if (employees < 500) return "a scaling mid-sized workforce";
        if (employees < 2000) return "a large and increasingly complex workforce";
        return "a substantial enterprise workforce";
    }

    function getJsPDFConstructor() {
        return global.jspdf?.jsPDF || global.jsPDF || null;
    }

    function getStoredReport() {
        try {
            const raw = global.localStorage?.getItem(REPORT_STORAGE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (error) {
            console.warn("GrowWithHR PDF: saved report data could not be read.", error);
            return null;
        }
    }

    function resolveReportPayload(payload = {}) {
        const report =
            payload.report ||
            payload.advisory ||
            activePDFReportData ||
            getStoredReport() ||
            {};

        const lead = payload.lead || {};
        const answers = payload.answers || {};

        const companyName = cleanText(
            report.companyName ||
            lead.companyName ||
            answers.companyName,
            "Your Organisation"
        );

        const priorities = unique([
            ...toArray(report.priorities),
            ...toArray(lead.priorities),
            ...toArray(answers.priorities)
        ]);

        return {
            report,
            lead,
            answers,
            companyName,
            recipientName: cleanText(
                report.recipientName || lead.name,
                "Executive Leadership"
            ),
            recipientEmail: cleanText(
                report.recipientEmail || lead.email
            ),
            recipientRole: cleanText(
                report.recipientRole || lead.role
            ),
            industry: cleanText(
                report.industry || lead.industry || answers.industry,
                "Not specified"
            ),
            nature: cleanText(
                report.nature || answers.nature,
                "The organisation description was not provided."
            ),
            founded: cleanText(
                report.founded || answers.founded,
                "Not specified"
            ),
            entity: cleanText(
                report.entity || answers.entity,
                "Not specified"
            ),
            fundingStage: cleanText(
                report.fundingStage || answers.fundingStage,
                "Not specified"
            ),
            employees: asNumber(
                report.employees ?? lead.employees ?? answers.employees
            ),
            contractWorkers: asNumber(
                report.contractWorkers ?? answers.contractWorkers
            ),
            interns: asNumber(
                report.interns ?? answers.interns
            ),
            apprentices: asNumber(
                report.apprentices ?? answers.apprentices
            ),
            workModel: cleanText(
                report.workModel || answers.workModel,
                "Not specified"
            ),
            remoteWorkforce: cleanText(
                report.remoteWorkforce || answers.remoteWorkforce,
                "Not specified"
            ),
            primaryState: cleanText(
                report.primaryState ||
                report.state ||
                answers.primaryState,
                "Not specified"
            ),
            locations: asNumber(
                report.locations ?? answers.locations,
                1
            ),
            countries: asNumber(
                report.countries ?? answers.countries,
                1
            ),
            hiringPlans: cleanText(
                report.hiringPlans || answers.hiringPlans,
                "Not specified"
            ),
            expansionPlans: unique([
                ...toArray(report.expansionPlans),
                ...toArray(answers.expansionPlans)
            ]),
            growthContext: cleanMultiline(
                report.growthContext || answers.growthContext
            ),
            peopleFunction: cleanText(
                report.peopleFunction ||
                lead.peopleFunction ||
                answers.peopleFunction,
                "Not specified"
            ),
            priorities,
            generatedAt:
                report.generatedAt ||
                lead.capturedAt ||
                new Date().toISOString(),
            source: cleanText(
                report.source || lead.source,
                "Executive Advisory Briefing"
            )
        };
    }

    /* ----------------------------------------------------------
       Advisory content model
    ---------------------------------------------------------- */

    const PRIORITY_LIBRARY = Object.freeze({
        "Hiring and onboarding": {
            observation:
                "Growth will place greater pressure on role clarity, selection quality and the consistency of onboarding.",
            recommendation:
                "Create a repeatable hiring and onboarding system with approved role profiles, structured interviews, decision criteria and a practical first-90-day plan.",
            first30:
                "Document the most important recurring roles and agree the minimum selection evidence for each role.",
            next60:
                "Introduce a consistent interview scorecard and a common onboarding checklist for managers.",
            next90:
                "Review quality-of-hire, offer acceptance and early attrition signals, then improve the process using evidence."
        },
        "Policies and compliance": {
            observation:
                "People policies and statutory governance need to keep pace with workforce size, location and operating complexity.",
            recommendation:
                "Establish a controlled policy and compliance calendar covering ownership, review dates, evidence, communication and escalation.",
            first30:
                "Create a single inventory of current policies, statutory registrations, records and responsible owners.",
            next60:
                "Close the highest-risk policy and record-keeping gaps and communicate updated requirements to managers.",
            next90:
                "Run a documented quarterly compliance review with leadership and retain evidence of actions completed."
        },
        "Performance and rewards": {
            observation:
                "Clear performance expectations and transparent reward decisions become increasingly important as the organisation grows.",
            recommendation:
                "Introduce a simple performance rhythm that connects business priorities, role outcomes, manager feedback and fair reward decisions.",
            first30:
                "Define the three to five outcomes that matter most for priority roles and teams.",
            next60:
                "Train managers to run concise monthly check-ins and document agreed actions.",
            next90:
                "Calibrate performance and reward decisions across teams to improve consistency and trust."
        },
        "Manager capability": {
            observation:
                "The organisation's growth experience will be shaped heavily by the quality and consistency of day-to-day management.",
            recommendation:
                "Define the essential expectations of every people manager and support them with practical routines, tools and coaching.",
            first30:
                "Agree a short manager standard covering communication, goal setting, feedback, attendance and escalation.",
            next60:
                "Run targeted manager sessions using real scenarios from the organisation.",
            next90:
                "Measure adoption through employee feedback, retention signals and management-quality reviews."
        },
        "Culture and engagement": {
            observation:
                "Culture is likely to become less dependent on founder proximity and more dependent on repeated leadership behaviour and operating rituals.",
            recommendation:
                "Translate the desired culture into observable behaviours, leadership routines and employee experiences that can scale.",
            first30:
                "Identify the behaviours that should be protected and the behaviours that are beginning to create friction.",
            next60:
                "Embed those behaviours into onboarding, manager conversations and recognition practices.",
            next90:
                "Use a short employee pulse and leadership review to identify where experience differs across teams."
        },
        "HR operations and technology": {
            observation:
                "Manual or fragmented people administration can reduce visibility and create avoidable operational risk as headcount increases.",
            recommendation:
                "Simplify the core employee-data, document, leave, attendance and reporting processes before adding unnecessary system complexity.",
            first30:
                "Map the highest-volume HR processes and identify duplicated data, manual handoffs and control gaps.",
            next60:
                "Standardise core workflows and define one reliable employee data source.",
            next90:
                "Select or improve technology only after process ownership and reporting requirements are clear."
        },
        "Workforce planning": {
            observation:
                "Hiring plans need to be translated into a practical view of capability, cost, timing and organisational capacity.",
            recommendation:
                "Create a rolling workforce plan that links business priorities to critical roles, hiring timing, workforce cost and alternative talent options.",
            first30:
                "Confirm the roles and capabilities most critical to the next twelve months.",
            next60:
                "Build a quarterly workforce and cost forecast with clear assumptions.",
            next90:
                "Review the plan monthly against business demand, hiring progress and productivity evidence."
        },
        "Organisation design": {
            observation:
                "As complexity increases, unclear accountabilities and overlapping decision rights can slow execution.",
            recommendation:
                "Clarify the organisation structure around outcomes, accountabilities, spans of control and the decisions that must remain close to leadership.",
            first30:
                "Map current accountabilities and identify duplicated ownership or decisions with no clear owner.",
            next60:
                "Agree the target structure and decision rights for the next stage of growth.",
            next90:
                "Implement changes with clear role communication, transition support and follow-up review."
        }
    });

    function defaultPriorityNames(data) {
        const inferred = [];

        if (/grow|significant|steady|selective/i.test(data.hiringPlans)) {
            inferred.push("Hiring and onboarding", "Workforce planning");
        }

        if (data.employees >= 75) {
            inferred.push("Manager capability", "Performance and rewards");
        }

        if (
            data.locations > 1 ||
            data.countries > 1 ||
            /remote|hybrid|mixed/i.test(data.workModel)
        ) {
            inferred.push(
                "Policies and compliance",
                "HR operations and technology"
            );
        }

        if (/founder|no formal|administration|operations/i.test(data.peopleFunction)) {
            inferred.push(
                "HR operations and technology",
                "Manager capability"
            );
        }

        if (!inferred.length) {
            inferred.push(
                "Workforce planning",
                "Manager capability",
                "Policies and compliance"
            );
        }

        return unique(inferred).slice(0, 3);
    }

    function normalisePriorities(data) {
        const knownKeys = Object.keys(PRIORITY_LIBRARY);
        const selected = [];

        data.priorities.forEach((priority) => {
            const exact = knownKeys.find(
                (key) => key.toLowerCase() === priority.toLowerCase()
            );

            if (exact) {
                selected.push(exact);
            }
        });

        return unique([
            ...selected,
            ...defaultPriorityNames(data)
        ]).slice(0, 4);
    }

    function buildStrengths(data) {
        const strengths = [];

        if (data.nature && !/not provided/i.test(data.nature)) {
            strengths.push(
                "Leadership has articulated a clear description of the organisation and the value it provides."
            );
        }

        if (!/not specified/i.test(data.hiringPlans)) {
            strengths.push(
                "The organisation has begun to define its near-term workforce direction rather than treating hiring as a purely reactive activity."
            );
        }

        if (data.priorities.length) {
            strengths.push(
                "Leadership has identified priority people themes, creating a useful foundation for focused action and accountability."
            );
        }

        if (!/not specified/i.test(data.peopleFunction)) {
            strengths.push(
                "The current People or HR support model is understood, making it easier to match recommendations to available capacity."
            );
        }

        if (!strengths.length) {
            strengths.push(
                "Completing the briefing provides leadership with a common starting point for discussing workforce priorities."
            );
        }

        return strengths.slice(0, 4);
    }

    function buildComplianceConsiderations(data) {
        const considerations = [
            "Confirm that employment documentation, personnel records and policy acknowledgements are complete, current and securely retained.",
            "Maintain a documented calendar for applicable labour, payroll, benefits, workplace and statutory obligations, with named owners and evidence of completion.",
            "Review worker classification, contractor governance and engagement terms wherever non-employee workers are used."
        ];

        if (data.locations > 1 || data.countries > 1) {
            considerations.push(
                "Review jurisdiction-specific requirements across every permanent operating location and country; one standard policy may not satisfy every local obligation."
            );
        }

        if (data.contractWorkers > 0) {
            considerations.push(
                "Review contractor deployment, supervision, invoicing, access, safety and statutory responsibilities to reduce co-employment and classification risk."
            );
        }

        if (data.interns > 0 || data.apprentices > 0) {
            considerations.push(
                "Ensure internship and apprenticeship arrangements have clear learning objectives, supervision, documentation and legally appropriate terms."
            );
        }

        if (/remote|hybrid|mixed/i.test(data.workModel)) {
            considerations.push(
                "Clarify remote-working expectations covering working time, information security, equipment, expense, workplace safety and manager responsibilities."
            );
        }

        return unique(considerations).slice(0, 6);
    }

    function buildExecutiveSummary(data, priorities) {
        const workforce = employeeBand(data.employees);

        const operatingFootprint = data.countries > 1
            ? `${pluralise(data.locations, "permanent location")} across ${pluralise(data.countries, "country", "countries")}`
            : `${pluralise(data.locations, "permanent location")} in ${data.primaryState}`;

        return [
            `${data.companyName} operates in ${data.industry} with ${workforce}. Its current operating model is ${data.workModel.toLowerCase()}, supported from ${operatingFootprint}.`,
            `The organisation's next-stage people agenda should be shaped around ${sentenceList(priorities)}. These themes should be treated as connected business capabilities rather than isolated HR activities.`,
            "The immediate objective is not to introduce unnecessary process. It is to create enough clarity, consistency and evidence for leadership to scale the organisation without losing speed, accountability or employee trust."
        ];
    }

    function buildPerspective(data, priorities) {
        const scaleSentence = data.employees > 0
            ? `At approximately ${data.employees} employees, informal practices may still work in some teams, but inconsistency will become more visible as the workforce expands.`
            : "As the workforce grows, informal practices will become increasingly difficult to apply consistently.";

        const expansionSentence = data.expansionPlans.length
            ? `Planned changes - ${sentenceList(data.expansionPlans)} - will increase the importance of clear workforce assumptions, manager ownership and repeatable people practices.`
            : "Even without major expansion, leadership will benefit from clearer workforce assumptions, manager ownership and repeatable people practices.";

        return [
            scaleSentence,
            expansionSentence,
            `Leadership should sequence work around ${sentenceList(priorities)} while protecting the organisation's ability to make timely decisions.`
        ];
    }

    function buildRoadmap(priorities) {
        const entries = priorities.map((name) => ({
            name,
            ...PRIORITY_LIBRARY[name]
        }));

        return {
            first30: unique(entries.map((entry) => entry.first30)).slice(0, 4),
            next60: unique(entries.map((entry) => entry.next60)).slice(0, 4),
            next90: unique(entries.map((entry) => entry.next90)).slice(0, 4)
        };
    }

    function buildAdvisoryModel(payload = {}) {
        const data = resolveReportPayload(payload);
        const priorities = normalisePriorities(data);

        const recommendations = priorities.map((name) => ({
            title: name,
            ...PRIORITY_LIBRARY[name]
        }));

        return {
            ...data,
            priorities,
            strengths: buildStrengths(data),
            executiveSummary: buildExecutiveSummary(data, priorities),
            perspective: buildPerspective(data, priorities),
            recommendations,
            roadmap: buildRoadmap(priorities),
            compliance: buildComplianceConsiderations(data),
            opportunities: [
                "Use workforce information as a regular leadership input, not only as an HR reporting exercise.",
                "Strengthen manager capability before adding complex systems or policies that depend on manager adoption.",
                "Create a small set of trusted people measures linked to business outcomes, workforce cost and execution risk.",
                "Review the advisory after material changes in headcount, locations, leadership structure or business strategy."
            ]
        };
    }

    /* ----------------------------------------------------------
       Logo helper
    ---------------------------------------------------------- */

    function imageToDataUrl(image) {
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth || image.width;
        canvas.height = image.naturalHeight || image.height;

        const context = canvas.getContext("2d");

        if (!context) {
            throw new Error("The browser could not create a logo canvas context.");
        }

        context.drawImage(image, 0, 0);
        return canvas.toDataURL("image/png");
    }

    async function loadLogoDataUrl() {
        if (cachedLogoDataUrl) {
            return cachedLogoDataUrl;
        }

        if (logoRequest) {
            return logoRequest;
        }

        if (typeof document === "undefined") {
            return null;
        }

        logoRequest = new Promise((resolve) => {
            const image = new Image();
            image.crossOrigin = "anonymous";

            image.onload = () => {
                try {
                    cachedLogoDataUrl = imageToDataUrl(image);
                    resolve(cachedLogoDataUrl);
                } catch (error) {
                    console.warn("GrowWithHR PDF: logo could not be converted.", error);
                    resolve(null);
                }
            };

            image.onerror = () => resolve(null);
            image.src = "assets/hrtechify-logo.png";
        });

        return logoRequest;
    }

    /* ----------------------------------------------------------
       Document options
    ---------------------------------------------------------- */

    function resolveDocumentOptions(payload = {}) {
        const isSample = Boolean(payload.isSample);

        return {
            isSample,
            runningTitle: cleanText(
                payload.runningTitle,
                isSample
                    ? "GrowWithHR Sample Executive Advisory"
                    : "GrowWithHR Executive Advisory"
            ),
            coverLabel: cleanText(
                payload.coverLabel,
                isSample
                    ? "ILLUSTRATIVE SAMPLE EXECUTIVE ADVISORY"
                    : "PERSONALISED EXECUTIVE ADVISORY"
            ),
            coverTitle: cleanText(
                payload.coverTitle,
                "Executive Advisory"
            ),
            coverIntro: cleanText(
                payload.coverIntro,
                isSample
                    ? "A fictional, illustrative leadership document demonstrating how GrowWithHR turns organisation information into a structured executive people advisory."
                    : "A confidential leadership document prepared from the organisation context shared through the GrowWithHR Executive Advisory Briefing."
            ),
            coverNote: cleanText(
                payload.coverNote,
                isSample
                    ? "This sample uses fictional organisation information. It is provided for demonstration only and is not legal, tax or regulatory advice."
                    : "This advisory supports leadership discussion and prioritisation. It is not legal, tax or regulatory advice."
            )
        };
    }

    /* ----------------------------------------------------------
       PDF writer
    ---------------------------------------------------------- */

    function createWriter(doc, model, logoDataUrl, options = {}) {
        const usableWidth = PAGE.width - PAGE.marginLeft - PAGE.marginRight;
        const contentBottom = PAGE.height - PAGE.marginBottom - PAGE.footerHeight;
        let cursorY = PAGE.marginTop;

        function setTextColor(color) {
            doc.setTextColor(...color);
        }

        function setDrawColor(color) {
            doc.setDrawColor(...color);
        }

        function setFillColor(color) {
            doc.setFillColor(...color);
        }

        function setFont(style = "normal", size = 10.5) {
            doc.setFont("helvetica", style);
            doc.setFontSize(size);
        }

        function lineHeightFor(size, multiplier = 1.45) {
            return size * 0.3528 * multiplier;
        }

        function splitText(text, width = usableWidth) {
            return doc.splitTextToSize(cleanMultiline(text), width);
        }

        function drawRunningHeader() {
            setFont("bold", 8.5);
            setTextColor(BRAND.navy);
            doc.text("HRTechify", PAGE.marginLeft, PAGE.marginTop - 3);

            setFont("normal", 8.5);
            setTextColor(BRAND.muted);
            doc.text(
                options.runningTitle,
                PAGE.width - PAGE.marginRight,
                PAGE.marginTop - 3,
                { align: "right" }
            );

            setDrawColor(BRAND.orange);
            doc.setLineWidth(0.35);
            doc.line(
                PAGE.marginLeft,
                PAGE.marginTop + 1,
                PAGE.width - PAGE.marginRight,
                PAGE.marginTop + 1
            );
        }

        function newPage() {
            doc.addPage();
            cursorY = PAGE.marginTop + PAGE.headerHeight;
            drawRunningHeader();
        }

        function ensureSpace(heightNeeded) {
            if (cursorY + heightNeeded > contentBottom) {
                newPage();
            }
        }

        function drawCover() {
            cursorY = 30;

            if (logoDataUrl) {
                try {
                    doc.addImage(
                        logoDataUrl,
                        "PNG",
                        PAGE.marginLeft,
                        22,
                        20,
                        20,
                        undefined,
                        "FAST"
                    );
                } catch (error) {
                    console.warn("GrowWithHR PDF: logo could not be added.", error);
                }
            }

            setFont("bold", 12);
            setTextColor(BRAND.navy);
            doc.text(
                "HRTechify",
                logoDataUrl ? 44 : PAGE.marginLeft,
                31
            );

            setFont("normal", 8.5);
            setTextColor(BRAND.muted);
            doc.text(
                "GrowWithHR",
                logoDataUrl ? 44 : PAGE.marginLeft,
                37
            );

            setDrawColor(BRAND.orange);
            doc.setLineWidth(1.1);
            doc.line(
                PAGE.marginLeft,
                56,
                PAGE.width - PAGE.marginRight,
                56
            );

            setFont("bold", 10.5);
            setTextColor(BRAND.orange);
            doc.text(
                options.coverLabel,
                PAGE.marginLeft,
                75
            );

            setFont("bold", 28);
            setTextColor(BRAND.navy);
            const titleLines = splitText(options.coverTitle, 150);
            doc.text(titleLines, PAGE.marginLeft, 94);

            setFont("normal", 15);
            setTextColor(BRAND.navySoft);
            const companyLines = splitText(model.companyName, 150);
            doc.text(companyLines, PAGE.marginLeft, 119);

            const companyHeight = companyLines.length * lineHeightFor(15, 1.2);
            const preparedY = 132 + companyHeight;

            setFont("normal", 10.5);
            setTextColor(BRAND.text);
            doc.text(
                `Prepared for ${model.recipientName}`,
                PAGE.marginLeft,
                preparedY
            );

            if (model.recipientRole) {
                setTextColor(BRAND.muted);
                doc.text(
                    model.recipientRole,
                    PAGE.marginLeft,
                    preparedY + 7
                );
            }

            setFont("normal", 10);
            setTextColor(BRAND.muted);
            doc.text(
                `Prepared ${formatDate(model.generatedAt)}`,
                PAGE.marginLeft,
                preparedY + 19
            );

            setFont("normal", 11);
            setTextColor(BRAND.text);
            const intro = splitText(options.coverIntro, 150);
            doc.text(intro, PAGE.marginLeft, 184, {
                lineHeightFactor: 1.5
            });

            setFillColor(BRAND.orangeSoft);
            doc.roundedRect(
                PAGE.marginLeft,
                218,
                usableWidth,
                34,
                3,
                3,
                "F"
            );

            setFont("italic", 9.5);
            setTextColor(BRAND.muted);
            const note = splitText(options.coverNote, usableWidth - 14);
            doc.text(note, PAGE.marginLeft + 7, 229, {
                lineHeightFactor: 1.45
            });
        }

        function sectionHeading(overline, title, introduction = "") {
            ensureSpace(28 + (introduction ? 16 : 0));

            setFont("bold", 8.5);
            setTextColor(BRAND.orange);
            doc.text(
                cleanText(overline).toUpperCase(),
                PAGE.marginLeft,
                cursorY
            );
            cursorY += 7;

            setFont("bold", 18);
            setTextColor(BRAND.navy);
            const titleLines = splitText(title, usableWidth);
            doc.text(titleLines, PAGE.marginLeft, cursorY);
            cursorY += titleLines.length * lineHeightFor(18, 1.12) + 3;

            setDrawColor(BRAND.orange);
            doc.setLineWidth(0.55);
            doc.line(
                PAGE.marginLeft,
                cursorY,
                PAGE.marginLeft + 28,
                cursorY
            );
            cursorY += 7;

            if (introduction) {
                paragraph(introduction, {
                    color: BRAND.muted,
                    size: 10.25,
                    spacingAfter: 8
                });
            }
        }

        function subheading(title) {
            ensureSpace(14);
            setFont("bold", 12.5);
            setTextColor(BRAND.navy);
            const lines = splitText(title, usableWidth);
            doc.text(lines, PAGE.marginLeft, cursorY);
            cursorY += lines.length * lineHeightFor(12.5, 1.2) + 3;
        }

        function paragraph(text, optionsForParagraph = {}) {
            const size = optionsForParagraph.size || 10.5;
            const color = optionsForParagraph.color || BRAND.text;
            const style = optionsForParagraph.style || "normal";
            const indent = optionsForParagraph.indent || 0;
            const width =
                optionsForParagraph.width ||
                usableWidth - indent;
            const spacingAfter =
                optionsForParagraph.spacingAfter ?? 5;
            const lineHeightFactor =
                optionsForParagraph.lineHeight || 1.5;
            const lines = splitText(text, width);
            const lineHeight = lineHeightFor(size, lineHeightFactor);

            ensureSpace(lines.length * lineHeight + spacingAfter);
            setFont(style, size);
            setTextColor(color);
            doc.text(
                lines,
                PAGE.marginLeft + indent,
                cursorY,
                { lineHeightFactor }
            );
            cursorY += lines.length * lineHeight + spacingAfter;
        }

        function bulletList(items, optionsForList = {}) {
            const source = toArray(items);
            const size = optionsForList.size || 10.25;
            const lineHeight = lineHeightFor(size, 1.42);
            const bulletIndent = optionsForList.bulletIndent || 6;
            const textIndent = optionsForList.textIndent || 11;
            const width = usableWidth - textIndent;

            source.forEach((item) => {
                const lines = splitText(item, width);
                const height = lines.length * lineHeight + 3;
                ensureSpace(height);

                setFillColor(BRAND.orange);
                doc.circle(
                    PAGE.marginLeft + bulletIndent,
                    cursorY - 1.1,
                    1.15,
                    "F"
                );

                setFont("normal", size);
                setTextColor(BRAND.text);
                doc.text(
                    lines,
                    PAGE.marginLeft + textIndent,
                    cursorY,
                    { lineHeightFactor: 1.42 }
                );

                cursorY += height;
            });

            cursorY += optionsForList.spacingAfter ?? 3;
        }

        function numberedList(items) {
            const source = toArray(items);

            source.forEach((item, index) => {
                const number = `${index + 1}.`;
                const lines = splitText(item, usableWidth - 13);
                const height =
                    lines.length * lineHeightFor(10.25, 1.42) + 3;

                ensureSpace(height);

                setFont("bold", 10.25);
                setTextColor(BRAND.orange);
                doc.text(number, PAGE.marginLeft, cursorY);

                setFont("normal", 10.25);
                setTextColor(BRAND.text);
                doc.text(
                    lines,
                    PAGE.marginLeft + 10,
                    cursorY,
                    { lineHeightFactor: 1.42 }
                );

                cursorY += height;
            });

            cursorY += 3;
        }

        function keyValue(label, value) {
            const safeLabel = cleanText(label);
            const safeValue = cleanText(value, "Not specified");
            const labelWidth = 49;
            const valueWidth = usableWidth - labelWidth - 4;
            const valueLines = splitText(safeValue, valueWidth);
            const lineHeight = lineHeightFor(10.25, 1.35);
            const rowHeight = Math.max(
                8,
                valueLines.length * lineHeight + 3
            );

            ensureSpace(rowHeight + 2);

            setFont("bold", 9.5);
            setTextColor(BRAND.navy);
            doc.text(safeLabel, PAGE.marginLeft, cursorY);

            setFont("normal", 10.25);
            setTextColor(BRAND.text);
            doc.text(
                valueLines,
                PAGE.marginLeft + labelWidth,
                cursorY,
                { lineHeightFactor: 1.35 }
            );

            cursorY += rowHeight;
            setDrawColor(BRAND.line);
            doc.setLineWidth(0.2);
            doc.line(
                PAGE.marginLeft,
                cursorY - 2,
                PAGE.width - PAGE.marginRight,
                cursorY - 2
            );
        }

        function priorityBlock(item, index) {
            ensureSpace(36);

            setFont("bold", 9);
            setTextColor(BRAND.orange);
            doc.text(
                `PRIORITY ${index + 1}`,
                PAGE.marginLeft,
                cursorY
            );
            cursorY += 6;

            subheading(item.title);
            paragraph(item.observation, {
                color: BRAND.muted,
                size: 10,
                spacingAfter: 4
            });
            paragraph(item.recommendation, {
                size: 10.5,
                spacingAfter: 10
            });
        }

        function roadmapStage(label, title, items) {
            ensureSpace(28);

            setFont("bold", 8.5);
            setTextColor(BRAND.orange);
            doc.text(label.toUpperCase(), PAGE.marginLeft, cursorY);
            cursorY += 6;

            subheading(title);
            numberedList(items);
            cursorY += 4;
        }

        function addSectionPage() {
            newPage();
        }

        function drawFooters() {
            const totalPages = doc.getNumberOfPages();

            for (
                let pageNumber = 1;
                pageNumber <= totalPages;
                pageNumber += 1
            ) {
                doc.setPage(pageNumber);

                const y = PAGE.height - 14;

                setDrawColor(BRAND.orange);
                doc.setLineWidth(0.35);
                doc.line(
                    PAGE.marginLeft,
                    y - 5,
                    PAGE.width - PAGE.marginRight,
                    y - 5
                );

                setFont("bold", 7.8);
                setTextColor(BRAND.navy);
                doc.text("HRTechify | GrowWithHR", PAGE.marginLeft, y);

                setFont("normal", 7.3);
                setTextColor(BRAND.muted);
                doc.text(
                    "(c) 2026 HRTechify. All Rights Reserved.",
                    PAGE.marginLeft,
                    y + 4.4
                );
                doc.text(
                    "Smart People Strategy. More business momentum.",
                    PAGE.width / 2,
                    y + 4.4,
                    { align: "center" }
                );
                doc.text(
                    `Page ${pageNumber} of ${totalPages}`,
                    PAGE.width - PAGE.marginRight,
                    y + 4.4,
                    { align: "right" }
                );
            }
        }

        return {
            drawCover,
            newPage,
            addSectionPage,
            drawRunningHeader,
            sectionHeading,
            subheading,
            paragraph,
            bulletList,
            numberedList,
            keyValue,
            priorityBlock,
            roadmapStage,
            drawFooters
        };
    }

    /* ----------------------------------------------------------
       Document rendering
    ---------------------------------------------------------- */

    function renderAdvisoryDocument(
        doc,
        model,
        logoDataUrl,
        options = {}
    ) {
        const writer = createWriter(
            doc,
            model,
            logoDataUrl,
            options
        );

        writer.drawCover();

        writer.newPage();
        writer.sectionHeading(
            "Executive snapshot",
            "About Your Organisation",
            "A concise view of the organisation context used to shape this advisory."
        );
        writer.keyValue("Organisation", model.companyName);
        writer.keyValue("Industry", model.industry);
        writer.keyValue("What it does", model.nature);
        writer.keyValue("Operating since", model.founded);
        writer.keyValue("Legal structure", model.entity);
        writer.keyValue("Funding position", model.fundingStage);
        writer.keyValue(
            "Employees",
            model.employees
                ? String(model.employees)
                : "Not specified"
        );
        writer.keyValue(
            "Other workers",
            [
                model.contractWorkers
                    ? pluralise(model.contractWorkers, "contract worker")
                    : "",
                model.interns
                    ? pluralise(model.interns, "intern")
                    : "",
                model.apprentices
                    ? pluralise(model.apprentices, "apprentice")
                    : ""
            ].filter(Boolean).join(", ") || "None specified"
        );
        writer.keyValue("Working model", model.workModel);
        writer.keyValue("Remote workforce", model.remoteWorkforce);
        writer.keyValue("Primary base", model.primaryState);
        writer.keyValue(
            "Operating footprint",
            `${pluralise(model.locations, "location")} across ${pluralise(model.countries, "country", "countries")}`
        );
        writer.keyValue("Hiring direction", model.hiringPlans);
        writer.keyValue(
            "Expected change",
            sentenceList(model.expansionPlans)
        );
        writer.keyValue("People support", model.peopleFunction);

        writer.addSectionPage();
        writer.sectionHeading(
            "Executive summary",
            "What Matters Next",
            "The following perspective connects the organisation's current stage with the people foundations likely to matter most next."
        );
        model.executiveSummary.forEach((text) => {
            writer.paragraph(text, { spacingAfter: 7 });
        });
        writer.subheading("Immediate leadership focus");
        writer.numberedList(model.priorities);

        writer.addSectionPage();
        writer.sectionHeading(
            "Executive perspective",
            "Coach HRTechify's Perspective",
            "People capability becomes a strategic business capability when growth introduces greater complexity, dependency and leadership risk."
        );
        model.perspective.forEach((text) => {
            writer.paragraph(text, { spacingAfter: 7 });
        });

        if (model.growthContext) {
            writer.subheading("Context shared by leadership");
            writer.paragraph(model.growthContext, {
                style: "italic",
                color: BRAND.muted
            });
        }

        writer.subheading("Positive foundations");
        writer.bulletList(model.strengths);

        writer.addSectionPage();
        writer.sectionHeading(
            "Leadership priorities",
            "Areas Requiring Leadership Attention",
            "These areas are not presented as shortcomings. They are the capabilities most likely to improve execution, consistency and organisational readiness."
        );
        model.recommendations.forEach((item, index) => {
            writer.priorityBlock(item, index);
        });

        writer.addSectionPage();
        writer.sectionHeading(
            "Recommended actions",
            "Strategic Recommendations",
            "Leadership should keep the response practical: establish the minimum repeatable practice, assign ownership, and review whether it is improving business and employee outcomes."
        );
        model.recommendations.forEach((item, index) => {
            writer.subheading(`${index + 1}. ${item.title}`);
            writer.paragraph(item.recommendation, {
                spacingAfter: 9
            });
        });

        writer.addSectionPage();
        writer.sectionHeading(
            "Your next steps",
            "Executive Implementation Roadmap",
            "The roadmap sequences the recommendations into a realistic first ninety days. Leadership should adjust pace to reflect capacity, risk and business timing."
        );
        writer.roadmapStage(
            "First 30 days",
            "Create clarity",
            model.roadmap.first30
        );
        writer.roadmapStage(
            "Days 31-60",
            "Build consistency",
            model.roadmap.next60
        );
        writer.roadmapStage(
            "Days 61-90",
            "Embed and review",
            model.roadmap.next90
        );

        writer.addSectionPage();
        writer.sectionHeading(
            "Compliance review",
            "What You Should Review",
            "The following are governance prompts, not legal conclusions. Applicable obligations should be confirmed with qualified advisers and official authorities."
        );
        writer.bulletList(model.compliance);
        writer.subheading("Suggested governance rhythm");
        writer.numberedList([
            "Assign one accountable owner for each obligation or policy area.",
            "Record the evidence that demonstrates completion, communication and review.",
            "Escalate overdue or high-risk items through a regular leadership forum.",
            "Reassess requirements after changes in headcount, location, worker type or operating model."
        ]);

        writer.addSectionPage();
        writer.sectionHeading(
            "Strategic opportunities",
            "Opportunities for Organisational Growth",
            "Strong people foundations can increase execution speed, leadership capacity and employee confidence when they are connected directly to business priorities."
        );
        writer.bulletList(model.opportunities);
        writer.subheading("Questions for the leadership team");
        writer.numberedList([
            "Which people decision would most improve business execution during the next quarter?",
            "Where are managers making inconsistent decisions because expectations or ownership are unclear?",
            "Which workforce risk would become most serious if headcount or operating complexity increased quickly?",
            "What evidence will show that the chosen people priorities are improving outcomes?"
        ]);

        writer.addSectionPage();
        writer.sectionHeading(
            "Looking ahead",
            "Preparing for the Next Stage of Growth",
            "The strongest organisations revisit their people foundations before complexity becomes a constraint."
        );
        writer.paragraph(
            `${model.companyName} should use this advisory as a leadership working document. Select a small number of actions, assign clear owners, agree evidence of progress and review the priorities alongside business performance.`
        );
        writer.paragraph(
            "The advisory should be refreshed when there is a material change in workforce size, operating locations, leadership structure, growth expectations or the People/HR support model."
        );
        writer.subheading("Final thoughts");
        writer.paragraph(
            "Sustainable growth depends not only on commercial opportunity, but also on the organisation's ability to make clear, fair and repeatable people decisions. Early investment in the right foundations protects momentum and gives leadership more capacity to focus on the business."
        );

        writer.addSectionPage();
        writer.sectionHeading(
            "Important information",
            options.isSample
                ? "Sample Notice and Disclaimer"
                : "Confidentiality, Privacy and Disclaimer"
        );

        if (options.isSample) {
            writer.subheading("Illustrative sample notice");
            writer.paragraph(
                "This sample advisory uses fictional company, workforce and leadership information. It does not describe or assess any real organisation or individual."
            );
        } else {
            writer.subheading("Confidentiality notice");
            writer.paragraph(
                "This Executive Advisory has been prepared for the organisation and recipient identified in this document. It is intended to support internal leadership discussion and should be shared only with appropriate stakeholders."
            );

            writer.subheading("Privacy and data handling");
            writer.paragraph(
                "GrowWithHR uses the information submitted through the Executive Advisory Briefing to prepare and deliver the advisory. Optional marketing communication remains subject to the separate choice selected by the user."
            );
        }

        writer.subheading("Advisory disclaimer");
        writer.paragraph(
            options.isSample
                ? "This document is provided only to demonstrate the structure and style of a GrowWithHR Executive Advisory. Its observations and recommendations are illustrative and must not be treated as legal, tax, accounting, employment-law or regulatory advice."
                : "This document provides general business and people-management guidance based on information supplied by the user. It is not legal, tax, accounting, employment-law or regulatory advice. Requirements should be verified with qualified professionals and current official sources before action is taken."
        );

        writer.subheading("About Coach HRTechify");
        writer.paragraph(
            "Coach HRTechify is designed to help founders, business leaders and People/HR leaders understand the organisational implications of growth and identify practical next steps."
        );

        writer.drawFooters();
    }

    /* ----------------------------------------------------------
       Public PDF API
    ---------------------------------------------------------- */

    async function buildAdvisoryPdf(payload = {}) {
        const JsPDF = getJsPDFConstructor();

        if (!JsPDF) {
            throw new Error(
                "jsPDF is not available. Load the jsPDF library before js/pdf.js."
            );
        }

        const model = buildAdvisoryModel(payload);
        const documentOptions = resolveDocumentOptions(payload);
        const logoDataUrl = await loadLogoDataUrl();

        const doc = new JsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
            compress: true,
            putOnlyUsedFonts: true
        });

        doc.setProperties({
            title: documentOptions.isSample
                ? `Sample Executive Advisory - ${model.companyName}`
                : `Executive Advisory - ${model.companyName}`,
            subject: documentOptions.isSample
                ? "HRTechify GrowWithHR Illustrative Sample Advisory"
                : "GrowWithHR Personalised Executive Advisory",
            author: "HRTechify",
            creator: `GrowWithHR PDF ${PDF_VERSION}`,
            keywords: documentOptions.isSample
                ? "HRTechify, GrowWithHR, sample advisory, fictional company"
                : "HRTechify, GrowWithHR, executive advisory, people strategy"
        });

        renderAdvisoryDocument(
            doc,
            model,
            logoDataUrl,
            documentOptions
        );

        const filename = cleanText(
            payload.filename,
            documentOptions.isSample
                ? "HRTechify-Sample-Executive-Advisory.pdf"
                : `GrowWithHR-Advisory-${escapeFilename(model.companyName)}.pdf`
        );

        const dataUri = doc.output("datauristring");
        const base64 = dataUri.includes(",")
            ? dataUri.split(",")[1]
            : dataUri;
        const arrayBuffer = doc.output("arraybuffer");

        return {
            document: doc,
            filename,
            base64,
            dataUri,
            sizeBytes: arrayBuffer.byteLength,
            pageCount: doc.getNumberOfPages(),
            generatedAt: new Date().toISOString(),
            companyName: model.companyName,
            version: PDF_VERSION,
            isSample: documentOptions.isSample
        };
    }

    async function downloadAdvisoryPdf(payload = {}) {
        let result = payload.document || payload.pdf || null;

        if (result && typeof result.save === "function") {
            result = {
                document: result,
                filename: cleanText(payload.filename, DEFAULT_FILENAME)
            };
        }

        if (
            !result ||
            (!result.document && typeof result.save !== "function")
        ) {
            result = await buildAdvisoryPdf(payload);
        }

        const doc = result.document || result;
        const filename = cleanText(
            result.filename || payload.filename,
            DEFAULT_FILENAME
        );

        if (!doc || typeof doc.save !== "function") {
            throw new Error(
                "A valid jsPDF document was not available for download."
            );
        }

        doc.save(filename);

        try {
            global.localStorage?.setItem(
                LAST_DOWNLOAD_KEY,
                new Date().toISOString()
            );
        } catch (error) {
            console.warn(
                "GrowWithHR PDF: download time could not be saved.",
                error
            );
        }

        return result;
    }

    /* ----------------------------------------------------------
       Legacy modal compatibility
    ---------------------------------------------------------- */

    function openPDFModal(reportData) {
        activePDFReportData = reportData || getStoredReport();
        const modal = document.getElementById("pdfModal");

        if (modal) {
            modal.style.display = "flex";
            modal.removeAttribute("hidden");
        }
    }

    function closePDFModal() {
        const modal = document.getElementById("pdfModal");

        if (modal) {
            modal.style.display = "none";
            modal.setAttribute("hidden", "");
        }
    }

    async function generatePDFReport() {
        const button = document.getElementById("generateReportBtn");
        const email = cleanText(
            document.getElementById("userEmail")?.value
        );
        const report = activePDFReportData || getStoredReport() || {};

        if (button) {
            button.disabled = true;
            button.setAttribute("aria-busy", "true");
        }

        try {
            const result = await buildAdvisoryPdf({
                report,
                lead: {
                    email,
                    deliveryRequested: true
                }
            });

            await downloadAdvisoryPdf({
                document: result
            });

            closePDFModal();
        } catch (error) {
            console.error(
                "GrowWithHR PDF: report generation failed.",
                error
            );

            if (typeof global.alert === "function") {
                global.alert(
                    "We could not prepare the PDF just yet. Please try again."
                );
            }
        } finally {
            if (button) {
                button.disabled = false;
                button.removeAttribute("aria-busy");
            }
        }
    }

    function bindPDFEvents() {
        const cancel = document.getElementById("cancelReportBtn");
        const generate = document.getElementById("generateReportBtn");

        if (cancel && !cancel.dataset.pdfBound) {
            cancel.dataset.pdfBound = "true";
            cancel.addEventListener("click", closePDFModal);
        }

        if (generate && !generate.dataset.pdfBound) {
            generate.dataset.pdfBound = "true";
            generate.addEventListener("click", generatePDFReport);
        }
    }

    if (typeof document !== "undefined") {
        if (document.readyState === "loading") {
            document.addEventListener(
                "DOMContentLoaded",
                bindPDFEvents,
                { once: true }
            );
        } else {
            bindPDFEvents();
        }
    }

    global.GrowWithHRPDF = Object.freeze({
        version: PDF_VERSION,
        buildAdvisoryPdf,
        downloadAdvisoryPdf,
        buildAdvisoryModel
    });

    // Preserve older global function names used by existing pages.
    global.openPDFModal = openPDFModal;
    global.closePDFModal = closePDFModal;
    global.bindPDFEvents = bindPDFEvents;
    global.generatePDFReport = generatePDFReport;
})(window);
