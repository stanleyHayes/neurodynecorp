import { createHmac, timingSafeEqual } from "crypto";
import type { Request, Response, NextFunction, RequestHandler } from "express";
import type { Logger } from "pino";
import Stripe from "stripe";
import type { BillingService } from "../../../app/billing-service.js";
import { InvoiceAlreadyPaidError, InvoiceNotFoundError } from "../../../app/billing-service.js";

export interface PaymentWebhookConfig {
  stripeWebhookSecret: string;
  paystackWebhookSecret: string;
}

/**
 * Provider payment webhooks (Stripe / Paystack). Mount Stripe with
 * `express.raw({ type: "application/json" })` so the signature can be verified.
 */
export function createPaymentWebhookHandlers(
  billingService: BillingService,
  config: PaymentWebhookConfig,
  logger: Logger,
): { stripe: RequestHandler; paystack: RequestHandler } {
  const stripeHandler: RequestHandler = async (req: Request, res: Response, _next: NextFunction) => {
    const secret = config.stripeWebhookSecret;
    if (!secret) {
      logger.warn("Stripe webhook received but NEURODYNE_STRIPE_WEBHOOK_SECRET is unset");
      res.status(503).json({ error: "Webhook not configured" });
      return;
    }

    const signature = req.headers["stripe-signature"];
    if (typeof signature !== "string") {
      res.status(400).json({ error: "Missing Stripe signature" });
      return;
    }

    const rawBody = req.body;
    if (!Buffer.isBuffer(rawBody)) {
      res.status(400).json({ error: "Raw body required for Stripe webhook verification" });
      return;
    }

    let event: Stripe.Event;
    try {
      // Stripe SDK verifies the signature against the raw payload.
      event = Stripe.webhooks.constructEvent(rawBody, signature, secret);
    } catch (err) {
      logger.warn({ err }, "Stripe webhook signature verification failed");
      res.status(400).json({ error: "Invalid signature" });
      return;
    }

    try {
      if (event.type === "payment_intent.succeeded") {
        const intent = event.data.object as Stripe.PaymentIntent;
        const invoiceId = intent.metadata?.["invoiceId"] ?? intent.metadata?.["invoice_id"];
        if (invoiceId) {
          try {
            await billingService.markPaid(invoiceId, intent.id);
          } catch (err) {
            if (!(err instanceof InvoiceAlreadyPaidError) && !(err instanceof InvoiceNotFoundError)) {
              throw err;
            }
            logger.info({ invoiceId, err: (err as Error).name }, "Stripe webhook invoice mark skipped");
          }
        } else {
          logger.info({ paymentIntentId: intent.id }, "Stripe payment succeeded without invoiceId metadata");
        }
      }
      res.status(200).json({ received: true });
    } catch (err) {
      logger.error({ err }, "Stripe webhook handler failed");
      res.status(500).json({ error: "Webhook handler failed" });
    }
  };

  const paystackHandler: RequestHandler = async (req: Request, res: Response, _next: NextFunction) => {
    const secret = config.paystackWebhookSecret;
    if (!secret) {
      logger.warn("Paystack webhook received but NEURODYNE_PAYSTACK_WEBHOOK_SECRET is unset");
      res.status(503).json({ error: "Webhook not configured" });
      return;
    }

    const signature = req.headers["x-paystack-signature"];
    if (typeof signature !== "string") {
      res.status(400).json({ error: "Missing Paystack signature" });
      return;
    }

    if (!Buffer.isBuffer(req.body)) {
      res.status(400).json({ error: "Raw body required for Paystack webhook verification" });
      return;
    }

    const hash = createHmac("sha512", secret).update(req.body).digest("hex");
    const a = Buffer.from(hash);
    const b = Buffer.from(signature);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      logger.warn("Paystack webhook signature verification failed");
      res.status(400).json({ error: "Invalid signature" });
      return;
    }

    try {
      const event = JSON.parse(req.body.toString("utf8")) as {
        event?: string;
        data?: { reference?: string; metadata?: Record<string, string> };
      };

      if (event.event === "charge.success") {
        const invoiceId = event.data?.metadata?.["invoiceId"] ?? event.data?.metadata?.["invoice_id"];
        const reference = event.data?.reference ?? `paystack-${Date.now()}`;
        if (invoiceId) {
          try {
            await billingService.markPaid(invoiceId, reference);
          } catch (err) {
            if (!(err instanceof InvoiceAlreadyPaidError) && !(err instanceof InvoiceNotFoundError)) {
              throw err;
            }
            logger.info({ invoiceId, err: (err as Error).name }, "Paystack webhook invoice mark skipped");
          }
        } else {
          logger.info({ reference }, "Paystack charge succeeded without invoiceId metadata");
        }
      }
      res.status(200).json({ received: true });
    } catch (err) {
      logger.error({ err }, "Paystack webhook handler failed");
      res.status(500).json({ error: "Webhook handler failed" });
    }
  };

  return { stripe: stripeHandler, paystack: paystackHandler };
}
