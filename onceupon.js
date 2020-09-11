module.exports = () => {
    let r = {
        events: {},

        fire: (event, data) => {
            if(r.events[event] === undefined) {
                r.create(event);
            }

            if(typeof data !== 'undefined') {
                r.events[event].data.push(data);
            }

            r.events[event].callbacks.forEach(e => {
                if(e.type === 0 && e.fired === 0) {
                    e.do(data !== undefined ? data : null, event);
                    e.fired++;
                } else if(e.type === 1) {
                    e.do(data !== undefined ? data : null, event);
                    e.fired++;
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
                                    if(c.type === 0 && c.fired === 0) {
                                        c.do(r.events[event].data[i] !== undefined ? r.events[event].data[c.fired] : null, event);
                                        c.fired++;
                                    } else if(c.type === 1) {
                                        c.do(r.events[event].data[i] !== undefined ? r.events[event].data[c.fired] : null, event);
                                        c.fired++;
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
    };

    return r;
};