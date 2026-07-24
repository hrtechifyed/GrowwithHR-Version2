/* GrowWithHR report runtime corrections v0.23.1 */
(() => {
    "use strict";

    const VERSION = "0.23.1-report-runtime-corrections";
    const INTELLIGENCE_LABEL = "UNDERSTANDING INTELLIGENCE ENGINE";

    async function restorePdfCapabilities() {
        const current = window.GrowWithHRPDF;
        if (!current || typeof current.buildAdvisoryPdf !== "function") return false;

        const [executive, lineLayout] = await Promise.all([
            Promise.resolve(window.GrowWithHRPDFExecutiveEnhancementsReady).catch(() => null),
            Promise.resolve(window.GrowWithHRPDFLineLayoutReady).catch(() => null)
        ]);

        const enhanced = Object.freeze({
            ...current,
            version: executive?.version || current.version,
            supportsDualTheme: executive?.supportsDualTheme ?? current.supportsDualTheme,
            lineLayoutVersion: lineLayout?.lineLayoutVersion || current.lineLayoutVersion,
            runningTextPolicyVersion: lineLayout?.runningTextPolicyVersion || current.runningTextPolicyVersion,
            allRunningTextJustified: lineLayout?.allRunningTextJustified ?? current.allRunningTextJustified
        });

        window.GrowWithHRPDF = enhanced;
        window.GrowWithHRPDFPolishReady = Promise.resolve(enhanced);
        return true;
    }

    async function loadFounderReportCorrections() {
        await import("./report-sequence-controller.js");
        await import("./report-founder-summary-corrections.js");
        await restorePdfCapabilities();
    }

    loadFounderReportCorrections().catch((error) => {
        console.error("GrowWithHR founder-first report corrections could not load.", error);
    });

    function replaceReportLabels(value) {
        return String(value)
            .replace(/M4 EXPLAINABLE INTELLIGENCE/g, INTELLIGENCE_LABEL)
            .replace(/M4 explainability section/gi, "Understanding Intelligence Engine section")
            .replace(/^RECOMMENDED ACTIONS$/g, "STRATEGIC RECOMMENDATIONS")
            .replace(/^0[–-]90 DAYS ROADMAP$/g, "ROADMAP - 0 TO 90 DAYS");
    }

    function installAssessmentStyles() {
        if (!document?.head || document.getElementById("growwithhrWorkModelLockStyles")) return;
        const style = document.createElement("style");
        style.id = "growwithhrWorkModelLockStyles";
        style.textContent = `.is-work-model-locked{opacity:.42!important;cursor:not-allowed!important}.is-work-model-locked>span{cursor:not-allowed!important}`;
        document.head.appendChild(style);
    }

    function installPdfCorrections() {
        const JsPDF = window.jspdf?.jsPDF || window.jsPDF;
        if (!JsPDF?.API || JsPDF.API.__growwithhrReportCorrectionsInstalled) return;

        const originalText = JsPDF.API.text;
        const originalTextWithLink = JsPDF.API.textWithLink;
        const originalRoundedRect = JsPDF.API.roundedRect;

        if (typeof originalText === "function") {
            JsPDF.API.text = function correctedText(value, ...args) {
                const nextValue = Array.isArray(value)
                    ? value.map((line) => typeof line === "string" ? replaceReportLabels(line) : line)
                    : typeof value === "string" ? replaceReportLabels(value) : value;
                return originalText.call(this, nextValue, ...args);
            };
        }

        if (typeof originalTextWithLink === "function") {
            JsPDF.API.textWithLink = function correctedTextWithLink(text, x, y, options = {}) {
                const result = originalTextWithLink.call(this, text, x, y, options);
                const url = options?.url;
                if (url && typeof this.link === "function") {
                    const size = Number(this.getFontSize?.() || 8);
                    const width = Math.max(18, Number(this.getTextWidth?.(String(text)) || 0));
                    const height = Math.max(4, size * 0.42);
                    this.link(Number(x), Number(y) - height + 0.8, width, height + 1.5, { url });
                    if (typeof this.line === "function") {
                        this.line(Number(x), Number(y) + 0.8, Number(x) + width, Number(y) + 0.8);
                    }
                }
                return result;
            };
        }

        if (typeof originalRoundedRect === "function") {
            JsPDF.API.roundedRect = function correctedRoadmapRect(x, y, width, height, radiusX, radiusY, style) {
                const isRoadmapBadge = Math.abs(Number(width) - 40) < 0.2 && Math.abs(Number(height) - 11) < 0.2;
                if (isRoadmapBadge && typeof this.setFillColor === "function" && typeof this.setDrawColor === "function") {
                    const isDark = window.localStorage?.getItem("growwithhr-report-theme") === "dark";
                    this.setFillColor(...(isDark ? [21, 21, 21] : [244, 247, 251]));
                    this.setDrawColor(...(isDark ? [68, 68, 68] : [166, 181, 202]));
                }
                return originalRoundedRect.call(this, x, y, width, height, radiusX, radiusY, style);
            };
        }

        JsPDF.API.__growwithhrReportCorrectionsInstalled = VERSION;
    }

    installAssessmentStyles();
    installPdfCorrections();

    window.GrowWithHRReportRuntimeCorrections = Object.freeze({
        version: VERSION,
        intelligenceLabel: INTELLIGENCE_LABEL,
        replaceReportLabels,
        loadFounderReportCorrections,
        restorePdfCapabilities
    });
})();
