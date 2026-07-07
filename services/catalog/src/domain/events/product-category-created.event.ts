export type ProductCategoryCreatedEvent = {
  type: 'product.category.created';
  occurredAt: Date;
  payload: {
    operationId: string;
    categoryId: string;
    establishmentId: string;
    name: string;
  };
};
