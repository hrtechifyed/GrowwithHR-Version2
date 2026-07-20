/**
 * GrowWithHR Compliance DNA
 * M2 Assessment Fact Mapper
 *
 * Converts protected Executive Advisory assessment answers into:
 * - confirmed facts supplied by the user;
 * - deterministic derived facts calculated from those answers.
 *
 * This module has no DOM, browser-storage, network, PDF, email or
 * report-delivery side effects.
 */

import {
    createConfirmedFact,
    createDerivedFact
} from "./traceability-contract.js";

export const FACT_MAPPER_VERSION =
    "1.0.0";

export const FACT_IDS =
    Object.freeze({
        COMPANY_NAME:
            "fact.company.name",

        INDUSTRY:
            "fact.company.industry",

        INDUSTRY_ID:
            "fact.company.industry-id",

        CUSTOM_INDUSTRY:
            "fact.company.custom-industry",

        BUSINESS_NATURE:
            "fact.company.business-nature",

        FOUNDED_YEAR:
            "fact.company.founded-year",

        FOUNDED_YEAR_UNKNOWN:
            "fact.company.founded-year-unknown",

        ENTITY_TYPE:
            "fact.company.entity-type",

        FUNDING_STAGE:
            "fact.company.funding-stage",

        EMPLOYEE_COUNT:
            "fact.workforce.employee-count",

        CONTRACT_WORKER_COUNT:
            "fact.workforce.contract-worker-count",

        INTERN_COUNT:
            "fact.workforce.intern-count",

        APPRENTICE_COUNT:
            "fact.workforce.apprentice-count",

        WORK_MODEL:
            "fact.workforce.work-model",

        REMOTE_WORKFORCE_BAND:
            "fact.workforce.remote-workforce-band",

        REMOTE_WORKFORCE_PERCENTAGE:
            "fact.workforce.remote-workforce-percentage",

        PRIMARY_STATE:
            "fact.footprint.primary-state",

        LOCATION_COUNT:
            "fact.footprint.location-count",

        COUNTRY_COUNT:
            "fact.footprint.country-count",

        HIRING_PLAN:
            "fact.growth.hiring-plan",

        EXPANSION_PLANS:
            "fact.growth.expansion-plans",

        GROWTH_CONTEXT:
            "fact.growth.context",

        PEOPLE_FUNCTION:
            "fact.people.people-function",

        PRIORITIES:
            "fact.people.priorities",

        TOTAL_REPORTED_WORKFORCE:
            "fact.workforce.total-reported-workforce",

        WORKFORCE_SIZE_BAND:
            "fact.workforce.size-band",

        MULTI_LOCATION:
            "fact.footprint.multi-location",

        MULTI_COUNTRY:
            "fact.footprint.multi-country",

        DISTRIBUTED_WORKFORCE:
            "fact.workforce.distributed-workforce",

        RAPID_GROWTH:
            "fact.growth.rapid-growth",

        EXPANSION_ACTIVITY:
            "fact.growth.expansion-activity",

        FORMAL_PEOPLE_FUNCTION:
            "fact.people.formal-people-function"
    });

export const DERIVATION_RULE_IDS =
    Object.freeze({
        TOTAL_REPORTED_WORKFORCE:
            "rule.workforce.total-reported-workforce.calculate",

        WORKFORCE_SIZE_BAND:
            "rule.workforce.employee-count.band",

        MULTI_LOCATION:
            "rule.footprint.location-count.multiple",

        MULTI_COUNTRY:
            "rule.footprint.country-count.multiple",

        DISTRIBUTED_WORKFORCE:
            "rule.workforce.working-model.distributed",

        RAPID_GROWTH:
            "rule.growth.hiring-plan.rapid-growth",

        EXPANSION_ACTIVITY:
            "rule.growth.expansion-plan.active",

        FORMAL_PEOPLE_FUNCTION:
            "rule.people.people-function.formal"
    });

