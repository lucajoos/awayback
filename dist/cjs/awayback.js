"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListenerType = void 0;
const awayback_model_js_1 = require("./awayback.model.js");
Object.defineProperty(exports, "ListenerType", { enumerable: true, get: function () { return awayback_model_js_1.ListenerType; } });
const lodash_es_1 = require("lodash-es");
const helpers_js_1 = require("./helpers.js");
/**
 * @license
 * awayback
 * Released under MIT license
 * Copyright Luca Raúl Joos
 */
function awayback() {
    const events = {};
    const timeouts = {};
    function create(event) {
        events[event] = {
            callbacks: [],
            data: [],
            runs: 0,
        };
    }
    function emit(event, ...data) {
        if (typeof events[event] === 'undefined')
            create(event);
        const self = events[event];
        if (!self)
            return;
        if (typeof data !== 'undefined') {
            self.data.push(data);
        }
        self.runs++;
        self.callbacks.forEach((callback) => {
            if (callback.type === awayback_model_js_1.ListenerType.on ||
                (callback.type === awayback_model_js_1.ListenerType.once && callback.runs === 0) ||
                (callback.type === awayback_model_js_1.ListenerType.only &&
                    callback.runs === 0 &&
                    self.callbacks.reduce((sum, callback) => sum + callback.runs, 0) === 0)) {
                callback.handler(...data);
                callback.runs++;
            }
        });
    }
    function listen(type, event, handler, options) {
        if (typeof events[event] === 'undefined')
            create(event);
        const self = events[event];
        if (!self)
            return;
        if (options?.signal) {
            options.signal.addEventListener('abort', () => {
                remove(event, handler);
            });
        }
        self.callbacks.push({
            handler: handler,
            type,
            runs: 0,
            options: (0, lodash_es_1.merge)({ isExecutingPrevious: false }, options ?? {}),
        });
        if (self.runs > 0) {
            self.callbacks.forEach(({ type, runs, options, handler }) => {
                if (!(options.isExecutingPrevious ?? false))
                    return;
                while (runs < self.runs) {
                    if (type === awayback_model_js_1.ListenerType.on ||
                        (type === awayback_model_js_1.ListenerType.once && runs === 0) ||
                        (type === awayback_model_js_1.ListenerType.only && runs === 0 && self.callbacks.reduce((sum, callback) => sum + runs, 0) === 0)) {
                        const data = self.data[runs];
                        if (typeof options.predicate === 'function' && !options.predicate(...data))
                            break;
                        handler(...data);
                        runs++;
                    }
                    else
                        break;
                }
            });
        }
    }
    function on(event, handler, options) {
        listen(awayback_model_js_1.ListenerType.on, event, handler, options);
    }
    function once(event, handler, options) {
        listen(awayback_model_js_1.ListenerType.once, event, handler, options);
    }
    function only(event, handler, options) {
        listen(awayback_model_js_1.ListenerType.only, event, handler, options);
    }
    function promise(event, options) {
        return new Promise((resolve, reject) => {
            const controller = new AbortController();
            const signal = (0, helpers_js_1.any)(controller.signal, options?.signal);
            const _options = (0, lodash_es_1.merge)(options, { signal });
            once(event, (...data) => {
                controller.abort();
                resolve(data);
            }, _options);
            if (Array.isArray(_options?.reject)) {
                _options.reject.forEach((current) => {
                    once(current, () => {
                        controller.abort();
                        reject(new Error(`Event "${String(event)}" was rejected due to "${String(current)}" event.`));
                    }, { isExecutingPrevious: _options.isExecutingPrevious, signal });
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
    function remove(event, handler) {
        if (typeof events[event] === 'undefined')
            return;
        const self = events[event];
        if (!self)
            return;
        self.callbacks = self.callbacks.filter((callback) => callback.handler !== handler);
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
        events,
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
