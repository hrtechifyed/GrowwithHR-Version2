/* ==========================================
   GrowWithHR  0.9.0-beta
   renderer.js
   Executive Dashboard Renderer
========================================== */

function getDashboardRoot() {
    return document.getElementById("dashboardRoot");
}

function escapeHTML(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function asArray(value) {
    return Array.isArray(value) ? value : [];
}

function getRuleTitle(rule) {
    return escapeHTML(formatRule(rule));
}

function renderMetricCard(label, value, note) {
    return `
        <div class="executive-metric-card">
            <span class="metric-label">${escapeHTML(label)}</span>
            <strong class="metric-value">${escapeHTML(value)}</strong>
            <span class="metric-note">${escapeHTML(note)}</span>
        </div>
    `;
}

function renderEmptyState(message) {
    return `
        <div class="empty-state">
            <p>${escapeHTML(message)}</p>
        </div>
    `;
}

function renderSourceCitation(item = {}) {

    if (!item.source) {
        return "";
    }

    return `
        <div class="official-source">

            <span class="source-label">

                Official Source

            </span>

            <a
                href="${escapeHTML(item.source.url)}"
                target="_blank"
                rel="noopener noreferrer">

                ${escapeHTML(item.source.name)}

            </a>

        </div>
    `;

}

function renderSectionShell(id, title, subtitle, content, expanded) {
    return `
        <section class="dashboard-accordion" id="${escapeHTML(id)}">
            <button class="accordion-trigger" type="button" aria-expanded="${expanded ? "true" : "false"}">
                <span>
                    <strong>${escapeHTML(title)}</strong>
                    <small>${escapeHTML(subtitle)}</small>
                </span>
                <span class="accordion-icon">${expanded ? "−" : "+"}</span>
            </button>
            <div class="accordion-panel" ${expanded ? "" : "hidden"}>
                ${content}
            </div>
        </section>
    `;
}

function renderExecutiveSummary(reportData) {

    const profile =
        reportData.organizationProfile || {};

    const summary =
        reportData.executiveSummary || {};

    return `

        <section
            class="executive-summary-card executive-summary-hero"
            aria-labelledby="executiveSummaryTitle">

            <div class="summary-hero-copy">

                <p class="eyebrow">

                    Executive Advisory Report

                </p>

                <h2 id="executiveSummaryTitle">

                    Executive Intelligence Overview

                </h2>

                <p>

                    Executive advisory generated for

                    <strong>

                        ${escapeHTML(
                            profile.companyName ||
                            "Organization"
                        )}

                    </strong>

                    operating within

                    <strong>

                        ${escapeHTML(
                            profile.industry ||
                            "Unknown Industry"
                        )}

                    </strong>.

                </p>

            </div>

            <div
                class="executive-profile-strip">

                ${renderMetricCard(

                    "Employees",

                    profile.currentEmployees ?? "-",

                    "Current Workforce"

                )}

                ${renderMetricCard(

                    "Projected",

                    profile.projectedEmployees ?? "-",

                    "Growth Plan"

                )}

                ${renderMetricCard(

                    "Industry",

                    profile.industry ?? "-",

                    "Business"

                )}

                ${renderMetricCard(

                    "Work Model",

                    profile.workModel ?? "-",

                    "Operating Model"

                )}

            </div>

            <div
                class="executive-meta-grid executive-status-grid">

                ${renderMetricCard(

                    "Observations",

                    summary.observationCount ?? 0,

                    "Executive Findings"

                )}

                ${renderMetricCard(

                    "Risks",

                    summary.riskCount ?? 0,

                    "Potential Risks"

                )}

                ${renderMetricCard(

                    "Opportunities",

                    summary.opportunityCount ?? 0,

                    "Improvement Areas"

                )}

                ${renderMetricCard(

                    "Recommendations",

                    summary.recommendationCount ?? 0,

                    "Recommended Actions"

                )}

            </div>

        </section>

    `;

}


function renderCompanyProfile(reportData) {

    const profile =
        reportData.organizationProfile || {};

    return `

        <div class="executive-card-grid">

            ${renderMetricCard(

                "Company",

                profile.companyName || "-",

                "Organization"

            )}

            ${renderMetricCard(

                "Industry",

                profile.industry || "-",

                "Business Sector"

            )}

            ${renderMetricCard(

                "Entity",

                profile.entityType || "-",

                "Legal Structure"

            )}

            ${renderMetricCard(

                "Work Model",

                profile.workModel || "-",

                "Operating Model"

            )}

            ${renderMetricCard(

                "Employees",

                profile.currentEmployees ?? "-",

                "Current"

            )}

            ${renderMetricCard(

                "Projected",

                profile.projectedEmployees ?? "-",

                "Planned"

            )}

        </div>

    `;

}

function renderObservations(reportData) {

    const observations =
        asArray(reportData.observations);

    if (!observations.length) {

        return renderEmptyState(

            "No executive observations available."

        );

    }

    return observations.map(

        observation => `

            <div class="executive-card">

                <h4>

                    ${escapeHTML(
                        observation.title
                    )}

                </h4>

                <p>

                    ${escapeHTML(
                        observation.description
                    )}

                </p>

            </div>

        `

    ).join("");

}

function renderRisks(reportData) {

    const risks =
        asArray(reportData.risks);

    if (!risks.length) {

        return renderEmptyState(

            "No executive risks identified."

        );

    }

    return risks.map(

        risk => `

            <div class="executive-card executive-risk">

                <h4>

                    ${escapeHTML(
                        risk.title
                    )}

                </h4>

                <p>

                    ${escapeHTML(
                        risk.description
                    )}

                </p>

            </div>

        `

    ).join("");

}

function renderOpportunities(reportData) {

    const opportunities =
        asArray(
            reportData.opportunities
        );

    if (!opportunities.length) {

        return renderEmptyState(

            "No executive opportunities identified."

        );

    }

    return opportunities.map(

        opportunity => `

            <div class="executive-card executive-opportunity">

                <h4>

                    ${escapeHTML(
                        opportunity.title
                    )}

                </h4>

                <p>

                    ${escapeHTML(
                        opportunity.description
                    )}

                </p>

            </div>

        `

    ).join("");

}

function renderInsights(reportData) {

    const insights =
        asArray(
            reportData.insights
        );

    if (!insights.length) {

        return renderEmptyState(

            "No executive insights available."

        );

    }

    return insights.map(

        insight => `

            <div class="executive-card executive-insight">

                <h4>

                    ${escapeHTML(
                        insight.title
                    )}

                </h4>

                <p>

                    ${escapeHTML(
                        insight.description
                    )}

                </p>

            </div>

        `

    ).join("");

}


function renderRecommendations(reportData) {

    const recommendations =
        asArray(
            reportData.recommendations
        );

    if (!recommendations.length) {

        return renderEmptyState(

            "No recommendations generated."

        );

    }

    return recommendations.map(

        recommendation => `

            <div class="executive-card executive-recommendation">

                <h4>

                    ${escapeHTML(
                        recommendation.title
                    )}

                </h4>

                <p>

                    ${escapeHTML(
                        recommendation.description
                    )}

                </p>

                <span class="recommendation-priority">

                    Priority:
                    ${escapeHTML(
                        recommendation.priority || "-"
                    )}

                </span>

            </div>

        `

    ).join("");

}







function renderDashboardLayout(reportData) {

    const root =
        getDashboardRoot();

    if (!root) {
        return;
    }

    root.innerHTML = `

        <div
            class="executive-dashboard"
            id="executiveDashboard">

            ${renderExecutiveSummary(reportData)}

            <div
                class="journey-rail">

                <span>Executive Summary</span>

                <span>Company Profile</span>

                <span>Insights</span>

                <span>Recommendations</span>

            </div>

            <div
                class="dashboard-workspace">

                <main
                    class="dashboard-content">

                    ${renderSectionShell(

                        "companyProfile",

                        "Company Profile",

                        "Organization overview",

                        renderCompanyProfile(reportData),

                        true

                    )}

                    ${renderSectionShell(

                        "executiveObservations",

                        "Executive Observations",

                        "Business observations",

                        renderObservations(reportData),

                        false

                    )}

                    ${renderSectionShell(

                        "executiveRisks",

                        "Executive Risks",

                        "Potential business risks",

                        renderRisks(reportData),

                        false

                    )}

                    ${renderSectionShell(

                        "executiveOpportunities",

                        "Executive Opportunities",

                        "Growth opportunities",

                        renderOpportunities(reportData),

                        false

                    )}

                    ${renderSectionShell(

                        "executiveInsights",

                        "Executive Insights",

                        "Cross-functional intelligence",

                        renderInsights(reportData),

                        false

                    )}

                    ${renderSectionShell(

                        "executiveRecommendations",

                        "Recommendations",

                        "Recommended actions",

                        renderRecommendations(reportData),

                        false

                    )}

                </main>

            </div>

        </div>

    `;

    bindAccordionEvents();

}

function bindAccordionEvents() {
    document.querySelectorAll(".accordion-trigger").forEach(trigger => {
        trigger.addEventListener("click", () => {
            const panel = trigger.nextElementSibling;
            const expanded = trigger.getAttribute("aria-expanded") === "true";

            trigger.setAttribute("aria-expanded", String(!expanded));

            const icon = trigger.querySelector(".accordion-icon");
            if (icon) {
                icon.textContent = expanded ? "+" : "−";
            }

            if (panel) {
                panel.hidden = expanded;
            }
        });
    });
}

function bindDashboardNavigation() {
    document.querySelectorAll(".dashboard-nav-card").forEach(button => {
        button.addEventListener("click", () => {
            const section = document.getElementById(button.dataset.target);
            const trigger = section ? section.querySelector(".accordion-trigger") : null;
            const panel = trigger ? trigger.nextElementSibling : null;

            if (trigger && panel && trigger.getAttribute("aria-expanded") !== "true") {
                trigger.setAttribute("aria-expanded", "true");
                const icon = trigger.querySelector(".accordion-icon");
                if (icon) icon.textContent = "−";
                panel.hidden = false;
            }

            if (section) {
                section.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    });
}

function bindDashboardActions(reportData) {
    const downloadButtons = [
        document.getElementById("downloadReportButton"),
        document.getElementById("downloadPackButton")
    ];

    downloadButtons.forEach(button => {
        if (button) {
            button.addEventListener("click", () => {
                if (typeof openPDFModal === "function") {
                    openPDFModal(reportData);
                }
            });
        }
    });
}
