/* ==========================================================
   HRTechify Sample Advisory PDF
   File: js/sample-advisory-pdf.js

   Generates a branded, searchable and selectable text PDF
   using fictional sample-company information.
========================================================== */

(function initialiseSampleAdvisoryPdf(window, document) {
    "use strict";

    const SAMPLE_REPORT_SUFFIX = "SM01";
    const SAMPLE_GENERATED_AT = new Date().toISOString();

    function buildSampleReportId(generatedAt) {
        const date = new Date(generatedAt);
        const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;
        const year = String(safeDate.getUTCFullYear());
        const month = String(safeDate.getUTCMonth() + 1).padStart(2, "0");
        const day = String(safeDate.getUTCDate()).padStart(2, "0");
        return `GWHR-${year}-${month}${day}-${SAMPLE_REPORT_SUFFIX}`;
    }

    const SAMPLE_REPORT_ID = buildSampleReportId(SAMPLE_GENERATED_AT);

    const SAMPLE_REPORT = {
        reportId: SAMPLE_REPORT_ID,
        companyName: "Acme Technologies Pvt. Ltd.",
        recipientName: "Illustrative Executive Leadership",
        recipientRole: "Fictional sample organisation",
        industry: "Information Technology and SaaS",
        nature:
            "Acme Technologies provides cloud-based workflow and analytics software to growing businesses across India.",
        founded: "2019",
        entity: "Private Limited Company",
        fundingStage: "Growth funded",
        employees: 86,
        contractWorkers: 12,
        interns: 4,
        apprentices: 0,
        workModel: "Hybrid",
        remoteWorkforce: "Approximately 38%",
        primaryState: "Karnataka",
        locations: 3,
        countries: 1,
        hiringPlans:
            "Steady hiring across product, sales and customer success",
        expansionPlans: [
            "Add another permanent operating location",
            "Introduce a more formal management structure",
            "Increase specialist and leadership hiring"
        ],
        growthContext:
            "The organisation expects continued customer growth and wants to strengthen management capability, workforce planning and people governance before headcount increases further.",
        peopleFunction:
            "One People lead supported by the operations team",
        priorities: [
            "Policies and compliance",
            "Manager capability",
            "Performance and rewards",
            "Workforce planning"
        ],
        generatedAt: SAMPLE_GENERATED_AT,
        source: "HRTechify illustrative sample advisory"
    };

    function getElements() {
        return {
            button: document.getElementById("downloadSampleAdvisoryPdf"),
            status: document.getElementById("samplePdfStatus")
        };
    }

    function ensureSampleReportIdentity() {
        if (document.getElementById("sampleReportIdentity")) {
            return;
        }

        const heroContent = document.querySelector(
            ".sample-advisory-page .hero .hero-content"
        );

        if (!heroContent) {
            return;
        }

        const identity = document.createElement("p");
        identity.id = "sampleReportIdentity";
        identity.className = "sample-report-identity";
        identity.setAttribute(
            "aria-label",
            `Sample Report ID ${SAMPLE_REPORT_ID}`
        );

        const label = document.createElement("span");
        label.textContent = "Sample Report ID";

        const value = document.createElement("strong");
        value.textContent = SAMPLE_REPORT_ID;

        identity.append(label, value);

        const description = heroContent.querySelector(".hero-description");
        if (description) {
            description.insertAdjacentElement("afterend", identity);
        } else {
            heroContent.prepend(identity);
        }
    }

    function showStatus(statusElement, message, isError = false) {
        if (!statusElement) {
            return;
        }

        statusElement.hidden = false;
        statusElement.textContent = message;
        statusElement.style.color = isError ? "#ff6b75" : "#9da9bc";
    }

    async function downloadSamplePdf() {
        const { button, status } = getElements();

        if (!button || button.disabled) {
            return;
        }

        const originalHtml = button.innerHTML;

        button.disabled = true;
        button.setAttribute("aria-busy", "true");
        button.innerHTML = `
            <i class="fa-solid fa-circle-notch fa-spin" aria-hidden="true"></i>
            Preparing sample PDF
        `;

        showStatus(
            status,
            "Preparing your HRTechify sample advisory..."
        );

        try {
            const pdfService = window.GrowWithHRPDF;

            if (
                !pdfService ||
                typeof pdfService.downloadAdvisoryPdf !== "function"
            ) {
                throw new Error(
                    "The HRTechify PDF service is unavailable."
                );
            }

            await pdfService.downloadAdvisoryPdf({
                isSample: true,
                reportId: SAMPLE_REPORT_ID,
                filename: "HRTechify-Sample-Executive-Advisory.pdf",
                runningTitle: "GrowWithHR Sample Executive Advisory",
                coverLabel: "ILLUSTRATIVE SAMPLE EXECUTIVE ADVISORY",
                coverTitle: "Executive Advisory",
                coverIntro:
                    `Sample Report ID: ${SAMPLE_REPORT_ID}. A fictional, illustrative leadership document demonstrating how GrowWithHR turns organisation information into a structured executive people advisory.`,
                report: SAMPLE_REPORT
            });

            showStatus(
                status,
                "Your sample advisory download has started."
            );
        } catch (error) {
            console.error(
                "HRTechify sample PDF generation failed.",
                error
            );

            showStatus(
                status,
                "We could not prepare the sample PDF. Please reload the page and try again.",
                true
            );
        } finally {
            button.disabled = false;
            button.removeAttribute("aria-busy");
            button.innerHTML = originalHtml;
        }
    }

    function initialise() {
        ensureSampleReportIdentity();

        const { button } = getElements();

        if (!button || button.dataset.samplePdfBound) {
            return;
        }

        button.dataset.samplePdfBound = "true";
        button.addEventListener("click", downloadSamplePdf);
    }

    window.GrowWithHRSampleAdvisory = Object.freeze({
        reportId: SAMPLE_REPORT_ID,
        generatedAt: SAMPLE_GENERATED_AT,
        report: Object.freeze({ ...SAMPLE_REPORT })
    });

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialise, {
            once: true
        });
    } else {
        initialise();
    }
})(window, document);
