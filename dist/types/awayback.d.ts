import { Callback, CallbackHandler, Definition, Events, ListenerOptions, ListenerType, type Awayback } from './awayback.model.js';
/**
 * @license
 * awayback
 * Released under MIT license
 * Copyright Luca Raúl Joos
 */
declare function awayback<D extends Definition>(cache?: undefined): Awayback<D, undefined>;
declare function awayback<D extends Definition, const C extends (keyof D)[]>(cache: C): Awayback<D, C>;
export { ListenerType };
export type { Callback, CallbackHandler, Definition, Events, ListenerOptions };
export default awayback;
