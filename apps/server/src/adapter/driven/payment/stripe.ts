import Stripe from "stripe";
import type { PaymentGateway } from "../../../domain/port/index.js";

export interface StripeConfig {
  secretKey: string;
}

export class StripePaymentGateway implements PaymentGateway {
  private readonly stripe: Stripe;

  constructor(config: StripeConfig) {
    this.stripe = new Stripe(config.secretKey, {
      apiVersion: "2025-01-27.acacia" as Stripe.LatestApiVersion,
    });
  }

  async createPaymentIntent(
    amount: number,
    currency: string,
    metadata?: Record<string, string>,
  ): Promise<{ clientSecret: string; paymentIntentId: string }> {
    const intent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects cents
      currency: currency.toLowerCase(),
      metadata: metadata ?? {},
    });

    return {
      clientSecret: intent.client_secret!,
      paymentIntentId: intent.id,
    };
  }

  async confirmPayment(paymentIntentId: string): Promise<boolean> {
    const intent =
      await this.stripe.paymentIntents.retrieve(paymentIntentId);
    return intent.status === "succeeded";
  }

  async getPaymentStatus(
    paymentIntentId: string,
  ): Promise<"pending" | "succeeded" | "failed" | "cancelled"> {
    const intent =
      await this.stripe.paymentIntents.retrieve(paymentIntentId);

    switch (intent.status) {
      case "succeeded":
        return "succeeded";
      case "canceled":
        return "cancelled";
      case "requires_payment_method":
      case "requires_confirmation":
      case "requires_action":
      case "processing":
        return "pending";
      default:
        return "failed";
    }
  }
}
