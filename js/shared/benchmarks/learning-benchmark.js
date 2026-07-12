/**
 * =============================================================================
 * GrowWithHR Intelligence Platform
 * Shared Learning Benchmark
 * -----------------------------------------------------------------------------
 * File      : js/shared/benchmarks/learning-benchmark.js
 * Version   : 1.0.0
 * =============================================================================
 */

const learningBenchmark = Object.freeze({

    id: "BENCHMARK-LEARNING",

    name: "Learning Benchmark",

    version: "1.0.0",

    description:
        "Standard learning and development benchmarks shared across intelligence modules.",

    metrics: [

        {
            metric: "Training Completion Rate",

            unit: "%",

            target: 95
        },

        {
            metric: "Average Learning Hours",

            unit: "Hours / Employee / Year",

            target: 40
        },

        {
            metric: "Certification Completion",

            unit: "%",

            target: 90
        },

        {
            metric: "Learning Effectiveness",

            unit: "%",

            target: 85
        },

        {
            metric: "Skill Gap Closure",

            unit: "%",

            target: 80
        },

        {
            metric: "Learning Satisfaction",

            unit: "%",

            target: 90
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

export default learningBenchmark;
