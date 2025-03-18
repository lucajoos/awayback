import { ListenerType, } from './awayback.model.js';
import { merge } from 'lodash-es';
import { any } from './helpers.js';
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
            if (callback.type === ListenerType.on ||
                (callback.type === ListenerType.once && callback.runs === 0) ||
                (callback.type === ListenerType.only &&
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
            options: merge({ isExecutingPrevious: false }, options ?? {}),
        });
        if (self.runs > 0) {
            self.callbacks.forEach((callback) => {
                if (!(callback.options.isExecutingPrevious ?? false))
                    return;
                let isExiting = false;
                while (callback.runs < self.runs && !isExiting) {
                    if (callback.type === ListenerType.on ||
                        (callback.type === ListenerType.once && callback.runs === 0) ||
                        (callback.type === ListenerType.only &&
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
        listen(ListenerType.on, event, handler, options);
    }
    function once(event, handler, options) {
        listen(ListenerType.once, event, handler, options);
    }
    function only(event, handler, options) {
        listen(ListenerType.only, event, handler, options);
    }
    function promise(event, options) {
        return new Promise((resolve, reject) => {
            const controller = new AbortController();
            const signal = any(controller.signal, options?.signal);
            const _options = merge(options, { signal });
            once(event, (...data) => {
                controller.abort();
                resolve(data);
            }, _options);
            if (Array.isArray(options?.reject)) {
                options.reject.forEach((current) => {
                    once(current, () => {
                        controller.abort();
                        reject(new Error(`Event "${String(event)}" was rejected due to "${String(current)}" event.`));
                    }, _options);
                });
            }
            if (typeof options.timeout === 'number') {
                const id = crypto.randomUUID();
                timeouts[id] = setTimeout(() => {
                    if (timeouts[id])
                        delete timeouts[id];
                    controller.abort();
                    reject(new Error(`Event "${String(event)}" was rejected due to timeout after ${options.timeout}ms`));
                }, options.timeout);
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
export { ListenerType };
export default awayback;
