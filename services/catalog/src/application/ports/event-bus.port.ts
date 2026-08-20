export const EVENT_BUS = Symbol('EVENT_BUS');

export interface EventBus {
  publish<TType extends string, TPayload>(type: TType, payload: TPayload): Promise<void>;
}
