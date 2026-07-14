/**
 * =============================================================================
 * GrowWithHR Intelligence Platform
 * AI Advisor Engine
 * -----------------------------------------------------------------------------
 * File      : js/advisor/advisor.js
 * Version   : 1.0.0
 * =============================================================================
 */

import companyDNA from "../core/company-dna.js";
import recommendationEngine from "../core/recommendation-engine.js";
import organizationService from "../modules/organization/service.js";
import hiringService from "../modules/hiring/service.js";
import performanceService from "../modules/performance/service.js";
import leadershipService from "../modules/leadership/service.js";
import talentService from "../modules/talent/service.js";
import rewardsService from "../modules/rewards/service.js";
import learningService from "../modules/learning/service.js";
import cultureService from "../modules/culture/service.js";
import policyService from "../modules/policy/service.js";
import complianceService from "../modules/compliance/service.js";

class AdvisorEngine {

buildExecutiveContext(company) {

    return {

        currentEmployees:
            company.getTotalEmployees(),

        projectedEmployees:
            company.company.growth
                ?.projectedEmployees ?? null,

        growthPlanned:
            (
                company.company.growth
                    ?.projectedEmployees ?? 0
            ) >
            company.getTotalEmployees(),

        operatesInMultipleStates:
            (company.company.states || []).length > 1,

        operatesInMultipleCountries:
            (company.company.countries || []).length > 1,

        operatesInMultipleCities:
            (company.company.cities || []).length > 1,

        workModel:
            company.company.workModel,

        industry:
            company.company.industry,

        entityType:
            company.company.entityType

    };

}
    
    buildExecutiveObservations(executiveContext) {

        const observations = [];

if (executiveContext.growthPlanned) {

    observations.push({

        id: "growth-planned",

        category: "Growth",

        title: "Workforce expansion planned",

        description:
            "The assessment indicates planned employee growth. HR processes, onboarding capacity and workforce planning should scale alongside business growth.",

        evidence: {

            currentEmployees:
                executiveContext.currentEmployees,

            projectedEmployees:
                executiveContext.projectedEmployees

        }

    });

}

if (executiveContext.operatesInMultipleStates) {

    observations.push({

        id: "multi-state",

        category: "Operations",

        title: "Operations span multiple states",

        description:
            "Operating across multiple states increases administrative and statutory complexity and benefits from standardized HR processes."

    });

}

if (executiveContext.operatesInMultipleCountries) {

    observations.push({

        id: "multi-country",

        category: "Operations",

        title: "International operations detected",

        description:
            "Operating across multiple countries introduces additional people, compliance and governance considerations."

    });

}

if (executiveContext.workModel === "Hybrid") {

    observations.push({

        id: "hybrid-work",

        category: "Workforce",

        title: "Hybrid workforce model",

        description:
            "A hybrid workforce benefits from consistent people practices, communication and performance management."

    });

}
        
        return observations;

    }

buildExecutiveRisks(executiveContext, observations) {

    const risks = [];

    if (executiveContext.growthPlanned) {

        risks.push({

            id: "growth-capacity",

            category: "Growth",

            title: "People processes may not scale with planned growth",

            description:
                "Planned workforce expansion may place additional demands on hiring, onboarding, performance management and HR administration.",

            relatedObservation:
                "growth-planned"

        });

    }

    if (executiveContext.operatesInMultipleStates) {

        risks.push({

            id: "multi-state-compliance",

            category: "Compliance",

            title: "Multi-state operations increase compliance complexity",

            description:
                "Operating across multiple states may require additional statutory compliance, documentation and policy consistency.",

            relatedObservation:
                "multi-state"

        });

    }

    if (executiveContext.operatesInMultipleCountries) {

        risks.push({

            id: "global-governance",

            category: "Governance",

            title: "International operations require stronger governance",

            description:
                "Cross-border operations introduce additional employment, policy and governance considerations.",

            relatedObservation:
                "multi-country"

        });

    }

    return risks;

}

