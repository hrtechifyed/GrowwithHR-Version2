const FRAMEWORK = Object.freeze({
    id: "GWHR-ORG-FRAMEWORK-1",
    name: "GrowWithHR Organization Structure Assessment Framework",
    version: "1.1.0",
    access: "Free public methodology",
    methodologyUrl: "organization-structure-methodology.html",
    publicMethodologyUrl: "https://hrtechifyed.github.io/GrowwithHR-Version2/organization-structure-methodology.html",
    reviewedAt: "2026-08-17",
    statement: "GrowWithHR applies deterministic structural rules to company facts, then shows the public evidence used to support the underlying organization-design principle. Public sources support the principle; GrowWithHR remains responsible for its disclosed interpretation and numeric prototype triggers.",
    versionHistory: Object.freeze([
        Object.freeze({ version: "1.0.0", date: "2026-08-17", summary: "Initial source-traceable Organization Structure framework." }),
        Object.freeze({ version: "1.1.0", date: "2026-08-17", summary: "Added contextual span factors, founder-decision dependency, expansion signals, report-delivery traceability and richer evidence governance." })
    ])
});

const GOVS003_URL = "https://www.gov.uk/government/publications/government-functional-standard-govs-003-human-resources/govenment-functional-standard-govs-003-people";
const REVIEWED_AT = "2026-08-17";

