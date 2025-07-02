import { Callback, CallbackHandler, Definition, Events, ListenerOptions, ListenerType, type PromiseOptions } from './awayback.model.js';
/**
 * @license
 * awayback
 * Released under MIT license
 * Copyright Luca Raúl Joos
 */
declare function awayback<D extends Definition>(): {
    events: Events<D>;
    emit: <E extends keyof D>(event: E, ...data: Parameters<D[E]>) => void;
    on: <E extends keyof D>(event: E, handler: CallbackHandler<D, E>, options?: ListenerOptions<D, E>) => void;
    once: <E extends keyof D>(event: E, handler: CallbackHandler<D, E>, options?: ListenerOptions<D, E>) => void;
    only: <E extends keyof D>(event: E, handler: CallbackHandler<D, E>, options?: ListenerOptions<D, E>) => void;
    promise: <E extends keyof D>(event: E, options?: PromiseOptions<D, E>) => Promise<Parameters<D[E]>>;
    remove: <E extends keyof D>(event: E, handler: CallbackHandler<D, E>) => void;
    destroy: () => void;
};
export { ListenerType };
export type { Callback, CallbackHandler, Definition, Events, ListenerOptions };
export default awayback;
