/* ==========================================
   GrowWithHR V0.9.0-beta
   company-dna.js
   Company DNA Collector
========================================== */

export function collectCompanyDNA() {

    return {

        /* ======================================
           COMPANY INFORMATION
        ====================================== */

        companyName:
            document.getElementById("companyName")?.value.trim() || "",

        yearFounded:
            document.getElementById("yearFounded")?.value || "",

        entity:
            document.getElementById("entitySelect")?.value || "",

        industry:
            document.getElementById("industrySelect")?.value || "",

        businessNature:
            document.getElementById("businessNature")?.value || "",

        /* ======================================
           WORKFORCE
        ====================================== */

        employeeBand:
            document.getElementById("employeeCount")?.value || "",

        contractWorkers:
            Number(document.getElementById("contractWorkers")?.value || 0),

        interns:
            Number(document.getElementById("interns")?.value || 0),

        apprentices:
            Number(document.getElementById("apprentices")?.value || 0),

        remoteWorkforce:
            document.getElementById("remoteWorkforce")?.value || "",

        /* ======================================
           OPERATIONS
        ====================================== */

        state:
            document.getElementById("stateSelect")?.value || "",

        workModel:
            document.getElementById("workModel")?.value || "",

        operatingLocations:
            document.getElementById("additionalStates")?.value || "",

        countries:
            document.getElementById("countries")?.value || "",

        /* ======================================
           GROWTH
        ====================================== */

        plannedHiring:
            document.getElementById("plannedHiring")?.value || "",

        fundingStage:
            document.getElementById("fundingStage")?.value || "",

        expansionPlans:
            document.getElementById("expansionPlans")?.value || "",

        peopleFunction:
            document.getElementById("hrOwner")?.value || ""

    };

}
