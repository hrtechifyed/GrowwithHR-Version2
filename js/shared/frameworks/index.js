/**
 * =============================================================================
 * GrowWithHR Intelligence Platform
 * Shared Framework Library
 * -----------------------------------------------------------------------------
 * File      : js/shared/frameworks/index.js
 * Version   : 1.0.0
 * =============================================================================
 */

import competencyFramework from "./competency-framework.js";
import careerFramework from "./career-framework.js";
import leadershipFramework from "./leadership-framework.js";
import performanceFramework from "./performance-framework.js";
import learningFramework from "./learning-framework.js";
import rewardsFramework from "./rewards-framework.js";
import okrFramework from "./okr-framework.js";
import balancedScorecard from "./balanced-scorecard.js";

class SharedFrameworkLibrary {

    constructor() {

        this.frameworks = Object.freeze({

            competency:
                competencyFramework,

            career:
                careerFramework,

            leadership:
                leadershipFramework,

            performance:
                performanceFramework,

            learning:
                learningFramework,

            rewards:
                rewardsFramework,

            okr:
                okrFramework,

            balancedScorecard:
                balancedScorecard

        });

    }

    all() {

        return {

            ...this.frameworks

        };

    }

    names() {

        return Object.keys(
            this.frameworks
        );

    }

    get(name) {

        return this.frameworks[name] || null;

    }

    exists(name) {

        return Boolean(
            this.frameworks[name]
        );

    }

}

const sharedFrameworkLibrary =
    new SharedFrameworkLibrary();

export { SharedFrameworkLibrary };

export default sharedFrameworkLibrary;
