const FRAMEWORK = Object.freeze({
    id: "GWHR-ORG-FRAMEWORK-1",
    name: "GrowWithHR Organization Structure Assessment Framework",
    version: "1.1",
    access: "Free public methodology",
    methodologyUrl: "organization-structure-methodology.html",
    lastReviewed: "2026-08-17",
    reviewOwner: "GrowWithHR organisation-design methodology",
    statement: "GrowWithHR applies deterministic structural rules to company facts, then shows the public evidence used to support the underlying organization-design principle. A source supports the principle; it does not automatically prescribe GrowWithHR's status threshold unless the finding explicitly says so.",
    changeLog: Object.freeze([
        Object.freeze({ version: "1.1", date: "2026-08-17", note: "Added contextual management-capacity factors, founder-decision and expansion signals, governed report metadata and explicit source/rule version traceability." }),
        Object.freeze({ version: "1.0", date: "2026-08-17", note: "Initial public Organization Structure methodology and source registry." })
    ])
});

const GOVS003_URL = "https://www.gov.uk/government/publications/government-functional-standard-govs-003-human-resources/govenment-functional-standard-govs-003-people";

const SOURCES = Object.freeze({
    "OPENSTAX-SPAN-CONTEXT": Object.freeze({
        id: "OPENSTAX-SPAN-CONTEXT",
        publisher: "OpenStax",
        title: "Introduction to Business 2e — Degree of Centralization",
        section: "7.5 Degree of Centralization — factors affecting span of control",
        url: "https://openstax.org/books/introduction-business-2e/pages/7-5-degree-of-centralization",
        access: "Free public source",
        license: "Creative Commons Attribution 4.0 International (CC BY 4.0)",
        supports: "Treating span of control contextually using task complexity, worker location, delegation, manager-worker interaction and workforce capability rather than applying one universal span number.",
        lastReviewed: "2026-08-17"
    }),
    "OPENSTAX-ORG-DESIGN": Object.freeze({
        id: "OPENSTAX-ORG-DESIGN",
        publisher: "OpenStax",
        title: "Principles of Management — Organizational Structures and Design",
        section: "10.1 Organizational Structures and Design",
        url: "https://openstax.org/books/principles-management/pages/10-1-organizational-structures-and-design",
        access: "Free public source",
        license: "Creative Commons Attribution 4.0 International (CC BY 4.0)",
        supports: "Using specialization, command-and-control, span of control, centralization and formalization as connected organization-design variables whose appropriate balance depends on circumstances and objectives.",
        lastReviewed: "2026-08-17"
    }),
    "GOVS003-PRINCIPLES": Object.freeze({
        id: "GOVS003-PRINCIPLES",
        publisher: "UK Government / Cabinet Office",
        title: "Government Functional Standard GovS 003: People — Principles",
        section: "Section 2 — Principles",
        url: `${GOVS003_URL}#2-principles`,
        access: "Free public source",
        license: "Open Government Licence v3.0",
        supports: "Proportionate governance, traceable accountabilities and responsibilities, and matching work to available capability and capacity.",
        lastReviewed: "2026-08-17"
    }),
    "GOVS003-GOVERNANCE": Object.freeze({
        id: "GOVS003-GOVERNANCE",
        publisher: "UK Government / Cabinet Office",
        title: "Government Functional Standard GovS 003: People — Governance and management framework",
        section: "Section 4.1 — Governance and management framework",
        url: `${GOVS003_URL}#41-governance-and-management-framework`,
        access: "Free public source",
        license: "Open Government Licence v3.0",
        supports: "Authority limits, decision-making roles, degrees of autonomy, reporting structures, roles and accountabilities.",
        lastReviewed: "2026-08-17"
    }),
    "GOVS003-DECISIONS": Object.freeze({
        id: "GOVS003-DECISIONS",
        publisher: "UK Government / Cabinet Office",
        title: "Government Functional Standard GovS 003: People — Decision making",
        section: "Section 4.4 — Decision Making",
        url: `${GOVS003_URL}#44-decision-making`,
        access: "Free public source",
        license: "Open Government Licence v3.0",
        supports: "Timely decisions based on evidence, defined criteria, stakeholder consultation and appropriate approval roles.",
        lastReviewed: "2026-08-17"
    }),
    "GOVS003-ACCOUNTABILITY": Object.freeze({
        id: "GOVS003-ACCOUNTABILITY",
        publisher: "UK Government / Cabinet Office",
        title: "Government Functional Standard GovS 003: People — Roles and accountabilities",
        section: "Section 4.5.1 — Roles and accountabilities overview",
        url: `${GOVS003_URL}#451-overview`,
        access: "Free public source",
        license: "Open Government Licence v3.0",
        supports: "Defining activities, outputs and outcomes for which roles are responsible, including who each role is accountable to.",
        lastReviewed: "2026-08-17"
    }),
    "GOVS003-ORG-DESIGN": Object.freeze({
        id: "GOVS003-ORG-DESIGN",
        publisher: "UK Government / Cabinet Office",
        title: "Government Functional Standard GovS 003: People — Organisation design",
        section: "Section 5.1.1 — Organisation design",
        url: `${GOVS003_URL}#511-organisation-design`,
        access: "Free public source",
        license: "Open Government Licence v3.0",
        supports: "Aligning operating design with business purpose and strategy, including reporting lines, work, roles, structures, tools, processes and culture.",
        lastReviewed: "2026-08-17"
    }),
    "GOVS003-WORKFORCE": Object.freeze({
        id: "GOVS003-WORKFORCE",
        publisher: "UK Government / Cabinet Office",
        title: "Government Functional Standard GovS 003: People — Workforce planning",
        section: "Section 5.1.2 — Workforce planning",
        url: `${GOVS003_URL}#512-workforce-planning`,
        access: "Free public source",
        license: "Open Government Licence v3.0",
        supports: "Planning future workforce size, shape, composition and locations and keeping those factors aligned to business plans.",
        lastReviewed: "2026-08-17"
    }),
    "GOVS003-ANALYSIS": Object.freeze({
        id: "GOVS003-ANALYSIS",
        publisher: "UK Government / Cabinet Office",
        title: "Government Functional Standard GovS 003: People — Analysis and insight",
        section: "Section 5.1.4 — Analysis and insight",
        url: `${GOVS003_URL}#514-analysis-and-insight`,
        access: "Free public source",
        license: "Open Government Licence v3.0",
        supports: "Using management information and external research to build an evidence base and model scenarios and outcomes against long-term strategy.",
        lastReviewed: "2026-08-17"
    }),
    "GOVUK-SPANS-LAYERS": Object.freeze({
        id: "GOVUK-SPANS-LAYERS",
        publisher: "UK Government / Cabinet Office",
        title: "Civil Service People Plan 2024–2027 — Spans and Layers",
        section: "Spans and Layers",
        url: "https://www.gov.uk/government/publications/civil-service-people-plan-2024-2027/civil-service-people-plan-2024-2027-html#spans-and-layers",
        access: "Free public source",
        license: "Open Government Licence v3.0",
        supports: "Treating spans and layers as organization-design variables that can affect decision speed and line-management quality. It does not publish a universal numeric span benchmark.",
        lastReviewed: "2026-08-17"
    }),
    "CIPD-ORG-DESIGN": Object.freeze({
        id: "CIPD-ORG-DESIGN",
        publisher: "Chartered Institute of Personnel and Development (CIPD)",
        title: "Organisation design factsheet",
        section: "Organisation design and the organisation design process",
        url: "https://www.cipd.org/en/knowledge/factsheets/organisational-development-design-factsheet/",
        access: "Free public reference",
        license: "Copyright retained by CIPD; linked as a public reference",
        supports: "Viewing organisation design as alignment of structure with strategy and considering the wider system rather than only the organisation chart.",
        lastReviewed: "2026-08-17"
    })
});

