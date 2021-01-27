/**
 * @license
 * onceupon.js
 * Released under MIT license
 * Copyright Luca Joos
 */

module.exports = object => {
    let r = {
        events: {},

        fire: (event, ...data) => {
            if(r.events[event] === undefined) {
                r.create(event);
            }

            if(typeof data !== 'undefined') {
                if(data.length === 1) {
                    data = data[0];
                }

                r.events[event].data.push(data);
            }

            r.events[event].callbacks.forEach(c => {
                if((c.type === 0 && c.fired === 0) || c.type === 1 || (c.type === 2 && c.fired === 0 && r.events[event].did === 0)) {
                    c.fired++;
                    r.events[event].did = r.events[event].did + 1;
                    c.do(typeof data !== 'undefined' ? data : null, event);
                }
            });

            r.events[event].fired++;
        },

        create: event => {
            r.events[event] = {
                callbacks: new Proxy([], {
                    set: (target, key, value) => {
                        target[key] = value;

                        if(r.events[event].fired > 0) {
                            r.events[event].callbacks.forEach((c, i) => {
                                let exit = false;

                                while(c.fired !== r.events[event].fired && !exit && !c.last) {
                                    if((c.type === 0 && c.fired === 0) || c.type === 1 || (c.type === 2 && c.fired === 0 && r.events[event].did === 0)) {
                                        c.fired++;
                                        r.events[event].did = r.events[event].did + 1;
                                        c.do(r.events[event].data[i] !== undefined ? r.events[event].data[c.fired] : null, event);
                                    } else {
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
            }
        },

        once: (event, callback, last) => {
            event.split('|').forEach(ce => {
                ce = ce.trim();

                if(r.events[ce] === undefined) {
                    r.create(ce);
                }

                r.events[ce].callbacks.push(
                    {
                        do: callback,
                        type: 0,
                        fired: 0,
                        last: typeof last === 'boolean' ? last : false
                    }
                )
            });
        },

        on: (event, callback, last) => {
            event.split('|').forEach(ce => {
                ce = ce.trim();

                if(r.events[ce] === undefined) {
                    r.create(ce);
                }

                r.events[ce].callbacks.push(
                    {
                        do: callback,
                        type: 1,
                        fired: 0,
                        last: typeof last === 'boolean' ? last : false
                    }
                )
            });
        },

        only: (event, callback, last) => {
            event.split('|').forEach(ce => {
                ce = ce.trim();

                if(r.events[ce] === undefined) {
                    r.create(ce);
                }

                r.events[ce].callbacks.push(
                    {
                        do: callback,
                        type: 2,
                        fired: 0,
                        last: typeof last === 'boolean' ? last : false
                    }
                )
            });
        },

        isFired: event => {
            return typeof r.events[event] === 'object' ? r.events[event].fired > 0 : false;
        }
    };

    return typeof object === 'object' ? Object.assign(object, r) : r;
};