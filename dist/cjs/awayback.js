"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListenerType = void 0;
const awayback_model_js_1 = require("./awayback.model.js");
Object.defineProperty(exports, "ListenerType", { enumerable: true, get: function () { return awayback_model_js_1.ListenerType; } });
const lodash_es_1 = require("lodash-es");
/**
 * @license
 * awayback
 * Released under MIT license
 * Copyright Luca Raúl Joos
 */
function awayback() {
    const events = {};
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
            self.callbacks.forEach((callback) => {
                if (!(callback.options.isExecutingPrevious ?? false))
                    return;
                let isExiting = false;
                while (callback.runs < self.runs && !isExiting) {
                    if (callback.type === awayback_model_js_1.ListenerType.on ||
                        (callback.type === awayback_model_js_1.ListenerType.once && callback.runs === 0) ||
                        (callback.type === awayback_model_js_1.ListenerType.only &&
                            callback.runs === 0 &&
                            self.callbacks.reduce((sum, callback) => sum + callback.runs, 0) === 0)) {
                        callback.handler(...self.data[callback.runs]);
                        callback.runs++;
                    }
                    else {
                        isExiting = true;
                    }
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
        return new Promise((resolve) => {
            once(event, (...data) => {
                resolve(data);
            }, options);
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
