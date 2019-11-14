module.exports = () => {
    let r = {
        events: {},

        fire: (n, d) => {
            if(r.events[n] === undefined) {
                r.create(n);
            }

            r.events[n].fired++;

            r.events[n].callbacks.forEach(e => {
                if(e.type === 0 && e.fired === 0) {
                    e.do(d !== undefined ? d : null, n);
                    e.fired++;
                } else if(e.type === 1) {
                    e.do(d !== undefined ? d : null, n);
                    e.fired++;
                }
            });
        },

        create: n => {
            r.events[n] = {
                callbacks: new Proxy([], {
                    set: (target, key, value) => {
                        target[key] = value;

                        if(r.events[n].fired > 0) {
                            r.events[n].callbacks.forEach(c => {
                                let exit = false;

                                while(c.fired !== r.events[n].fired && !exit) {
                                    if(c.type === 0 && c.fired === 0) {
                                        c.do();
                                        c.fired++;
                                    } else if(c.type === 1) {
                                        c.do();
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
            }
        },

        once: (event, callback) => {
            event.split('|').forEach(ce => {
                ce = ce.trim();

                if(r.events[ce] === undefined) {
                    r.create(ce);
                }

                r.events[ce].callbacks.push(
                    {
                        do: callback,
                        type: 0,
                        fired: 0
                    }
                )
            });
        },

        on: (event, callback) => {
            event.split('|').forEach(ce => {
                ce = ce.trim();

                if(r.events[ce] === undefined) {
                    r.create(ce);
                }

                r.events[ce].callbacks.push(
                    {
                        do: callback,
                        type: 1,
                        fired: 0
                    }
                )
            });
        },
    };

    return r;
};