import { defaults, merge } from 'lodash-es';
import { EventProperty, ListenerProperty, ListenerType, } from './awayback.model.js';
import { any } from './helpers.js';
function awayback(replayable) {
    const events = {};
    const timeouts = {};
    function _create(event) {
        events[event] = {
            [EventProperty.listeners]: [],
            [EventProperty.parameters]: [],
            [EventProperty.emissions]: 0,
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
        self[EventProperty.listeners].push({
            [ListenerProperty.callback]: callback,
            [ListenerProperty.type]: type,
            [ListenerProperty.emissions]: 0,
            [ListenerProperty.executions]: 0,
            [ListenerProperty.options]: defaults({}, options, { isReplaying: false }),
        });
        if (self[EventProperty.emissions] > 0) {
            self[EventProperty.listeners].forEach((listener) => {
                if (!(listener[ListenerProperty.options].isReplaying ?? false))
                    return;
                while (listener[ListenerProperty.emissions] < self[EventProperty.emissions]) {
                    if (!events[event])
                        break;
                    if (listener[ListenerProperty.type] === ListenerType.on ||
                        (listener[ListenerProperty.type] === ListenerType.once && listener[ListenerProperty.executions] === 0) ||
                        (listener[ListenerProperty.type] === ListenerType.only &&
                            listener[ListenerProperty.executions] === 0 &&
                            self[EventProperty.listeners].reduce((sum, current) => sum + current[ListenerProperty.executions], 0) ===
                                0)) {
                        const data = self[EventProperty.parameters][listener[ListenerProperty.emissions]];
                        listener[ListenerProperty.emissions] += 1;
                        if (typeof listener[ListenerProperty.options].predicate === 'function' &&
                            !listener[ListenerProperty.options].predicate(...data)) {
                            continue;
                        }
                        try {
                            listener[ListenerProperty.callback](...data);
                        }
                        catch (error) {
                            console.error(`Error occurred in event callback for event "${String(event)}":`, error);
                        }
                        listener[ListenerProperty.executions] += 1;
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
        if (Array.isArray(replayable) && replayable.includes(event)) {
            self[EventProperty.parameters].push(parameters);
        }
        self[EventProperty.emissions] += 1;
        self[EventProperty.listeners].forEach((listener) => {
            if (!events[event])
                return;
            if (listener[ListenerProperty.type] === ListenerType.on ||
                (listener[ListenerProperty.type] === ListenerType.once && listener[ListenerProperty.executions] === 0) ||
                (listener[ListenerProperty.type] === ListenerType.only &&
                    listener[ListenerProperty.executions] === 0 &&
                    self[EventProperty.listeners].reduce((sum, current) => sum + current[ListenerProperty.executions], 0) === 0)) {
                listener[ListenerProperty.emissions] += 1;
                if (typeof listener[ListenerProperty.options].predicate === 'function' &&
                    !listener[ListenerProperty.options].predicate(...parameters))
                    return;
                try {
                    listener[ListenerProperty.callback](...parameters);
                }
                catch (error) {
                    console.error(`Error occurred in event callback for event "${String(event)}":`, error);
                }
                listener[ListenerProperty.executions] += 1;
            }
        });
    }
    function on(event, callback, options) {
        _listen(ListenerType.on, event, callback, options);
    }
    function once(event, callback, options) {
        _listen(ListenerType.once, event, callback, options);
    }
    function only(event, callback, options) {
        _listen(ListenerType.only, event, callback, options);
    }
    function promise(event, options) {
        return new Promise((resolve, reject) => {
            const controller = new AbortController();
            const signal = any(controller.signal, options?.signal);
            const _options = merge({}, options, { signal });
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
                        isReplaying: ((Array.isArray(replayable) && replayable.includes(current) ? _options.isReplaying : false)),
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
        self[EventProperty.listeners] = self[EventProperty.listeners].filter((listener) => listener[ListenerProperty.callback] !== callback);
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
export { EventProperty, ListenerProperty, ListenerType };
export default awayback;
