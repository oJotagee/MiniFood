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

export class InvalidOrderTransitionError extends Error {
  constructor(currentStatus: string, targetStatus: string) {
    super(`Order cannot transition from ${currentStatus} to ${targetStatus}.`);
    this.name = 'InvalidOrderTransitionError';
  }
}
