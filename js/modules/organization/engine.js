/**
 * GrowWithHR Organization Intelligence Engine
 * Structured deterministic wrapper for the shared Intelligence Platform.
 */

import { analyzeOrganizationStructure } from "./organization-structure-engine.mjs";

function companyToOrganizationInput(company = {}, context = {}) {
    const organizationContext = context.organization || {};
    const sharedContext = context.shared || {};
    const workforceContext = context.workforce || {};
    const geographyContext = context.geography || {};

    return {
        shared: {
            companyName:
                sharedContext.companyName ||
                company.company?.displayName ||
                company.company?.legalName ||
                "",
            industry:
                sharedContext.industry ||
                company.industry?.sector ||
                "",
            growthStage:
                sharedContext.growthStage ||
                company.business?.growthStage ||
                "",
            employees:
                workforceContext.totalEmployees ??
                sharedContext.employees ??
                company.workforce?.totalEmployees ??
                null,
            expectedEmployees:
                workforceContext.expectedEmployees12Months ??
                sharedContext.expectedEmployees ??
                null
        },
        workforce: {
            totalEmployees:
                workforceContext.totalEmployees ??
                company.workforce?.totalEmployees ??
                null,
            expectedEmployees12Months:
                workforceContext.expectedEmployees12Months ??
                sharedContext.expectedEmployees ??
                null
        },
        geography: {
            operatingLocationCount:
                geographyContext.operatingLocationCount ??
                organizationContext.locations ??
                null
        },
        organization: {
            departments:
                organizationContext.departments ??
                company.organization?.departments ??
                [],
            reportingLevels:
                organizationContext.reportingLevels ??
                company.organization?.reportingLevels ??
                null,
            peopleManagerCount:
                organizationContext.peopleManagerCount ??
                organizationContext.managerCount ??
                null,
            founderDirectReports:
                organizationContext.founderDirectReports ??
                null,
            founderDecisions:
                organizationContext.founderDecisions ??
                "",
            expansion:
                organizationContext.expansion ??
                "",
            roleClarity:
                organizationContext.roleClarity ??
                "",
            decisionRights:
                organizationContext.decisionRights ??
                "",
            governanceCadence:
                organizationContext.governanceCadence ??
                "",
            coordinationFriction:
                organizationContext.coordinationFriction ??
                "",
            locations:
                organizationContext.locations ??
                geographyContext.operatingLocationCount ??
                null,
            confirmedAt:
                organizationContext.confirmedAt ??
                context.confirmedAt
        }
    };
}

class OrganizationEngine {
    analyze({ company = {}, context = {} } = {}) {
        return analyzeOrganizationStructure(
            companyToOrganizationInput(company, context)
        );
    }
}

const organizationEngine = new OrganizationEngine();

export {
    OrganizationEngine,
    companyToOrganizationInput
};

export default organizationEngine;
