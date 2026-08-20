import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { connect, type Channel, type ChannelModel } from 'amqplib';

import type { EventBus } from '@/application/ports/event-bus.port';

const EXCHANGE = 'minifood.events';

@Injectable()
export class RabbitMqEventBus implements EventBus, OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMqEventBus.name);
  private connection!: ChannelModel;
  private channel!: Channel;

  async onModuleInit(): Promise<void> {
    this.connection = await connect(process.env.RABBITMQ_URL ?? 'amqp://localhost:5672');
    this.channel = await this.connection.createChannel();
    await this.channel.assertExchange(EXCHANGE, 'topic', { durable: true });
    this.logger.log(`Connected to RabbitMQ, exchange "${EXCHANGE}" ready`);
  }

  async publish<TType extends string, TPayload>(type: TType, payload: TPayload): Promise<void> {
    const envelope = {
      eventId: crypto.randomUUID(),
      type,
      version: 1 as const,
      payload,
      occurredAt: new Date().toISOString(),
    };

    this.channel.publish(EXCHANGE, type, Buffer.from(JSON.stringify(envelope)), {
      persistent: true,
      contentType: 'application/json',
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
  }
}
