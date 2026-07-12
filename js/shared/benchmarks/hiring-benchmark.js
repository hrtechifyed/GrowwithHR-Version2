/**
 * =============================================================================
 * GrowWithHR Intelligence Platform
 * Shared Hiring Benchmark
 * -----------------------------------------------------------------------------
 * File      : js/shared/benchmarks/hiring-benchmark.js
 * Version   : 1.0.0
 * =============================================================================
 */

const hiringBenchmark = Object.freeze({

    id: "BENCHMARK-HIRING",

    name: "Hiring Benchmark",

    version: "1.0.0",

    description:
        "Standard hiring benchmarks used across hiring intelligence.",

    metrics: [

        {
            metric: "Time to Hire",

            unit: "Days",

            target: 30
        },

        {
            metric: "Time to Fill",

            unit: "Days",

            target: 45
        },

        {
            metric: "Offer Acceptance Rate",

            unit: "%",

            target: 90
        },

        {
            metric: "Quality of Hire",

            unit: "%",

            target: 85
        },

        {
            metric: "Cost per Hire",

            unit: "Relative Index",

            target: 100
        },

        {
            metric: "Hiring Manager Satisfaction",

            unit: "%",

            target: 90
        }

    ],

    applicableModules: [

        "hiring",

        "talent",

        "performance"

    ]

});

export default hiringBenchmark;
