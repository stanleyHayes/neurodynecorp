import type { PaymentGateway } from "../../../domain/port/index.js";
import type { PaymentConfig } from "../../../config/index.js";
import { StripePaymentGateway } from "./stripe.js";
import { PaystackPaymentGateway } from "./paystack.js";

export function createPaymentGateway(config: PaymentConfig): PaymentGateway {
  switch (config.provider) {
    case "stripe":
      return new StripePaymentGateway({ secretKey: config.stripe.secretKey });
    case "paystack":
      return new PaystackPaymentGateway({ secretKey: config.paystack.secretKey });
    default:
      throw new Error(`Unknown payment provider: ${config.provider}`);
  }
}

export { StripePaymentGateway } from "./stripe.js";
export { PaystackPaymentGateway } from "./paystack.js";
