export class OrderApprovalNotFoundError extends Error {
  constructor(orderId: string) {
    super(`Order approval for order ${orderId} not found.`);
    this.name = 'OrderApprovalNotFoundError';
  }
}

export class OrderApprovalNotOwnedError extends Error {
  constructor(orderId: string) {
    super(`Order approval for order ${orderId} does not belong to the requester's establishment.`);
    this.name = 'OrderApprovalNotOwnedError';
  }
}

export class OrderApprovalAlreadyDecidedError extends Error {
  constructor(orderId: string, status: string) {
    super(`Order approval for order ${orderId} was already decided (${status}).`);
    this.name = 'OrderApprovalAlreadyDecidedError';
  }
}