const CONFIRMED_FACT_DEFINITIONS =
    Object.freeze([
        {
            answerKey:
                "companyName",

            id:
                FACT_IDS.COMPANY_NAME,

            label:
                "Organisation name",

            type:
                "text"
        },
        {
            answerKey:
                "industry",

            id:
                FACT_IDS.INDUSTRY,

            label:
                "Industry",

            type:
                "text"
        },
        {
            answerKey:
                "industryId",

            id:
                FACT_IDS.INDUSTRY_ID,

            label:
                "Industry identifier",

            type:
                "text"
        },
        {
            answerKey:
                "customIndustry",

            id:
                FACT_IDS.CUSTOM_INDUSTRY,

            label:
                "Custom industry",

            type:
                "text"
        },
        {
            answerKey:
                "nature",

            id:
                FACT_IDS.BUSINESS_NATURE,

            label:
                "Business description",

            type:
                "text"
        },
        {
            answerKey:
                "founded",

            id:
                FACT_IDS.FOUNDED_YEAR,

            label:
                "Founded year",

            type:
                "integer"
        },
        {
            answerKey:
                "foundedNotSure",

            id:
                FACT_IDS.FOUNDED_YEAR_UNKNOWN,

            label:
                "Founded year not known",

            type:
                "boolean"
        },
        {
            answerKey:
                "entity",

            id:
                FACT_IDS.ENTITY_TYPE,

            label:
                "Legal entity type",

            type:
                "text"
        },
        {
            answerKey:
                "fundingStage",

            id:
                FACT_IDS.FUNDING_STAGE,

            label:
                "Funding stage",

            type:
                "text"
        },
        {
            answerKey:
                "employees",

            id:
                FACT_IDS.EMPLOYEE_COUNT,

            label:
                "Employee count",

            type:
                "non-negative-integer"
        },
        {
            answerKey:
                "contractWorkers",

            id:
                FACT_IDS.CONTRACT_WORKER_COUNT,

            label:
                "Contract and outsourced worker count",

            type:
                "non-negative-integer"
        },
        {
            answerKey:
                "interns",

            id:
                FACT_IDS.INTERN_COUNT,

            label:
                "Intern count",

            type:
                "non-negative-integer"
        },
        {
            answerKey:
                "apprentices",

            id:
                FACT_IDS.APPRENTICE_COUNT,

            label:
                "Apprentice count",

            type:
                "non-negative-integer"
        },
        {
            answerKey:
                "workModel",

            id:
                FACT_IDS.WORK_MODEL,

            label:
                "Working model",

            type:
                "text"
        },
        {
            answerKey:
                "remoteBand",

            id:
                FACT_IDS.REMOTE_WORKFORCE_BAND,

            label:
                "Remote workforce band",

            type:
                "text"
        },
        {
            answerKey:
                "remoteExact",

            id:
                FACT_IDS.REMOTE_WORKFORCE_PERCENTAGE,

            label:
                "Remote workforce percentage",

            type:
                "percentage"
        },
        {
            answerKey:
                "primaryState",

            id:
                FACT_IDS.PRIMARY_STATE,

            label:
                "Primary operating state",

            type:
                "text"
        },
        {
            answerKey:
                "locations",

            id:
                FACT_IDS.LOCATION_COUNT,

            label:
                "Permanent operating location count",

            type:
                "positive-integer"
        },
        {
            answerKey:
                "countries",

            id:
                FACT_IDS.COUNTRY_COUNT,

            label:
                "Operating country count",

            type:
                "positive-integer"
        },
        {
            answerKey:
                "hiringPlans",

            id:
                FACT_IDS.HIRING_PLAN,

            label:
                "Hiring plan",

            type:
                "text"
        },
        {
            answerKey:
                "expansionPlans",

            id:
                FACT_IDS.EXPANSION_PLANS,

            label:
                "Expansion plans",

            type:
                "text-array"
        },
        {
            answerKey:
                "growthContext",

            id:
                FACT_IDS.GROWTH_CONTEXT,

            label:
                "Growth context",

            type:
                "text"
        },
        {
            answerKey:
                "peopleFunction",

            id:
                FACT_IDS.PEOPLE_FUNCTION,

            label:
                "People or HR function",

            type:
                "text"
        },
        {
            answerKey:
                "priorities",

            id:
                FACT_IDS.PRIORITIES,

            label:
                "Selected advisory priorities",

            type:
                "text-array"
        }
    ]);

