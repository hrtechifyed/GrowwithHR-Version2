/**
 * =============================================================================
 * GrowWithHR Intelligence Platform
 * Shared Salary Benchmark
 * -----------------------------------------------------------------------------
 * File      : js/shared/benchmarks/salary-benchmark.js
 * Version   : 1.0.0
 * =============================================================================
 */

const salaryBenchmark = Object.freeze({

    id: "BENCHMARK-SALARY",

    name: "Salary Benchmark",

    version: "1.0.0",

    description:
        "Standard compensation benchmarks used across the platform.",

    metrics: [

        {
            metric: "Market Position",

            unit: "Percentile",

            target: 50
        },

        {
            metric: "Salary Competitiveness",

            unit: "%",

            target: 100
        },

        {
            metric: "Internal Equity",

            unit: "%",

            target: 95
        },

        {
            metric: "Pay Compression",

            unit: "%",

            target: 10
        },

        {
            metric: "Variable Pay Ratio",

            unit: "%",

            target: 20
        },

        {
            metric: "Benefits Competitiveness",

            unit: "%",

            target: 90
        }

    ],

    applicableModules: [

        "rewards",

        "performance",

        "talent",

        "leadership"

    ]

});

export default salaryBenchmark;
