/* GrowWithHR shared rolling-card initializer */
(() => {
    "use strict";

    const groupSelectors = [".home-stack-section", ".gwhr-peel-stack", ".trust-grid", ".how-grid", ".carousel-track", ".executive-card-grid", ".summary-cards", ".metrics-grid", ".services-grid", ".features-grid", ".benefits-grid", ".process-grid", ".update-grid"];
    const cardSelectors = [".home-stack-card", ".gwhr-peel-card", ".workspace-card", ".how-card", ".capability-slide", ".trust-card", ".exec-card", ".executive-card", ".summary-card", ".metric-card", ".service-card", ".feature-card", ".benefit-card", ".process-card", ".info-card", ".update-card", ".rule-card", ".expansion-card", ".comparison-card"];
    const excluded = ["form", ".exec-conversation-container", ".exec-review-card", ".exec-modal-card", ".modal", ".modal-footer", ".navbar", "footer", ".report-page", ".print-page", "table"];
    const groupSelector = groupSelectors.join(",");
    const cardSelector = cardSelectors.join(",");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const isExcluded = (element) => excluded.some((selector) => element.closest(selector));

    function hasBlockingAncestor(element) {
        let parent = element.parentElement;
        while (parent && parent !== document.body) {
            const style = getComputedStyle(parent);
            if (!["visible", "clip"].includes(style.overflowY) || style.transform !== "none") return true;
            parent = parent.parentElement;
        }
        return false;
    }

    function applyRollingCards(root = document) {
        const groups = Array.from(root.querySelectorAll(groupSelector));
        groups.forEach((group) => {
            if (isExcluded(group)) return;
            const cards = Array.from(group.children).filter((child) => child.matches(cardSelector) && !isExcluded(child));
            const enabled = cards.length >= 2 && !reducedMotion.matches && group.scrollHeight > window.innerHeight * 0.55 && !hasBlockingAncestor(group) && !window.matchMedia("print").matches;
            group.classList.add("rolling-card-group");
            group.classList.toggle("rolling-card-enabled", enabled);
            group.classList.toggle("rolling-card-fallback", !enabled);
            group.style.setProperty("--rolling-card-count", String(cards.length));
            cards.forEach((card, index) => {
                card.classList.add("rolling-card");
                card.style.setProperty("--rolling-card-index", String(index));
            });
            window.GWHR_LOG?.("[GrowWithHR:STICKY]", { group: group.dataset.testid || group.className, cardCount: cards.length, viewportHeight: window.innerHeight, enabled });
        });
    }

    function initRollingCards() {
        applyRollingCards();
        const observer = new MutationObserver((mutations) => mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) applyRollingCards(node.matches(groupSelector) ? node.parentElement || document : node);
        })));
        observer.observe(document.body, { childList: true, subtree: true });
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initRollingCards, { once: true });
    else initRollingCards();
})();
