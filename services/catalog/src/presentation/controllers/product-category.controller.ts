import { Body, Controller, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiQuery } from '@nestjs/swagger';

import { FindAllProductCategoriesUseCase } from '@/application/use-cases/product-category/find-all-product-categories.use-case';
import { FindProductCategoryByIdUseCase } from '@/application/use-cases/product-category/find-product-category-by-id.use-case';
import { CreateProductCategoryUseCase } from '@/application/use-cases/product-category/create-product-category.use-case';
import { UpdateProductCategoryUseCase } from '@/application/use-cases/product-category/update-product-category.use-case';
import { FilterProductCategoriesDto } from '../dtos/product-categories/filter-product-categories.dto';
import { UpdateProductCategoryDto } from '../dtos/product-categories/update-product-category.dto';
import { CreateProductCategoryDto } from '../dtos/product-categories/create-product-category.dto';
import type { AuthenticatedRequest } from '@/infrastructure/auth/authenticated-request';
import { JwtAuthGuard } from '@/infrastructure/auth/jwt-auth.guard';
import {
  PaginatedProductCategoryResponseDto,
  ProductCategoryDto,
} from '../dtos/product-categories/response-product-categories.dto';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('product-categories')
export class ProductCategoryController {
  constructor(
    private readonly findAllProductCategoriesUseCase: FindAllProductCategoriesUseCase,
    private readonly findProductCategoryByIdUseCase: FindProductCategoryByIdUseCase,
    private readonly createProductCategoryUseCase: CreateProductCategoryUseCase,
    private readonly updateProductCategoryUseCase: UpdateProductCategoryUseCase,
  ) {}

  @Get()
  @ApiQuery({
    name: 'name',
    required: false,
    example: 'Bebidas',
    description: 'Nome da categoria de produtos',
    type: 'string',
  })
  @ApiQuery({
    name: 'establishmentId',
    required: true,
    example: 'dtb1a8f0-3c4b-4e2a-9f1e-2b5f6c8e9d7a',
    description: 'ID do estabelecimento',
    type: 'string',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 10,
    description: 'Número máximo de resultados a serem retornados',
    type: 'number',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    example: 0,
    description: 'Número de resultados a serem ignorados antes de começar a retornar os resultados',
    type: 'number',
  })
  @ApiOkResponse({
    description: 'Lista de categorias de produtos',
    type: PaginatedProductCategoryResponseDto,
  })
  findAllProductCategories(
    @Query() filter: FilterProductCategoriesDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<PaginatedProductCategoryResponseDto> {
    return this.findAllProductCategoriesUseCase.execute({
      ...filter,
      requesterId: req.user.userId,
    });
  }

  @Get(':id')
  @ApiOkResponse({
    description: 'Categoria de produto encontrada',
    type: ProductCategoryDto,
  })
  findProductCategoryById(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<ProductCategoryDto> {
    return this.findProductCategoryByIdUseCase.execute({ id, requesterId: req.user.userId });
  }

  @Post()
  @ApiOkResponse({
    description: 'Categoria de produto criada',
    type: ProductCategoryDto,
  })
  createProductCategory(
    @Body() body: CreateProductCategoryDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<ProductCategoryDto> {
    return this.createProductCategoryUseCase.execute({ ...body, requesterId: req.user.userId });
  }

  @Put(':id')
  @ApiOkResponse({
    description: 'Categoria de produto atualizada',
    type: ProductCategoryDto,
  })
  updateProductCategory(
    @Param('id') id: string,
    @Body() body: UpdateProductCategoryDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<ProductCategoryDto> {
    return this.updateProductCategoryUseCase.execute({ id, requesterId: req.user.userId, ...body });
  }
}
