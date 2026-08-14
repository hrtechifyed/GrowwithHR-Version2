/**
 * GrowWithHR Organization Intelligence Report Builder
 * Structured prototype report without arbitrary maturity scoring.
 */

import organizationService from "./service.js";

function createReportId() {
    return `organization-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

class OrganizationReport {
    generate(context = {}) {
        const analysis = organizationService.analyze(context);
        return {
            id: createReportId(),
            type: "Organization",
            module: "organization",
            title: "Organization Intelligence Report",
            generatedAt: new Date().toISOString(),
            authority: analysis.authority,
            facts: analysis.facts,
            derivedMetrics: analysis.derivedMetrics,
            findings: analysis.findings,
            statusSummary: analysis.statusSummary,
            missingFacts: analysis.missingFacts,
            scenario: analysis.scenario,
            recommendations: organizationService.recommendations(context),
            boundaries: analysis.boundaries
        };
    }

    summary(context = {}) {
        const report = this.generate(context);
        return {
            id: report.id,
            title: report.title,
            generatedAt: report.generatedAt,
            statusSummary: report.statusSummary,
            findingCount: report.findings.length,
            recommendationCount: report.recommendations.length,
            missingFactCount: report.missingFacts.length
        };
    }

    executiveSummary(context = {}) {
        const analysis = organizationService.analyze(context);
        return {
            module: "Organization Intelligence",
            statusSummary: analysis.statusSummary,
            findings: analysis.findings,
            missingFacts: analysis.missingFacts,
            scenario: analysis.scenario,
            boundaries: analysis.boundaries
        };
    }

    dashboard(context = {}) {
        const analysis = organizationService.analyze(context);
        return {
            statusSummary: analysis.statusSummary,
            findingCount: analysis.findings.length,
            actionCount: analysis.statusSummary?.action || 0,
            watchCount: analysis.statusSummary?.watch || 0,
            missingInformationCount:
                analysis.statusSummary?.["needs-information"] || 0
        };
    }
}

const organizationReport = new OrganizationReport();

export { OrganizationReport };
export default organizationReport;
