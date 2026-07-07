export type ProductCreatedEvent = {
  type: 'product.created';
  occurredAt: Date;
  payload: {
    operationId: string;
    productId: string;
    establishmentId: string;
    productCategoryId: string;
    name: string;
    description?: string;
    priceCents: string;
    isAvailable: boolean;
  };
};
