/**
 * =============================================================================
 * GrowWithHR Intelligence Platform
 * Shared Attrition Benchmark
 * -----------------------------------------------------------------------------
 * File      : js/shared/benchmarks/attrition-benchmark.js
 * Version   : 1.0.0
 * =============================================================================
 */

const attritionBenchmark = Object.freeze({

    id: "BENCHMARK-ATTRITION",

    name: "Attrition Benchmark",

    version: "1.0.0",

    description:
        "Standard employee attrition benchmarks used across the intelligence platform.",

    metrics: [

        {
            metric: "Overall Attrition",

            unit: "%",

            target: 12
        },

        {
            metric: "Voluntary Attrition",

            unit: "%",

            target: 8
        },

        {
            metric: "Early Attrition (First Year)",

            unit: "%",

            target: 10
        },

        {
            metric: "Critical Talent Attrition",

            unit: "%",

            target: 5
        },

        {
            metric: "Leadership Attrition",

            unit: "%",

            target: 5
        },

        {
            metric: "Employee Retention",

            unit: "%",

            target: 90
        }

    ],

    applicableModules: [

        "talent",

        "performance",

        "culture",

        "leadership",

        "rewards"

    ]

});

export default attritionBenchmark;
