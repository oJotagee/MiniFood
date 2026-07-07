export type ProductDeactivatedEvent = {
  type: 'product.deactivated';
  occurredAt: Date;
  payload: {
    operationId: string;
    establishmentId: string;
    productId: string;
  };
};
