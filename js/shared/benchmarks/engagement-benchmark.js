/**
 * =============================================================================
 * GrowWithHR Intelligence Platform
 * Shared Engagement Benchmark
 * -----------------------------------------------------------------------------
 * File      : js/shared/benchmarks/engagement-benchmark.js
 * Version   : 1.0.0
 * =============================================================================
 */

const engagementBenchmark = Object.freeze({

    id: "BENCHMARK-ENGAGEMENT",

    name: "Engagement Benchmark",

    version: "1.0.0",

    description:
        "Standard employee engagement benchmarks shared across intelligence modules.",

    metrics: [

        {
            metric: "Employee Engagement Score",

            unit: "%",

            target: 85
        },

        {
            metric: "Employee Satisfaction",

            unit: "%",

            target: 90
        },

        {
            metric: "Employee Net Promoter Score",

            unit: "eNPS",

            target: 50
        },

        {
            metric: "Manager Effectiveness",

            unit: "%",

            target: 90
        },

        {
            metric: "Recognition Participation",

            unit: "%",

            target: 80
        },

        {
            metric: "Employee Wellbeing Index",

            unit: "%",

            target: 85
        }

    ],

    applicableModules: [

        "culture",

        "leadership",

        "learning",

        "performance",

        "rewards"

    ]

});

export default engagementBenchmark;
