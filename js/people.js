/* ==========================================
   GrowItWithHR V8
   people.js
   People Strategy Rendering
========================================== */

function renderPeopleStrategy(reportData) {
    const recommendations = asArray(reportData.recommended);

    if (!recommendations.length) {
        return renderEmptyState("No people strategy recommendations were identified.");
    }

    return `
        <div class="strategy-grid compact-rule-list">
            ${recommendations.map(renderPeopleRecommendation).join("")}
        </div>
    `;
}

function renderPeopleRecommendation(item, index) {
    const title = formatRule(item);

    return `
        <article class="strategy-card rule-card">
            <details ${index === 0 ? "open" : ""}>
                <summary class="rule-summary">
                    <span class="priority-dot muted-dot" aria-hidden="true">●</span>
                    <span class="rule-summary-copy">
                        <span class="rule-priority">Recommendation</span>
                        <strong>${escapeHTML(title)}</strong>
                        <small>HR Governance</small>
                    </span>
                    <span class="expand-label">Expand ▼</span>
                </summary>
                <div class="rule-detail-block">
                    <h4>Why this matters</h4>
                    <p>${escapeHTML(getRecommendationReason(title))}</p>
                </div>
                <div class="rule-detail-block two-column-detail">
                    <div>
                        <h4>Business Benefit</h4>
                        <p>${escapeHTML(getRecommendationBenefit(title))}</p>
                    </div>
                    <div>
                        <h4>Suggested Timeline</h4>
                        <p>${escapeHTML(getRecommendationTimeline(title))}</p>
                    </div>
                </div>
            </details>
        </article>
    `;
}
