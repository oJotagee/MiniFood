import { APP_FILTER } from '@nestjs/core';
import { Module } from '@nestjs/common';

import { FindAllProductCategoriesUseCase } from './application/use-cases/product-category/find-all-product-categories.use-case';
import { FindProductCategoryByIdUseCase } from './application/use-cases/product-category/find-product-category-by-id.use-case';
import { UpdateProductCategoryUseCase } from './application/use-cases/product-category/update-product-category.use-case';
import { CreateProductCategoryUseCase } from './application/use-cases/product-category/create-product-category.use-case';
import { FindEstablishmentByIdUseCase } from './application/use-cases/establishment/find-establishment-by-id.use-case';
import { FindAllEstablishmentsUseCase } from './application/use-cases/establishment/find-all-establishments.use-case';
import { ProductCategoryPrismaRepository } from './infrastructure/repositories/product-category-prisma.repository';
import { CreateEstablishmentUseCase } from './application/use-cases/establishment/create-establishment.use-case';
import { UpdateEstablishmentUseCase } from './application/use-cases/establishment/update-establishment.use-case';
import { EstablishmentPrismaRepository } from './infrastructure/repositories/establishment-prisma.repository';
import { DesactivateProductUseCase } from './application/use-cases/product/desactive-product.use-case';
import { DomainExceptionFilter } from './presentation/filters/domain-exception.filter';
import { FindProductByIdUseCase } from './application/use-cases/product/find-product-by-id.use-case';
import { FindAllProductsUseCase } from './application/use-cases/product/find-all-product.use-case';
import { PRODUCT_CATEGORY_REPOSITORY } from './application/ports/product-category-repository.port';
import { ProductPrismaRepository } from './infrastructure/repositories/product-prisma.repository';
import { CreateProductUseCase } from './application/use-cases/product/create-product.use-case';
import { UpdateProductUseCase } from './application/use-cases/product/update-product.use-case';
import { EstablishmentController } from './presentation/controllers/establishment.controller';
import { ESTABLISHMENT_REPOSITORY } from './application/ports/establishment-repository.port';
import { PRODUCT_REPOSITORY } from './application/ports/product-repository.port';
import { HealthController } from './presentation/controllers/health.controller';
import { PrismaService } from './infrastructure/prisma/prisma.service';

@Module({
  imports: [],
  controllers: [HealthController, EstablishmentController],
  providers: [
    PrismaService,
    // ESTABLISHMENT_USE_CASES
    FindAllEstablishmentsUseCase,
    FindEstablishmentByIdUseCase,
    CreateEstablishmentUseCase,
    UpdateEstablishmentUseCase,
    {
      provide: ESTABLISHMENT_REPOSITORY,
      useClass: EstablishmentPrismaRepository,
    },
    {
      provide: APP_FILTER,
      useClass: DomainExceptionFilter,
    },
    // PRODUCT_CATEGORY_USE_CASES
    FindAllProductCategoriesUseCase,
    FindProductCategoryByIdUseCase,
    CreateProductCategoryUseCase,
    UpdateProductCategoryUseCase,
    {
      provide: PRODUCT_CATEGORY_REPOSITORY,
      useClass: ProductCategoryPrismaRepository,
    },
    // PRODUCT_USE_CASES
    FindAllProductsUseCase,
    FindProductByIdUseCase,
    CreateProductUseCase,
    UpdateProductUseCase,
    DesactivateProductUseCase,
    {
      provide: PRODUCT_REPOSITORY,
      useClass: ProductPrismaRepository,
    },
  ],
})
export class AppModule {}
