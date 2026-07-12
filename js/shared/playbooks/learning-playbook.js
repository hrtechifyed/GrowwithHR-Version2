/**
 * =============================================================================
 * GrowWithHR Intelligence Platform
 * Shared Learning Playbook
 * -----------------------------------------------------------------------------
 * File      : js/shared/playbooks/learning-playbook.js
 * Version   : 1.0.0
 * =============================================================================
 */

const learningPlaybook = Object.freeze({

    id: "PLAYBOOK-LEARNING",

    name: "Learning Playbook",

    version: "1.0.0",

    description:
        "Standard learning and development playbook shared across the platform.",

    objective:
        "Develop employee capability through structured learning, development and continuous improvement.",

    phases: [

        {

            phase: "Learning Needs Assessment",

            activities: [

                "Identify Skill Gaps",

                "Review Performance Inputs",

                "Assess Competencies",

                "Prioritize Learning Needs"

            ]

        },

        {

            phase: "Learning Planning",

            activities: [

                "Create Learning Plan",

                "Define Learning Objectives",

                "Select Delivery Methods",

                "Schedule Programs"

            ]

        },

        {

            phase: "Learning Delivery",

            activities: [

                "Conduct Training",

                "Assign E-Learning",

                "Coaching & Mentoring",

                "On-the-Job Learning"

            ]

        },

        {

            phase: "Learning Evaluation",

            activities: [

                "Knowledge Assessment",

                "Collect Feedback",

                "Measure Learning Effectiveness",

                "Update Development Plans"

            ]

        }

    ],

    applicableModules: [

        "learning",

        "performance",

        "leadership",

        "talent",

        "culture"

    ]

});

export default learningPlaybook;
