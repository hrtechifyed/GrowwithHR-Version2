/**
 * =============================================================================
 * GrowWithHR Intelligence Platform
 * Shared Hiring Playbook
 * -----------------------------------------------------------------------------
 * File      : js/shared/playbooks/hiring-playbook.js
 * Version   : 1.0.0
 * =============================================================================
 */

const hiringPlaybook = Object.freeze({

    id: "PLAYBOOK-HIRING",

    name: "Hiring Playbook",

    version: "1.0.0",

    description:
        "Standard hiring implementation playbook shared across the platform.",

    objective:
        "Enable a structured, consistent and compliant hiring process.",

    phases: [

        {

            phase: "Workforce Planning",

            activities: [

                "Identify Hiring Need",

                "Obtain Hiring Approval",

                "Define Budget",

                "Finalize Hiring Timeline"

            ]

        },

        {

            phase: "Job Definition",

            activities: [

                "Create Job Description",

                "Define Competencies",

                "Define Selection Criteria",

                "Determine Compensation Range"

            ]

        },

        {

            phase: "Candidate Sourcing",

            activities: [

                "Internal Hiring",

                "Employee Referrals",

                "Job Portals",

                "Recruitment Partners"

            ]

        },

        {

            phase: "Selection",

            activities: [

                "Resume Screening",

                "Technical Assessment",

                "Behavioral Interview",

                "Final Interview"

            ]

        },

        {

            phase: "Offer & Onboarding",

            activities: [

                "Reference Check",

                "Issue Offer",

                "Pre-Joining Documentation",

                "Employee Onboarding"

            ]

        }

    ],

    applicableModules: [

        "hiring",

        "talent",

        "learning",

        "performance"

    ]

});

export default hiringPlaybook;
