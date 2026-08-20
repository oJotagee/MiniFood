import { Injectable } from '@nestjs/common';

import type { InboxRepository } from '@/application/ports/inbox-repository.port';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InboxPrismaRepository implements InboxRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async wasReceived(eventId: string): Promise<boolean> {
    const existing = await this.prismaService.inboxEvent.findUnique({
      where: { eventId },
      select: { eventId: true },
    });

    return existing !== null;
  }

  async markReceived(eventId: string, type: string): Promise<void> {
    await this.prismaService.inboxEvent.create({
      data: { eventId, type, status: 'PROCESSING' },
    });
  }

  async markProcessed(eventId: string): Promise<void> {
    await this.prismaService.inboxEvent.update({
      where: { eventId },
      data: { status: 'PROCESSED', processedAt: new Date() },
    });
  }

  async markFailed(eventId: string, error: string): Promise<void> {
    await this.prismaService.inboxEvent.update({
      where: { eventId },
      data: { status: 'FAILED', attempts: { increment: 1 }, lastError: error },
    });
  }
}
