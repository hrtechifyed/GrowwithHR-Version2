/**
 * =============================================================================
 * GrowWithHR Intelligence Platform
 * Shared Utility Functions
 * -----------------------------------------------------------------------------
 * File      : js/shared/utils/index.js
 * Version   : 1.0.0
 * =============================================================================
 */

import {
    clone,
    deepMerge,
    deepFreeze,
    uuid,
    now,
    isArray,
    isObject,
    isString,
    isNumber,
    isBoolean,
    isNil,
    unique
} from "../helpers/index.js";

export function createId(prefix = "gwhr") {
    return `${prefix}-${uuid()}`;
}

export function timestamp() {
    return now();
}

export function immutable(value) {
    return deepFreeze(clone(value));
}

export function merge(...objects) {

    let result = {};

    for (const object of objects) {
        result = deepMerge(result, object);
    }

    return result;

}

export function cloneObject(object = {}) {
    return clone(object);
}

export function safeArray(value) {

    if (isArray(value)) {
        return [...value];
    }

    return [];

}

export function safeObject(value) {

    if (isObject(value)) {
        return clone(value);
    }

    return {};

}

export function safeString(value) {

    if (isString(value)) {
        return value.trim();
    }

    return "";

}

export function safeNumber(value, defaultValue = 0) {

    if (isNumber(value)) {
        return value;
    }

    return defaultValue;

}

export function safeBoolean(value, defaultValue = false) {

    if (isBoolean(value)) {
        return value;
    }

    return defaultValue;

}

export function exists(value) {
    return !isNil(value);
}

export function removeDuplicates(array = []) {
    return unique(array);
}

export function sortAscending(array = [], key) {

    return [...array].sort((left, right) => {

        if (left[key] < right[key]) return -1;
        if (left[key] > right[key]) return 1;

        return 0;

    });

}

export function sortDescending(array = [], key) {

    return [...array].sort((left, right) => {

        if (left[key] > right[key]) return -1;
        if (left[key] < right[key]) return 1;

        return 0;

    });

}

export function indexBy(array = [], key) {

    return array.reduce((result, item) => {

        result[item[key]] = item;

        return result;

    }, {});

}

export function pick(object = {}, keys = []) {

    const result = {};

    for (const key of keys) {

        if (key in object) {
            result[key] = object[key];
        }

    }

    return result;

}

export function omit(object = {}, keys = []) {

    const result = clone(object);

    for (const key of keys) {
        delete result[key];
    }

    return result;

}

export function debounce(callback, delay = 300) {

    let timer;

    return (...args) => {

        clearTimeout(timer);

        timer = setTimeout(() => {
            callback(...args);
        }, delay);

    };

}

export function throttle(callback, delay = 300) {

    let waiting = false;

    return (...args) => {

        if (waiting) {
            return;
        }

        callback(...args);

        waiting = true;

        setTimeout(() => {
            waiting = false;
        }, delay);

    };

}

export function sleep(milliseconds = 0) {

    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });

}

export function noop() {}

export default Object.freeze({
    createId,
    timestamp,
    immutable,
    merge,
    cloneObject,
    safeArray,
    safeObject,
    safeString,
    safeNumber,
    safeBoolean,
    exists,
    removeDuplicates,
    sortAscending,
    sortDescending,
    indexBy,
    pick,
    omit,
    debounce,
    throttle,
    sleep,
    noop
});
