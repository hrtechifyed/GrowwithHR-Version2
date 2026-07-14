/**
 * =============================================================================
 * GrowWithHR Intelligence Platform
 * Executive Dashboard
 * -----------------------------------------------------------------------------
 * File      : js/core/executive-dashboard.js
 * Version   : 2.0.0
 * =============================================================================
 */

import advisorService from "../advisor/service.js";
import peopleIntelligenceReport from "./people-intelligence-report.js";
import intelligenceGraph from "./intelligence-graph.js";

class ExecutiveDashboard {

    generate(context = {}) {

        const analysis =
            advisorService.analyze(
                context
            );

        const report =
            peopleIntelligenceReport.generate(
                context
            );

        // Temporary validation
        console.log(
            "Advisor Analysis",
            analysis
        );

        console.log(
            "People Report",
            report
        );

        return {

            generatedAt:
                new Date().toISOString(),

            company:
                analysis.company,

            organizationProfile:
                analysis.organizationProfile,

            executiveContext:
                analysis.executiveContext,

            modules:
                analysis.modules,

            observations:
                analysis.observations,

            risks:
                analysis.risks,

            opportunities:
                analysis.opportunities,

            insights:
                analysis.insights,

            graph:
                intelligenceGraph.summary(),

            executiveSummary:
                report.executiveSummary,

            priorities:
                report.priorities,

            recommendations:
                report.recommendations

        };

    }

    summary(context = {}) {

        const dashboard =
            this.generate(context);

        return {

            company:

                dashboard.company
                    ?.company
                    ?.companyName || "",

            moduleCount:
                dashboard.modules
                    .length,

            observationCount:
                dashboard.observations
                    .length,

            riskCount:
                dashboard.risks
                    .length,

            opportunityCount:
                dashboard.opportunities
                    .length,

            insightCount:
                dashboard.insights
                    .length,

            recommendationCount:
                dashboard.recommendations
                    .length

        };

    }

}

const executiveDashboard =
    new ExecutiveDashboard();

export { ExecutiveDashboard };

export default executiveDashboard;