const SOURCES = Object.freeze({
    "GOVS003-PRINCIPLES": Object.freeze({
        id: "GOVS003-PRINCIPLES",
        publisher: "UK Government / Cabinet Office",
        title: "Government Functional Standard GovS 003: People — Principles",
        section: "Section 2 — Principles",
        url: `${GOVS003_URL}#2-principles`,
        access: "Free public source",
        license: "Open Government Licence v3.0",
        reviewedAt: REVIEWED_AT,
        supports: "Proportionate governance, traceable accountabilities and responsibilities, and matching work to available capability and capacity."
    }),
    "GOVS003-GOVERNANCE": Object.freeze({
        id: "GOVS003-GOVERNANCE",
        publisher: "UK Government / Cabinet Office",
        title: "Government Functional Standard GovS 003: People — Governance and management framework",
        section: "Section 4.1 — Governance and management framework",
        url: `${GOVS003_URL}#41-governance-and-management-framework`,
        access: "Free public source",
        license: "Open Government Licence v3.0",
        reviewedAt: REVIEWED_AT,
        supports: "Authority limits, decision-making roles, degrees of autonomy, reporting structures, roles and accountabilities."
    }),
    "GOVS003-DECISIONS": Object.freeze({
        id: "GOVS003-DECISIONS",
        publisher: "UK Government / Cabinet Office",
        title: "Government Functional Standard GovS 003: People — Decision making",
        section: "Section 4.4 — Decision Making",
        url: `${GOVS003_URL}#44-decision-making`,
        access: "Free public source",
        license: "Open Government Licence v3.0",
        reviewedAt: REVIEWED_AT,
        supports: "Timely decisions based on evidence, defined criteria, stakeholder consultation and appropriate approval roles."
    }),
    "GOVS003-ACCOUNTABILITY": Object.freeze({
        id: "GOVS003-ACCOUNTABILITY",
        publisher: "UK Government / Cabinet Office",
        title: "Government Functional Standard GovS 003: People — Roles and accountabilities",
        section: "Section 4.5.1 — Roles and accountabilities overview",
        url: `${GOVS003_URL}#451-overview`,
        access: "Free public source",
        license: "Open Government Licence v3.0",
        reviewedAt: REVIEWED_AT,
        supports: "Defining activities, outputs and outcomes for which roles are responsible, including who each role is accountable to."
    }),
    "GOVS003-ORG-DESIGN": Object.freeze({
        id: "GOVS003-ORG-DESIGN",
        publisher: "UK Government / Cabinet Office",
        title: "Government Functional Standard GovS 003: People — Organisation design",
        section: "Section 5.1.1 — Organisation design",
        url: `${GOVS003_URL}#511-organisation-design`,
        access: "Free public source",
        license: "Open Government Licence v3.0",
        reviewedAt: REVIEWED_AT,
        supports: "Aligning operating design with business purpose and strategy, including reporting lines, work, roles, structures, tools, processes and culture."
    }),
    "GOVS003-WORKFORCE": Object.freeze({
        id: "GOVS003-WORKFORCE",
        publisher: "UK Government / Cabinet Office",
        title: "Government Functional Standard GovS 003: People — Workforce planning",
        section: "Section 5.1.2 — Workforce planning",
        url: `${GOVS003_URL}#512-workforce-planning`,
        access: "Free public source",
        license: "Open Government Licence v3.0",
        reviewedAt: REVIEWED_AT,
        supports: "Planning future workforce size, shape, composition and locations and keeping those factors aligned to business plans."
    }),
    "GOVS003-ANALYSIS": Object.freeze({
        id: "GOVS003-ANALYSIS",
        publisher: "UK Government / Cabinet Office",
        title: "Government Functional Standard GovS 003: People — Analysis and insight",
        section: "Section 5.1.4 — Analysis and insight",
        url: `${GOVS003_URL}#514-analysis-and-insight`,
        access: "Free public source",
        license: "Open Government Licence v3.0",
        reviewedAt: REVIEWED_AT,
        supports: "Using management information and external research to build an evidence base and model scenarios and outcomes against long-term strategy."
    }),
    "GOVUK-SPANS-LAYERS": Object.freeze({
        id: "GOVUK-SPANS-LAYERS",
        publisher: "UK Government / Cabinet Office",
        title: "Civil Service People Plan 2024–2027 — Spans and Layers",
        section: "Spans and Layers",
        url: "https://www.gov.uk/government/publications/civil-service-people-plan-2024-2027/civil-service-people-plan-2024-2027-html#spans-and-layers",
        access: "Free public source",
        license: "Open Government Licence v3.0",
        reviewedAt: REVIEWED_AT,
        supports: "Treating spans and layers as organization-design variables that can affect decision speed and line-management quality. It does not publish a universal numeric span benchmark."
    }),
    "OPENSTAX-SPAN-CONTEXT": Object.freeze({
        id: "OPENSTAX-SPAN-CONTEXT",
        publisher: "OpenStax",
        title: "Introduction to Business 2e — Degree of Centralization",
        section: "7.5 — Degree of Centralization",
        url: "https://openstax.org/books/introduction-business-2e/pages/7-5-degree-of-centralization",
        access: "Free public source",
        license: "Creative Commons Attribution-NonCommercial-ShareAlike",
        reviewedAt: REVIEWED_AT,
        supports: "Evaluating span of control contextually using task complexity, worker location, delegation, required manager interaction and workforce skill or experience rather than relying on one universal span number."
    }),
    "OPENSTAX-ORG-DESIGN": Object.freeze({
        id: "OPENSTAX-ORG-DESIGN",
        publisher: "OpenStax",
        title: "Principles of Management — Organizational Structures and Design",
        section: "10.1 — Organizational Structures and Design",
        url: "https://openstax.org/books/principles-management/pages/10-1-organizational-structures-and-design",
        access: "Free public source",
        license: "Creative Commons Attribution 4.0",
        reviewedAt: REVIEWED_AT,
        supports: "Using specialization, reporting and command structure, span of control, centralization and formalization as core organization-design dimensions."
    }),
    "CIPD-ORG-DESIGN": Object.freeze({
        id: "CIPD-ORG-DESIGN",
        publisher: "Chartered Institute of Personnel and Development (CIPD)",
        title: "Organisation design factsheet",
        section: "Organisation design and the organisation design process",
        url: "https://www.cipd.org/en/knowledge/factsheets/organisational-development-design-factsheet/",
        access: "Free public reference",
        license: "Copyright retained by CIPD; linked as a public reference",
        reviewedAt: REVIEWED_AT,
        supports: "Viewing organisation design as alignment of structure with strategy and considering the wider system rather than only the organisation chart."
    })
});