const DISTRIBUTED_WORK_MODELS =
    Object.freeze([
        "Hybrid",
        "Remote",
        "Field Workforce",
        "Mixed"
    ]);

const FORMAL_PEOPLE_FUNCTIONS =
    Object.freeze([
        "Dedicated HR Team",
        "Single HR/People Professional"
    ]);

const ACTIVE_EXPANSION_PLANS =
    Object.freeze([
        "new-locations",
        "new-markets",
        "new-products",
        "scale-operations",
        "restructure"
    ]);

function asObject(value) {
    return (
        value &&
        typeof value === "object" &&
        !Array.isArray(value)
    )
        ? value
        : {};
}

function cleanText(value) {
    return String(
        value ?? ""
    ).trim();
}

function hasOwn(
    object,
    property
) {
    return Object.prototype
        .hasOwnProperty.call(
            object,
            property
        );
}

function hasMeaningfulValue(value) {
    if (
        value === null ||
        value === undefined
    ) {
        return false;
    }

    if (
        typeof value ===
        "string"
    ) {
        return cleanText(value) !== "";
    }

    if (Array.isArray(value)) {
        return value.length > 0;
    }

    return true;
}

function parseInteger(value) {
    if (
        typeof value === "number" &&
        Number.isInteger(value)
    ) {
        return value;
    }

    const text =
        cleanText(value);

    if (
        !/^-?\d+$/.test(text)
    ) {
        return null;
    }

    const parsed =
        Number.parseInt(
            text,
            10
        );

    return Number.isSafeInteger(parsed)
        ? parsed
        : null;
}

function normalizeTextArray(value) {
    if (!Array.isArray(value)) {
        return [];
    }

    return [
        ...new Set(
            value
                .map(cleanText)
                .filter(Boolean)
        )
    ];
}

function normalizeValue(
    value,
    type
) {
    switch (type) {
        case "text":
            return cleanText(value);

        case "boolean":
            return Boolean(value);

        case "integer": {
            return parseInteger(value);
        }

        case "non-negative-integer": {
            const parsed =
                parseInteger(value);

            return (
                parsed !== null &&
                parsed >= 0
            )
                ? parsed
                : null;
        }

        case "positive-integer": {
            const parsed =
                parseInteger(value);

            return (
                parsed !== null &&
                parsed >= 1
            )
                ? parsed
                : null;
        }

        case "percentage": {
            const parsed =
                parseInteger(value);

            return (
                parsed !== null &&
                parsed >= 0 &&
                parsed <= 100
            )
                ? parsed
                : null;
        }

        case "text-array":
            return normalizeTextArray(
                value
            );

        default:
            return value;
    }
}

function resolveRecordedAt(
    answerKey,
    options
) {
    const recordedAtByAnswer =
        asObject(
            options
                .recordedAtByAnswer
        );

    const supplied =
        recordedAtByAnswer[
            answerKey
        ] ??
        options.recordedAt ??
        null;

    if (
        supplied === null ||
        supplied === undefined ||
        cleanText(supplied) === ""
    ) {
        return null;
    }

    const date =
        new Date(supplied);

    return Number.isFinite(
        date.getTime()
    )
        ? date.toISOString()
        : null;
}

