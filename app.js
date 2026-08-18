import bootstrap from "./js/bootstrap.js";
import APP_CONFIG from "./js/config/app-config.js";
import "./js/intelligence-core.js";

const SELECTOR_AUTO_ADVANCE_MS = 2200;

function bindSelectorGroup({ selector, dataAttribute, eventName, autoAdvanceMs = SELECTOR_AUTO_ADVANCE_MS }) {
    const items = Array.from(document.querySelectorAll(selector));
    if (!items.length) return null;

    let activeIndex = Math.max(0, items.findIndex((item) => item.classList.contains("active")));
    let timerId = 0;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const activate = (index) => {
        activeIndex = ((index % items.length) + items.length) % items.length;

        items.forEach((item, itemIndex) => {
            const active = itemIndex === activeIndex;
            item.classList.toggle("active", active);
            item.setAttribute("aria-pressed", String(active));
        });

        const selected = items[activeIndex];
        if (selected && eventName && dataAttribute) {
            document.dispatchEvent(new CustomEvent(eventName, {
                detail: {
                    value: selected.dataset[dataAttribute],
                    index: activeIndex
                }
            }));
        }
    };

    const stopAutoAdvance = () => {
        if (timerId) {
            window.clearTimeout(timerId);
            timerId = 0;
        }
    };

    const startAutoAdvance = () => {
        stopAutoAdvance();
        if (items.length < 2 || motionQuery.matches) return;

        timerId = window.setTimeout(() => {
            activate(activeIndex + 1);
            startAutoAdvance();
        }, autoAdvanceMs);
    };

    const handleMotionChange = () => {
        if (motionQuery.matches) {
            stopAutoAdvance();
        } else {
            startAutoAdvance();
        }
    };

    items.forEach((item, index) => {
        item.type = "button";
        item.setAttribute("aria-pressed", String(item.classList.contains("active")));
        item.addEventListener("click", () => {
            activate(index);
            startAutoAdvance();
        });
    });

    activate(activeIndex);
    startAutoAdvance();

    if (typeof motionQuery.addEventListener === "function") {
        motionQuery.addEventListener("change", handleMotionChange);
    } else {
        motionQuery.addListener(handleMotionChange);
    }

    return Object.freeze({
        activate,
        getActiveIndex: () => activeIndex,
        start: startAutoAdvance,
        stop: stopAutoAdvance
    });
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

    const selectorControllers = [
        bindSelectorGroup({
            selector: ".dna-item",
            dataAttribute: "pillar",
            eventName: "dnaChange"
        }),
        bindSelectorGroup({
            selector: ".stage-item",
            dataAttribute: "stage",
            eventName: "growthStageChange"
        }),
        bindSelectorGroup({
            selector: ".recommendation-item",
            dataAttribute: "recommendation",
            eventName: "recommendationChange"
        })
    ].filter(Boolean);

    window.GrowWithHRSelectorPreview = Object.freeze({
        intervalMs: SELECTOR_AUTO_ADVANCE_MS,
        controllers: selectorControllers
    });
});