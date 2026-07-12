/**
 * =============================================================================
 * GrowWithHR Intelligence Platform
 * Shared Rule Repository
 * -----------------------------------------------------------------------------
 * File      : js/shared/rules/index.js
 * Version   : 1.0.0
 * =============================================================================
 */

class SharedRuleRepository {

    constructor() {

        this.rules = [];

    }

    register(rule = {}) {

        this.rules.push({

            ...rule

        });

        return rule;

    }

    registerMany(rules = []) {

        rules.forEach(rule =>
            this.register(rule)
        );

        return this.list();

    }

    list() {

        return [...this.rules];

    }

    get(id) {

        return this.rules.find(
            rule => rule.id === id
        ) || null;

    }

    byModule(module) {

        return this.rules.filter(
            rule => rule.module === module
        );

    }

    byCategory(category) {

        return this.rules.filter(
            rule => rule.category === category
        );

    }

    byPriority(priority) {

        return this.rules.filter(
            rule => rule.priority === priority
        );

    }

    exists(id) {

        return this.rules.some(
            rule => rule.id === id
        );

    }

    count() {

        return this.rules.length;

    }

    clear() {

        this.rules = [];

    }

}

const sharedRuleRepository =
    new SharedRuleRepository();

export { SharedRuleRepository };

export default sharedRuleRepository;
