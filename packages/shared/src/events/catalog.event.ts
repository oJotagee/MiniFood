import type { EventEnvelope } from './event-envelope';

export type CatalogEstablishmentCreated = EventEnvelope<
  'catalog.establishment.created',
  {
    establishmentId: string;
    ownerId: string;
    name: string;
    description?: string;
    address: {
      street: string;
      number: string;
      complement?: string;
      neighborhood: string;
      city: string;
      state: string;
      zipCode: string;
    };
  }
>;

export type CatalogEstablishmentUpdated = EventEnvelope<
  'catalog.establishment.updated',
  {
    establishmentId: string;
    name: string;
    description?: string;
    address: {
      street: string;
      number: string;
      complement?: string;
      neighborhood: string;
      city: string;
      state: string;
      zipCode: string;
    };
  }
>;

export type CatalogProductCategoryCreated = EventEnvelope<
  'catalog.product-category.created',
  {
    categoryId: string;
    establishmentId: string;
    name: string;
  }
>;

export type CatalogProductCategoryUpdated = EventEnvelope<
  'catalog.product-category.updated',
  {
    categoryId: string;
    establishmentId: string;
    name: string;
  }
>;

export type CatalogProductCreated = EventEnvelope<
  'catalog.product.created',
  {
    productId: string;
    establishmentId: string;
    categoryId: string;
    name: string;
    description?: string;
    priceCents: string;
    isAvailable: boolean;
  }
>;

export type CatalogProductUpdated = EventEnvelope<
  'catalog.product.updated',
  {
    productId: string;
    establishmentId: string;
    categoryId: string;
    name: string;
    description?: string;
    priceCents: string;
    isAvailable: boolean;
  }
>;

export type CatalogProductDeactivated = EventEnvelope<
  'catalog.product.deactivated',
  {
    productId: string;
    establishmentId: string;
  }
>;

export type CatalogEvent =
  | CatalogEstablishmentCreated
  | CatalogEstablishmentUpdated
  | CatalogProductCategoryCreated
  | CatalogProductCategoryUpdated
  | CatalogProductCreated
  | CatalogProductUpdated
  | CatalogProductDeactivated;
