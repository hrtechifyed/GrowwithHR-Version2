/* ==========================================
   GrowWithHR V0.9.0-beta
   helpers.js
   Shared Helper Functions
========================================== */

function formatRule(item) {

    if (typeof item === "string") {
        return item;
    }

    if (item && typeof item === "object") {
        return item.title || item.name || "";
    }

    return "";

}


function getComplianceCategory(rule) {

    const title = (rule.title || rule.name || "").toLowerCase();

    if (rule.category) {
        return rule.category;
    }

    if (title.includes("epf") || title.includes("provident")) {
        return "Provident Fund";
    }

    if (title.includes("esic") || title.includes("insurance")) {
        return "Employee Insurance";
    }

    if (title.includes("posh")) {
        return "Workplace Safety";
    }

    if (title.includes("gratuity") || title.includes("bonus") || title.includes("maternity")) {
        return "Statutory Benefits";
    }

    return "Statutory Compliance";

}

/* ==========================================
   RULE EXPLANATIONS
========================================== */

function getRuleExplanation(rule) {

    const title = (rule.title || rule.name || "").toLowerCase();
    const threshold = rule.threshold || rule.applicability || rule.condition || "the selected state, entity type, industry, and workforce size";

    if (title.includes("epf") || title.includes("provident")) {
        return "This applies because the Employees' Provident Funds and Miscellaneous Provisions Act, 1952 can require covered establishments to register, enrol eligible employees, deposit contributions, and maintain returns. Non-compliance may lead to interest, damages, recovery proceedings, inspections, and prosecution exposure for responsible officers.";
    }

    if (title.includes("esic") || title.includes("insurance")) {
        return "This applies because the Employees' State Insurance Act, 1948 can require eligible establishments and employees to be registered and contributions to be deposited within statutory timelines. Violations may trigger interest, damages, contribution recovery, inspection actions, and prosecution exposure.";
    }

    if (title.includes("posh") || title.includes("sexual harassment")) {
        return "This applies because the POSH framework requires covered employers to prevent and redress workplace sexual harassment through an Internal Committee, policy communication, awareness, and records. Failure can result in monetary penalties, reputational harm, cancellation or non-renewal risks for business licences, and repeat-offence consequences.";
    }

    if (title.includes("gratuity")) {
        return "This applies because the Payment of Gratuity Act, 1972 creates a statutory terminal-benefit obligation for eligible employees. Delayed or incorrect payment can lead to interest, authority proceedings, recovery directions, penalties, and avoidable employee disputes.";
    }

    if (title.includes("bonus")) {
        return "This applies because the Payment of Bonus Act, 1965 can require qualifying establishments to calculate and pay statutory bonus to eligible employees. Breaches may lead to labour authority proceedings, arrears, penalties, prosecution exposure, and employee-relations risk.";
    }

    if (title.includes("maternity")) {
        return "This applies because the Maternity Benefit Act, 1961 protects eligible employees with statutory benefits, leave, and related safeguards. Non-compliance can create wage liability, penalties, prosecution exposure, and heightened discrimination or employee-relations risk.";
    }

    return `This applies because your organisation profile matches applicability signals for this law or statutory requirement: ${threshold}. Treat this as a legal-risk checkpoint: missed registrations, late filings, weak records, or unpaid statutory dues can result in notices, financial exposure, prosecution risk, and disruption during audits, funding diligence, or enterprise customer reviews.`;

}

/* ==========================================
   AUTHORITIES
========================================== */

function getAuthorityName(sourceId) {

    switch (sourceId) {

        case "EPFO":
            return "Employees' Provident Fund Organisation";

        case "ESIC":
            return "Employees' State Insurance Corporation";

        case "INDIACODE":
            return "India Code";

        case "LABOUR":
            return "Ministry of Labour & Employment";

        default:
            return "Government Authority";

    }

}

