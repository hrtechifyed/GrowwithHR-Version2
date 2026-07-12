/**
 * =============================================================================
 * GrowWithHR Intelligence Platform
 * Shared Balanced Scorecard Framework
 * -----------------------------------------------------------------------------
 * File      : js/shared/frameworks/balanced-scorecard.js
 * Version   : 1.0.0
 * =============================================================================
 */

const balancedScorecard = Object.freeze({

    id: "FRAMEWORK-BSC",

    name: "Balanced Scorecard",

    version: "1.0.0",

    description:
        "Balanced Scorecard framework used for strategic performance management across the organization.",

    perspectives: [

        {
            id: "FINANCIAL",

            name: "Financial",

            objectives: [

                "Increase Revenue",

                "Improve Profitability",

                "Reduce Operating Costs",

                "Increase Shareholder Value"

            ]

        },

        {
            id: "CUSTOMER",

            name: "Customer",

            objectives: [

                "Improve Customer Satisfaction",

                "Increase Customer Retention",

                "Acquire New Customers",

                "Strengthen Brand Reputation"

            ]

        },

        {
            id: "PROCESS",

            name: "Internal Process",

            objectives: [

                "Improve Operational Efficiency",

                "Reduce Process Cycle Time",

                "Increase Quality",

                "Improve Compliance"

            ]

        },

        {
            id: "LEARNING",

            name: "Learning & Growth",

            objectives: [

                "Develop Employee Capability",

                "Strengthen Leadership",

                "Promote Innovation",

                "Improve Employee Engagement"

            ]

        }

    ],

    measurementCycle: [

        "Annual",

        "Quarterly",

        "Monthly"

    ],

    applicableModules: [

        "performance",

        "leadership",

        "learning",

        "culture",

        "rewards",

        "organization"

    ]

});

export default balancedScorecard;
