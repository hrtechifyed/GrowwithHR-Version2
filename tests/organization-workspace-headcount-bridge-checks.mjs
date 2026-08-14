import assert from "node:assert/strict";
import fs from "node:fs";

import { analyzeOrganizationStructure } from "../js/modules/organization/organization-structure-engine.mjs";

const engineSource = fs.readFileSync(
    new URL("../js/modules/organization/engine.js", import.meta.url),
    "utf8"
);

const workforceBlock = engineSource.match(/workforce:\s*\{([\s\S]*?)\n\s*\},\n\s*geography:/)?.[1] || "";
assert.ok(workforceBlock, "Organization bridge must expose a workforce mapping block.");

const sharedIndex = workforceBlock.indexOf("sharedContext.employees");
const companyIndex = workforceBlock.indexOf("company.workforce?.totalEmployees");
assert.ok(sharedIndex >= 0, "Recovered shared workspace headcount must be a workforce fallback.");
assert.ok(companyIndex >= 0, "Persisted Company DNA headcount must remain a workforce fallback.");
assert.ok(
    sharedIndex < companyIndex,
    "Recovered shared headcount must win over the empty Company DNA default of zero."
);

const workspaceShape = analyzeOrganizationStructure({
    shared: {
        companyName: "Recovered Workspace",
        employees: 42,
        expectedEmployees: 60
    },
    organization: {
        peopleManagerCount: 6,
        reportingLevels: 2,
        founderDirectReports: 5,
        departments: ["Sales", "Product", "Operations"],
        roleClarity: "clear",
        decisionRights: "clear",
        governanceCadence: "weekly",
        coordinationFriction: "low"
    }
});

assert.equal(workspaceShape.facts.employees, 42);
assert.equal(workspaceShape.derivedMetrics.currentEmployeeToManagerRatio, 7);
assert.equal(workspaceShape.derivedMetrics.expectedHeadcountGrowthPercent, 42.9);

console.log("Organization returning-workspace headcount bridge checks passed.");
