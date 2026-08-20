import type {
  OutboxEventRecord,
  OutboxRepository,
  PendingOutboxEvent,
} from '@/application/ports/outbox-repository.port';

export class FakeOutboxRepository implements OutboxRepository {
  public readonly events: OutboxEventRecord[] = [];

  async add(_tx: unknown, event: OutboxEventRecord): Promise<void> {
    this.events.push(event);
  }

  async runInTransaction(fn: (tx: unknown) => Promise<void>): Promise<void> {
    await fn({});
  }

  async findPending(limit: number): Promise<PendingOutboxEvent[]> {
    return this.events.slice(0, limit).map((event) => ({ ...event, attempts: 0 }));
  }

  async markPublished(): Promise<void> {}

  async markFailed(): Promise<void> {}
}
