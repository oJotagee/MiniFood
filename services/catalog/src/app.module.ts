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
import { PRODUCT_CATEGORY_REPOSITORY } from './application/ports/product-category-repository.port';
import { ESTABLISHMENT_REPOSITORY } from './application/ports/establishment-repository.port';
import { PrismaService } from './infrastructure/prisma/prisma.service';

@Module({
  imports: [],
  controllers: [],
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
    // PRODUCT_CATEGORY_USE_CASES
    FindAllProductCategoriesUseCase,
    FindProductCategoryByIdUseCase,
    CreateProductCategoryUseCase,
    UpdateProductCategoryUseCase,
    {
      provide: PRODUCT_CATEGORY_REPOSITORY,
      useClass: ProductCategoryPrismaRepository,
    },
  ],
})
export class AppModule {}
