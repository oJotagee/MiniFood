import { Inject, Injectable } from '@nestjs/common';

import type { ProductCategoryRepository } from '@/application/ports/product-category-repository.port';
import { PRODUCT_CATEGORY_REPOSITORY } from '@/application/ports/product-category-repository.port';
import type { OrderApprovalRepository } from '@/application/ports/order-approval-repository.port';
import { ORDER_APPROVAL_REPOSITORY } from '@/application/ports/order-approval-repository.port';
import type { ProductRepository } from '@/application/ports/product-repository.port';
import { PRODUCT_REPOSITORY } from '@/application/ports/product-repository.port';
import { OrderApprovalEntity } from '@/domain/entities/order-approval.entity';
import {
  ProductBelongsToAnotherEstablishmentError,
  ProductNotAvailableError,
  ProductNotFoundError,
} from '@/domain/errors/product.errors';

type ValidateOrderApprovalInput = {
  orderId: string;
  operationId: string;
  establishmentId: string;
  items: Array<{ itemId: string; quantity: number; priceCents: string }>;
};

@Injectable()
export class ApproveOrRejectOrderUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly products: ProductRepository,
    @Inject(PRODUCT_CATEGORY_REPOSITORY)
    private readonly categories: ProductCategoryRepository,
    @Inject(ORDER_APPROVAL_REPOSITORY)
    private readonly orderApprovals: OrderApprovalRepository,
  ) {}

  async execute(input: ValidateOrderApprovalInput): Promise<void> {
    for (const item of input.items) {
      const product = await this.products.findById(item.itemId);

      if (!product) {
        throw new ProductNotFoundError(item.itemId);
      }

      if (!product.isAvailable) {
        throw new ProductNotAvailableError(item.itemId);
      }

      const category = await this.categories.findById(product.categoryId);

      if (!category || category.establishmentId !== input.establishmentId) {
        throw new ProductBelongsToAnotherEstablishmentError(item.itemId, input.establishmentId);
      }
    }

    const approval = OrderApprovalEntity.create({
      orderId: input.orderId,
      operationId: input.operationId,
      establishmentId: input.establishmentId,
      items: input.items,
    });

    await this.orderApprovals.save(approval);
  }
}
