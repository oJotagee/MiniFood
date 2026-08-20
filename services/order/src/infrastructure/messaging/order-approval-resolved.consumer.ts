import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { connect, type Channel, type ConsumeMessage } from 'amqplib';

import type { InboxRepository } from '@/application/ports/inbox-repository.port';
import { INBOX_REPOSITORY } from '@/application/ports/inbox-repository.port';
import { OrderApprovalResolvedEventsHandler } from '@/application/handlers/order-approval-resolved-events.handler';
import type {
  OrderApprovedEvent,
  OrderRejectedEvent,
} from '@/domain/events/order-approval-resolved.event';

const EXCHANGE = 'minifood.events';
const QUEUE = 'order.approval-resolved-replies';

type Envelope = {
  eventId: string;
  type: 'order.approved' | 'order.rejected';
  payload: OrderApprovedEvent['payload'] | OrderRejectedEvent['payload'];
};

@Injectable()
export class OrderApprovalResolvedConsumer implements OnModuleInit {
  private readonly logger = new Logger(OrderApprovalResolvedConsumer.name);

  constructor(
    private readonly handler: OrderApprovalResolvedEventsHandler,
    @Inject(INBOX_REPOSITORY) private readonly inbox: InboxRepository,
  ) {}

  async onModuleInit(): Promise<void> {
    const connection = await connect(process.env.RABBITMQ_URL ?? 'amqp://localhost:5672');
    const channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE, 'topic', { durable: true });

    await channel.assertQueue(`${QUEUE}.dlq`, { durable: true });
    await channel.assertQueue(QUEUE, {
      durable: true,
      deadLetterExchange: '',
      deadLetterRoutingKey: `${QUEUE}.dlq`,
    });

    await channel.bindQueue(QUEUE, EXCHANGE, 'order.approved');
    await channel.bindQueue(QUEUE, EXCHANGE, 'order.rejected');

    await channel.prefetch(1);

    await channel.consume(QUEUE, (message) => void this.onMessage(channel, message));

    this.logger.log(`Listening on queue "${QUEUE}"`);
  }

  private async onMessage(channel: Channel, message: ConsumeMessage | null): Promise<void> {
    if (!message) return;

    try {
      const envelope = JSON.parse(message.content.toString()) as Envelope;

      const alreadyReceived = await this.inbox.wasReceived(envelope.eventId);
      if (alreadyReceived) {
        this.logger.warn(`Duplicate event ${envelope.eventId} (${envelope.type}), skipping`);
        channel.ack(message);
        return;
      }

      await this.inbox.markReceived(envelope.eventId, envelope.type);

      await this.handler.handle({
        type: envelope.type,
        occurredAt: new Date(),
        payload: envelope.payload,
      } as OrderApprovedEvent | OrderRejectedEvent);

      await this.inbox.markProcessed(envelope.eventId);
      channel.ack(message);
    } catch (error) {
      const messageText = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to process message: ${messageText}`);
      channel.nack(message, false, false);
    }
  }
}
