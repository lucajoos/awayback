export function any(...signals) {
    const controller = new AbortController();
    const { signal } = controller;
    signals.forEach((current) => current && current.addEventListener('abort', () => controller.abort()));
    return signal;
}
