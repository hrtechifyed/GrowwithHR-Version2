/**
 * =============================================================================
 * GrowWithHR Intelligence Platform
 * Shared Compliance Playbook
 * -----------------------------------------------------------------------------
 * File      : js/shared/playbooks/compliance-playbook.js
 * Version   : 1.0.0
 * =============================================================================
 */

const compliancePlaybook = Object.freeze({

    id: "PLAYBOOK-COMPLIANCE",

    name: "Compliance Playbook",

    version: "1.0.0",

    description:
        "Standard compliance implementation playbook shared across the platform.",

    objective:
        "Establish a proactive and compliant workplace aligned with statutory and organizational requirements.",

    phases: [

        {

            phase: "Compliance Assessment",

            activities: [

                "Review Applicable Laws",

                "Identify Compliance Requirements",

                "Conduct Gap Assessment",

                "Assess Business Risks"

            ]

        },

        {

            phase: "Policy & Documentation",

            activities: [

                "Prepare Policies",

                "Prepare Registers",

                "Create Compliance Calendar",

                "Assign Responsibilities"

            ]

        },

        {

            phase: "Implementation",

            activities: [

                "Conduct Awareness Programs",

                "Deploy Policies",

                "Monitor Compliance Activities",

                "Maintain Documentation"

            ]

        },

        {

            phase: "Audit & Improvement",

            activities: [

                "Internal Compliance Audit",

                "Correct Non-Compliance",

                "Review Legal Updates",

                "Continuous Improvement"

            ]

        }

    ],

    applicableModules: [

        "compliance",

        "policy",

        "organization",

        "leadership"

    ]

});

export default compliancePlaybook;
