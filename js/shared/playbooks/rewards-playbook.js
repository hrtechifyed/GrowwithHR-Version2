/**
 * =============================================================================
 * GrowWithHR Intelligence Platform
 * Shared Rewards Playbook
 * -----------------------------------------------------------------------------
 * File      : js/shared/playbooks/rewards-playbook.js
 * Version   : 1.0.0
 * =============================================================================
 */

const rewardsPlaybook = Object.freeze({

    id: "PLAYBOOK-REWARDS",

    name: "Rewards Playbook",

    version: "1.0.0",

    description:
        "Standard rewards and recognition playbook shared across the platform.",

    objective:
        "Design fair, competitive and performance-driven rewards programs.",

    phases: [

        {

            phase: "Rewards Strategy",

            activities: [

                "Review Business Goals",

                "Review Market Practices",

                "Define Rewards Philosophy",

                "Establish Governance"

            ]

        },

        {

            phase: "Compensation Design",

            activities: [

                "Salary Structure",

                "Salary Benchmarking",

                "Variable Pay Design",

                "Benefits Planning"

            ]

        },

        {

            phase: "Recognition Programs",

            activities: [

                "Spot Awards",

                "Service Awards",

                "Performance Recognition",

                "Peer Recognition"

            ]

        },

        {

            phase: "Review & Improvement",

            activities: [

                "Rewards Analytics",

                "Employee Feedback",

                "Market Review",

                "Continuous Improvement"

            ]

        }

    ],

    applicableModules: [

        "rewards",

        "performance",

        "leadership",

        "culture",

        "talent"

    ]

});

export default rewardsPlaybook;
