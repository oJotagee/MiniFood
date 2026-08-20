export type OrderApprovedEvent = {
  type: 'order.approved';
  occurredAt: Date;
  payload: {
    operationId: string;
    orderId: string;
  };
};

export type OrderRejectedReason =
  | 'PRODUCT_NOT_FOUND'
  | 'PRODUCT_NOT_AVAILABLE'
  | 'PRODUCT_FROM_ANOTHER_ESTABLISHMENT'
  | 'REJECTED_BY_ESTABLISHMENT'
  | 'UNKNOWN';

export type OrderRejectedEvent = {
  type: 'order.rejected';
  occurredAt: Date;
  payload: {
    operationId: string;
    orderId: string;
    reason: OrderRejectedReason;
  };
};
