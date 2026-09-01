/* GrowWithHR customer-facing product vocabulary and hierarchy.
 * Internal technical IDs/routes remain stable. This layer keeps presentation
 * terminology consistent without forking assessment controllers or API contracts.
 */
(() => {
    "use strict";

    const VERSION = "1.0.0";
    const REPLACEMENTS = Object.freeze([
        ["Compliance Needs", "HR Compliance Readiness"],
        ["Compliance Intelligence", "HR Compliance Readiness"],
        ["Executive Advisory Briefing", "HR Compliance Readiness"],
        ["Identify My Company’s Compliance Needs", "Assess My HR Compliance Readiness"],
        ["Identify My Company's Compliance Needs", "Assess My HR Compliance Readiness"],
        ["Identify My Company’s Compliance Needs →", "Assess My HR Compliance Readiness →"],
        ["Identify My Company's Compliance Needs →", "Assess My HR Compliance Readiness →"]
    ]);

    function replaceTextNode(node) {
        let value = node.nodeValue || "";
        let changed = false;
        for (const [before, after] of REPLACEMENTS) {
            if (!value.includes(before)) continue;
            value = value.split(before).join(after);
            changed = true;
        }
        if (changed) node.nodeValue = value;
    }

    function normalizeVisibleTerminology(root = document.body) {
        if (!root) return;
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
            acceptNode(node) {
                const parent = node.parentElement;
                if (!parent || ["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "OPTION"].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
                return NodeFilter.FILTER_ACCEPT;
            }
        });
        const nodes = [];
        while (walker.nextNode()) nodes.push(walker.currentNode);
        nodes.forEach(replaceTextNode);
    }

    function prioritizeOrganizationOnHomepage() {
        if (!document.body?.classList.contains("home-page")) return;
        const grid = document.querySelector("#capabilities .buyer-outcome-grid");
        if (!grid) return;
        const cards = Array.from(grid.querySelectorAll(":scope > .buyer-card"));
        const organization = cards.find((card) => /Organization Structure/i.test(card.textContent || ""));
        const compliance = cards.find((card) => /Compliance/i.test(card.textContent || ""));
        if (organization && compliance && organization !== cards[0]) grid.insertBefore(organization, compliance);
        organization?.setAttribute("data-product-priority", "flagship");
        const label = organization?.querySelector(".buyer-card__label");
        if (label && !/flagship/i.test(label.textContent || "")) label.textContent = "Organization Structure & Growth · Flagship";
        const focus = document.querySelector("#capabilities .focus-note");
        if (focus) focus.textContent = "The public product is intentionally focused on Organization Structure & Growth as the flagship diagnostic, supported by HR Compliance Readiness. Additional intelligence modules remain future product work.";
    }

    function updateMetaDescription() {
        if (!document.body?.classList.contains("home-page")) return;
        const meta = document.querySelector('meta[name="description"]');
        if (meta) meta.setAttribute("content", "GrowWithHR turns company facts into explainable organization-growth decisions, HR compliance readiness signals, Change Intelligence and clear next actions.");
    }

    function apply() {
        normalizeVisibleTerminology();
        prioritizeOrganizationOnHomepage();
        updateMetaDescription();
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply, { once: true });
    else apply();

    window.GrowWithHRProductPositioning = Object.freeze({
        version: VERSION,
        flagship: "Organization Structure & Growth",
        secondary: "HR Compliance Readiness",
        recurringLayer: "Change Intelligence",
        apply
    });
})();