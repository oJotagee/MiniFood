import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import type { OutboxRepository } from '@/application/ports/outbox-repository.port';
import { OUTBOX_REPOSITORY } from '@/application/ports/outbox-repository.port';
import type { EventBus } from '@/application/ports/event-bus.port';
import { EVENT_BUS } from '@/application/ports/event-bus.port';

const POLL_INTERVAL_MS = 2000;
const BATCH_SIZE = 20;

@Injectable()
export class OutboxRelay implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxRelay.name);
  private timer?: ReturnType<typeof setInterval>;
  private running = false;

  constructor(
    @Inject(OUTBOX_REPOSITORY) private readonly outbox: OutboxRepository,
    @Inject(EVENT_BUS) private readonly eventBus: EventBus,
  ) {}

  onModuleInit(): void {
    this.timer = setInterval(() => void this.tick(), POLL_INTERVAL_MS);
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  private async tick(): Promise<void> {
    if (this.running) return;
    this.running = true;

    try {
      const pending = await this.outbox.findPending(BATCH_SIZE);

      for (const event of pending) {
        try {
          await this.eventBus.publish(event.type, event.payload);
          await this.outbox.markPublished(event.eventId);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          this.logger.error(`Failed to publish outbox event ${event.eventId}: ${message}`);
          await this.outbox.markFailed(event.eventId, message);
        }
      }
    } catch (error) {
      this.logger.error(`Outbox relay tick failed: ${String(error)}`);
    } finally {
      this.running = false;
    }
  }
}
