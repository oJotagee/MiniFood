export type ProductCategoryUpdatedEvent = {
  type: 'product.category.updated';
  occurredAt: Date;
  payload: {
    operationId: string;
    categoryId: string;
    establishmentId: string;
    name: string;
  };
};
