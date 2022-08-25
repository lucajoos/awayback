const awayback = (object) => {
    const response = {
        events: {},
        fire: (event, ...data) => {
            event.split('|').forEach(current => {
                if (response.events[current] === undefined) {
                    response.create(current);
                }
                if (typeof data !== 'undefined') {
                    if (data.length === 1) {
                        data = data[0];
                    }
                    response.events[current].data.push(data);
                }
                response.events[current].fired++;
                response.events[current].callbacks.forEach((callback) => {
                    if ((callback.type === 0 && callback.fired === 0) || callback.type === 1 || (callback.type === 2 && callback.fired === 0 && response.events[current].did === 0)) {
                        callback.fired++;
                        response.events[current].did = response.events[current].did + 1;
                        callback.do(typeof data !== 'undefined' ? data : null, current);
                    }
                });
            });
        },
        create: (event) => {
            response.events[event] = {
                callbacks: new Proxy([], {
                    set: (target, property, value) => {
                        target[property] = value;
                        if (response.events[event].fired > 0) {
                            response.events[event].callbacks.forEach((callback, index) => {
                                let options = Object.assign({
                                    isExecutingPrevious: false
                                }, callback.options);
                                let exit = false;
                                while (callback.fired < response.events[event].fired && !exit && options.isExecutingPrevious) {
                                    if ((callback.type === 0 && callback.fired === 0) || callback.type === 1 || (callback.type === 2 && callback.fired === 0 && response.events[event].did === 0)) {
                                        response.events[event].callbacks[index].fired++;
                                        response.events[event].did = response.events[event].did + 1;
                                        callback.do(response.events[event].data[callback.fired - 1] || null, event);
                                    }
                                    else {
                                        exit = true;
                                    }
                                }
                            });
                        }
                        return true;
                    }
                }),
                fired: 0,
                did: 0,
                data: []
            };
        },
        once: (event, callback, options) => {
            event.split('|').forEach(currentEvent => {
                currentEvent = currentEvent.trim();
                if (response.events[currentEvent] === undefined) {
                    response.create(currentEvent);
                }
                response.events[currentEvent].callbacks.push({
                    do: callback,
                    type: 0,
                    fired: 0,
                    options: options || {}
                });
            });
        },
        on: (event, callback, options) => {
            event.split('|').forEach(currentEvent => {
                currentEvent = currentEvent.trim();
                if (response.events[currentEvent] === undefined) {
                    response.create(currentEvent);
                }
                response.events[currentEvent].callbacks.push({
                    do: callback,
                    type: 1,
                    fired: 0,
                    options: options || {}
                });
            });
        },
        only: (event, callback, options) => {
            event.split('|').forEach(currentEvent => {
                currentEvent = currentEvent.trim();
                if (response.events[currentEvent] === undefined) {
                    response.create(currentEvent);
                }
                if (response.events[currentEvent].callbacks.length === 0) {
                    response.events[currentEvent].callbacks.push({
                        do: callback,
                        type: 2,
                        fired: 0,
                        options: options || {}
                    });
                }
            });
        },
        isFired: (event) => {
            return (event === null || event === void 0 ? void 0 : event.length) > 0 ? (typeof response.events[event] === 'object' ? response.events[event].fired > 0 : false) : false;
        }
    };
    return typeof object === 'object' ? Object.assign(object, response) : response;
};
export default awayback;
