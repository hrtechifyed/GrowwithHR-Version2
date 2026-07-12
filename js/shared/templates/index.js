/**
 * =============================================================================
 * GrowWithHR Intelligence Platform
 * Shared Template Library
 * -----------------------------------------------------------------------------
 * File      : js/shared/templates/index.js
 * Version   : 1.0.0
 * =============================================================================
 */

class SharedTemplateLibrary {

    constructor() {

        this.templates = [];

    }

    register(template = {}) {

        this.templates.push({

            ...template

        });

        return template;

    }

    registerMany(templates = []) {

        templates.forEach(template =>
            this.register(template)
        );

        return this.list();

    }

    list() {

        return [...this.templates];

    }

    get(id) {

        return this.templates.find(
            template => template.id === id
        ) || null;

    }

    byModule(module) {

        return this.templates.filter(
            template => template.module === module
        );

    }

    byCategory(category) {

        return this.templates.filter(
            template => template.category === category
        );

    }

    search(keyword = "") {

        const query =
            keyword.toLowerCase();

        return this.templates.filter(template =>

            (template.name || "")
                .toLowerCase()
                .includes(query)

            ||

            (template.description || "")
                .toLowerCase()
                .includes(query)

            ||

            (template.category || "")
                .toLowerCase()
                .includes(query)

        );

    }

    exists(id) {

        return this.templates.some(
            template => template.id === id
        );

    }

    count() {

        return this.templates.length;

    }

    clear() {

        this.templates = [];

    }

}

const sharedTemplateLibrary =
    new SharedTemplateLibrary();

export { SharedTemplateLibrary };

export default sharedTemplateLibrary;
