export type ProductDeactivatedEvent = {
  type: 'product.deactivated';
  occurredAt: Date;
  payload: {
    establishmentId: string;
    productId: string;
  };
};
