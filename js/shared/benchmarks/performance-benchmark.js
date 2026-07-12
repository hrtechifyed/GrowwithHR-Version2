/**
 * =============================================================================
 * GrowWithHR Intelligence Platform
 * Shared Performance Benchmark
 * -----------------------------------------------------------------------------
 * File      : js/shared/benchmarks/performance-benchmark.js
 * Version   : 1.0.0
 * =============================================================================
 */

const performanceBenchmark = Object.freeze({

    id: "BENCHMARK-PERFORMANCE",

    name: "Performance Benchmark",

    version: "1.0.0",

    description:
        "Standard performance management benchmarks shared across intelligence modules.",

    metrics: [

        {
            metric: "Goal Achievement",

            unit: "%",

            target: 90
        },

        {
            metric: "High Performer Ratio",

            unit: "%",

            target: 20
        },

        {
            metric: "Performance Review Completion",

            unit: "%",

            target: 100
        },

        {
            metric: "Development Plan Completion",

            unit: "%",

            target: 95
        },

        {
            metric: "Manager Feedback Frequency",

            unit: "Per Quarter",

            target: 3
        },

        {
            metric: "Employee Performance Improvement",

            unit: "%",

            target: 15
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

export default performanceBenchmark;
