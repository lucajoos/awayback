import { merge } from 'lodash-es';
import { ListenerType, } from './awayback.model.js';
import { any } from './helpers.js';
function awayback(cache) {
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
        if (typeof data !== 'undefined' && Array.isArray(cache) && cache.includes(event)) {
            self.data.push(data);
        }
        self.runs += 1;
        self.callbacks.forEach((callback) => {
            if (!events[event])
                return;
            if (callback.type === ListenerType.on ||
                (callback.type === ListenerType.once && callback.calls === 0) ||
                (callback.type === ListenerType.only &&
                    callback.calls === 0 &&
                    self.callbacks.reduce((sum, current) => sum + current.calls, 0) === 0)) {
                callback.runs += 1;
                if (typeof callback.options.predicate === 'function' && !callback.options.predicate(...data))
                    return;
                try {
                    callback.handler(...data);
                }
                catch (error) {
                    console.error(`Error occurred in event handler for event "${String(event)}":`, error);
                }
                callback.calls += 1;
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
            if (options.signal.aborted)
                return;
            options.signal.addEventListener('abort', () => {
                remove(event, handler);
            });
        }
        self.callbacks.push({
            handler: handler,
            type,
            runs: 0,
            calls: 0,
            options: merge({ isExecutingPrevious: false }, options ?? {}),
        });
        if (self.runs > 0) {
            self.callbacks.forEach((callback) => {
                if (!(callback.options.isExecutingPrevious ?? false))
                    return;
                while (callback.runs < self.runs) {
                    if (!events[event])
                        break;
                    if (callback.type === ListenerType.on ||
                        (callback.type === ListenerType.once && callback.calls === 0) ||
                        (callback.type === ListenerType.only &&
                            callback.calls === 0 &&
                            self.callbacks.reduce((sum, current) => sum + current.calls, 0) === 0)) {
                        const data = self.data[callback.runs];
                        callback.runs += 1;
                        if (typeof callback.options.predicate === 'function' && !callback.options.predicate(...data))
                            continue;
                        try {
                            callback.handler(...data);
                        }
                        catch (error) {
                            console.error(`Error occurred in event handler for event "${String(event)}":`, error);
                        }
                        callback.calls += 1;
                    }
                    else
                        break;
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
            if (Array.isArray(_options?.reject)) {
                _options.reject.forEach((current) => {
                    once(current, () => {
                        controller.abort();
                        reject(new Error(`Event "${String(event)}" was rejected due to "${String(current)}" event.`));
                    }, {
                        isExecutingPrevious: ((cache.includes(current) ? _options.isExecutingPrevious : false)),
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
