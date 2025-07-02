export function any(...signals: (AbortSignal | undefined)[]): AbortSignal {
  const controller = new AbortController()
  const { signal } = controller

  signals.forEach((current) => current && current.addEventListener('abort', () => controller.abort()))

  return signal
}
