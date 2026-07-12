/**
 * =============================================================================
 * GrowWithHR Intelligence Platform
 * Shared Performance Framework
 * -----------------------------------------------------------------------------
 * File      : js/shared/frameworks/performance-framework.js
 * Version   : 1.0.0
 * =============================================================================
 */

const performanceFramework = Object.freeze({

    id: "FRAMEWORK-PERFORMANCE",

    name: "Performance Framework",

    version: "1.0.0",

    description:
        "Standard performance management framework shared across all intelligence modules.",

    lifecycle: [

        {
            phase: "Goal Setting",

            activities: [

                "Define Objectives",

                "Set KPIs",

                "Align Individual Goals",

                "Approval"

            ]

        },

        {
            phase: "Continuous Feedback",

            activities: [

                "One-on-One Meetings",

                "Manager Feedback",

                "Peer Feedback",

                "Coaching"

            ]

        },

        {
            phase: "Performance Review",

            activities: [

                "Self Assessment",

                "Manager Assessment",

                "Calibration",

                "Final Rating"

            ]

        },

        {
            phase: "Development",

            activities: [

                "Development Plan",

                "Learning Assignment",

                "Career Planning",

                "Recognition"

            ]

        }

    ],

    ratingScale: [

        "Outstanding",

        "Exceeds Expectations",

        "Meets Expectations",

        "Needs Improvement",

        "Unsatisfactory"

    ],

    applicableModules: [

        "performance",

        "leadership",

        "talent",

        "learning",

        "rewards"

    ]

});

export default performanceFramework;
