/**
 * =============================================================================
 * GrowWithHR Intelligence Platform
 * Shared Rewards Benchmark
 * -----------------------------------------------------------------------------
 * File      : js/shared/benchmarks/rewards-benchmark.js
 * Version   : 1.0.0
 * =============================================================================
 */

const rewardsBenchmark = Object.freeze({

    id: "BENCHMARK-REWARDS",

    name: "Rewards Benchmark",

    version: "1.0.0",

    description:
        "Standard rewards and compensation benchmarks shared across intelligence modules.",

    metrics: [

        {
            metric: "Compensation Competitiveness",

            unit: "%",

            target: 100
        },

        {
            metric: "Pay Equity",

            unit: "%",

            target: 95
        },

        {
            metric: "Variable Pay Participation",

            unit: "%",

            target: 85
        },

        {
            metric: "Benefits Utilization",

            unit: "%",

            target: 80
        },

        {
            metric: "Recognition Coverage",

            unit: "%",

            target: 90
        },

        {
            metric: "Reward Satisfaction",

            unit: "%",

            target: 85
        }

    ],

    applicableModules: [

        "rewards",

        "performance",

        "talent",

        "leadership",

        "culture"

    ]

});

export default rewardsBenchmark;
