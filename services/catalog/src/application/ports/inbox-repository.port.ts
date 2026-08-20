export const INBOX_REPOSITORY = Symbol('INBOX_REPOSITORY');

export interface InboxRepository {
  wasReceived(eventId: string): Promise<boolean>;
  markReceived(eventId: string, type: string): Promise<void>;
  markProcessed(eventId: string): Promise<void>;
  markFailed(eventId: string, error: string): Promise<void>;
}
