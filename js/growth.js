/* ==========================================
   GrowItWithHR V8
   Growth Readiness Rendering
========================================== */

function renderGrowthReadiness(reportData) {
    const items = asArray(reportData.future);

    if (!items.length) {
        return renderEmptyState("No growth readiness actions were identified.");
    }

    return `
        <div class="growth-roadmap-grid compact-rule-list">
            ${items.map(renderGrowthItem).join("")}
        </div>
    `;
}

function renderGrowthItem(item, index) {
    const title = formatRule(item);

    return `
        <article class="growth-card rule-card">
            <details ${index === 0 ? "open" : ""}>
                <summary class="rule-summary">
                    <span class="priority-dot muted-dot" aria-hidden="true">●</span>
                    <span class="rule-summary-copy">
                        <span class="rule-priority">Future</span>
                        <strong>${escapeHTML(title)}</strong>
                        <small>Organisation Growth</small>
                    </span>
                    <span class="expand-label">Expand ▼</span>
                </summary>
                <div class="rule-detail-block">
                    <h4>Why this matters</h4>
                    <p>${escapeHTML(getGrowthReason(title))}</p>
                </div>
                <div class="rule-detail-block two-column-detail">
                    <div>
                        <h4>Benefit</h4>
                        <p>${escapeHTML(getGrowthBenefit(title))}</p>
                    </div>
                    <div>
                        <h4>Timeline</h4>
                        <p>${escapeHTML(getGrowthTimeline(title))}</p>
                    </div>
                </div>
            </details>
        </article>
    `;
}