function getAuthorityURL(sourceId) {

    switch (sourceId) {

        case "EPFO":
            return "https://www.epfindia.gov.in";

        case "ESIC":
            return "https://www.esic.gov.in";

        case "INDIACODE":
            return "https://www.indiacode.nic.in";

        case "LABOUR":
            return "https://labour.gov.in";

        default:
            return "https://labour.gov.in";

    }

}

/* ==========================================
   NEXT ACTIONS
========================================== */

function getNextActions(rule) {

    const title = (rule.title || "").toLowerCase();

    if (title.includes("epf")) {

        return [
            "Review EPF applicability.",
            "Register with EPFO if applicable.",
            "Enroll eligible employees.",
            "Deposit monthly contributions.",
            "Maintain statutory records."
        ];

    }

    if (title.includes("esic")) {

        return [
            "Review ESIC applicability.",
            "Register establishment.",
            "Register eligible employees.",
            "Deposit contributions.",
            "Maintain statutory records."
        ];

    }

    if (title.includes("posh")) {

        return [
            "Review applicability.",
            "Constitute Internal Committee.",
            "Publish POSH Policy.",
            "Conduct awareness sessions.",
            "Maintain complaint records."
        ];

    }

    if (title.includes("gratuity")) {

        return [
            "Review employee eligibility.",
            "Maintain service records.",
            "Calculate gratuity correctly.",
            "Maintain documentation."
        ];

    }

    return [

        "Review the requirement.",
        "Implement the process.",
        "Maintain documentation.",
        "Review periodically."

    ];

}

/* ==========================================
   PEOPLE STRATEGY
========================================== */

function getRecommendationReason(item) {

    const text = item.toLowerCase();

    if (text.includes("handbook"))
        return "Improves policy communication and consistency.";

    if (text.includes("performance"))
        return "Builds accountability and employee development.";

    if (text.includes("manager"))
        return "Develops leadership capability.";

    if (text.includes("workforce"))
        return "Supports future hiring decisions.";

    return "Strengthens HR governance.";

}

function getRecommendationBenefit(item) {

    const text = item.toLowerCase();

    if (text.includes("handbook"))
        return "Improves employee experience.";

    if (text.includes("performance"))
        return "Supports organisational performance.";

    if (text.includes("manager"))
        return "Creates stronger people managers.";

    if (text.includes("workforce"))
        return "Improves workforce planning.";

    return "Improves governance maturity.";

}

function getRecommendationTimeline(item) {

    const text = item.toLowerCase();

    if (text.includes("handbook"))
        return "0–30 Days";

    if (text.includes("performance"))
        return "30–90 Days";

    if (text.includes("manager"))
        return "60–180 Days";

    return "As the organisation grows.";

}

/* ==========================================
   GROWTH READINESS
========================================== */

function getGrowthReason(item) {

    const text = item.toLowerCase();

    if (text.includes("hris"))
        return "Supports efficient HR operations.";

    if (text.includes("analytics"))
        return "Enables data-driven workforce decisions.";

    if (text.includes("leadership"))
        return "Builds future organisational capability.";

    if (text.includes("succession"))
        return "Improves business continuity.";

    return "Supports sustainable growth.";

}

function getGrowthBenefit(item) {

    const text = item.toLowerCase();

    if (text.includes("hris"))
        return "Improves HR efficiency.";

    if (text.includes("analytics"))
        return "Supports better decision making.";

    if (text.includes("leadership"))
        return "Develops future leaders.";

    if (text.includes("succession"))
        return "Reduces organisational risk.";

    return "Supports long-term growth.";

}

function getGrowthTimeline(item) {

    const text = item.toLowerCase();

    if (text.includes("hris"))
        return "6–12 Months";

    if (text.includes("analytics"))
        return "After HRIS";

    if (text.includes("leadership"))
        return "3–6 Months";

    if (text.includes("succession"))
        return "Before 250 Employees";

    return "As Needed";

}
