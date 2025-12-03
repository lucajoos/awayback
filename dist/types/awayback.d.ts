import { Definition, EventProperty, Events, Listener, ListenerCallback, ListenerOptions, ListenerProperty, ListenerType, type Awayback, type PromiseOptions } from './awayback.model.js';
/**
 * @license
 * awayback
 * Released under MIT license
 * Copyright Luca Raúl Joos
 */
declare function awayback<D extends Definition>(replayable?: undefined): Awayback<D, undefined>;
declare function awayback<D extends Definition, const R extends (keyof D)[]>(replayable: R): Awayback<D, R>;
export { EventProperty, ListenerProperty, ListenerType };
export type { Awayback, Definition, Events, Listener, ListenerCallback, ListenerOptions, PromiseOptions };
export default awayback;