function createConfirmedFacts(
    answers,
    options
) {
    const facts = [];

    for (
        const definition
        of CONFIRMED_FACT_DEFINITIONS
    ) {
        if (
            !hasOwn(
                answers,
                definition.answerKey
            )
        ) {
            continue;
        }

        const rawValue =
            answers[
                definition.answerKey
            ];

        if (
            !hasMeaningfulValue(
                rawValue
            )
        ) {
            continue;
        }

        const normalizedValue =
            normalizeValue(
                rawValue,
                definition.type
            );

        if (
            normalizedValue === null ||
            normalizedValue === undefined ||
            (
                typeof normalizedValue ===
                    "string" &&
                normalizedValue === ""
            ) ||
            (
                Array.isArray(
                    normalizedValue
                ) &&
                normalizedValue.length === 0
            )
        ) {
            continue;
        }

        facts.push(
            createConfirmedFact({
                id:
                    definition.id,

                kind:
                    "confirmed",

                label:
                    definition.label,

                value:
                    normalizedValue,

                answerKey:
                    definition.answerKey,

                recordedAt:
                    resolveRecordedAt(
                        definition.answerKey,
                        options
                    ),

                metadata: {
                    mapperVersion:
                        FACT_MAPPER_VERSION,

                    source:
                        "protected-assessment-answer"
                }
            })
        );
    }

    return facts;
}

function indexFacts(facts) {
    return new Map(
        facts.map(
            (fact) => [
                fact.id,
                fact
            ]
        )
    );
}

function factValue(
    factIndex,
    identifier
) {
    return factIndex
        .get(identifier)
        ?.value;
}

function numericFactValue(
    factIndex,
    identifier
) {
    const value =
        factValue(
            factIndex,
            identifier
        );

    return (
        typeof value === "number" &&
        Number.isFinite(value)
    )
        ? value
        : null;
}

function createDerivedRecord({
    id,
    label,
    value,
    derivedFrom,
    derivationRuleId,
    metadata = {}
}) {
    return createDerivedFact({
        id,
        kind:
            "derived",
        label,
        value,
        derivedFrom,
        derivationRuleId,
        metadata: {
            mapperVersion:
                FACT_MAPPER_VERSION,

            deterministic:
                true,

            ...metadata
        }
    });
}

function deriveTotalReportedWorkforce(
    factIndex
) {
    const componentIds = [
        FACT_IDS.EMPLOYEE_COUNT,
        FACT_IDS.CONTRACT_WORKER_COUNT,
        FACT_IDS.INTERN_COUNT,
        FACT_IDS.APPRENTICE_COUNT
    ];

    const presentComponents =
        componentIds.filter(
            (identifier) =>
                numericFactValue(
                    factIndex,
                    identifier
                ) !== null
        );

    if (
        !presentComponents.includes(
            FACT_IDS.EMPLOYEE_COUNT
        )
    ) {
        return null;
    }

    const total =
        presentComponents.reduce(
            (
                sum,
                identifier
            ) => {
                return (
                    sum +
                    numericFactValue(
                        factIndex,
                        identifier
                    )
                );
            },
            0
        );

    return createDerivedRecord({
        id:
            FACT_IDS
                .TOTAL_REPORTED_WORKFORCE,

        label:
            "Total reported workforce",

        value:
            total,

        derivedFrom:
            presentComponents,

        derivationRuleId:
            DERIVATION_RULE_IDS
                .TOTAL_REPORTED_WORKFORCE
    });
}

function workforceSizeBand(
    employeeCount
) {
    if (employeeCount === 0) {
        return "0";
    }

    if (employeeCount <= 9) {
        return "1-9";
    }

    if (employeeCount <= 19) {
        return "10-19";
    }

    if (employeeCount <= 49) {
        return "20-49";
    }

    if (employeeCount <= 99) {
        return "50-99";
    }

    if (employeeCount <= 249) {
        return "100-249";
    }

    if (employeeCount <= 499) {
        return "250-499";
    }

    return "500+";
}

