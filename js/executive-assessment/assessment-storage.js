/* ==========================================================
   GrowWithHR
   Executive Advisory Assessment Storage

   Responsibility:
   - Read and write assessment progress
   - Read and write report, lead and delivery records
   - Cache the industry catalogue
   - Normalise legacy saved assessment data
   - Clear user-specific browser data

   This module preserves the existing storage keys and the
   current top-level saved-state shape during the migration.
========================================================== */

(() => {
    "use strict";

    const modules =
        window.GrowWithHRModules =
        window.GrowWithHRModules || {};

    const LEGACY_STATE_VERSION = "2.1.0";

    const FALLBACK_KEYS = Object.freeze({
        STORAGE_KEY:
            "growwithhr-advisory-briefing-v2",

        REPORT_KEY:
            "growwithhr-report",

        LEAD_KEY:
            "growwithhr-lead",

        DELIVERY_KEY:
            "growwithhr-advisory-delivery-v1",

        INDUSTRY_CACHE_KEY:
            "growwithhr-industry-catalog-v1"
    });

    function definitions() {
        return (
            modules.AssessmentDefinition ||
            {}
        );
    }

    function utils() {
        return (
            modules.AssessmentUtils ||
            {}
        );
    }

    function key(name) {
        return String(
            definitions()[name] ||
            FALLBACK_KEYS[name]
        );
    }

    function asObject(value) {
        return (
            value &&
            typeof value === "object" &&
            !Array.isArray(value)
        )
            ? value
            : {};
    }

    function asArray(value) {
        return Array.isArray(value)
            ? [...value]
            : [];
    }

    function isAvailable() {
        try {
            const testKey =
                "__growwithhr_storage_test__";

            window.localStorage.setItem(
                testKey,
                "1"
            );

            window.localStorage.removeItem(
                testKey
            );

            return true;
        } catch (error) {
            return false;
        }
    }

    function readJson(
        storageKey,
        fallback,
        label
    ) {
        try {
            const raw =
                window.localStorage.getItem(
                    storageKey
                );

            if (
                raw === null ||
                raw === ""
            ) {
                return fallback;
            }

            return JSON.parse(raw);
        } catch (error) {
            console.warn(
                `GrowWithHR: ${label} could not be read.`,
                error
            );

            return fallback;
        }
    }

    function writeJson(
        storageKey,
        value,
        label
    ) {
        try {
            window.localStorage.setItem(
                storageKey,
                JSON.stringify(value)
            );

            return true;
        } catch (error) {
            console.warn(
                `GrowWithHR: ${label} could not be saved.`,
                error
            );

            return false;
        }
    }

    function remove(
        storageKey,
        label
    ) {
        try {
            window.localStorage.removeItem(
                storageKey
            );

            return true;
        } catch (error) {
            console.warn(
                `GrowWithHR: ${label} could not be cleared.`,
                error
            );

            return false;
        }
    }

    function createDefaultAnswers() {
        const factory =
            definitions()
                .createInitialAnswers;

        if (
            typeof factory === "function"
        ) {
            return factory();
        }

        return {
            locations: "1",
            countries: "1",
            expansionPlans: [],
            priorities: []
        };
    }

    function createDefaultLead() {
        const factory =
            definitions()
                .createInitialLead;

        if (
            typeof factory === "function"
        ) {
            return factory();
        }

        return {
            name: "",
            email: "",
            role: "",
            marketingConsent: false
        };
    }

    function createDefaultUi() {
        const factory =
            definitions()
                .createInitialUiState;

        if (
            typeof factory === "function"
        ) {
            return factory();
        }

        return {
            showSupplementalWorkforce: false
        };
    }

    function schemaVersion() {
        const value = Number(
            definitions()
                .STATE_SCHEMA_VERSION
        );

        return (
            Number.isInteger(value) &&
            value > 0
        )
            ? value
            : 1;
    }

    function clampMoment(value) {
        const moments =
            definitions().MOMENTS;

        const count =
            Array.isArray(moments)
                ? moments.length
                : 1;

        if (
            typeof utils().clampMoment ===
            "function"
        ) {
            return utils().clampMoment(
                value,
                count
            );
        }

        const maximum =
            Math.max(count - 1, 0);

        return Math.min(
            Math.max(
                Number(value) || 0,
                0
            ),
            maximum
        );
    }

    function unwrapAssessment(record) {
        const source =
            asObject(record);

        const data =
            asObject(source.data);

        if (!Object.keys(data).length) {
            return source;
        }

        return {
            ...data,

            version:
                source.version ??
                data.version,

            schemaVersion:
                source.schemaVersion ??
                data.schemaVersion,

            updatedAt:
                source.updatedAt ??
                data.updatedAt
        };
    }

    function normaliseAssessment(record) {
        const source =
            unwrapAssessment(record);

        if (!Object.keys(source).length) {
            return null;
        }

        const answers = {
            ...createDefaultAnswers(),
            ...asObject(source.answers)
        };

        answers.expansionPlans =
            asArray(
                answers.expansionPlans
            );

        answers.priorities =
            asArray(
                answers.priorities
            );

        const lead = {
            ...createDefaultLead(),
            ...asObject(source.lead)
        };

        lead.marketingConsent =
            Boolean(
                lead.marketingConsent
            );

        const ui = {
            ...createDefaultUi(),
            ...asObject(source.ui)
        };

        ui.showSupplementalWorkforce =
            Boolean(
                ui.showSupplementalWorkforce
            );

        return {
            version: String(
                source.version ||
                LEGACY_STATE_VERSION
            ),

            schemaVersion:
                schemaVersion(),

            started:
                Boolean(source.started),

            completed:
                Boolean(source.completed),

            currentMoment:
                clampMoment(
                    source.currentMoment
                ),

            answers,
            lead,
            ui,

            updatedAt: String(
                source.updatedAt || ""
            )
        };
    }

    function createAssessmentSnapshot(
        state
    ) {
        const source =
            asObject(state);

        return normaliseAssessment({
            version:
                source.version ||
                LEGACY_STATE_VERSION,

            schemaVersion:
                schemaVersion(),

            started:
                source.started,

            completed:
                source.completed,

            currentMoment:
                source.currentMoment,

            answers:
                source.answers,

            lead:
                source.lead,

            ui:
                source.ui,

            updatedAt:
                new Date().toISOString()
        });
    }

    function readAssessment() {
        return normaliseAssessment(
            readJson(
                key("STORAGE_KEY"),
                null,
                "saved progress"
            )
        );
    }

    function writeAssessment(state) {
        const snapshot =
            createAssessmentSnapshot(
                state
            );

        if (!snapshot) {
            return null;
        }

        return writeJson(
            key("STORAGE_KEY"),
            snapshot,
            "progress"
        )
            ? snapshot
            : null;
    }

    function clearAssessment() {
        return remove(
            key("STORAGE_KEY"),
            "saved progress"
        );
    }

    function readReport() {
        const report =
            readJson(
                key("REPORT_KEY"),
                null,
                "report data"
            );

        return Object.keys(
            asObject(report)
        ).length
            ? report
            : null;
    }

    function writeReport(report) {
        const record =
            asObject(report);

        if (!Object.keys(record).length) {
            console.warn(
                "GrowWithHR: empty report data was not saved."
            );

            return null;
        }

        return writeJson(
            key("REPORT_KEY"),
            record,
            "report data"
        )
            ? record
            : null;
    }

    function hasReport() {
        try {
            return Boolean(
                window.localStorage.getItem(
                    key("REPORT_KEY")
                )
            );
        } catch (error) {
            return false;
        }
    }

    function clearReport() {
        return remove(
            key("REPORT_KEY"),
            "report data"
        );
    }

    function readLead() {
        const lead =
            readJson(
                key("LEAD_KEY"),
                null,
                "lead record"
            );

        return Object.keys(
            asObject(lead)
        ).length
            ? lead
            : null;
    }

    function writeLead(lead) {
        const record =
            asObject(lead);

        if (!Object.keys(record).length) {
            console.warn(
                "GrowWithHR: empty lead data was not saved."
            );

            return null;
        }

        return writeJson(
            key("LEAD_KEY"),
            record,
            "lead record"
        )
            ? record
            : null;
    }

    function clearLead() {
        return remove(
            key("LEAD_KEY"),
            "lead record"
        );
    }

    function readDelivery() {
        return asObject(
            readJson(
                key("DELIVERY_KEY"),
                {},
                "delivery record"
            )
        );
    }

    function writeDelivery(delivery) {
        const source =
            asObject(delivery);

        const record = {
            ...source,

            updatedAt:
                source.updatedAt ||
                new Date().toISOString()
        };

        return writeJson(
            key("DELIVERY_KEY"),
            record,
            "delivery status"
        )
            ? record
            : null;
    }

    function mergeDelivery(
        current,
        update
    ) {
        return writeDelivery({
            ...asObject(current),
            ...asObject(update),
            updatedAt:
                new Date().toISOString()
        });
    }

    function clearDelivery() {
        return remove(
            key("DELIVERY_KEY"),
            "delivery status"
        );
    }

    function readIndustryCache(
        fallback = []
    ) {
        const catalogue =
            readJson(
                key(
                    "INDUSTRY_CACHE_KEY"
                ),
                null,
                "cached industry catalogue"
            );

        return (
            Array.isArray(catalogue) &&
            catalogue.length
        )
            ? catalogue
            : asArray(fallback);
    }

    function writeIndustryCache(
        industries
    ) {
        if (
            !Array.isArray(industries) ||
            !industries.length
        ) {
            console.warn(
                "GrowWithHR: empty industry catalogue was not cached."
            );

            return null;
        }

        const catalogue =
            [...industries];

        return writeJson(
            key(
                "INDUSTRY_CACHE_KEY"
            ),
            catalogue,
            "industry catalogue"
        )
            ? catalogue
            : null;
    }

    function clearIndustryCache() {
        return remove(
            key(
                "INDUSTRY_CACHE_KEY"
            ),
            "industry catalogue"
        );
    }

    /**
     * Matches the current restart behavior.
     *
     * The industry catalogue cache is preserved because it does not contain
     * user assessment data.
     */
    function clearUserData() {
        return [
            clearAssessment(),
            clearReport(),
            clearLead(),
            clearDelivery()
        ].every(Boolean);
    }

    /**
     * Clears both user assessment data and the reusable industry cache.
     */
    function clearAll() {
        return [
            clearUserData(),
            clearIndustryCache()
        ].every(Boolean);
    }

    const AssessmentStorage = {
        moduleVersion: "1.0.0",

        isAvailable,
        normaliseAssessment,
        createAssessmentSnapshot,

        readAssessment,
        writeAssessment,
        clearAssessment,

        readReport,
        writeReport,
        hasReport,
        clearReport,

        readLead,
        writeLead,
        clearLead,

        readDelivery,
        writeDelivery,
        mergeDelivery,
        clearDelivery,

        readIndustryCache,
        writeIndustryCache,
        clearIndustryCache,

        clearUserData,
        clearAll
    };

    modules.AssessmentStorage =
        Object.freeze(
            AssessmentStorage
        );
})();
