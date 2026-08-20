import { Injectable } from '@nestjs/common';
import type { Prisma } from '@generated/prisma/client';

import type {
  OutboxEventRecord,
  OutboxRepository,
  PendingOutboxEvent,
} from '@/application/ports/outbox-repository.port';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OutboxPrismaRepository implements OutboxRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async add(tx: unknown, event: OutboxEventRecord): Promise<void> {
    const client = tx as Prisma.TransactionClient;

    await client.outboxEvent.create({
      data: {
        eventId: event.eventId,
        type: event.type,
        payload: event.payload as Prisma.InputJsonValue,
        occurredAt: event.occurredAt,
      },
    });
  }

  async runInTransaction(fn: (tx: unknown) => Promise<void>): Promise<void> {
    await this.prismaService.$transaction((tx) => fn(tx));
  }

  async findPending(limit: number): Promise<PendingOutboxEvent[]> {
    const rows = await this.prismaService.outboxEvent.findMany({
      where: { publishedAt: null },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });

    return rows.map((row) => ({
      eventId: row.eventId,
      type: row.type,
      payload: row.payload,
      occurredAt: row.occurredAt,
      attempts: row.attempts,
    }));
  }

  async markPublished(eventId: string): Promise<void> {
    await this.prismaService.outboxEvent.update({
      where: { eventId },
      data: { publishedAt: new Date() },
    });
  }

  async markFailed(eventId: string, error: string): Promise<void> {
    await this.prismaService.outboxEvent.update({
      where: { eventId },
      data: { attempts: { increment: 1 }, lastError: error },
    });
  }
}
