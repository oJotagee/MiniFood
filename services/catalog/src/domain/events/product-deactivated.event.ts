export type ProductDeactivatedEvent = {
  type: 'product.deactivated';
  occurredAt: Date;
  payload: {
    productId: string;
  };
};
