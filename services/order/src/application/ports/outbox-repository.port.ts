export const OUTBOX_REPOSITORY = Symbol('OUTBOX_REPOSITORY');

export type OutboxEventRecord = {
  eventId: string;
  type: string;
  payload: unknown;
  occurredAt: Date;
};

export type PendingOutboxEvent = OutboxEventRecord & {
  attempts: number;
};

export interface OutboxRepository {
  add(tx: unknown, event: OutboxEventRecord): Promise<void>;
  runInTransaction(fn: (tx: unknown) => Promise<void>): Promise<void>;
  findPending(limit: number): Promise<PendingOutboxEvent[]>;
  markPublished(eventId: string): Promise<void>;
  markFailed(eventId: string, error: string): Promise<void>;
}
