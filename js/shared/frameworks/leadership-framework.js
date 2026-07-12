/**
 * =============================================================================
 * GrowWithHR Intelligence Platform
 * Shared Leadership Framework
 * -----------------------------------------------------------------------------
 * File      : js/shared/frameworks/leadership-framework.js
 * Version   : 1.0.0
 * =============================================================================
 */

const leadershipFramework = Object.freeze({

    id: "FRAMEWORK-LEADERSHIP",

    name: "Leadership Framework",

    version: "1.0.0",

    description:
        "Standard leadership capability framework shared across the platform.",

    pillars: [

        {
            code: "VISION",

            title: "Vision & Strategy",

            capabilities: [

                "Strategic Thinking",

                "Business Acumen",

                "Decision Making",

                "Innovation"

            ]

        },

        {
            code: "PEOPLE",

            title: "People Leadership",

            capabilities: [

                "Coaching",

                "Delegation",

                "Performance Management",

                "Conflict Resolution"

            ]

        },

        {
            code: "EXECUTION",

            title: "Execution Excellence",

            capabilities: [

                "Planning",

                "Accountability",

                "Risk Management",

                "Continuous Improvement"

            ]

        },

        {
            code: "CULTURE",

            title: "Culture & Values",

            capabilities: [

                "Integrity",

                "Collaboration",

                "Employee Engagement",

                "Change Leadership"

            ]

        }

    ],

    leadershipLevels: [

        "Emerging Leader",

        "Team Leader",

        "Manager",

        "Senior Manager",

        "Director",

        "Executive"

    ],

    applicableModules: [

        "leadership",

        "performance",

        "talent",

        "learning",

        "culture",

        "rewards"

    ]

});

export default leadershipFramework;
