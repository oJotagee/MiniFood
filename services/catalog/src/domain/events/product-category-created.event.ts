export type ProductCategoryCreatedEvent = {
  type: 'product.category.created';
  occurredAt: Date;
  payload: {
    categoryId: string;
    establishmentId: string;
    name: string;
  };
};
