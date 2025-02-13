import { Callback, ListenerType, Definition, Events, ListenerOptions, CallbackHandler } from './awayback.model.js';
/**
 * @license
 * awayback
 * Released under MIT license
 * Copyright Luca Raúl Joos
 */
declare function awayback<D extends Definition>(): {
    events: Events<D>;
    emit: <E extends keyof D>(event: E, ...data: Parameters<D[E]>) => void;
    on: <E extends keyof D>(event: E, handler: CallbackHandler<D, E>, options?: ListenerOptions) => void;
    once: <E extends keyof D>(event: E, handler: CallbackHandler<D, E>, options?: ListenerOptions) => void;
    only: <E extends keyof D>(event: E, handler: CallbackHandler<D, E>, options?: ListenerOptions) => void;
    promise: <E extends keyof D>(event: E, options?: ListenerOptions) => Promise<Parameters<D[E]>>;
    remove: <E extends keyof D>(event: E, handler: CallbackHandler<D, E>) => void;
    destroy: () => void;
};
export { ListenerType };
export type { Callback, Definition, Events, ListenerOptions, CallbackHandler };
export default awayback;