    buildExecutiveOpportunities(executiveContext, observations, risks) {

    const opportunities = [];

    if (executiveContext.growthPlanned) {

        opportunities.push({

            id: "scale-people-operations",

            category: "Growth",

            title: "Strengthen people operations before expansion",

            description:
                "Planned workforce growth presents an opportunity to establish scalable HR processes before headcount increases."

        });

    }

    if (executiveContext.operatesInMultipleStates) {

        opportunities.push({

            id: "standardize-operations",

            category: "Operations",

            title: "Standardize HR practices across locations",

            description:
                "Common HR processes, policies and documentation can improve consistency across operating locations."

        });

    }

    if (executiveContext.workModel === "Hybrid") {

        opportunities.push({

            id: "hybrid-framework",

            category: "Workforce",

            title: "Strengthen hybrid workforce practices",

            description:
                "Clear communication, performance expectations and collaboration practices can improve hybrid workforce effectiveness."

        });

    }

    return opportunities;
    }

buildRecommendations(
    executiveContext,
    observations,
    risks,
    opportunities
)
    
    
    {

    recommendationEngine.clear();

    if (executiveContext.growthPlanned) {

        recommendationEngine.create({

            module: "organization",

            category: "Growth",

            title:
                "Prepare HR processes for workforce expansion",

            description:
                "Review hiring, onboarding and workforce planning processes before planned employee growth accelerates.",

            priority: "High"

        });

    }

    if (executiveContext.operatesInMultipleStates) {

        recommendationEngine.create({

            module: "organization",

            category: "Compliance",

            title:
                "Standardize HR policies across operating locations",

            description:
                "Create consistent HR documentation, policies and operating procedures across all locations.",

            priority: "High"

        });

    }

    if (executiveContext.workModel === "Hybrid") {

        recommendationEngine.create({

            module: "organization",

            category: "People",

            title:
                "Strengthen hybrid workforce practices",

            description:
                "Define consistent communication, collaboration and performance expectations for hybrid teams.",

            priority: "Medium"

        });

    }

    return recommendationEngine.list();

}

   buildCrossModuleInsights(
    executiveContext,
    observations,
    risks,
    opportunities
) {

    const insights = [];

    if (
        executiveContext.growthPlanned &&
        executiveContext.operatesInMultipleStates
    ) {

        insights.push({

            id: "growth-governance",

            title:
                "Growth is increasing organizational complexity",

            description:
                "Planned workforce expansion across multiple operating locations is likely to increase HR coordination, governance and compliance requirements."

        });

    }

    if (
        executiveContext.workModel === "Hybrid" &&
        executiveContext.operatesInMultipleStates
    ) {

        insights.push({

            id: "distributed-workforce",

            title:
                "Distributed workforce requires consistent operating practices",

            description:
                "Hybrid work combined with geographically distributed operations benefits from standardized people processes and communication."

        });

    }

    return insights;

}

    
    buildExecutiveSummary(
    executiveContext,
    observations,
    risks,
    opportunities
) {

    const summary = {

        title: "Executive Summary",

        overview: "",

        highlights: [],

        focusAreas: []

    };

    if (executiveContext.growthPlanned) {

        summary.highlights.push(
            "The organization is preparing for workforce expansion."
        );

        summary.focusAreas.push(
            "Scale HR operations to support business growth."
        );

    }

    if (executiveContext.operatesInMultipleStates) {

        summary.highlights.push(
            "Operations span multiple states."
        );

        summary.focusAreas.push(
            "Standardize HR and compliance practices across locations."
        );

    }

    if (executiveContext.workModel === "Hybrid") {

        summary.highlights.push(
            "The organization operates with a hybrid workforce."
        );

        summary.focusAreas.push(
            "Strengthen communication and people management practices."
        );

    }

    summary.overview =
        summary.highlights.join(" ");

    return summary;

}

    
    analyze(context = {}) {

        const company =
            companyDNA.get();

        const modules = [

            organizationService.summary(),

            hiringService.summary(),

            performanceService.summary(),

            leadershipService.summary(),

            talentService.summary(),

            rewardsService.summary(),

            learningService.summary(),

            cultureService.summary(),

            policyService.summary(),

            complianceService.summary()

        ];

const organizationProfile = {

    companyName:
        company.company.companyName,

    entityType:
        company.company.entityType,

    industry:
        company.company.industry,

    natureOfBusiness:
        company.company.natureOfBusiness,

    workModel:
        company.company.workModel,

    operatingCountries:
        company.company.countries,

    operatingStates:
        company.company.states,

    operatingCities:
        company.company.cities,

    currentEmployees:
        company.getTotalEmployees(),

    projectedEmployees:
        company.company.growth
            ?.projectedEmployees ?? null

};

        const executiveContext =
    this.buildExecutiveContext(
        company
    );

       const observations =
    this.buildExecutiveObservations(
        executiveContext
    );

    const risks =
    this.buildExecutiveRisks(
        executiveContext,
        observations
    );


        const opportunities =
    this.buildExecutiveOpportunities(
        executiveContext,
        observations,
        risks
    );

        const recommendations =
    this.buildRecommendations(
        executiveContext,
        observations,
        risks,
        opportunities
    );

const insights =
    this.buildCrossModuleInsights(
        executiveContext,
        observations,
        risks,
        opportunities
    );
        
        const executiveSummary =
    this.buildExecutiveSummary(
        executiveContext,
        observations,
        risks,
        opportunities
    );

        return {

    company,
 
    organizationProfile,
    
    executiveSummary,
    
    executiveContext,
            
    modules,

    observations,

    risks,

    opportunities,

    insights,

    recommendations,
    
    context

        };

    }

}

const advisorEngine =
    new AdvisorEngine();

export { AdvisorEngine };

export default advisorEngine;
