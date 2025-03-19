"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.any = any;
function any(...signals) {
    const controller = new AbortController();
    const { signal } = controller;
    signals.forEach((current) => current && current.addEventListener('abort', () => controller.abort()));
    return signal;
}
