/**
 * =============================================================================
 * GrowWithHR Intelligence Platform
 * Shared Helper Functions
 * -----------------------------------------------------------------------------
 * File      : js/shared/helpers/index.js
 * Version   : 1.0.0
 * =============================================================================
 */

export function isNull(value) {
    return value === null;
}

export function isUndefined(value) {
    return value === undefined;
}

export function isNil(value) {
    return value === null || value === undefined;
}

export function isString(value) {
    return typeof value === "string";
}

export function isNumber(value) {
    return typeof value === "number" && Number.isFinite(value);
}

export function isBoolean(value) {
    return typeof value === "boolean";
}

export function isFunction(value) {
    return typeof value === "function";
}

export function isArray(value) {
    return Array.isArray(value);
}

export function isObject(value) {
    return Object.prototype.toString.call(value) === "[object Object]";
}

export function isEmpty(value) {

    if (isNil(value)) return true;

    if (isString(value)) return value.trim().length === 0;

    if (isArray(value)) return value.length === 0;

    if (isObject(value)) return Object.keys(value).length === 0;

    return false;

}

export function clone(value) {

    if (typeof structuredClone === "function") {
        return structuredClone(value);
    }

    return JSON.parse(JSON.stringify(value));

}

export function freeze(value) {
    return Object.freeze(value);
}

export function deepFreeze(object) {

    if (!isObject(object) && !isArray(object)) {
        return object;
    }

    Object.getOwnPropertyNames(object).forEach((property) => {

        const value = object[property];

        if (
            value &&
            (isObject(value) || isArray(value)) &&
            !Object.isFrozen(value)
        ) {
            deepFreeze(value);
        }

    });

    return Object.freeze(object);

}

export function deepMerge(target = {}, source = {}) {

    const output = clone(target);

    if (!isObject(source)) {
        return output;
    }

    Object.keys(source).forEach((key) => {

        const sourceValue = source[key];
        const targetValue = output[key];

        if (isArray(sourceValue)) {

            output[key] = [...sourceValue];
            return;

        }

        if (isObject(sourceValue)) {

            output[key] = deepMerge(
                isObject(targetValue) ? targetValue : {},
                sourceValue
            );

            return;

        }

        output[key] = sourceValue;

    });

    return output;

}

export function uuid() {

    if (globalThis.crypto?.randomUUID) {
        return crypto.randomUUID();
    }

    return "gwhr-" + Date.now() + "-" + Math.random().toString(36).slice(2, 12);

}

export function now() {
    return new Date().toISOString();
}

export function capitalize(text = "") {

    if (!isString(text) || text.length === 0) {
        return "";
    }

    return text.charAt(0).toUpperCase() + text.slice(1);

}

export function toTitleCase(text = "") {

    if (!isString(text)) {
        return "";
    }

    return text
        .toLowerCase()
        .split(" ")
        .filter(Boolean)
        .map(capitalize)
        .join(" ");

}

export function unique(array = []) {
    return [...new Set(array)];
}

export function sortBy(array = [], key) {

    return [...array].sort((a, b) => {

        if (a[key] < b[key]) return -1;
        if (a[key] > b[key]) return 1;
        return 0;

    });

}

export function groupBy(array = [], key) {

    return array.reduce((groups, item) => {

        const group = item[key];

        if (!groups[group]) {
            groups[group] = [];
        }

        groups[group].push(item);

        return groups;

    }, {});

}

export function chunk(array = [], size = 1) {

    const chunks = [];

    for (let index = 0; index < array.length; index += size) {
        chunks.push(array.slice(index, index + size));
    }

    return chunks;

}

export default Object.freeze({
    isNull,
    isUndefined,
    isNil,
    isString,
    isNumber,
    isBoolean,
    isFunction,
    isArray,
    isObject,
    isEmpty,
    clone,
    freeze,
    deepFreeze,
    deepMerge,
    uuid,
    now,
    capitalize,
    toTitleCase,
    unique,
    sortBy,
    groupBy,
    chunk
});
