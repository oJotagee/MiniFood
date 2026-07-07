export type ProductUpdatedEvent = {
  type: 'product.updated';
  occurredAt: Date;
  payload: {
    operationId: string;
    establishmentId: string;
    productId: string;
    productCategoryId: string;
    name: string;
    description?: string;
    priceCents: string;
    isAvailable: boolean;
  };
};
