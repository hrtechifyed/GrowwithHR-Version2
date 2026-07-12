/**
 * =============================================================================
 * GrowWithHR Intelligence Platform
 * Shared Culture Playbook
 * -----------------------------------------------------------------------------
 * File      : js/shared/playbooks/culture-playbook.js
 * Version   : 1.0.0
 * =============================================================================
 */

const culturePlaybook = Object.freeze({

    id: "PLAYBOOK-CULTURE",

    name: "Culture Playbook",

    version: "1.0.0",

    description:
        "Standard organizational culture implementation playbook shared across the platform.",

    objective:
        "Build a high-performing, values-driven and employee-centric organizational culture.",

    phases: [

        {

            phase: "Culture Assessment",

            activities: [

                "Assess Current Culture",

                "Employee Feedback",

                "Leadership Assessment",

                "Culture Gap Analysis"

            ]

        },

        {

            phase: "Culture Design",

            activities: [

                "Define Core Values",

                "Define Expected Behaviours",

                "Leadership Alignment",

                "Communication Strategy"

            ]

        },

        {

            phase: "Culture Implementation",

            activities: [

                "Leadership Workshops",

                "Employee Engagement Programs",

                "Recognition Initiatives",

                "Change Management"

            ]

        },

        {

            phase: "Culture Measurement",

            activities: [

                "Pulse Surveys",

                "Engagement Analysis",

                "Culture Metrics Review",

                "Continuous Improvement"

            ]

        }

    ],

    applicableModules: [

        "culture",

        "leadership",

        "learning",

        "performance",

        "rewards",

        "organization"

    ]

});

export default culturePlaybook;