function deriveWorkforceSizeBand(
    factIndex
) {
    const employeeCount =
        numericFactValue(
            factIndex,
            FACT_IDS.EMPLOYEE_COUNT
        );

    if (employeeCount === null) {
        return null;
    }

    return createDerivedRecord({
        id:
            FACT_IDS
                .WORKFORCE_SIZE_BAND,

        label:
            "Employee workforce size band",

        value:
            workforceSizeBand(
                employeeCount
            ),

        derivedFrom: [
            FACT_IDS.EMPLOYEE_COUNT
        ],

        derivationRuleId:
            DERIVATION_RULE_IDS
                .WORKFORCE_SIZE_BAND
    });
}

function deriveBooleanThreshold({
    factIndex,
    sourceId,
    id,
    label,
    derivationRuleId,
    predicate
}) {
    const sourceValue =
        numericFactValue(
            factIndex,
            sourceId
        );

    if (sourceValue === null) {
        return null;
    }

    return createDerivedRecord({
        id,
        label,

        value:
            Boolean(
                predicate(
                    sourceValue
                )
            ),

        derivedFrom: [
            sourceId
        ],

        derivationRuleId
    });
}

function remoteBandIndicatesDistribution(
    value
) {
    const band =
        cleanText(value);

    return (
        band !== "" &&
        band !== "0" &&
        band !== "not-sure"
    );
}

function deriveDistributedWorkforce(
    factIndex
) {
    const workModel =
        cleanText(
            factValue(
                factIndex,
                FACT_IDS.WORK_MODEL
            )
        );

    const remoteBand =
        cleanText(
            factValue(
                factIndex,
                FACT_IDS
                    .REMOTE_WORKFORCE_BAND
            )
        );

    const remoteExact =
        numericFactValue(
            factIndex,
            FACT_IDS
                .REMOTE_WORKFORCE_PERCENTAGE
        );

    const derivedFrom = [];

    if (workModel) {
        derivedFrom.push(
            FACT_IDS.WORK_MODEL
        );
    }

    if (remoteBand) {
        derivedFrom.push(
            FACT_IDS
                .REMOTE_WORKFORCE_BAND
        );
    }

    if (remoteExact !== null) {
        derivedFrom.push(
            FACT_IDS
                .REMOTE_WORKFORCE_PERCENTAGE
        );
    }

    if (!derivedFrom.length) {
        return null;
    }

    const distributed =
        DISTRIBUTED_WORK_MODELS
            .includes(workModel) ||
        remoteBandIndicatesDistribution(
            remoteBand
        ) ||
        (
            remoteExact !== null &&
            remoteExact > 0
        );

    return createDerivedRecord({
        id:
            FACT_IDS
                .DISTRIBUTED_WORKFORCE,

        label:
            "Distributed workforce indicator",

        value:
            distributed,

        derivedFrom,

        derivationRuleId:
            DERIVATION_RULE_IDS
                .DISTRIBUTED_WORKFORCE
    });
}

function deriveRapidGrowth(
    factIndex
) {
    const hiringPlan =
        cleanText(
            factValue(
                factIndex,
                FACT_IDS.HIRING_PLAN
            )
        );

    if (!hiringPlan) {
        return null;
    }

    return createDerivedRecord({
        id:
            FACT_IDS.RAPID_GROWTH,

        label:
            "Rapid growth indicator",

        value:
            hiringPlan ===
                "Significant Growth",

        derivedFrom: [
            FACT_IDS.HIRING_PLAN
        ],

        derivationRuleId:
            DERIVATION_RULE_IDS
                .RAPID_GROWTH
    });
}

