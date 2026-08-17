import bootstrap from "./js/bootstrap.js";
import APP_CONFIG from "./js/config/app-config.js";
import "./js/intelligence-core.js";

function bindSelectorGroup({ selector, dataAttribute, eventName }) {
    const items = Array.from(document.querySelectorAll(selector));
    if (!items.length) return;

    const activate = (index) => {
        items.forEach((item, itemIndex) => {
            const active = itemIndex === index;
            item.classList.toggle("active", active);
            item.setAttribute("aria-pressed", String(active));
        });

        const selected = items[index];
        if (selected && eventName && dataAttribute) {
            document.dispatchEvent(new CustomEvent(eventName, {
                detail: {
                    value: selected.dataset[dataAttribute],
                    index
                }
            }));
        }
    };

    items.forEach((item, index) => {
        item.type = "button";
        item.setAttribute("aria-pressed", String(item.classList.contains("active")));
        item.addEventListener("click", () => activate(index));
    });

    const initialIndex = Math.max(0, items.findIndex((item) => item.classList.contains("active")));
    activate(initialIndex);
}

document.addEventListener("DOMContentLoaded", () => {
    document.title = `${APP_CONFIG.productName} | ${APP_CONFIG.companyName}`;

    const productVersion = document.getElementById("productVersion");
    if (productVersion) {
        productVersion.textContent = `${APP_CONFIG.productName} ${APP_CONFIG.releaseName} ${APP_CONFIG.version}`;
    }

    try {
        bootstrap();
    } catch (error) {
        console.error(`${APP_CONFIG.productName} initialization error`, error);
    }

    bindSelectorGroup({
        selector: ".dna-item",
        dataAttribute: "pillar",
        eventName: "dnaChange"
    });

    bindSelectorGroup({
        selector: ".stage-item",
        dataAttribute: "stage",
        eventName: "growthStageChange"
    });

    bindSelectorGroup({
        selector: ".recommendation-item",
        dataAttribute: "recommendation",
        eventName: "recommendationChange"
    });
});
