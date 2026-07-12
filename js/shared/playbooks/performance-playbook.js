/**
 * =============================================================================
 * GrowWithHR Intelligence Platform
 * Shared Performance Playbook
 * -----------------------------------------------------------------------------
 * File      : js/shared/playbooks/performance-playbook.js
 * Version   : 1.0.0
 * =============================================================================
 */

const performancePlaybook = Object.freeze({

    id: "PLAYBOOK-PERFORMANCE",

    name: "Performance Playbook",

    version: "1.0.0",

    description:
        "Standard performance management playbook shared across the platform.",

    objective:
        "Establish a continuous performance management process that aligns employee goals with business objectives.",

    phases: [

        {

            phase: "Planning",

            activities: [

                "Set Business Goals",

                "Define Individual Objectives",

                "Establish KPIs",

                "Obtain Goal Approval"

            ]

        },

        {

            phase: "Execution",

            activities: [

                "Track Progress",

                "Conduct One-on-One Meetings",

                "Provide Continuous Feedback",

                "Remove Performance Barriers"

            ]

        },

        {

            phase: "Review",

            activities: [

                "Employee Self Review",

                "Manager Assessment",

                "Calibration Meeting",

                "Finalize Ratings"

            ]

        },

        {

            phase: "Development",

            activities: [

                "Create Development Plan",

                "Assign Learning Activities",

                "Career Discussion",

                "Recognition & Rewards"

            ]

        }

    ],

    applicableModules: [

        "performance",

        "leadership",

        "learning",

        "rewards",

        "talent"

    ]

});

export default performancePlaybook;
