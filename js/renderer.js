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
function renderDashboardLayout(reportData) {
    const root = getDashboardRoot();

    if (!root) {
        return;
    }

    root.innerHTML = `
        <div class="executive-dashboard" id="executiveDashboard">
            ${renderExecutiveSummary(reportData)}

            <div class="journey-rail" aria-label="Dashboard journey">
                <span>1 Executive Summary</span>
                <span>2 Choose a Category</span>
                <span>3 Expand a Rule</span>
                <span>4 Official Sources</span>
                <span>5 Download</span>
            </div>

            <div class="dashboard-quick-actions" aria-label="Advisory categories">
                <button class="dashboard-nav-card" type="button" data-target="complianceSection">
                    <span class="nav-card-kicker">Mandatory</span>
                    <strong>Compliance</strong>
                    <span>View →</span>
                </button>
                <button class="dashboard-nav-card" type="button" data-target="peopleSection">
                    <span class="nav-card-kicker">Recommended</span>
                    <strong>People</strong>
                    <span>View →</span>
                </button>
                <button class="dashboard-nav-card" type="button" data-target="growthSection">
                    <span class="nav-card-kicker">Future</span>
                    <strong>Growth</strong>
                    <span>View →</span>
                </button>
                <button class="dashboard-nav-card" type="button" data-target="expansionSection">
                    <span class="nav-card-kicker">Planner</span>
                    <strong>Expansion</strong>
                    <span>View →</span>
                </button>
            </div>

            <details class="dashboard-download-menu">
                <summary>Download options <span>+</span></summary>
                <div class="download-actions">
                    <button class="primary-btn" type="button" id="downloadReportButton">Download Report</button>
                    <button class="primary-btn" type="button" id="downloadPackButton">Download Advisory Pack</button>
                </div>
            </details>

            <div class="dashboard-workspace">
                <main class="dashboard-content">
                    ${renderSectionShell(
                        "complianceSection",
                        "Compliance Obligations",
                        "Mandatory statutory obligations and next actions",
                        typeof renderCompliance === "function" ? renderCompliance(reportData) : renderEmptyState("Compliance module is not loaded."),
                        true
                    )}
                    ${renderSectionShell(
                        "peopleSection",
                        "HR Governance",
                        "Recommended people practices",
                        typeof renderPeopleStrategy === "function" ? renderPeopleStrategy(reportData) : renderEmptyState("People module is not loaded."),
                        false
                    )}
                    ${renderSectionShell(
                        "growthSection",
                        "Organisation Growth",
                        "Future operating model recommendations",
                        typeof renderGrowthReadiness === "function" ? renderGrowthReadiness(reportData) : renderEmptyState("Growth module is not loaded."),
                        false
                    )}
                    ${renderSectionShell(
                        "expansionSection",
                        "Expansion Planner",
                        "State comparison and expansion readiness",
                        typeof renderExpansionAdvisor === "function" ? renderExpansionAdvisor(reportData) : renderEmptyState("Expansion module is not loaded."),
                        false
                    )}
                </main>
            </div>
        </div>
    `;

    bindAccordionEvents();
    bindDashboardActions(reportData);
    bindDashboardNavigation();
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
