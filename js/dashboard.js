/* ==========================================
   GrowItWithHR V8
   dashboard.js
   Dashboard Bootstrap
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    const reportData = loadAssessmentData();

    if (!reportData) {
        renderMissingAssessment();
        return;
    }

    renderDashboardLayout(reportData);

    if (typeof bindExpansionAdvisor === "function") {
        bindExpansionAdvisor(reportData);
    }

    if (typeof bindStateComparisonEvents === "function") {
        bindStateComparisonEvents(reportData);
    }

    if (typeof bindPDFEvents === "function") {
        bindPDFEvents();
    }
});

function loadAssessmentData() {
    const raw = localStorage.getItem("growitwithhrAssessment");

    if (!raw) {
        return null;
    }

    try {
        return JSON.parse(raw);
    } catch (error) {
        console.error("Invalid GrowItWithHR assessment data", error);
        return null;
    }
}

function renderMissingAssessment() {
    const root = getDashboardRoot();

    if (!root) {
        return;
    }

    root.innerHTML = `
        <div class="summary-card">
            <h2>No assessment data found</h2>
            <p>Please generate an advisory report from the main assessment form first.</p>
            <a class="primary-btn" href="index.html">Start Assessment</a>
        </div>
    `;
}