const RULE_SOURCE_MAP = Object.freeze({
    "ORG-CAPACITY-001": Object.freeze({
        version: "1.1",
        sourceIds: ["OPENSTAX-SPAN-CONTEXT", "OPENSTAX-ORG-DESIGN", "GOVUK-SPANS-LAYERS", "GOVS003-WORKFORCE"],
        ruleBasis: "GrowWithHR interprets management span together with work complexity, standardization, manager role, team independence, coaching intensity and operating-location context. Any numeric guardrails used by GrowWithHR are prototype triggers, not published external benchmarks.",
        lastReviewed: "2026-08-17",
        reviewOwner: "GrowWithHR organisation-design methodology"
    }),
    "ORG-FOUNDER-001": Object.freeze({
        version: "1.1",
        sourceIds: ["GOVS003-GOVERNANCE", "GOVS003-ACCOUNTABILITY", "GOVS003-DECISIONS", "OPENSTAX-ORG-DESIGN"],
        ruleBasis: "GrowWithHR combines founder/CEO direct-report concentration with the important decisions the company says still require founder approval. The direct-report guardrails remain GrowWithHR prototype triggers, not source-prescribed limits.",
        lastReviewed: "2026-08-17",
        reviewOwner: "GrowWithHR organisation-design methodology"
    }),
    "ORG-REPORTING-001": Object.freeze({
        version: "1.1",
        sourceIds: ["GOVUK-SPANS-LAYERS", "GOVS003-ORG-DESIGN", "GOVS003-GOVERNANCE", "OPENSTAX-ORG-DESIGN"],
        ruleBasis: "GrowWithHR compares reporting layers with current headcount and other structural signals to flag potentially under-defined or overly layered structures. Numeric layer/headcount guardrails are GrowWithHR prototype triggers.",
        lastReviewed: "2026-08-17",
        reviewOwner: "GrowWithHR organisation-design methodology"
    }),
    "ORG-OWNERSHIP-001": Object.freeze({
        version: "1.1",
        sourceIds: ["GOVS003-ACCOUNTABILITY", "GOVS003-ORG-DESIGN", "GOVS003-PRINCIPLES", "OPENSTAX-ORG-DESIGN"],
        ruleBasis: "GrowWithHR checks whether important functions and ownership boundaries are visible enough for the supplied scale. It does not require a particular department count as a universal model.",
        lastReviewed: "2026-08-17",
        reviewOwner: "GrowWithHR organisation-design methodology"
    }),
    "ORG-CLARITY-001": Object.freeze({
        version: "1.1",
        sourceIds: ["GOVS003-ACCOUNTABILITY", "GOVS003-PRINCIPLES", "OPENSTAX-ORG-DESIGN"],
        ruleBasis: "GrowWithHR interprets the company's own report of role clarity against public principles that responsibilities, reporting relationships and accountability should be understandable for the operating model being used.",
        lastReviewed: "2026-08-17",
        reviewOwner: "GrowWithHR organisation-design methodology"
    }),
    "ORG-DECISIONS-001": Object.freeze({
        version: "1.1",
        sourceIds: ["GOVS003-GOVERNANCE", "GOVS003-DECISIONS", "GOVS003-ACCOUNTABILITY", "OPENSTAX-SPAN-CONTEXT"],
        ruleBasis: "GrowWithHR interprets the company's reported decision ownership together with the important decisions still requiring founder approval. It uses those facts as a centralization and escalation signal rather than prescribing one decision-rights framework.",
        lastReviewed: "2026-08-17",
        reviewOwner: "GrowWithHR organisation-design methodology"
    }),
    "ORG-GOVERNANCE-001": Object.freeze({
        version: "1.1",
        sourceIds: ["GOVS003-GOVERNANCE", "GOVS003-DECISIONS"],
        ruleBasis: "GrowWithHR uses the presence and regularity of a cross-functional operating review as a structural governance signal. The cadence categories are GrowWithHR interpretation, not a source-mandated meeting frequency.",
        lastReviewed: "2026-08-17",
        reviewOwner: "GrowWithHR organisation-design methodology"
    }),
    "ORG-COORDINATION-001": Object.freeze({
        version: "1.1",
        sourceIds: ["GOVS003-ORG-DESIGN", "CIPD-ORG-DESIGN", "OPENSTAX-ORG-DESIGN"],
        ruleBasis: "GrowWithHR uses reported recurring handoff friction as an indicator that roles, interfaces, reporting relationships or decision paths may need redesign.",
        lastReviewed: "2026-08-17",
        reviewOwner: "GrowWithHR organisation-design methodology"
    }),
    "ORG-GROWTH-001": Object.freeze({
        version: "1.1",
        sourceIds: ["GOVS003-WORKFORCE", "GOVS003-ANALYSIS", "GOVS003-ORG-DESIGN", "CIPD-ORG-DESIGN"],
        ruleBasis: "GrowWithHR compares today's structure with the user's 12-month headcount and expansion assumptions to create a deterministic planning scenario. Growth and span guardrails are GrowWithHR prototype triggers, not source benchmarks.",
        lastReviewed: "2026-08-17",
        reviewOwner: "GrowWithHR organisation-design methodology"
    }),
    "ORG-LOCATION-001": Object.freeze({
        version: "1.1",
        sourceIds: ["OPENSTAX-SPAN-CONTEXT", "GOVS003-WORKFORCE", "GOVS003-ORG-DESIGN", "GOVS003-GOVERNANCE"],
        ruleBasis: "GrowWithHR uses current and planned operating-location complexity as a coordination and local-versus-central ownership signal. Any location-count guardrail is a GrowWithHR prototype trigger.",
        lastReviewed: "2026-08-17",
        reviewOwner: "GrowWithHR organisation-design methodology"
    }),
    "ORG-SCENARIO-HEADCOUNT-001": Object.freeze({
        version: "1.1",
        sourceIds: ["GOVS003-WORKFORCE", "GOVS003-ANALYSIS", "OPENSTAX-SPAN-CONTEXT"],
        ruleBasis: "GrowWithHR models a simple 'headcount changes, manager count unchanged' scenario from user-supplied assumptions and applies the same disclosed contextual management-capacity logic. It is not a forecast.",
        lastReviewed: "2026-08-17",
        reviewOwner: "GrowWithHR organisation-design methodology"
    })
});

function sourcesForRule(ruleId) {
    const mapping = RULE_SOURCE_MAP[ruleId] || { sourceIds: [], ruleBasis: "", version: "unversioned", lastReviewed: "", reviewOwner: "" };
    return {
        ruleId,
        ruleVersion: mapping.version,
        ruleBasis: mapping.ruleBasis,
        lastReviewed: mapping.lastReviewed,
        reviewOwner: mapping.reviewOwner,
        sources: mapping.sourceIds.map((id) => SOURCES[id]).filter(Boolean)
    };
}

function sourceRuleIds(sourceId) {
    return Object.entries(RULE_SOURCE_MAP)
        .filter(([, rule]) => rule.sourceIds.includes(sourceId))
        .map(([ruleId]) => ruleId);
}

export { FRAMEWORK, SOURCES, RULE_SOURCE_MAP, sourcesForRule, sourceRuleIds };
export default SOURCES;
