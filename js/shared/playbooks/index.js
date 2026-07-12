/**
 * =============================================================================
 * GrowWithHR Intelligence Platform
 * Shared Playbook Library
 * -----------------------------------------------------------------------------
 * File      : js/shared/playbooks/index.js
 * Version   : 1.0.0
 * =============================================================================
 */

import hiringPlaybook from "./hiring-playbook.js";
import leadershipPlaybook from "./leadership-playbook.js";
import performancePlaybook from "./performance-playbook.js";
import learningPlaybook from "./learning-playbook.js";
import rewardsPlaybook from "./rewards-playbook.js";
import compliancePlaybook from "./compliance-playbook.js";
import culturePlaybook from "./culture-playbook.js";

class SharedPlaybookLibrary {

    constructor() {

        this.playbooks = Object.freeze({

            hiring:
                hiringPlaybook,

            leadership:
                leadershipPlaybook,

            performance:
                performancePlaybook,

            learning:
                learningPlaybook,

            rewards:
                rewardsPlaybook,

            compliance:
                compliancePlaybook,

            culture:
                culturePlaybook

        });

    }

    all() {

        return {

            ...this.playbooks

        };

    }

    names() {

        return Object.keys(
            this.playbooks
        );

    }

    get(name) {

        return this.playbooks[name] || null;

    }

    exists(name) {

        return Boolean(
            this.playbooks[name]
        );

    }

}

const sharedPlaybookLibrary =
    new SharedPlaybookLibrary();

export { SharedPlaybookLibrary };

export default sharedPlaybookLibrary;
