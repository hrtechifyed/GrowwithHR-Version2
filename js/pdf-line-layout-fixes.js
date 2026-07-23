/* ==========================================================
   GrowWithHR PDF running-text layout fixes
   - Reflows pre-split body copy as one paragraph before wrapping
   - Justifies full-width running text without premature line breaks
   - Centres a mid-sized HRTechify logo on the End of Report page
   ========================================================== */
(function installGrowWithHRPdfLineLayoutFixes(window, document) {
    "use strict";

    const currentPdf = window.GrowWithHRPDF;
    const JsPDF = window.jspdf?.jsPDF || window.jsPDF;

    if (
        !currentPdf ||
        typeof currentPdf.buildAdvisoryPdf !== "function" ||
        !JsPDF
    ) {
        console.warn(
            "GrowWithHR PDF line-layout fixes: the PDF service is unavailable."
        );
        return;
    }

    if (currentPdf.fullLineLayout) return;

    const LAYOUT_VERSION = "3.3.1-full-line-logo";
    const MIN_RUNNING_WIDTH = 130;
    const PAGE = Object.freeze({
        width: 210,
        height: 297,
        borderInset: 5.5
    });

    const THEMES = Object.freeze({
        light: Object.freeze({
            page: [255, 255, 255],
            heading: [4, 28, 67],
            line: [166, 181, 202],
            accent: [245, 158, 11]
        }),
        dark: Object.freeze({
            page: [7, 16, 31],
            heading: [255, 255, 255],
            line: [61, 82, 111],
            accent: [245, 158, 11]
        })
    });

    const originalBuild =
        currentPdf.buildAdvisoryPdf.bind(currentPdf);

    let logoPromise = null;

    function cleanText(value, fallback = "") {
        const text = String(value ?? "")
            .replace(/\s+/g, " ")
            .trim();

        return text || fallback;
    }

    function fullParagraphText(text) {
        return cleanText(
            Array.isArray(text)
                ? text.join(" ")
                : text
        );
    }

    function currentFontStyle(doc) {
        try {
            return cleanText(
                doc.getFont?.().fontStyle ||
                doc.internal?.getFont?.().fontStyle
            ).toLowerCase();
        } catch (_error) {
            return "";
        }
    }

    function isFullWidthRunningText(doc, text, options = {}) {
        const maximumWidth = Number(options.maxWidth) || 0;
        const alignment = cleanText(options.align).toLowerCase();
        const paragraph = fullParagraphText(text);
        const fontSize = Number(doc.getFontSize?.()) || 0;
        const fontStyle = currentFontStyle(doc);
        const hasMultipleSourceLines =
            Array.isArray(text) && text.length > 1;

        if (!hasMultipleSourceLines && alignment !== "justify") {
            return false;
        }

        if (maximumWidth < MIN_RUNNING_WIDTH) return false;
        if (alignment && !["left", "justify"].includes(alignment)) {
            return false;
        }
        if (fontSize < 7 || fontSize > 10.5) return false;
        if (fontStyle.includes("bold")) return false;
        if (paragraph.split(/\s+/).length < 8) return false;

        return true;
    }

    function patchTextTarget(target, restorers) {
        if (!target || typeof target.text !== "function") return;

        const originalText = target.text;

        target.text = function fillEachRunningLine(
            text,
            x,
            y,
            options,
            transform
        ) {
            if (!isFullWidthRunningText(this, text, options)) {
                return originalText.call(
                    this,
                    text,
                    x,
                    y,
                    options,
                    transform
                );
            }

            /*
             * The base renderer often passes an array returned by
             * splitTextToSize(). Passing that array back with justify and
             * maxWidth can make jsPDF wrap an already-wrapped line again,
             * producing a short middle line. Recombine the source first so
             * jsPDF calculates every line against the complete usable width.
             */
            const paragraph = fullParagraphText(text);
            const paragraphOptions = {
                ...(options || {}),
                align: "justify"
            };

            return originalText.call(
                this,
                paragraph,
                x,
                y,
                paragraphOptions,
                transform
            );
        };

        restorers.push(() => {
            target.text = originalText;
        });
    }

    async function buildWithFullLineText(build) {
        const restorers = [];
        const targets = Array.from(
            new Set(
                [
                    JsPDF.API,
                    JsPDF.prototype
                ].filter(
                    (target) =>
                        target &&
                        typeof target.text === "function"
                )
            )
        );

        targets.forEach((target) => {
            patchTextTarget(target, restorers);
        });

        try {
            return await build();
        } finally {
            restorers
                .reverse()
                .forEach((restore) => restore());
        }
    }

    function loadLogoDataUrl() {
        if (logoPromise) return logoPromise;

        logoPromise = new Promise((resolve) => {
            const image = new Image();
            image.decoding = "async";

            image.onload = () => {
                try {
                    const size = 420;
                    const canvas = document.createElement("canvas");
                    const context = canvas.getContext("2d");

                    canvas.width = size;
                    canvas.height = size;
                    context.clearRect(0, 0, size, size);
                    context.save();
                    context.beginPath();
                    context.arc(
                        size / 2,
                        size / 2,
                        size / 2 - 4,
                        0,
                        Math.PI * 2
                    );
                    context.clip();
                    context.drawImage(image, 0, 0, size, size);
                    context.restore();

                    resolve(canvas.toDataURL("image/png"));
                } catch (_error) {
                    resolve("");
                }
            };

            image.onerror = () => resolve("");
            image.src = new URL(
                "assets/hrtechify-logo.png",
                window.location.href
            ).href;
        });

        return logoPromise;
    }

    function setColour(doc, method, colour) {
        doc[method](...colour);
    }

    function decorateEndPage(doc, themeName, logoDataUrl) {
        if (!doc || typeof doc.getNumberOfPages !== "function") {
            return;
        }

        const pageNumber = doc.getNumberOfPages();
        const theme = THEMES[themeName] || THEMES.light;
        const centreX = PAGE.width / 2;
        const logoSize = 34;
        const logoY = 112;

        doc.setPage(pageNumber);
        setColour(doc, "setFillColor", theme.page);
        doc.rect(0, 0, PAGE.width, PAGE.height, "F");

        setColour(doc, "setDrawColor", theme.line);
        doc.setLineWidth(0.35);
        doc.rect(
            PAGE.borderInset,
            PAGE.borderInset,
            PAGE.width - PAGE.borderInset * 2,
            PAGE.height - PAGE.borderInset * 2,
            "S"
        );

        if (logoDataUrl) {
            try {
                doc.addImage(
                    logoDataUrl,
                    "PNG",
                    centreX - logoSize / 2,
                    logoY,
                    logoSize,
                    logoSize,
                    `end-report-logo-${themeName}`,
                    "FAST"
                );
            } catch (_error) {
                /* The title remains visible if image rendering is unavailable. */
            }
        }

        setColour(doc, "setDrawColor", theme.accent);
        doc.setLineWidth(0.7);
        doc.line(centreX - 38, 153, centreX - 15, 153);
        doc.line(centreX + 15, 153, centreX + 38, 153);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        setColour(doc, "setTextColor", theme.heading);
        doc.text("End of Report", centreX, 166, {
            align: "center"
        });
    }

    function serialisePdfResult(result) {
        const doc = result?.document;

        if (!doc || typeof doc.output !== "function") {
            return result;
        }

        const dataUri = doc.output("datauristring");
        const arrayBuffer = doc.output("arraybuffer");

        return {
            ...result,
            dataUri,
            base64:
                dataUri.includes(",")
                    ? dataUri.split(",")[1]
                    : dataUri,
            sizeBytes: arrayBuffer.byteLength,
            pageCount: doc.getNumberOfPages(),
            lineLayoutVersion: LAYOUT_VERSION
        };
    }

    function decorateBuiltResult(result, logoDataUrl) {
        if (Array.isArray(result?.pdfs)) {
            const pdfs = result.pdfs.map((variant) => {
                decorateEndPage(
                    variant.document,
                    variant.theme,
                    logoDataUrl
                );
                return serialisePdfResult(variant);
            });
            const primary = pdfs[0] || result;

            return {
                ...result,
                ...primary,
                theme: "both",
                pdfs,
                documents: pdfs.map((item) => item.document),
                filenames: pdfs.map((item) => item.filename),
                sizeBytes: pdfs.reduce(
                    (sum, item) =>
                        sum + (Number(item.sizeBytes) || 0),
                    0
                ),
                pageCounts: Object.fromEntries(
                    pdfs.map((item) => [
                        item.theme,
                        item.pageCount
                    ])
                ),
                lineLayoutVersion: LAYOUT_VERSION
            };
        }

        decorateEndPage(
            result?.document,
            result?.theme,
            logoDataUrl
        );
        return serialisePdfResult(result);
    }

    async function buildAdvisoryPdf(payload = {}) {
        const [result, logoDataUrl] = await Promise.all([
            buildWithFullLineText(
                () => originalBuild(payload)
            ),
            loadLogoDataUrl()
        ]);

        return decorateBuiltResult(
            result,
            logoDataUrl
        );
    }

    const enhancedPdf = Object.freeze({
        ...currentPdf,
        fullLineLayout: true,
        lineLayoutVersion: LAYOUT_VERSION,
        buildAdvisoryPdf
    });

    window.GrowWithHRPDF = enhancedPdf;
    window.GrowWithHRPDFPolishReady =
        Promise.resolve(enhancedPdf);
    window.GrowWithHRPDFLineLayoutReady =
        Promise.resolve(enhancedPdf);

    window.GrowWithHRPDFRunningTextFix = Object.freeze({
        version: LAYOUT_VERSION,
        minimumRunningWidth: MIN_RUNNING_WIDTH,
        fullParagraphText
    });
})(window, document);
