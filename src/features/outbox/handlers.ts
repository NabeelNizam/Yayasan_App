export type WebhookEvent = {
  provider: string
  eventId: string
  payload: unknown
}

export type WebhookHandler = (event: WebhookEvent) => Promise<void>

const registry = new Map<string, WebhookHandler>()

export function registerWebhookHandler(provider: string, handler: WebhookHandler): void {
  if (!provider) throw new Error('provider name is required')
  registry.set(provider, handler)
}

export function getWebhookHandler(provider: string): WebhookHandler | undefined {
  return registry.get(provider)
}

export function availableProviders(): string[] {
  return [...registry.keys()]
}

/** Test-only: clear the registry. */
export function resetWebhookHandlers(): void {
  registry.clear()
}

/**
 * Default handler for providers without an integration yet (payment is on hold).
 * It records the event durably (the row is already persisted in webhook_inbox)
 * and resolves - it is a REAL seam: when a provider integration lands, register
 * a handler for that provider name and the relay will route to it.
 */
export const defaultWebhookHandler: WebhookHandler = async (event) => {
  void event
}
