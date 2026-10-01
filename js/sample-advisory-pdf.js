/* ==========================================================
   HRTechify Sample Advisory PDF
   File: js/sample-advisory-pdf.js

   Generates a branded, searchable and selectable text PDF
   using fictional sample-company information.
========================================================== */

(function initialiseSampleAdvisoryPdf(window, document) {
    "use strict";

    const SAMPLE_REPORT = {
        companyName: "Acme Technologies Pvt. Ltd.",
        recipientName: "Illustrative People Leadership Team",
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
        generatedAt: new Date().toISOString(),
        source: "HRTechify illustrative HR Compliance Readiness sample"
    };

    function getElements() {
        return {
            button: document.getElementById("downloadSampleAdvisoryPdf"),
            status: document.getElementById("samplePdfStatus")
        };
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
            "Preparing your HRTechify compliance-readiness sample..."
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
                filename: "GrowWithHR-Sample-HR-Compliance-Readiness.pdf",
                runningTitle: "GrowWithHR Sample HR Compliance Readiness Report",
                coverLabel: "ILLUSTRATIVE SAMPLE HR COMPLIANCE READINESS",
                coverTitle: "HR Compliance Readiness Report",
                coverIntro:
                    "A fictional, illustrative report demonstrating how GrowWithHR turns company information into structured HR compliance-readiness findings and next actions.",
                report: SAMPLE_REPORT
            });

            showStatus(
                status,
                "Your sample HR Compliance Readiness report download has started."
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
        const { button } = getElements();

        if (!button || button.dataset.samplePdfBound) {
            return;
        }

        button.dataset.samplePdfBound = "true";
        button.addEventListener("click", downloadSamplePdf);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialise, {
            once: true
        });
    } else {
        initialise();
    }
})(window, document);
