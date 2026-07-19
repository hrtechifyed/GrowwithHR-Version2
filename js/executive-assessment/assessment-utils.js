/* ==========================================================
   GrowWithHR
   Executive Advisory Assessment Utilities

   Responsibility:
   - Text normalisation
   - Safe HTML escaping
   - Number conversion
   - Option-label resolution
   - Human-readable list formatting
   - Email-format validation
   - Assessment-position clamping

   This module contains reusable helper functions.

   It must not:
   - mutate assessment state;
   - write to localStorage;
   - render assessment screens;
   - generate reports or PDFs;
   - send email-delivery requests.
========================================================== */

(() => {
    "use strict";

    const modules =
        window.GrowWithHRModules =
        window.GrowWithHRModules || {};

    /**
     * Returns an option list supplied by the caller or loaded from the
     * assessment-definition module.
     *
     * Resolving definitions at call time keeps the helper resilient while
     * scripts are introduced incrementally.
     *
     * @param {string} definitionName
     * @param {Array|null|undefined} suppliedOptions
     * @returns {Array}
     */
    function resolveOptions(
        definitionName,
        suppliedOptions
    ) {
        if (Array.isArray(suppliedOptions)) {
            return suppliedOptions;
        }

        const definitions =
            modules.AssessmentDefinition || {};

        const options =
            definitions[definitionName];

        return Array.isArray(options)
            ? options
            : [];
    }

    /**
     * Converts a value into a consistent search key.
     *
     * @param {*} value
     * @returns {string}
     */
    function normaliseSearchText(value) {
        return String(value || "")
            .toLowerCase()
            .normalize("NFKD")
            .replace(/[&]/g, " and ")
            .replace(/[^a-z0-9]+/g, " ")
            .trim()
            .replace(/\s+/g, " ");
    }

    /**
     * Returns a trimmed answer or the supplied fallback.
     *
     * @param {Object} answers
     * @param {string} key
     * @param {*} fallback
     * @returns {*}
     */
    function answerText(
        answers,
        key,
        fallback
    ) {
        const source =
            answers &&
            typeof answers === "object"
                ? answers
                : {};

        const value =
            String(source[key] ?? "").trim();

        return value || fallback;
    }

    /**
     * Creates a human-readable remote-work description.
     *
     * @param {Object} answers
     * @param {Array} [remoteOptions]
     * @returns {string}
     */
    function remoteDescription(
        answers,
        remoteOptions
    ) {
        const source =
            answers &&
            typeof answers === "object"
                ? answers
                : {};

        const options = resolveOptions(
            "REMOTE_OPTIONS",
            remoteOptions
        );

        const labels = Object.fromEntries(
            options
                .filter((option) => {
                    return (
                        Array.isArray(option) &&
                        option.length >= 2
                    );
                })
                .map(([value, label]) => {
                    return [value, label];
                })
        );

        if (source.remoteBand === "exact") {
            return (
                `${source.remoteExact || 0}% ` +
                "of the workforce working remotely"
            );
        }

        const label =
            labels[source.remoteBand] ||
            "the remote-work proportion not specified";

        return label === "None"
            ? "no regular remote workforce"
            : `${String(label).toLowerCase()} working remotely`;
    }

    /**
     * Converts the selected remote-work band into the value used by the
     * advisory report.
     *
     * @param {Object} answers
     * @returns {number|string}
     */
    function remoteReportValue(answers) {
        const source =
            answers &&
            typeof answers === "object"
                ? answers
                : {};

        if (source.remoteBand === "exact") {
            return normaliseNumber(
                source.remoteExact
            );
        }

        const values = {
            "0": 0,
            "1-24": 12,
            "25-50": 38,
            "51-75": 63,
            "76-99": 88,
            "100": 100,
            "not-sure": "Not Sure"
        };

        return values[source.remoteBand] ?? "";
    }

    /**
     * Creates the sentence fragment used to describe hiring plans.
     *
     * @param {Object} answers
     * @param {Array} [hiringOptions]
     * @returns {string}
     */
    function hiringDescription(
        answers,
        hiringOptions
    ) {
        const source =
            answers &&
            typeof answers === "object"
                ? answers
                : {};

        const options = resolveOptions(
            "HIRING_OPTIONS",
            hiringOptions
        );

        const labels = Object.fromEntries(
            options
                .filter((option) => {
                    return (
                        Array.isArray(option) &&
                        option.length >= 2
                    );
                })
                .map(([value, label]) => {
                    return [value, label];
                })
        );

        const label =
            labels[source.hiringPlans] ||
            "keep hiring flexible";

        return String(label)
            .replace(/^Grow /, "grow ")
            .replace(/^Hire /, "hire ")
            .replace(/^Stay /, "stay ")
            .replace(/^Unsure /, "remain unsure ");
    }

    /**
     * Returns the display labels matching a list of option values.
     *
     * @param {Array} values
     * @param {Array} options
     * @returns {Array<string>}
     */
    function labelsFor(
        values,
        options
    ) {
        const safeOptions =
            Array.isArray(options)
                ? options
                : [];

        const labels = Object.fromEntries(
            safeOptions
                .filter((option) => {
                    return (
                        Array.isArray(option) &&
                        option.length >= 2
                    );
                })
                .map(([value, label]) => {
                    return [value, label];
                })
        );

        return (
            Array.isArray(values)
                ? values
                : []
        )
            .map((value) => labels[value])
            .filter(Boolean);
    }

    /**
     * Formats a list using natural-language punctuation.
     *
     * @param {Array} items
     * @returns {string}
     */
    function humanList(items) {
        const safeItems =
            Array.isArray(items)
                ? items.filter((item) => {
                    return (
                        item !== null &&
                        item !== undefined &&
                        String(item).trim() !== ""
                    );
                })
                : [];

        if (safeItems.length <= 1) {
            return safeItems[0] || "";
        }

        if (safeItems.length === 2) {
            return (
                `${safeItems[0]} and ` +
                `${safeItems[1]}`
            );
        }

        const finalItem =
            safeItems[safeItems.length - 1];

        return (
            `${safeItems.slice(0, -1).join(", ")}, ` +
            `and ${finalItem}`
        );
    }

    /**
     * Returns a number as text when the value is numeric.
     *
     * @param {*} value
     * @param {*} fallback
     * @returns {*}
     */
    function numberText(
        value,
        fallback
    ) {
        return hasNumber(value)
            ? String(value)
            : fallback;
    }

    /**
     * Determines whether a value can be safely interpreted as a finite
     * number.
     *
     * Empty values are not considered numbers.
     *
     * @param {*} value
     * @returns {boolean}
     */
    function hasNumber(value) {
        return (
            value !== "" &&
            value !== null &&
            value !== undefined &&
            Number.isFinite(Number(value))
        );
    }

    /**
     * Converts a value to a non-negative integer.
     *
     * @param {*} value
     * @param {number} [fallback=0]
     * @returns {number}
     */
    function normaliseNumber(
        value,
        fallback = 0
    ) {
        const numeric =
            Number.parseInt(value, 10);

        return (
            Number.isFinite(numeric) &&
            numeric >= 0
        )
            ? numeric
            : fallback;
    }

    /**
     * Returns a singular or plural noun.
     *
     * @param {string} word
     * @param {*} value
     * @returns {string}
     */
    function pluralise(
        word,
        value
    ) {
        return Number(value) === 1
            ? word
            : `${word}s`;
    }

    /**
     * Adds a simple English article to a label when it does not already have
     * one.
     *
     * @param {*} value
     * @returns {string}
     */
    function withArticle(value) {
        const cleaned =
            String(value || "").trim();

        if (!cleaned) {
            return "the selected structure";
        }

        if (/^(a|an|the)\s/i.test(cleaned)) {
            return cleaned;
        }

        const article =
            /^[aeiou]/i.test(cleaned)
                ? "an"
                : "a";

        return `${article} ${cleaned}`;
    }

    /**
     * Ensures that a non-empty value ends with sentence punctuation.
     *
     * @param {*} value
     * @returns {string}
     */
    function ensureSentence(value) {
        const cleaned =
            String(value || "").trim();

        if (!cleaned) {
            return "";
        }

        return /[.!?]$/.test(cleaned)
            ? cleaned
            : `${cleaned}.`;
    }

    /**
     * Performs the same lightweight email-format validation used by the
     * current assessment controller.
     *
     * This does not confirm that the mailbox exists.
     *
     * @param {*} email
     * @returns {boolean}
     */
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(
            String(email || "")
        );
    }

    /**
     * Keeps an assessment moment within the available range.
     *
     * @param {*} moment
     * @param {number} [totalMoments]
     * @returns {number}
     */
    function clampMoment(
        moment,
        totalMoments
    ) {
        let momentCount =
            Number.parseInt(totalMoments, 10);

        if (
            !Number.isFinite(momentCount) ||
            momentCount < 1
        ) {
            const definitions =
                modules.AssessmentDefinition || {};

            momentCount =
                Array.isArray(definitions.MOMENTS)
                    ? definitions.MOMENTS.length
                    : 1;
        }

        const maximum =
            Math.max(momentCount - 1, 0);

        return Math.min(
            Math.max(
                Number(moment) || 0,
                0
            ),
            maximum
        );
    }

    /**
     * Escapes a value for use in a CSS selector.
     *
     * @param {*} value
     * @returns {string}
     */
    function cssEscape(value) {
        const text =
            String(value);

        if (
            window.CSS &&
            typeof window.CSS.escape === "function"
        ) {
            return window.CSS.escape(text);
        }

        return text.replace(
            /[^a-zA-Z0-9_-]/g,
            "\\$&"
        );
    }

    /**
     * Escapes text for safe insertion into an HTML attribute.
     *
     * @param {*} value
     * @returns {string}
     */
    function escapeAttribute(value) {
        return escapeHtml(
            String(value)
        ).replace(
            /`/g,
            "&#96;"
        );
    }

    /**
     * Escapes text for safe insertion into generated HTML.
     *
     * @param {*} value
     * @returns {string}
     */
    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    const AssessmentUtils = {
        moduleVersion: "1.0.0",

        normaliseSearchText,
        answerText,
        remoteDescription,
        remoteReportValue,
        hiringDescription,
        labelsFor,
        humanList,
        numberText,
        hasNumber,
        normaliseNumber,
        pluralise,
        withArticle,
        ensureSentence,
        isValidEmail,
        clampMoment,
        cssEscape,
        escapeAttribute,
        escapeHtml
    };

    modules.AssessmentUtils =
        Object.freeze(AssessmentUtils);
})();
