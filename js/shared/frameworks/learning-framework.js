/**
 * =============================================================================
 * GrowWithHR Intelligence Platform
 * Shared Learning Framework
 * -----------------------------------------------------------------------------
 * File      : js/shared/frameworks/learning-framework.js
 * Version   : 1.0.0
 * =============================================================================
 */

const learningFramework = Object.freeze({

    id: "FRAMEWORK-LEARNING",

    name: "Learning Framework",

    version: "1.0.0",

    description:
        "Organization-wide learning and development framework shared across intelligence modules.",

    lifecycle: [

        {
            phase: "Identify",

            activities: [

                "Training Needs Analysis",

                "Skill Gap Assessment",

                "Competency Review",

                "Performance Inputs"

            ]

        },

        {
            phase: "Plan",

            activities: [

                "Learning Objectives",

                "Learning Paths",

                "Development Plans",

                "Program Scheduling"

            ]

        },

        {
            phase: "Deliver",

            activities: [

                "Instructor-led Training",

                "E-Learning",

                "Workshops",

                "Coaching & Mentoring"

            ]

        },

        {
            phase: "Evaluate",

            activities: [

                "Knowledge Assessment",

                "Behavior Change",

                "Performance Impact",

                "ROI Evaluation"

            ]

        }

    ],

    deliveryMethods: [

        "Classroom",

        "Virtual",

        "Self-Paced",

        "On-the-Job",

        "Coaching",

        "Mentoring"

    ],

    applicableModules: [

        "learning",

        "performance",

        "leadership",

        "talent",

        "culture"

    ]

});

export default learningFramework;
