/**
 * =============================================================================
 * GrowWithHR Intelligence Platform
 * Shared Benchmark Library
 * -----------------------------------------------------------------------------
 * File      : js/shared/benchmarks/index.js
 * Version   : 1.0.0
 * =============================================================================
 */

import hiringBenchmark from "./hiring-benchmark.js";
import salaryBenchmark from "./salary-benchmark.js";
import attritionBenchmark from "./attrition-benchmark.js";
import performanceBenchmark from "./performance-benchmark.js";
import learningBenchmark from "./learning-benchmark.js";
import engagementBenchmark from "./engagement-benchmark.js";
import rewardsBenchmark from "./rewards-benchmark.js";

class SharedBenchmarkLibrary {

    constructor() {

        this.benchmarks = Object.freeze({

            hiring:
                hiringBenchmark,

            salary:
                salaryBenchmark,

            attrition:
                attritionBenchmark,

            performance:
                performanceBenchmark,

            learning:
                learningBenchmark,

            engagement:
                engagementBenchmark,

            rewards:
                rewardsBenchmark

        });

    }

    all() {

        return {

            ...this.benchmarks

        };

    }

    names() {

        return Object.keys(
            this.benchmarks
        );

    }

    get(name) {

        return this.benchmarks[name] || null;

    }

    exists(name) {

        return Boolean(
            this.benchmarks[name]
        );

    }

}

const sharedBenchmarkLibrary =
    new SharedBenchmarkLibrary();

export { SharedBenchmarkLibrary };

export default sharedBenchmarkLibrary;
