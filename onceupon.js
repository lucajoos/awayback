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
            event.split('|').forEach(ce => {
                if(r.events[ce] === undefined) {
                    r.create(ce);
                }
    
                if(typeof data !== 'undefined') {
                    if(data.length === 1) {
                        data = data[0];
                    }
    
                    r.events[ce].data.push(data);
                }
    
                r.events[ce].fired++;
    
                r.events[ce].callbacks.forEach(c => {
                    if((c.type === 0 && c.fired === 0) || c.type === 1 || (c.type === 2 && c.fired === 0 && r.events[ce].did === 0)) {
                        c.fired++;
                        r.events[ce].did = r.events[ce].did + 1;
                        c.do(typeof data !== 'undefined' ? data : null, ce);
                    }
                });
            })
        },

        create: event => {
            r.events[event] = {
                callbacks: new Proxy([], {
                    set: (target, key, value) => {
                        target[key] = value;

                        if(r.events[event].fired > 0) {
                            r.events[event].callbacks.forEach(c => {
                                let exit = false;

                                while(c.fired !== r.events[event].fired && !exit && !c.last) {
                                    if((c.type === 0 && c.fired === 0) || c.type === 1 || (c.type === 2 && c.fired === 0 && r.events[event].did === 0)) {
                                        c.fired++;
                                        r.events[event].did = r.events[event].did + 1;
                                        c.do(r.events[event].data[c.fired - 1] || null, event);
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

                if(r.events[ce].callbacks.length === 0) {
                    r.events[ce].callbacks.push(
                        {
                            do: callback,
                            type: 2,
                            fired: 0,
                            last: typeof last === 'boolean' ? last : false
                        }
                    )
                }
            });
        },

        isFired: event => {
            return event?.length > 0 ? (typeof r.events[event] === 'object' ? r.events[event].fired > 0 : false) : false;
        }
    };

    return typeof object === 'object' ? Object.assign(object, r) : r;
};