const FRAMEWORK = Object.freeze({
    id: "GWHR-ORG-FRAMEWORK-1",
    name: "GrowWithHR Organization Structure Assessment Framework",
    version: "1.0",
    access: "Free public methodology",
    methodologyUrl: "organization-structure-methodology.html",
    statement: "GrowWithHR applies deterministic structural rules to company facts, then shows the public evidence used to support the underlying organization-design principle. A source supports the principle; it does not automatically prescribe GrowWithHR's status threshold unless the finding explicitly says so."
});

const GOVS003_URL = "https://www.gov.uk/government/publications/government-functional-standard-govs-003-human-resources/govenment-functional-standard-govs-003-people";

const SOURCES = Object.freeze({
    "GOVS003-PRINCIPLES": Object.freeze({
        id: "GOVS003-PRINCIPLES",
        publisher: "UK Government / Cabinet Office",
        title: "Government Functional Standard GovS 003: People — Principles",
        section: "Section 2 — Principles",
        url: `${GOVS003_URL}#2-principles`,
        access: "Free public source",
        license: "Open Government Licence v3.0",
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
        supports: "Treating spans and layers as organization-design variables that can affect decision speed and line-management quality. It does not publish a universal numeric span benchmark."
    }),
    "CIPD-ORG-DESIGN": Object.freeze({
        id: "CIPD-ORG-DESIGN",
        publisher: "Chartered Institute of Personnel and Development (CIPD)",
        title: "Organisation design factsheet",
        section: "Organisation design and the organisation design process",
        url: "https://www.cipd.org/en/knowledge/factsheets/organisational-development-design-factsheet/",
        access: "Free public reference",
        license: "Copyright retained by CIPD; linked as a public reference",
        supports: "Viewing organisation design as alignment of structure with strategy and considering the wider system rather than only the organisation chart."
    })
});

const RULE_SOURCE_MAP = Object.freeze({
    "ORG-CAPACITY-001": Object.freeze({
        sourceIds: ["GOVUK-SPANS-LAYERS", "GOVS003-WORKFORCE", "GOVS003-ORG-DESIGN"],
        ruleBasis: "GrowWithHR compares supplied headcount and people-manager capacity as a structural signal. The >8 watch and >12 action triggers are GrowWithHR prototype triggers, not published government or industry benchmarks."
    }),
    "ORG-FOUNDER-001": Object.freeze({
        sourceIds: ["GOVS003-GOVERNANCE", "GOVS003-ACCOUNTABILITY", "GOVS003-DECISIONS"],
        ruleBasis: "GrowWithHR uses founder/CEO direct-report concentration as a proxy for centralized coordination and escalation load. The 7/10 direct-report triggers are GrowWithHR prototype triggers, not source-prescribed limits."
    }),
    "ORG-REPORTING-001": Object.freeze({
        sourceIds: ["GOVUK-SPANS-LAYERS", "GOVS003-ORG-DESIGN", "GOVS003-GOVERNANCE"],
        ruleBasis: "GrowWithHR compares reporting layers with current headcount to flag potentially under-defined or overly layered structures. The numeric triggers are GrowWithHR prototype triggers."
    }),
    "ORG-OWNERSHIP-001": Object.freeze({
        sourceIds: ["GOVS003-ACCOUNTABILITY", "GOVS003-ORG-DESIGN", "GOVS003-PRINCIPLES"],
        ruleBasis: "GrowWithHR checks whether important functions and ownership boundaries are visible enough for the supplied scale. It does not require a particular department count as a universal model."
    }),
    "ORG-CLARITY-001": Object.freeze({
        sourceIds: ["GOVS003-ACCOUNTABILITY", "GOVS003-PRINCIPLES"],
        ruleBasis: "GrowWithHR interprets the company's own report of role clarity against the principle that responsibilities and accountabilities should be defined and traceable."
    }),
    "ORG-DECISIONS-001": Object.freeze({
        sourceIds: ["GOVS003-GOVERNANCE", "GOVS003-DECISIONS", "GOVS003-ACCOUNTABILITY"],
        ruleBasis: "GrowWithHR interprets the company's own report of recurring decision ownership against public guidance on decision roles, autonomy and accountability."
    }),
    "ORG-GOVERNANCE-001": Object.freeze({
        sourceIds: ["GOVS003-GOVERNANCE", "GOVS003-DECISIONS"],
        ruleBasis: "GrowWithHR uses the presence and regularity of a cross-functional operating review as a structural governance signal. The cadence categories are GrowWithHR interpretation, not a source-mandated meeting frequency."
    }),
    "ORG-COORDINATION-001": Object.freeze({
        sourceIds: ["GOVS003-ORG-DESIGN", "CIPD-ORG-DESIGN"],
        ruleBasis: "GrowWithHR uses reported recurring handoff friction as an indicator that roles, interfaces or decision paths may need redesign."
    }),
    "ORG-GROWTH-001": Object.freeze({
        sourceIds: ["GOVS003-WORKFORCE", "GOVS003-ANALYSIS", "GOVS003-ORG-DESIGN"],
        ruleBasis: "GrowWithHR compares today's structure with the user's 12-month headcount assumption to create a deterministic planning scenario. The 30%/50% growth and 8/12 span triggers are GrowWithHR prototype triggers, not source benchmarks."
    }),
    "ORG-LOCATION-001": Object.freeze({
        sourceIds: ["GOVS003-WORKFORCE", "GOVS003-ORG-DESIGN", "GOVS003-GOVERNANCE"],
        ruleBasis: "GrowWithHR uses operating-location count as a coordination and local-versus-central ownership signal. The four-location watch trigger is a GrowWithHR prototype trigger."
    }),
    "ORG-SCENARIO-HEADCOUNT-001": Object.freeze({
        sourceIds: ["GOVS003-WORKFORCE", "GOVS003-ANALYSIS"],
        ruleBasis: "GrowWithHR models a simple 'headcount changes, manager count unchanged' scenario from user-supplied assumptions. It is not a forecast."
    })
});

function sourcesForRule(ruleId) {
    const mapping = RULE_SOURCE_MAP[ruleId] || { sourceIds: [], ruleBasis: "" };
    return {
        ruleBasis: mapping.ruleBasis,
        sources: mapping.sourceIds.map((id) => SOURCES[id]).filter(Boolean)
    };
}

export { FRAMEWORK, SOURCES, RULE_SOURCE_MAP, sourcesForRule };
export default SOURCES;
