import { Kafka, Producer } from "kafkajs";
import type { EventPublisher } from "../../../domain/port/index.js";

export interface KafkaPublisherConfig {
  brokers: string[];
  clientId: string;
}

export class KafkaEventPublisher implements EventPublisher {
  private readonly producer: Producer;

  constructor(config: KafkaPublisherConfig) {
    const kafka = new Kafka({
      clientId: config.clientId,
      brokers: config.brokers,
    });
    this.producer = kafka.producer();
  }

  async connect(): Promise<void> {
    await this.producer.connect();
  }

  async publish(topic: string, payload: unknown): Promise<void> {
    const value =
      typeof payload === "string" ? payload : JSON.stringify(payload);

    await this.producer.send({
      topic,
      messages: [{ value }],
    });
  }

  async close(): Promise<void> {
    await this.producer.disconnect();
  }
}
