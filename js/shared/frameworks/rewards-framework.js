/**
 * =============================================================================
 * GrowWithHR Intelligence Platform
 * Shared Rewards Framework
 * -----------------------------------------------------------------------------
 * File      : js/shared/frameworks/rewards-framework.js
 * Version   : 1.0.0
 * =============================================================================
 */

const rewardsFramework = Object.freeze({

    id: "FRAMEWORK-REWARDS",

    name: "Rewards Framework",

    version: "1.0.0",

    description:
        "Organization-wide rewards and recognition framework shared across intelligence modules.",

    components: [

        {
            category: "Fixed Compensation",

            elements: [

                "Salary Structure",

                "Salary Bands",

                "Job Evaluation",

                "Market Benchmarking"

            ]

        },

        {
            category: "Variable Compensation",

            elements: [

                "Performance Bonus",

                "Sales Incentives",

                "Profit Sharing",

                "Retention Bonus"

            ]

        },

        {
            category: "Benefits",

            elements: [

                "Insurance",

                "Retirement Benefits",

                "Leave Benefits",

                "Employee Wellness"

            ]

        },

        {
            category: "Recognition",

            elements: [

                "Spot Awards",

                "Service Awards",

                "Recognition Programs",

                "Non-Monetary Rewards"

            ]

        }

    ],

    principles: [

        "Internal Equity",

        "External Competitiveness",

        "Performance Orientation",

        "Transparency",

        "Compliance"

    ],

    applicableModules: [

        "rewards",

        "performance",

        "talent",

        "leadership",

        "culture"

    ]

});

export default rewardsFramework;
