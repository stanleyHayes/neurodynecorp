import type { PaymentGateway } from "../../../domain/port/index.js";

export interface PaystackConfig {
  secretKey: string;
}

interface PaystackInitResponse {
  status: boolean;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

interface PaystackVerifyResponse {
  status: boolean;
  data: {
    status: "success" | "abandoned" | "failed" | "pending";
    reference: string;
    amount: number;
    currency: string;
    metadata: Record<string, string>;
  };
}

export class PaystackPaymentGateway implements PaymentGateway {
  private readonly secretKey: string;
  private readonly baseUrl = "https://api.paystack.co";

  constructor(config: PaystackConfig) {
    this.secretKey = config.secretKey;
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Paystack API error (${res.status}): ${body}`);
    }

    return res.json() as Promise<T>;
  }

  async createPaymentIntent(
    amount: number,
    currency: string,
    metadata?: Record<string, string>,
  ): Promise<{ clientSecret: string; paymentIntentId: string }> {
    const data = await this.request<PaystackInitResponse>(
      "/transaction/initialize",
      {
        method: "POST",
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Paystack expects kobo/cents
          currency: currency.toUpperCase(),
          metadata: metadata ?? {},
          email: metadata?.email ?? "customer@neurodynecorp.com",
        }),
      },
    );

    return {
      // Prefer hosted checkout URL so clients can pay without a native SDK.
      clientSecret: data.data.authorization_url || data.data.access_code,
      paymentIntentId: data.data.reference,
    };
  }

  async confirmPayment(paymentIntentId: string): Promise<boolean> {
    const data = await this.request<PaystackVerifyResponse>(
      `/transaction/verify/${encodeURIComponent(paymentIntentId)}`,
    );
    return data.data.status === "success";
  }

  async getPaymentStatus(
    paymentIntentId: string,
  ): Promise<"pending" | "succeeded" | "failed" | "cancelled"> {
    const data = await this.request<PaystackVerifyResponse>(
      `/transaction/verify/${encodeURIComponent(paymentIntentId)}`,
    );

    switch (data.data.status) {
      case "success":
        return "succeeded";
      case "abandoned":
        return "cancelled";
      case "pending":
        return "pending";
      default:
        return "failed";
    }
  }
}
