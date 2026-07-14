export type EstablishmentUpdatedEvent = {
  type: 'establishment.updated';
  occurredAt: Date;
  payload: {
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
  };
};
