export type OrderCancelledEvent = {
  type: 'order.cancelled';
  occurredAt: Date;
  payload: {
    orderId: string;
    customerId: string;
    establishmentId: string;
    totalAmountCents: string;
  };
};