function deriveExpansionActivity(
    factIndex
) {
    const plans =
        factValue(
            factIndex,
            FACT_IDS.EXPANSION_PLANS
        );

    if (!Array.isArray(plans)) {
        return null;
    }

    const activePlans =
        plans.filter(
            (plan) =>
                ACTIVE_EXPANSION_PLANS
                    .includes(plan)
        );

    return createDerivedRecord({
        id:
            FACT_IDS.EXPANSION_ACTIVITY,

        label:
            "Expansion activity indicator",

        value:
            activePlans.length > 0,

        derivedFrom: [
            FACT_IDS.EXPANSION_PLANS
        ],

        derivationRuleId:
            DERIVATION_RULE_IDS
                .EXPANSION_ACTIVITY,

        metadata: {
            activePlans
        }
    });
}

function deriveFormalPeopleFunction(
    factIndex
) {
    const peopleFunction =
        cleanText(
            factValue(
                factIndex,
                FACT_IDS.PEOPLE_FUNCTION
            )
        );

    if (!peopleFunction) {
        return null;
    }

    return createDerivedRecord({
        id:
            FACT_IDS
                .FORMAL_PEOPLE_FUNCTION,

        label:
            "Formal People or HR function indicator",

        value:
            FORMAL_PEOPLE_FUNCTIONS
                .includes(
                    peopleFunction
                ),

        derivedFrom: [
            FACT_IDS.PEOPLE_FUNCTION
        ],

        derivationRuleId:
            DERIVATION_RULE_IDS
                .FORMAL_PEOPLE_FUNCTION
    });
}

function createDerivedFacts(
    confirmedFacts
) {
    const factIndex =
        indexFacts(
            confirmedFacts
        );

    return [
        deriveTotalReportedWorkforce(
            factIndex
        ),

        deriveWorkforceSizeBand(
            factIndex
        ),

        deriveBooleanThreshold({
            factIndex,

            sourceId:
                FACT_IDS.LOCATION_COUNT,

            id:
                FACT_IDS.MULTI_LOCATION,

            label:
                "Multi-location indicator",

            derivationRuleId:
                DERIVATION_RULE_IDS
                    .MULTI_LOCATION,

            predicate:
                (value) => value > 1
        }),

        deriveBooleanThreshold({
            factIndex,

            sourceId:
                FACT_IDS.COUNTRY_COUNT,

            id:
                FACT_IDS.MULTI_COUNTRY,

            label:
                "Multi-country indicator",

            derivationRuleId:
                DERIVATION_RULE_IDS
                    .MULTI_COUNTRY,

            predicate:
                (value) => value > 1
        }),

        deriveDistributedWorkforce(
            factIndex
        ),

        deriveRapidGrowth(
            factIndex
        ),

        deriveExpansionActivity(
            factIndex
        ),

        deriveFormalPeopleFunction(
            factIndex
        )
    ].filter(Boolean);
}

/**
 * Converts assessment answers into M2 confirmed and derived fact records.
 *
 * Missing, blank or invalid values are omitted. Their absence can then be
 * represented explicitly by later rule evaluations through missingFactIds.
 *
 * @param {Object} answers
 * @param {Object} options
 * @param {string|null} [options.recordedAt]
 * @param {Object} [options.recordedAtByAnswer]
 * @returns {{confirmed: ReadonlyArray, derived: ReadonlyArray}}
 */
export function createTraceabilityFacts(
    answers = {},
    options = {}
) {
    const normalizedAnswers =
        asObject(
            answers
        );

    const normalizedOptions =
        asObject(
            options
        );

    const confirmed =
        createConfirmedFacts(
            normalizedAnswers,
            normalizedOptions
        );

    const derived =
        createDerivedFacts(
            confirmed
        );

    return Object.freeze({
        confirmed:
            Object.freeze(
                [...confirmed]
            ),

        derived:
            Object.freeze(
                [...derived]
            )
    });
}

export default Object.freeze({
    version:
        FACT_MAPPER_VERSION,

    factIds:
        FACT_IDS,

    derivationRuleIds:
        DERIVATION_RULE_IDS,

    createTraceabilityFacts
});
