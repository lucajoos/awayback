export function any(...signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController()
  const { signal } = controller

  signals.forEach((current) => current.addEventListener('abort', () => controller.abort()))

  return signal
}
