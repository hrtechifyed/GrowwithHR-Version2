/**
 * GrowWithHR Organization Intelligence Mapper
 * Keeps structural facts and interpretations explicit; no maturity score.
 */

class OrganizationMapper {
    toDashboard(result = {}) {
        return {
            module: "Organization Intelligence",
            statusSummary: result.statusSummary || {},
            findings: result.findings || [],
            derivedMetrics: result.derivedMetrics || {},
            scenario: result.scenario || null,
            missingFacts: result.missingFacts || []
        };
    }

    toPeopleIntelligence(result = {}) {
        return {
            module: "Organization",
            findings: (result.findings || []).map(item => ({
                id: item.id,
                area: item.area,
                status: item.status,
                title: item.title,
                whyItMatters: item.whyItMatters,
                action: item.action,
                confidence: item.confidence
            })),
            statusSummary: result.statusSummary || {},
            missingFacts: result.missingFacts || []
        };
    }

    toAIContext(result = {}) {
        return {
            module: "Organization",
            authority: result.authority,
            deterministicFindings: result.findings || [],
            facts: result.facts || {},
            derivedMetrics: result.derivedMetrics || {},
            scenario: result.scenario || null,
            boundaries: result.boundaries || {},
            instruction:
                "Explain fixed Organization Intelligence findings and trade-offs only. Do not alter deterministic statuses or infer facts that were not supplied."
        };
    }

    toAPI(result = {}) {
        return {
            success: true,
            timestamp: new Date().toISOString(),
            data: {
                authority: result.authority,
                facts: result.facts || {},
                factRegistry: result.factRegistry || {},
                derivedMetrics: result.derivedMetrics || {},
                findings: result.findings || [],
                statusSummary: result.statusSummary || {},
                missingFacts: result.missingFacts || [],
                scenario: result.scenario || null,
                boundaries: result.boundaries || {}
            }
        };
    }

    toExport(result = {}) {
        return {
            exportedAt: new Date().toISOString(),
            module: "organization",
            authority: result.authority,
            facts: result.facts || {},
            derivedMetrics: result.derivedMetrics || {},
            findings: result.findings || [],
            statusSummary: result.statusSummary || {},
            missingFacts: result.missingFacts || [],
            scenario: result.scenario || null,
            boundaries: result.boundaries || {}
        };
    }
}

const organizationMapper = new OrganizationMapper();

export { OrganizationMapper };
export default organizationMapper;
