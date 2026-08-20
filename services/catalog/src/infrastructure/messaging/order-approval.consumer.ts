import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { connect, type Channel, type ConsumeMessage } from 'amqplib';

import type { OrderApprovalRequested } from '@/application/handlers/order-approval-events.handler';
import { OrderApprovalEventsHandler } from '@/application/handlers/order-approval-events.handler';
import type { InboxRepository } from '@/application/ports/inbox-repository.port';
import { INBOX_REPOSITORY } from '@/application/ports/inbox-repository.port';

const EXCHANGE = 'minifood.events';
const QUEUE = 'catalog.order-approval-requests';

type Envelope = {
  eventId: string;
  type: 'order.approval.requested';
  payload: OrderApprovalRequested['payload'];
};

@Injectable()
export class OrderApprovalConsumer implements OnModuleInit {
  private readonly logger = new Logger(OrderApprovalConsumer.name);

  constructor(
    private readonly handler: OrderApprovalEventsHandler,
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

    await channel.bindQueue(QUEUE, EXCHANGE, 'order.approval.requested');

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

      await this.handler.handle(envelope);

      await this.inbox.markProcessed(envelope.eventId);
      channel.ack(message);
    } catch (error) {
      this.logger.error(`Failed to process message: ${String(error)}`);
      channel.nack(message, false, false);
    }
  }
}
