/**
 * GrowWithHR Organization Intelligence Service
 */

import companyDNA from "../../core/company-dna.js";
import organizationEngine from "./engine.js";

class OrganizationService {
    analyze(context = {}) {
        return organizationEngine.analyze({
            company: companyDNA.get(),
            context
        });
    }

    findings(context = {}) {
        return this.analyze(context).findings;
    }

    actionFindings(context = {}) {
        return this.findings(context).filter(item => item.status === "action");
    }

    watchFindings(context = {}) {
        return this.findings(context).filter(item => item.status === "watch");
    }

    recommendations(context = {}) {
        return this.findings(context)
            .filter(item => item.status === "action" || item.status === "watch")
            .map(item => ({
                id: item.id,
                area: item.area,
                status: item.status,
                title: item.title,
                action: item.action,
                growthTrigger: item.growthTrigger
            }));
    }

    references(context = {}) {
        const analysis = this.analyze(context);
        return {
            authority: analysis.authority,
            boundaries: analysis.boundaries
        };
    }

    summary(context = {}) {
        const analysis = this.analyze(context);
        return {
            module: "organization",
            statusSummary: analysis.statusSummary,
            missingFacts: analysis.missingFacts,
            findingCount: analysis.findings.length,
            scenarioAvailable: analysis.scenario.available
        };
    }
}

const organizationService = new OrganizationService();

export { OrganizationService };
export default organizationService;
