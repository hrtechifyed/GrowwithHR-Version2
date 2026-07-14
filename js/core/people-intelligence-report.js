/**
 * =============================================================================
 * GrowWithHR Intelligence Platform
 * People Intelligence Report
 * -----------------------------------------------------------------------------
 * File      : js/core/people-intelligence-report.js
 * Version   : 1.0.0
 * =============================================================================
 */

import advisorService from "../advisor/service.js";

class PeopleIntelligenceReport {

    generate(context = {}) {

        const analysis =
            advisorService.analyze(
                context
            );

        return {

            generatedAt:
                new Date().toISOString(),

            company:
                analysis.company,

            modules:
                analysis.modules,
            observations: analysis.observations,

risks: analysis.risks,

opportunities: analysis.opportunities,

recommendations: analysis.recommendations,

            executiveSummary:
                this.executiveSummary(
                    analysis
                ),

            priorities:
                advisorService
                    .priorities(
                        context
                    ),

            recommendations:
                advisorService
                    .recommendations(
                        context
                    )

        };

    }

    executiveSummary(analysis) {

    return {

        moduleCount:
            (analysis.modules || []).length,

        observationCount:
            (analysis.observations || []).length,

        riskCount:
            (analysis.risks || []).length,

        opportunityCount:
            (analysis.opportunities || []).length,

        recommendationCount:
            (analysis.recommendations || []).length

    };

}

    
    dashboard(context = {}) {

        const report =
            this.generate(context);

        return {

            company:

                report.company
                    ?.company
                    ?.legalName || "",

           observationCount: report.observations.length,

riskCount: report.risks.length,

opportunityCount: report.opportunities.length,

recommendationCount: report.recommendations.length,

            moduleCount:
                report.modules.length,

            priorityCount:
                report.priorities
                    .length

        };

    }

}

const peopleIntelligenceReport =
    new PeopleIntelligenceReport();

export { PeopleIntelligenceReport };

export default peopleIntelligenceReport;
