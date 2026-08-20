export class OrderNotFoundError extends Error {
  constructor() {
    super('Order not found.');
    this.name = 'OrderNotFoundError';
  }
}

export class OrderStatusEmptyError extends Error {
  constructor() {
    super('Order status cannot be empty.');
    this.name = 'OrderStatusEmptyError';
  }
}

export class OrderMustHaveItemsError extends Error {
  constructor() {
    super('Order must contain at least one item.');
    this.name = 'OrderMustHaveItemsError';
  }
}

export class InvalidOrderStatusError extends Error {
  constructor(status: string) {
    super(`Order status "${status}" is invalid.`);
    this.name = 'InvalidOrderStatusError';
  }
}

export class OrderNotOwnedError extends Error {
  constructor(id: string) {
    super(`Order with ID ${id} does not belong to the requester.`);
    this.name = 'OrderNotOwnedError';
  }
}

export class InvalidOrderTransitionError extends Error {
  constructor(id: string, from: string, to: string) {
    super(`Order with ID ${id} cannot transition from "${from}" to "${to}".`);
    this.name = 'InvalidOrderTransitionError';
  }
}
