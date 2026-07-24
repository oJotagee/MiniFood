export type ProductActivatedEvent = {
  type: 'product.activated';
  occurredAt: Date;
  payload: {
    productId: string;
  };
};
