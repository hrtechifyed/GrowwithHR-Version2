/**
 * =============================================================================
 * GrowWithHR Intelligence Platform
 * Shared Leadership Playbook
 * -----------------------------------------------------------------------------
 * File      : js/shared/playbooks/leadership-playbook.js
 * Version   : 1.0.0
 * =============================================================================
 */

const leadershipPlaybook = Object.freeze({

    id: "PLAYBOOK-LEADERSHIP",

    name: "Leadership Playbook",

    version: "1.0.0",

    description:
        "Standard leadership development playbook shared across the platform.",

    objective:
        "Develop effective leaders capable of driving business performance and people growth.",

    phases: [

        {

            phase: "Leadership Assessment",

            activities: [

                "Leadership Competency Assessment",

                "360 Degree Feedback",

                "Potential Assessment",

                "Gap Analysis"

            ]

        },

        {

            phase: "Leadership Development",

            activities: [

                "Leadership Learning Plan",

                "Executive Coaching",

                "Mentoring",

                "Action Learning"

            ]

        },

        {

            phase: "Leadership Practice",

            activities: [

                "Strategic Projects",

                "Cross Functional Assignments",

                "Team Leadership",

                "Decision Making"

            ]

        },

        {

            phase: "Leadership Evaluation",

            activities: [

                "Performance Review",

                "Leadership Effectiveness",

                "Business Outcomes",

                "Succession Readiness"

            ]

        }

    ],

    applicableModules: [

        "leadership",

        "performance",

        "learning",

        "talent",

        "culture"

    ]

});

export default leadershipPlaybook;
