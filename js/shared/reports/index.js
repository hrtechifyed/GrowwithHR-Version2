/**
 * =============================================================================
 * GrowWithHR Intelligence Platform
 * Shared Report Library
 * -----------------------------------------------------------------------------
 * File      : js/shared/reports/index.js
 * Version   : 1.0.0
 * =============================================================================
 */

import reportEngine from "../../core/report-engine.js";

class SharedReportLibrary {

    generate(config = {}) {

        return reportEngine.generate({

            ...config

        });

    }

    executive(summary = {}) {

        return this.generate({

            type: "Executive",

            module: "shared",

            title: "Executive Intelligence Report",

            score:
                summary.score || 0,

            findings:
                summary.findings || [],

            recommendations:
                summary.recommendations || []

        });

    }

    operational(summary = {}) {

        return this.generate({

            type: "Operational",

            module: "shared",

            title: "Operational Intelligence Report",

            score:
                summary.score || 0,

            findings:
                summary.findings || [],

            recommendations:
                summary.recommendations || []

        });

    }

    compliance(summary = {}) {

        return this.generate({

            type: "Compliance",

            module: "shared",

            title: "Compliance Intelligence Report",

            score:
                summary.score || 0,

            findings:
                summary.findings || [],

            recommendations:
                summary.recommendations || []

        });

    }

}

const sharedReportLibrary =
    new SharedReportLibrary();

export { SharedReportLibrary };

export default sharedReportLibrary;
