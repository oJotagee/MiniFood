export class OrderItemNotFound extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OrderItemNotFound';
  }
}

export class OrderItemNameCannotBeEmpty extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OrderItemNameCannotBeEmpty';
  }
}

export class ItemIdNotFound extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ItemIdNotFound';
  }
}

export class OrderIdNotFound extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OrderIdNotFound';
  }
}

export class OrderItemDoesNotBelongToOrderError extends Error {
  constructor(itemId: string, orderId: string) {
    super(`Order item ${itemId} does not belong to order ${orderId}.`);
    this.name = 'OrderItemDoesNotBelongToOrderError';
  }
}
