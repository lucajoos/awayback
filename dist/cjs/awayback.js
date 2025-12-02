"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListenerType = exports.ListenerProperty = exports.EventProperty = void 0;
const lodash_es_1 = require("lodash-es");
const awayback_model_js_1 = require("./awayback.model.js");
Object.defineProperty(exports, "EventProperty", { enumerable: true, get: function () { return awayback_model_js_1.EventProperty; } });
Object.defineProperty(exports, "ListenerProperty", { enumerable: true, get: function () { return awayback_model_js_1.ListenerProperty; } });
Object.defineProperty(exports, "ListenerType", { enumerable: true, get: function () { return awayback_model_js_1.ListenerType; } });
const helpers_js_1 = require("./helpers.js");
function awayback(replay) {
    const events = {};
    const timeouts = {};
    function _create(event) {
        events[event] = {
            [awayback_model_js_1.EventProperty.listeners]: [],
            [awayback_model_js_1.EventProperty.parameters]: [],
            [awayback_model_js_1.EventProperty.emissions]: 0,
        };
    }
    function _listen(type, event, callback, options) {
        if (typeof events[event] === 'undefined')
            _create(event);
        const self = events[event];
        if (!self)
            return;
        if (options?.signal) {
            if (options.signal.aborted)
                return;
            options.signal.addEventListener('abort', () => {
                remove(event, callback);
            });
        }
        self[awayback_model_js_1.EventProperty.listeners].push({
            [awayback_model_js_1.ListenerProperty.callback]: callback,
            [awayback_model_js_1.ListenerProperty.type]: type,
            [awayback_model_js_1.ListenerProperty.emissions]: 0,
            [awayback_model_js_1.ListenerProperty.executions]: 0,
            [awayback_model_js_1.ListenerProperty.options]: (0, lodash_es_1.defaults)({}, options, { isReplaying: false }),
        });
        if (self[awayback_model_js_1.EventProperty.emissions] > 0) {
            self[awayback_model_js_1.EventProperty.listeners].forEach((listener) => {
                if (!(listener[awayback_model_js_1.ListenerProperty.options].isReplaying ?? false))
                    return;
                while (listener[awayback_model_js_1.ListenerProperty.emissions] < self[awayback_model_js_1.EventProperty.emissions]) {
                    if (!events[event])
                        break;
                    if (listener[awayback_model_js_1.ListenerProperty.type] === awayback_model_js_1.ListenerType.on ||
                        (listener[awayback_model_js_1.ListenerProperty.type] === awayback_model_js_1.ListenerType.once && listener[awayback_model_js_1.ListenerProperty.executions] === 0) ||
                        (listener[awayback_model_js_1.ListenerProperty.type] === awayback_model_js_1.ListenerType.only &&
                            listener[awayback_model_js_1.ListenerProperty.executions] === 0 &&
                            self[awayback_model_js_1.EventProperty.listeners].reduce((sum, current) => sum + current[awayback_model_js_1.ListenerProperty.executions], 0) ===
                                0)) {
                        const data = self[awayback_model_js_1.EventProperty.parameters][listener[awayback_model_js_1.ListenerProperty.emissions]];
                        listener[awayback_model_js_1.ListenerProperty.emissions] += 1;
                        if (typeof listener[awayback_model_js_1.ListenerProperty.options].predicate === 'function' &&
                            !listener[awayback_model_js_1.ListenerProperty.options].predicate(...data)) {
                            continue;
                        }
                        try {
                            listener[awayback_model_js_1.ListenerProperty.callback](...data);
                        }
                        catch (error) {
                            console.error(`Error occurred in event callback for event "${String(event)}":`, error);
                        }
                        listener[awayback_model_js_1.ListenerProperty.executions] += 1;
                    }
                    else
                        break;
                }
            });
        }
    }
    function emit(event, ...parameters) {
        if (typeof events[event] === 'undefined')
            _create(event);
        const self = events[event];
        if (!self)
            return;
        if (Array.isArray(replay) && replay.includes(event)) {
            self[awayback_model_js_1.EventProperty.parameters].push(parameters);
        }
        self[awayback_model_js_1.EventProperty.emissions] += 1;
        self[awayback_model_js_1.EventProperty.listeners].forEach((listener) => {
            if (!events[event])
                return;
            if (listener[awayback_model_js_1.ListenerProperty.type] === awayback_model_js_1.ListenerType.on ||
                (listener[awayback_model_js_1.ListenerProperty.type] === awayback_model_js_1.ListenerType.once && listener[awayback_model_js_1.ListenerProperty.executions] === 0) ||
                (listener[awayback_model_js_1.ListenerProperty.type] === awayback_model_js_1.ListenerType.only &&
                    listener[awayback_model_js_1.ListenerProperty.executions] === 0 &&
                    self[awayback_model_js_1.EventProperty.listeners].reduce((sum, current) => sum + current[awayback_model_js_1.ListenerProperty.executions], 0) === 0)) {
                listener[awayback_model_js_1.ListenerProperty.emissions] += 1;
                if (typeof listener[awayback_model_js_1.ListenerProperty.options].predicate === 'function' &&
                    !listener[awayback_model_js_1.ListenerProperty.options].predicate(...parameters))
                    return;
                try {
                    listener[awayback_model_js_1.ListenerProperty.callback](...parameters);
                }
                catch (error) {
                    console.error(`Error occurred in event callback for event "${String(event)}":`, error);
                }
                listener[awayback_model_js_1.ListenerProperty.executions] += 1;
            }
        });
    }
    function on(event, callback, options) {
        _listen(awayback_model_js_1.ListenerType.on, event, callback, options);
    }
    function once(event, callback, options) {
        _listen(awayback_model_js_1.ListenerType.once, event, callback, options);
    }
    function only(event, callback, options) {
        _listen(awayback_model_js_1.ListenerType.only, event, callback, options);
    }
    function promise(event, options) {
        return new Promise((resolve, reject) => {
            const controller = new AbortController();
            const signal = (0, helpers_js_1.any)(controller.signal, options?.signal);
            const _options = (0, lodash_es_1.merge)({}, options, { signal });
            once(event, (...data) => {
                controller.abort();
                resolve(data);
            }, _options);
            if (Array.isArray(_options?.reject)) {
                _options.reject.forEach((current) => {
                    once(current, () => {
                        controller.abort();
                        reject(new Error(`Event "${String(event)}" was rejected due to "${String(current)}" event.`));
                    }, {
                        isReplaying: ((Array.isArray(replay) && replay.includes(current) ? _options.isReplaying : false)),
                        signal,
                    });
                });
            }
            flow: if (typeof _options.timeout === 'number') {
                if (signal.aborted)
                    break flow;
                const id = Math.random().toString(16).slice(2);
                signal.addEventListener('abort', () => {
                    if (!timeouts[id])
                        return;
                    clearTimeout(timeouts[id]);
                    delete timeouts[id];
                });
                timeouts[id] = setTimeout(() => {
                    controller.abort();
                    reject(new Error(`Event "${String(event)}" was rejected due to timeout after ${_options.timeout}ms`));
                }, _options.timeout);
            }
        });
    }
    function remove(event, callback) {
        if (typeof events[event] === 'undefined')
            return;
        const self = events[event];
        if (!self)
            return;
        self[awayback_model_js_1.EventProperty.listeners] = self[awayback_model_js_1.EventProperty.listeners].filter((listener) => listener[awayback_model_js_1.ListenerProperty.callback] !== callback);
    }
    function destroy() {
        Object.keys(timeouts).forEach((id) => {
            clearTimeout(timeouts[id]);
            delete timeouts[id];
        });
        Object.keys(events).forEach((event) => {
            delete events[event];
        });
    }
    return {
        emit,
        on,
        once,
        only,
        promise,
        remove,
        destroy,
    };
}
exports.default = awayback;
