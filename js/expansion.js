/* ==========================================
   GrowItWithHR V8
   expansion.js
   Expansion Advisor
========================================== */

function renderExpansionAdvisor(reportData) {
    return `
        <div class="expansion-card">
            <h3>Expansion Planner</h3>
            <p>
                Plan compliance considerations for expansion from
                <strong>${escapeHTML(reportData.state)}</strong> into additional Indian states.
            </p>
            <button class="secondary-btn" type="button" id="openStateComparisonButton">
                Learn More →
            </button>
            <div id="stateComparisonResults" class="comparison-results"></div>
        </div>
    `;
}

function bindExpansionAdvisor(reportData) {
    const button = document.getElementById("openStateComparisonButton");

    if (!button) {
        return;
    }

    button.addEventListener("click", () => openStateComparisonModal(reportData));
}

function openStateComparisonModal(reportData) {
    const modal = document.getElementById("stateComparisonModal");
    const label = document.getElementById("currentStateLabel");
    const container = document.getElementById("stateSelectionContainer");

    if (!modal || !container) {
        return;
    }

    if (label) {
        label.textContent = reportData.state || "Current State";
    }

    const states = Object.keys(getStateExpansionData());

    container.innerHTML = states.map(state => `
        <label class="state-choice">
            <input type="checkbox" value="${escapeHTML(state)}">
            ${escapeHTML(state)}
        </label>
    `).join("");

    modal.style.display = "flex";
}

function closeStateComparisonModal() {
    const modal = document.getElementById("stateComparisonModal");

    if (modal) {
        modal.style.display = "none";
    }
}

function bindStateComparisonEvents(reportData) {
    const cancel = document.getElementById("cancelComparisonBtn");
    const compare = document.getElementById("compareStatesBtn");

    if (cancel) {
        cancel.addEventListener("click", closeStateComparisonModal);
    }

    if (compare) {
        compare.addEventListener("click", () => renderStateComparison(reportData));
    }
}

function renderStateComparison(reportData) {
    const selected = Array.from(document.querySelectorAll("#stateSelectionContainer input:checked"))
        .slice(0, 4)
        .map(input => input.value);

    const results = document.getElementById("stateComparisonResults");

    if (!results) {
        closeStateComparisonModal();
        return;
    }

    results.innerHTML = selected.length ? `
        <div class="comparison-grid">
            ${selected.map(state => renderStateComparisonCard(state)).join("")}
        </div>
    ` : renderEmptyState("Select at least one state to compare.");

    closeStateComparisonModal();
}

function getStateExpansionData() {
    if (typeof stateExpansionData !== "undefined") {
        return stateExpansionData;
    }

    return window.stateExpansionData || {};
}

function renderStateComparisonCard(state) {
    const data = getStateExpansionData()[state] || {};

    return `
        <article class="comparison-card">
            <h4>${escapeHTML(state)}</h4>
            <p>${escapeHTML(data.summary || "Review state-specific labour law registrations, shops and establishment requirements, and payroll obligations.")}</p>
            <ul>
                ${(data.keyConsiderations || ["Registration review", "Policy localisation", "Payroll compliance"]).map(item => `<li>${escapeHTML(item)}</li>`).join("")}
            </ul>
        </article>
    `;
}
