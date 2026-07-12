/**
 * =============================================================================
 * GrowWithHR Intelligence Platform
 * Shared Competency Framework
 * -----------------------------------------------------------------------------
 * File      : js/shared/frameworks/competency-framework.js
 * Version   : 1.0.0
 * =============================================================================
 */

const competencyFramework = Object.freeze({

    id: "FRAMEWORK-COMPETENCY",

    name: "Competency Framework",

    version: "1.0.0",

    description:
        "Organization-wide competency framework used across all intelligence modules.",

    categories: [

        {
            id: "CORE",

            name: "Core Competencies",

            competencies: [

                "Integrity",

                "Communication",

                "Collaboration",

                "Customer Focus",

                "Problem Solving"

            ]

        },

        {
            id: "FUNCTIONAL",

            name: "Functional Competencies",

            competencies: [

                "Technical Expertise",

                "Quality",

                "Planning",

                "Execution",

                "Innovation"

            ]

        },

        {
            id: "LEADERSHIP",

            name: "Leadership Competencies",

            competencies: [

                "Strategic Thinking",

                "Decision Making",

                "Coaching",

                "People Development",

                "Change Leadership"

            ]

        }

    ],

    levels: [

        "Beginner",

        "Intermediate",

        "Advanced",

        "Expert"

    ],

    applicableModules: [

        "hiring",

        "performance",

        "leadership",

        "talent",

        "learning",

        "culture"

    ]

});

export default competencyFramework;
