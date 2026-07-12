/**
 * =============================================================================
 * GrowWithHR Intelligence Platform
 * Shared OKR Framework
 * -----------------------------------------------------------------------------
 * File      : js/shared/frameworks/okr-framework.js
 * Version   : 1.0.0
 * =============================================================================
 */

const okrFramework = Object.freeze({

    id: "FRAMEWORK-OKR",

    name: "Objectives and Key Results",

    version: "1.0.0",

    description:
        "Standard OKR framework used across the GrowWithHR Intelligence Platform.",

    objectiveCriteria: [

        "Strategic",

        "Inspirational",

        "Time Bound",

        "Measurable",

        "Aligned"

    ],

    keyResultCriteria: [

        "Specific",

        "Quantifiable",

        "Outcome Focused",

        "Trackable",

        "Achievable"

    ],

    reviewCycle: [

        "Annual Planning",

        "Quarterly Planning",

        "Monthly Check-in",

        "Mid-cycle Review",

        "Quarter-end Review"

    ],

    alignmentLevels: [

        "Organization",

        "Business Unit",

        "Department",

        "Team",

        "Individual"

    ],

    recommendedMetrics: [

        "Revenue",

        "Customer Satisfaction",

        "Productivity",

        "Quality",

        "Learning",

        "Engagement",

        "Innovation"

    ],

    applicableModules: [

        "performance",

        "leadership",

        "learning",

        "culture",

        "rewards",

        "talent"

    ]

});

export default okrFramework;
