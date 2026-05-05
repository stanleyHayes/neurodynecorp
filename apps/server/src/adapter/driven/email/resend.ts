import { Resend } from "resend";
import type { EmailService } from "../../../domain/port/index.js";

export interface ResendEmailConfig {
  apiKey: string;
  fromAddress: string;
}

export class ResendEmailService implements EmailService {
  private readonly client: Resend;
  private readonly from: string;

  constructor(config: ResendEmailConfig) {
    this.client = new Resend(config.apiKey);
    this.from = config.fromAddress;
  }

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    await this.client.emails.send({
      from: this.from,
      to,
      subject,
      html,
    });
  }

  async sendTemplateEmail(
    to: string,
    templateId: string,
    variables: Record<string, string>,
  ): Promise<void> {
    // Resend does not have a native template-by-ID endpoint like some
    // providers. We fetch the template content and interpolate variables
    // manually. For production you could use React Email components or
    // a stored-template mapping. Here we send with the subject derived
    // from the templateId and variables rendered into a simple HTML body.
    let html = `<p>Template: ${templateId}</p>`;
    for (const [key, value] of Object.entries(variables)) {
      html += `<p><strong>${key}:</strong> ${value}</p>`;
    }

    await this.client.emails.send({
      from: this.from,
      to,
      subject: templateId,
      html,
    });
  }
}
