export type ProductUpdatedEvent = {
  type: 'product.updated';
  occurredAt: Date;
  payload: {
    productId: string;
    productCategoryId: string;
    name: string;
    description?: string;
    priceCents: string;
    isAvailable: boolean;
  };
};
