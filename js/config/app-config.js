/**
 * =============================================================================
 * GrowWithHR
 * Application Configuration
 * =============================================================================
 */

const APP_CONFIG = Object.freeze({
    productName: "GrowWithHR",
    companyName: "HRTechify",
    version: "0.16.0-beta",
    releaseName: "Private Beta",

    website:
        "https://hrtechifyed.github.io/GrowwithHR/",

    supportEmail:
        "hrtechifyed@gmail.com",

    routes: Object.freeze({
        assessmentV2: "analyze-company.html",
        assessmentV3: "analyze-company-v3.html"
    }),

    featureFlags: Object.freeze({
        complianceDnaV3: false
    }),

    featureFlagStoragePrefix:
        "growwithhr-feature-",

    isFeatureEnabled(name, runtime = globalThis) {
        const configured =
            Boolean(this.featureFlags[name]);

        try {
            const query =
                new URLSearchParams(
                    runtime?.location?.search || ""
                );

            const queryValue =
                query.get(name);

            if (queryValue === "1" || queryValue === "true") {
                return true;
            }

            if (queryValue === "0" || queryValue === "false") {
                return false;
            }

            const stored =
                runtime?.localStorage?.getItem(
                    `${this.featureFlagStoragePrefix}${name}`
                );

            if (stored === "enabled") {
                return true;
            }

            if (stored === "disabled") {
                return false;
            }
        } catch (error) {
            console.warn(
                "GrowWithHR: feature-flag override could not be read.",
                error
            );
        }

        return configured;
    },

    resolveAssessmentRoute(runtime = globalThis) {
        return this.isFeatureEnabled(
            "complianceDnaV3",
            runtime
        )
            ? this.routes.assessmentV3
            : this.routes.assessmentV2;
    },

    copyright:
        `© ${new Date().getFullYear()} HRTechify. All Rights Reserved.`
});

if (typeof window !== "undefined") {
    window.GrowWithHRAppConfig =
        APP_CONFIG;
}

export default APP_CONFIG;
