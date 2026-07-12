/* ==========================================
   GrowWithHR V0.9.0-beta
   pdf.js
   PDF Report Actions
========================================== */

let activePDFReportData = null;

/* ==========================================
   EMAILJS CONFIGURATION
========================================== */

const EMAILJS_SERVICE_ID = "service_as95qfh";

const EMAILJS_INTERNAL_TEMPLATE = "template_4j8ld17";

const EMAILJS_CUSTOMER_TEMPLATE = "template_9ii4u3e";

const EMAILJS_PUBLIC_KEY = "VW0eRAbcJdIvP4Mc3";

/* ==========================================
   PDF MODAL
========================================== */

function openPDFModal(reportData) {

    activePDFReportData = reportData;

    const modal =
        document.getElementById("pdfModal");

    if (modal) {

        modal.style.display = "flex";

    }

}

function closePDFModal() {

    const modal =
        document.getElementById("pdfModal");

    if (modal) {

        modal.style.display = "none";

    }

}

function bindPDFEvents() {

    const cancel =
        document.getElementById("cancelReportBtn");

    const generate =
        document.getElementById("generateReportBtn");

    if (cancel) {

        cancel.addEventListener(
            "click",
            closePDFModal
        );

    }

    if (generate) {

        generate.addEventListener(
            "click",
            generatePDFReport
        );

    }

}

/* ==========================================
   EMAILJS INITIALIZATION
========================================== */

function initializeEmailJS() {

    if (!window.emailjs) {

        console.warn("EmailJS library not available.");

        return;

    }

    emailjs.init({

        publicKey: EMAILJS_PUBLIC_KEY

    });

}

initializeEmailJS();

/* ==========================================
   EMAIL SENDER
========================================== */

async function sendEmails(email, consent, reportData) {

    if (!window.emailjs) {

        return;

    }

    const selectedTheme =

        document.querySelector(
            'input[name="reportTheme"]:checked'
        )?.value || "Lite";

    const templateData = {

        user_email:
            email,

        report_type:
            "Executive Advisory Report",

        state:
            reportData.state || "",

        industry:
            reportData.industry || "",

        entity:
            reportData.entity || "",

        employee_count:
            reportData.employeeBand || "",

        theme:
            selectedTheme,

        consent:
            consent ? "Yes" : "No",

        generated_on:
            new Date().toLocaleString()

    };

    try {

        /* ---------- INTERNAL NOTIFICATION ---------- */

        await emailjs.send(

            EMAILJS_SERVICE_ID,

            EMAILJS_INTERNAL_TEMPLATE,

            templateData

        );

        /* ---------- CUSTOMER CONFIRMATION ---------- */

        await emailjs.send(

            EMAILJS_SERVICE_ID,

            EMAILJS_CUSTOMER_TEMPLATE,

            templateData

        );

        console.info(
            "Emails sent successfully."
        );

    }

    catch (error) {

        console.error(

            "Email delivery failed.",

            error

        );

    }

}

/* ==========================================
   PDF GENERATION
========================================== */

async function generatePDFReport() {

    const email =

        document
            .getElementById("userEmail")
            ?.value
            ?.trim();

    const consent =

        document
            .getElementById("userConsent")
            ?.checked;

    if (!email) {

        alert(
            "Please enter your email address."
        );

        return;

    }

    if (!consent) {

        alert(
            "Please provide consent to receive product updates."
        );

        return;

    }

    if (activePDFReportData) {

        await sendEmails(

            email,

            consent,

            activePDFReportData

        );

    }

    const dashboard =

        document.getElementById(
            "executiveDashboard"
        );

    if (

        !dashboard ||

        !window.html2canvas ||

        !window.jspdf

    ) {

        window.print();

        closePDFModal();

        return;

    }

    const canvas =

        await html2canvas(

            dashboard,

            {

                scale: 2,

                backgroundColor: "#0b1120"

            }

        );

    const image =

        canvas.toDataURL("image/png");

    const pdf =

        new window.jspdf.jsPDF(

            "p",

            "mm",

            "a4"

        );

    const pageWidth =

        pdf.internal.pageSize.getWidth();

    const pageHeight =

        pdf.internal.pageSize.getHeight();

    const imageHeight =

        canvas.height *
        pageWidth /
        canvas.width;

    let heightLeft =
        imageHeight;

    let position = 0;

    pdf.addImage(

        image,

        "PNG",

        0,

        position,

        pageWidth,

        imageHeight

    );

    heightLeft -= pageHeight;

    while (heightLeft > 0) {

        position =
            heightLeft -
            imageHeight;

        pdf.addPage();

        pdf.addImage(

            image,

            "PNG",

            0,

            position,

            pageWidth,

            imageHeight

        );

        heightLeft -= pageHeight;

    }

    pdf.save(
        "GrowWithHR-Advisory-Report.pdf"
    );

    closePDFModal();

    if (activePDFReportData) {

        localStorage.setItem(

            "growwithhrLastReportDownload",

            new Date().toISOString()

        );

    }

}
