export type OrderConfirmedEvent = {
  type: 'order.confirmed';
  occurredAt: Date;
  payload: {
    orderId: string;
    customerId: string;
    establishmentId: string;
    totalAmountCents: string;
  };
};
