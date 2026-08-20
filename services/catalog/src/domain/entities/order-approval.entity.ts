import { OrderApprovalAlreadyDecidedError } from '../errors/order-approval.errors';

export enum OrderApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export type OrderApprovalItem = {
  itemId: string;
  quantity: number;
  priceCents: string;
};

type OrderApprovalProps = {
  orderId: string;
  operationId: string;
  establishmentId: string;
  status: OrderApprovalStatus;
  items: OrderApprovalItem[];
  decidedBy?: string;
  decidedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

type OrderApprovalCreateInput = {
  orderId: string;
  operationId: string;
  establishmentId: string;
  items: OrderApprovalItem[];
};

type OrderApprovalRestoreInput = OrderApprovalProps;

export class OrderApprovalEntity {
  private constructor(private readonly props: OrderApprovalProps) {}

  get orderId(): string {
    return this.props.orderId;
  }

  get operationId(): string {
    return this.props.operationId;
  }

  get establishmentId(): string {
    return this.props.establishmentId;
  }

  get status(): OrderApprovalStatus {
    return this.props.status;
  }

  get items(): readonly OrderApprovalItem[] {
    return [...this.props.items];
  }

  get decidedBy(): string | undefined {
    return this.props.decidedBy;
  }

  get decidedAt(): Date | undefined {
    return this.props.decidedAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  static create(input: OrderApprovalCreateInput): OrderApprovalEntity {
    const now = new Date();

    return new OrderApprovalEntity({
      orderId: input.orderId,
      operationId: input.operationId,
      establishmentId: input.establishmentId,
      status: OrderApprovalStatus.PENDING,
      items: [...input.items],
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(input: OrderApprovalRestoreInput): OrderApprovalEntity {
    return new OrderApprovalEntity({ ...input, items: [...input.items] });
  }

  approve(decidedBy: string): void {
    this.ensurePending();
    this.props.status = OrderApprovalStatus.APPROVED;
    this.props.decidedBy = decidedBy;
    this.props.decidedAt = new Date();
    this.props.updatedAt = this.props.decidedAt;
  }

  reject(decidedBy: string): void {
    this.ensurePending();
    this.props.status = OrderApprovalStatus.REJECTED;
    this.props.decidedBy = decidedBy;
    this.props.decidedAt = new Date();
    this.props.updatedAt = this.props.decidedAt;
  }

  private ensurePending(): void {
    if (this.props.status !== OrderApprovalStatus.PENDING) {
      throw new OrderApprovalAlreadyDecidedError(this.props.orderId, this.props.status);
    }
  }
}
