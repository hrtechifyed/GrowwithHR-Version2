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

        
        return {

    company,
 
    organizationProfile,
            
    modules,

    observations: [],

    risks: [],

    opportunities: [],

    recommendations: [],

    context

        };

    }

}

const advisorEngine =
    new AdvisorEngine();

export { AdvisorEngine };

export default advisorEngine;
