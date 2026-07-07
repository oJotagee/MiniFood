export type EventEnvelope<TType extends string, TPayload, TVersion extends number = 1> = {
  eventId: string;
  type: TType;
  version: TVersion;
  occurredAt: string;
  payload: TPayload;
  producer: string;
  correlationId?: string;
  causationId?: string;
};
