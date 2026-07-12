/**
 * =============================================================================
 * GrowWithHR Intelligence Platform
 * Shared Career Framework
 * -----------------------------------------------------------------------------
 * File      : js/shared/frameworks/career-framework.js
 * Version   : 1.0.0
 * =============================================================================
 */

const careerFramework = Object.freeze({

    id: "FRAMEWORK-CAREER",

    name: "Career Framework",

    version: "1.0.0",

    description:
        "Organization-wide career progression framework used across intelligence modules.",

    levels: [

        {
            code: "L1",

            title: "Entry Level",

            expectations: [

                "Learns role responsibilities",

                "Follows defined processes",

                "Develops functional skills"

            ]

        },

        {
            code: "L2",

            title: "Professional",

            expectations: [

                "Works independently",

                "Delivers consistent results",

                "Collaborates effectively"

            ]

        },

        {
            code: "L3",

            title: "Senior Professional",

            expectations: [

                "Leads complex assignments",

                "Mentors team members",

                "Improves business processes"

            ]

        },

        {
            code: "L4",

            title: "Manager",

            expectations: [

                "Leads teams",

                "Develops employees",

                "Drives departmental objectives"

            ]

        },

        {
            code: "L5",

            title: "Senior Leadership",

            expectations: [

                "Defines strategy",

                "Builds organizational capability",

                "Leads business transformation"

            ]

        }

    ],

    applicableModules: [

        "hiring",

        "performance",

        "leadership",

        "talent",

        "learning",

        "rewards"

    ]

});

export default careerFramework;
