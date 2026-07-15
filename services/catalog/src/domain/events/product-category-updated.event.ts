export type ProductCategoryUpdatedEvent = {
  type: 'product.category.updated';
  occurredAt: Date;
  payload: {
    categoryId: string;
    establishmentId: string;
    name: string;
  };
};
