/* ==========================================================
   GrowWithHR
   Executive Advisory Assessment Definitions

   Responsibility:
   - Storage-key definitions
   - Application URLs
   - Assessment option catalogues
   - Assessment chapters
   - Assessment moment metadata
   - Default assessment state factories

   This module contains configuration only.
   It must not access the DOM, localStorage, PDF services or
   email-delivery services.
========================================================== */

(() => {
    "use strict";

    const modules =
        window.GrowWithHRModules =
        window.GrowWithHRModules || {};

    /**
     * Recursively freezes an object so assessment definitions cannot be
     * accidentally changed by the controller or another module.
     *
     * @param {*} value
     * @returns {*}
     */
    function deepFreeze(value) {
        if (
            !value ||
            typeof value !== "object" ||
            Object.isFrozen(value)
        ) {
            return value;
        }

        Object.getOwnPropertyNames(value).forEach((propertyName) => {
            deepFreeze(value[propertyName]);
        });

        return Object.freeze(value);
    }

    const STORAGE_KEY =
        "growwithhr-advisory-briefing-v2";

    const REPORT_KEY =
        "growwithhr-report";

    const LEAD_KEY =
        "growwithhr-lead";

    const INDUSTRY_CACHE_KEY =
        "growwithhr-industry-catalog-v1";

    const DELIVERY_KEY =
        "growwithhr-advisory-delivery-v1";

    const DEFAULT_REPORT_URL =
        "executive-advisory-report.html";

    const INDUSTRY_DATA_URL =
        "data/industries.json";

    /**
     * Internal saved-state schema.
     *
     * Increase this value only when the shape of the persisted assessment
     * data changes and a migration or safe reset has been implemented.
     */
    const STATE_SCHEMA_VERSION = 1;

    /**
     * This fallback is used only when the JSON catalogue cannot be loaded.
     * data/industries.json remains the canonical industry source.
     */
    const INDUSTRY_FALLBACK = [
        {
            id: "information_technology",
            name: "Information Technology / SaaS",
            displayLabel: "Information Technology / SaaS",
            category: "Technology & Digital",
            aliases: [
                "IT services",
                "software company",
                "software services",
                "SaaS"
            ],
            ruleProfile: "Information Technology / SaaS"
        },
        {
            id: "semiconductor",
            name: "Semiconductor",
            displayLabel: "Semiconductor",
            category: "Technology & Digital",
            aliases: [
                "chips",
                "chip design",
                "chip manufacturing",
                "VLSI",
                "microelectronics"
            ],
            ruleProfile: "Semiconductor"
        },
        {
            id: "consulting_professional_services",
            name: "Consulting & Professional Services",
            displayLabel: "Consulting & Professional Services",
            category: "Professional & Business Services",
            aliases: [
                "consulting",
                "professional services",
                "advisory"
            ],
            ruleProfile: "Consulting & Professional Services"
        },
        {
            id: "manufacturing",
            name: "Manufacturing",
            displayLabel: "Manufacturing",
            category: "Industrial & Manufacturing",
            aliases: [
                "factory",
                "industrial manufacturing",
                "production"
            ],
            ruleProfile: "Manufacturing"
        },
        {
            id: "healthcare",
            name: "Healthcare",
            displayLabel: "Healthcare",
            category: "Healthcare & Life Sciences",
            aliases: [
                "hospital",
                "clinic",
                "health services"
            ],
            ruleProfile: "Healthcare"
        },
        {
            id: "financial_services",
            name: "Financial Services",
            displayLabel: "Financial Services",
            category: "Financial Services",
            aliases: [
                "finance",
                "banking",
                "NBFC"
            ],
            ruleProfile: "Financial Services"
        },
        {
            id: "other",
            name: "Other",
            displayLabel: "Other / Not listed",
            category: "Other",
            aliases: [
                "other",
                "not listed",
                "none of these"
            ],
            ruleProfile: "Other"
        }
    ];

    const STATES = [
        "Andhra Pradesh",
        "Arunachal Pradesh",
        "Assam",
        "Bihar",
        "Chhattisgarh",
        "Goa",
        "Gujarat",
        "Haryana",
        "Himachal Pradesh",
        "Jharkhand",
        "Karnataka",
        "Kerala",
        "Madhya Pradesh",
        "Maharashtra",
        "Manipur",
        "Meghalaya",
        "Mizoram",
        "Nagaland",
        "Odisha",
        "Punjab",
        "Rajasthan",
        "Sikkim",
        "Tamil Nadu",
        "Telangana",
        "Tripura",
        "Uttar Pradesh",
        "Uttarakhand",
        "West Bengal",
        "Andaman and Nicobar Islands",
        "Chandigarh",
        "Dadra and Nagar Haveli and Daman and Diu",
        "Delhi (NCT)",
        "Jammu and Kashmir",
        "Ladakh",
        "Lakshadweep",
        "Puducherry"
    ];

    const ENTITY_OPTIONS = [
        [
            "Private Limited",
            "Private Limited"
        ],
        [
            "Public Limited",
            "Public Limited"
        ],
        [
            "LLP",
            "LLP"
        ],
        [
            "One Person Company",
            "One Person Company"
        ],
        [
            "DPIIT Recognized Startup",
            "Recognised startup"
        ],
        [
            "Partnership",
            "Partnership"
        ],
        [
            "Proprietorship",
            "Proprietorship"
        ],
        [
            "Trust / Society",
            "Trust or society"
        ],
        [
            "Government / PSU",
            "Government or PSU"
        ],
        [
            "Other",
            "Other"
        ],
        [
            "Not Sure",
            "Not sure"
        ]
    ];

    const FUNDING_OPTIONS = [
        [
            "Bootstrapped",
            "Self-funded or bootstrapped"
        ],
        [
            "Seed",
            "Seed"
        ],
        [
            "Series A",
            "Series A"
        ],
        [
            "Series B",
            "Series B"
        ],
        [
            "Series C+",
            "Series C or later"
        ],
        [
            "Public",
            "Publicly listed"
        ],
        [
            "Not Applicable",
            "Not applicable"
        ],
        [
            "Not Sure",
            "Not sure"
        ]
    ];

    const WORK_MODEL_OPTIONS = [
        [
            "Office Based",
            "Mainly on-site",
            "Most people work from a shared workplace."
        ],
        [
            "Hybrid",
            "Hybrid",
            "People divide their time between on-site and remote work."
        ],
        [
            "Remote",
            "Mainly remote",
            "Most people work away from a permanent workplace."
        ],
        [
            "Field Workforce",
            "Field-based",
            "A large part of the team works at customer or field locations."
        ],
        [
            "Manufacturing / Plant",
            "Plant or manufacturing",
            "Work is primarily delivered from plants or production sites."
        ],
        [
            "Mixed",
            "Mixed",
            "The organisation uses several different working models."
        ]
    ];

    const REMOTE_OPTIONS = [
        [
            "0",
            "None"
        ],
        [
            "1-24",
            "Less than 25%"
        ],
        [
            "25-50",
            "25–50%"
        ],
        [
            "51-75",
            "51–75%"
        ],
        [
            "76-99",
            "More than 75%"
        ],
        [
            "100",
            "Fully remote"
        ],
        [
            "not-sure",
            "Not sure"
        ],
        [
            "exact",
            "Enter an exact percentage"
        ]
    ];

    const HIRING_OPTIONS = [
        [
            "Significant Growth",
            "Grow significantly",
            "A meaningful increase in team size is expected."
        ],
        [
            "Moderate Growth",
            "Grow steadily",
            "The team will grow at a measured pace."
        ],
        [
            "Selective Hiring",
            "Hire selectively",
            "Hiring will focus on a small number of priority roles."
        ],
        [
            "Maintain Current Size",
            "Stay about the same size",
            "The organisation expects limited net headcount growth."
        ],
        [
            "Unsure; Market drives hiring needs",
            "Unsure or market-led",
            "Hiring will depend on market and business conditions."
        ]
    ];

    const EXPANSION_OPTIONS = [
        [
            "new-locations",
            "Open new locations"
        ],
        [
            "new-markets",
            "Enter new markets or countries"
        ],
        [
            "new-products",
            "Introduce new products or services"
        ],
        [
            "scale-operations",
            "Scale current operations"
        ],
        [
            "restructure",
            "Restructure or improve efficiency"
        ],
        [
            "no-major-expansion",
            "No major expansion planned"
        ],
        [
            "still-deciding",
            "Still deciding"
        ]
    ];

    const PEOPLE_FUNCTION_OPTIONS = [
        [
            "Dedicated HR Team",
            "Dedicated HR or People team",
            "A team owns the organisation's People or HR work."
        ],
        [
            "Single HR/People Professional",
            "One HR or People professional",
            "One dedicated person leads the function."
        ],
        [
            "Founder Led",
            "Founder-led",
            "Founders or senior leaders make most people decisions."
        ],
        [
            "Shared Admin Function",
            "Shared with administration or operations",
            "People work is combined with another business function."
        ],
        [
            "External Consultant",
            "Supported by an external consultant",
            "External specialists provide ongoing HR support."
        ],
        [
            "No Formal HR/People Function",
            "No formal HR or People function",
            "There is no defined owner or structure today."
        ]
    ];

    const PRIORITY_OPTIONS = [
        [
            "hiring-onboarding",
            "Hiring and onboarding"
        ],
        [
            "policies-compliance",
            "Policies and compliance"
        ],
        [
            "performance-rewards",
            "Performance and rewards"
        ],
        [
            "manager-capability",
            "Manager capability"
        ],
        [
            "culture-engagement",
            "Culture and engagement"
        ],
        [
            "hr-operations-technology",
            "HR operations and technology"
        ],
        [
            "workforce-planning",
            "Workforce planning"
        ],
        [
            "organisation-design",
            "Organisation design"
        ]
    ];

    const ROLE_LABELS = {
        "founder-business-leader":
            "Founder or business leader",

        "hr-people-leader":
            "HR or People leader",

        "operations-leader":
            "Operations leader",

        "finance-leader":
            "Finance leader",

        "consultant-advisor":
            "Consultant or advisor",

        "other":
            "Other"
    };

    /**
     * Moment definitions identify controller methods by name.
     *
     * Using method names instead of direct function references allows this
     * configuration module to remain independent from the controller class.
     */
    const MOMENTS = [
        {
            id: "business-basics",
            chapter: 0,
            eyebrow: "Your business",
            title: "Let’s start with the business you’re building.",
            description:
                "These basics help us keep every recommendation grounded " +
                "in your organisation’s reality.",
            renderMethod: "renderBusinessBasics",
            validateMethod: "validateBusinessBasics"
        },
        {
            id: "business-stage",
            chapter: 0,
            eyebrow: "Your business",
            title: "Give us a little context around its stage.",
            description:
                "Approximate answers are enough. Choose “Not sure” " +
                "whenever you do not have the information.",
            renderMethod: "renderBusinessStage",
            validateMethod: "validateBusinessStage"
        },
        {
            id: "workforce",
            chapter: 1,
            eyebrow: "Your people",
            title: "Who helps the organisation deliver?",
            description:
                "Start with the core team. Add other workforce groups " +
                "only when they apply.",
            renderMethod: "renderWorkforce",
            validateMethod: "validateWorkforce"
        },
        {
            id: "working-model",
            chapter: 1,
            eyebrow: "Your people",
            title: "How does the team usually work?",
            description:
                "Choose what best reflects everyday working arrangements " +
                "rather than formal policy.",
            renderMethod: "renderWorkingModel",
            validateMethod: "validateWorkingModel"
        },
        {
            id: "operating-footprint",
            chapter: 2,
            eyebrow: "How work happens",
            title: "How distributed are your operations?",
            description:
                "This helps us understand the complexity of communication, " +
                "policy and people operations across the organisation.",
            renderMethod: "renderOperatingFootprint",
            validateMethod: "validateOperatingFootprint"
        },
        {
            id: "growth-direction",
            chapter: 3,
            eyebrow: "Your next chapter",
            title: "What is likely to change next?",
            description:
                "Your future direction helps us prioritise the people " +
                "foundations you may need next—not only what you need today.",
            renderMethod: "renderGrowthDirection",
            validateMethod: "validateGrowthDirection"
        },
        {
            id: "people-readiness",
            chapter: 3,
            eyebrow: "Your next chapter",
            title: "How are people decisions supported today?",
            description:
                "This final step helps us make the advisory practical for " +
                "your current level of People and HR support.",
            renderMethod: "renderPeopleReadiness",
            validateMethod: "validatePeopleReadiness"
        }
    ];

    const CHAPTERS = [
        "Your business",
        "Your people",
        "How work happens",
        "Your next chapter"
    ];

    /**
     * Creates a fresh assessment-answer object.
     *
     * A factory is used so every new assessment receives new array instances.
     *
     * @returns {Object}
     */
    function createInitialAnswers() {
        return {
            locations: "1",
            countries: "1",
            expansionPlans: [],
            priorities: []
        };
    }

    /**
     * Creates a fresh lead object.
     *
     * @returns {Object}
     */
    function createInitialLead() {
        return {
            name: "",
            email: "",
            role: "",
            marketingConsent: false
        };
    }

    /**
     * Creates the UI-only state used by the static assessment experience.
     *
     * @returns {Object}
     */
    function createInitialUiState() {
        return {
            showSupplementalWorkforce: false
        };
    }

    /**
     * Creates the initial delivery-state object.
     *
     * @returns {Object}
     */
    function createInitialDeliveryState() {
        return {};
    }

    /**
     * Creates a complete fresh assessment-state object.
     *
     * This is supplied here temporarily for compatibility. Mutable-state
     * operations will later move to assessment-state.js.
     *
     * @returns {Object}
     */
    function createInitialAssessmentState() {
        return {
            schemaVersion: STATE_SCHEMA_VERSION,
            currentMoment: 0,
            started: false,
            completed: false,
            answers: createInitialAnswers(),
            lead: createInitialLead(),
            ui: createInitialUiState(),
            delivery: createInitialDeliveryState()
        };
    }

    const AssessmentDefinition = {
        moduleVersion: "1.0.0",

        STATE_SCHEMA_VERSION,

        STORAGE_KEY,
        REPORT_KEY,
        LEAD_KEY,
        INDUSTRY_CACHE_KEY,
        DELIVERY_KEY,

        DEFAULT_REPORT_URL,
        INDUSTRY_DATA_URL,

        INDUSTRY_FALLBACK,
        STATES,
        ENTITY_OPTIONS,
        FUNDING_OPTIONS,
        WORK_MODEL_OPTIONS,
        REMOTE_OPTIONS,
        HIRING_OPTIONS,
        EXPANSION_OPTIONS,
        PEOPLE_FUNCTION_OPTIONS,
        PRIORITY_OPTIONS,
        ROLE_LABELS,
        MOMENTS,
        CHAPTERS,

        createInitialAnswers,
        createInitialLead,
        createInitialUiState,
        createInitialDeliveryState,
        createInitialAssessmentState
    };

    deepFreeze(AssessmentDefinition.INDUSTRY_FALLBACK);
    deepFreeze(AssessmentDefinition.STATES);
    deepFreeze(AssessmentDefinition.ENTITY_OPTIONS);
    deepFreeze(AssessmentDefinition.FUNDING_OPTIONS);
    deepFreeze(AssessmentDefinition.WORK_MODEL_OPTIONS);
    deepFreeze(AssessmentDefinition.REMOTE_OPTIONS);
    deepFreeze(AssessmentDefinition.HIRING_OPTIONS);
    deepFreeze(AssessmentDefinition.EXPANSION_OPTIONS);
    deepFreeze(AssessmentDefinition.PEOPLE_FUNCTION_OPTIONS);
    deepFreeze(AssessmentDefinition.PRIORITY_OPTIONS);
    deepFreeze(AssessmentDefinition.ROLE_LABELS);
    deepFreeze(AssessmentDefinition.MOMENTS);
    deepFreeze(AssessmentDefinition.CHAPTERS);

    modules.AssessmentDefinition =
        Object.freeze(AssessmentDefinition);
})();
