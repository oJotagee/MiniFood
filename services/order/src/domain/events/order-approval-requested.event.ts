export type OrderApprovalRequestedItem = {
  itemId: string;
  quantity: number;
  priceCents: string;
};

export type OrderApprovalRequestedEvent = {
  type: 'order.approval.requested';
  occurredAt: Date;
  payload: {
    operationId: string;
    orderId: string;
    establishmentId: string;
    items: OrderApprovalRequestedItem[];
  };
};