const RULE_SOURCE_MAP = Object.freeze({
    "ORG-CAPACITY-001": Object.freeze({
        sourceIds: ["OPENSTAX-SPAN-CONTEXT", "GOVUK-SPANS-LAYERS", "GOVS003-WORKFORCE", "GOVS003-ORG-DESIGN"],
        ruleBasis: "GrowWithHR starts with prototype watch/action span triggers, then adjusts them using supplied task complexity, delegation, manager-interaction, workforce-experience and location context. The numeric starting points and adjustment values are GrowWithHR prototype rules, not published external benchmarks."
    }),
    "ORG-FOUNDER-001": Object.freeze({
        sourceIds: ["GOVS003-GOVERNANCE", "GOVS003-ACCOUNTABILITY", "GOVS003-DECISIONS", "OPENSTAX-SPAN-CONTEXT"],
        ruleBasis: "GrowWithHR evaluates both founder/CEO direct-report concentration and the number of important decision categories the user says still require founder/CEO approval. The direct-report and decision-count triggers are GrowWithHR prototype rules, not source-prescribed limits."
    }),
    "ORG-REPORTING-001": Object.freeze({
        sourceIds: ["GOVUK-SPANS-LAYERS", "OPENSTAX-ORG-DESIGN", "GOVS003-ORG-DESIGN", "GOVS003-GOVERNANCE"],
        ruleBasis: "GrowWithHR compares reporting layers with current headcount to flag potentially under-defined or overly layered structures. The numeric triggers are GrowWithHR prototype triggers."
    }),
    "ORG-OWNERSHIP-001": Object.freeze({
        sourceIds: ["GOVS003-ACCOUNTABILITY", "OPENSTAX-ORG-DESIGN", "GOVS003-ORG-DESIGN", "GOVS003-PRINCIPLES"],
        ruleBasis: "GrowWithHR checks whether important functions and ownership boundaries are visible enough for the supplied scale. It does not require a universal department count."
    }),
    "ORG-CLARITY-001": Object.freeze({
        sourceIds: ["GOVS003-ACCOUNTABILITY", "GOVS003-PRINCIPLES"],
        ruleBasis: "GrowWithHR interprets the company's own report of role clarity against the principle that responsibilities and accountabilities should be defined and traceable."
    }),
    "ORG-DECISIONS-001": Object.freeze({
        sourceIds: ["GOVS003-GOVERNANCE", "GOVS003-DECISIONS", "GOVS003-ACCOUNTABILITY", "OPENSTAX-SPAN-CONTEXT"],
        ruleBasis: "GrowWithHR interprets the company's report of recurring decision ownership against public guidance on decision roles, autonomy, accountability and decentralization."
    }),
    "ORG-GOVERNANCE-001": Object.freeze({
        sourceIds: ["GOVS003-GOVERNANCE", "GOVS003-DECISIONS"],
        ruleBasis: "GrowWithHR uses the presence and regularity of a cross-functional operating review as a governance signal. The cadence categories are GrowWithHR interpretation, not a source-mandated meeting frequency."
    }),
    "ORG-COORDINATION-001": Object.freeze({
        sourceIds: ["GOVS003-ORG-DESIGN", "CIPD-ORG-DESIGN"],
        ruleBasis: "GrowWithHR uses reported recurring handoff friction as an indicator that roles, interfaces or decision paths may need redesign."
    }),
    "ORG-GROWTH-001": Object.freeze({
        sourceIds: ["GOVS003-WORKFORCE", "GOVS003-ANALYSIS", "GOVS003-ORG-DESIGN", "CIPD-ORG-DESIGN"],
        ruleBasis: "GrowWithHR compares today's structure with the user's 12-month headcount assumption and declared expansion type. Headcount growth, projected-span and expansion triggers are GrowWithHR prototype rules used for deterministic planning, not source benchmarks or forecasts."
    }),
    "ORG-LOCATION-001": Object.freeze({
        sourceIds: ["OPENSTAX-SPAN-CONTEXT", "GOVS003-WORKFORCE", "GOVS003-ORG-DESIGN", "GOVS003-GOVERNANCE"],
        ruleBasis: "GrowWithHR uses operating-location count as a coordination and local-versus-central ownership signal. The four-location watch trigger is a GrowWithHR prototype trigger."
    }),
    "ORG-SCENARIO-HEADCOUNT-001": Object.freeze({
        sourceIds: ["GOVS003-WORKFORCE", "GOVS003-ANALYSIS", "OPENSTAX-SPAN-CONTEXT"],
        ruleBasis: "GrowWithHR models a simple 'headcount changes, manager count unchanged' scenario and compares the projected span with the same disclosed contextual prototype thresholds. It is not a forecast."
    })
});

function sourcesForRule(ruleId) {
    const mapping = RULE_SOURCE_MAP[ruleId] || { sourceIds: [], ruleBasis: "" };
    return {
        ruleBasis: mapping.ruleBasis,
        sources: mapping.sourceIds.map((id) => SOURCES[id]).filter(Boolean)
    };
}

function ruleIdsForSource(sourceId) {
    return Object.entries(RULE_SOURCE_MAP)
        .filter(([, mapping]) => mapping.sourceIds.includes(sourceId))
        .map(([ruleId]) => ruleId);
}

export { FRAMEWORK, SOURCES, RULE_SOURCE_MAP, sourcesForRule, ruleIdsForSource };
export default SOURCES;
