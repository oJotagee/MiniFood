export type OrderCreatedEvent = {
  type: 'order.created';
  occurredAt: Date;
  payload: {
    orderId: string;
    customerId: string;
    establishmentId: string;
    totalAmountCents: string;
  };
};
