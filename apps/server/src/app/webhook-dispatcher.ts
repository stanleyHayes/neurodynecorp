import { createHmac } from "crypto";
import type { Logger } from "pino";
import type { WebhookSubscription, WebhookDelivery } from "../domain/entity/webhook.js";
import { createWebhookDelivery } from "../domain/entity/webhook.js";

/**
 * Delivers domain events to client-registered webhook endpoints.
 *
 * Before this existed the webhooks feature was decorative: a client could
 * register an endpoint, copy the signing secret and select events, and never
 * receive one. `createDelivery` was called from exactly one place in the whole
 * server — the manual "send test event" button — so the only traffic an
 * endpoint ever saw was a ping the client triggered themselves. Silence read as
 * the integrator's own bug.
 *
 * OWNERSHIP IS THE SECURITY BOUNDARY. Event payloads are inconsistent: some
 * carry `clientId`, others only a `projectId`. A dispatcher that fanned every
 * event out to every matching subscription would leak one client's project and
 * invoice activity to another. So every event must resolve to exactly one
 * owner, and an event whose owner cannot be resolved is dropped rather than
 * broadcast. Dropping a notification is recoverable; leaking one is not.
 */

export interface WebhookRepo {
  listActiveByEvent(event: string): Promise<WebhookSubscription[]>;
  createDelivery(d: WebhookDelivery): Promise<WebhookDelivery>;
  updateDelivery(d: WebhookDelivery): Promise<WebhookDelivery>;
}

/** Resolves the client an event belongs to, or null if it cannot be determined. */
export type OwnerResolver = (topic: string, payload: Record<string, unknown>) => Promise<string | null>;

/** Guards against SSRF — the same check the manual ping applies. */
export type UrlGuard = (url: string) => Promise<void>;

export interface WebhookDispatcherDeps {
  repo: WebhookRepo;
  resolveOwner: OwnerResolver;
  assertSafeUrl: UrlGuard;
  logger: Logger;
}

/** Attempt schedule in ms. Three tries over ~7s, then the delivery is failed. */
const RETRY_BACKOFF = [0, 2_000, 5_000];
const TIMEOUT_MS = 5_000;

export class WebhookDispatcher {
  constructor(private readonly deps: WebhookDispatcherDeps) {}

  /**
   * Fans one domain event out to its owner's matching subscriptions.
   *
   * Never throws: a webhook failure must not roll back the business operation
   * that produced the event. Everything is logged and recorded as a delivery.
   */
  async dispatch(topic: string, payload: unknown): Promise<void> {
    try {
      const body = (payload ?? {}) as Record<string, unknown>;
      const subs = await this.deps.repo.listActiveByEvent(topic);
      if (subs.length === 0) return;

      const ownerId = await this.deps.resolveOwner(topic, body);
      if (!ownerId) {
        // Not an error — plenty of events (user.registered, internal specs)
        // have no single client owner. Dropping is the safe outcome.
        this.deps.logger.debug({ topic }, "Webhook event has no resolvable owner; not delivered");
        return;
      }

      const targets = subs.filter((s) => s.ownerId === ownerId);
      if (targets.length === 0) return;

      await Promise.all(targets.map((sub) => this.deliver(sub, topic, body)));
    } catch (err) {
      this.deps.logger.error({ err, topic }, "Webhook dispatch failed");
    }
  }

  private async deliver(sub: WebhookSubscription, event: string, payload: Record<string, unknown>): Promise<void> {
    let delivery = await this.deps.repo.createDelivery(
      createWebhookDelivery({ subscriptionId: sub.id, event, status: "pending", attempts: 0 }),
    );

    const body = JSON.stringify({ event, at: new Date().toISOString(), data: payload });
    const signature = createHmac("sha256", sub.secret).update(body).digest("hex");

    for (let attempt = 0; attempt < RETRY_BACKOFF.length; attempt++) {
      if (RETRY_BACKOFF[attempt] > 0) {
        await new Promise((r) => setTimeout(r, RETRY_BACKOFF[attempt]));
      }

      try {
        // Re-checked on every attempt, not just at registration: DNS can be
        // repointed at a private address between creating a subscription and
        // delivering to it.
        await this.deps.assertSafeUrl(sub.url);

        const response = await fetch(sub.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Webhook-Event": event,
            "X-Webhook-Signature": signature,
            "X-Webhook-Delivery": delivery.id,
          },
          body,
          redirect: "manual",
          signal: AbortSignal.timeout(TIMEOUT_MS),
        });

        delivery = await this.deps.repo.updateDelivery({
          ...delivery,
          attempts: attempt + 1,
          responseCode: response.status,
          status: response.ok ? "success" : "failed",
        });

        if (response.ok) return;

        // 4xx means the endpoint rejected the payload; retrying sends the same
        // bytes to the same complaint. Only server-side failures are retried.
        if (response.status < 500) return;
      } catch (err) {
        delivery = await this.deps.repo.updateDelivery({
          ...delivery,
          attempts: attempt + 1,
          status: "failed",
        });
        this.deps.logger.warn(
          { err, subscriptionId: sub.id, event, attempt: attempt + 1 },
          "Webhook delivery attempt failed",
        );
      }
    }
  }
}

/**
 * Wraps an EventPublisher so every published event also reaches webhooks.
 *
 * A decorator rather than a call inside each service: there are nine publish
 * sites across five services, and any new one would otherwise have to remember
 * to dispatch. It also means webhooks work when Kafka is unavailable and the
 * publisher is the no-op stub, which is the common case in development.
 */
export function withWebhookDispatch<T extends { publish(topic: string, payload: unknown): Promise<void> }>(
  publisher: T,
  dispatcher: WebhookDispatcher,
): T {
  const original = publisher.publish.bind(publisher);
  return Object.assign(publisher, {
    publish: async (topic: string, payload: unknown) => {
      await original(topic, payload);
      // Deliberately not awaited into the caller's critical path, and it never
      // throws — an unreachable client endpoint must not fail the invoice.
      void dispatcher.dispatch(topic, payload);
    },
  });
}
