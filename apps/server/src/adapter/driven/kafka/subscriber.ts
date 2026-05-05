import { Kafka, Consumer, EachMessagePayload } from "kafkajs";
import type { EventSubscriber } from "../../../domain/port/index.js";

export interface KafkaSubscriberConfig {
  brokers: string[];
  clientId: string;
  groupId: string;
}

export class KafkaEventSubscriber implements EventSubscriber {
  private readonly consumer: Consumer;
  private readonly handlers = new Map<string, (payload: unknown) => Promise<void>>();
  private running = false;

  constructor(config: KafkaSubscriberConfig) {
    const kafka = new Kafka({
      clientId: config.clientId,
      brokers: config.brokers,
    });
    this.consumer = kafka.consumer({ groupId: config.groupId });
  }

  async connect(): Promise<void> {
    await this.consumer.connect();
  }

  async subscribe(
    topic: string,
    handler: (payload: unknown) => Promise<void>,
  ): Promise<void> {
    if (this.running) {
      throw new Error(
        `Cannot subscribe to topic "${topic}" after start(). Register all subscriptions first.`,
      );
    }
    this.handlers.set(topic, handler);
    await this.consumer.subscribe({ topic, fromBeginning: false });
  }

  /** Call after all subscribe() calls to begin consuming. */
  async start(): Promise<void> {
    if (this.running) return;
    this.running = true;

    await this.consumer.run({
      eachMessage: async ({ topic: msgTopic, message }: EachMessagePayload) => {
        if (!message.value) return;

        const topicHandler = this.handlers.get(msgTopic);
        if (!topicHandler) return;

        const raw = message.value.toString();
        let parsed: unknown;
        try {
          parsed = JSON.parse(raw);
        } catch {
          parsed = raw;
        }

        await topicHandler(parsed);
      },
    });
  }

  async close(): Promise<void> {
    await this.consumer.disconnect();
  }
}
