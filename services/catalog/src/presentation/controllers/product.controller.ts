import { ApiBearerAuth, ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { DesactivateProductUseCase } from '@/application/use-cases/product/desactive-product.use-case';
import { FindProductByIdUseCase } from '@/application/use-cases/product/find-product-by-id.use-case';
import { FindAllProductsUseCase } from '@/application/use-cases/product/find-all-product.use-case';
import { ActivateProductUseCase } from '@/application/use-cases/product/activate-product.use-case';
import { CreateProductUseCase } from '@/application/use-cases/product/create-product.use-case';
import { UpdateProductUseCase } from '@/application/use-cases/product/update-product.use-case';
import type { AuthenticatedRequest } from '@/infrastructure/auth/authenticated-request';
import { FilterProductDto } from '../dtos/product/filter-product.dto';
import { UpdateProductDto } from '../dtos/product/update-product.dto';
import { CreateProductDto } from '../dtos/product/create-product.dto';
import { JwtAuthGuard } from '@/infrastructure/auth/jwt-auth.guard';
import { Money } from '@/domain/value-objects/money.vo';
import {
  PaginatedProductResponseDto,
  ProductDto,
} from '../dtos/product/response-product-categories.dto';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductController {
  constructor(
    private readonly findAllProductsUseCase: FindAllProductsUseCase,
    private readonly findProductByIdUseCase: FindProductByIdUseCase,
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly deactivateProductUseCase: DesactivateProductUseCase,
    private readonly activateProductUseCase: ActivateProductUseCase,
  ) { }

  @Get()
  @ApiQuery({
    name: 'name',
    required: false,
    example: 'Bebidas',
    description: 'Nome do produto',
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
    description: 'Lista de produtos',
    type: PaginatedProductResponseDto,
  })
  async findAllProducts(@Query() filter: FilterProductDto): Promise<PaginatedProductResponseDto> {
    const result = await this.findAllProductsUseCase.execute(filter);

    return {
      ...result,
      list: result.list.map((product) => ({
        ...product,
        priceCents: product.priceCents.toString(),
      })),
    };
  }

  @Get(':id')
  @ApiOkResponse({
    description: 'Produto encontrado',
    type: ProductDto,
  })
  async findProductById(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<ProductDto> {
    const product = await this.findProductByIdUseCase.execute({ id, requesterId: req.user.userId });

    return { ...product, priceCents: product.priceCents.toString() };
  }

  @Post()
  @ApiOkResponse({
    description: 'Produto criado',
    type: ProductDto,
  })
  async createProduct(
    @Body() body: CreateProductDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<ProductDto> {
    const product = await this.createProductUseCase.execute({
      ...body,
      priceCents: Money.fromCents(body.priceCents),
      requesterId: req.user.userId,
    });

    return { ...product, priceCents: product.priceCents.toString() };
  }

  @Put(':id')
  @ApiOkResponse({
    description: 'Produto atualizado',
    type: ProductDto,
  })
  async updateProduct(
    @Param('id') id: string,
    @Body() body: UpdateProductDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<ProductDto> {
    const product = await this.updateProductUseCase.execute({
      id,
      requesterId: req.user.userId,
      ...body,
    });

    return { ...product, priceCents: product.priceCents.toString() };
  }

  @Delete(':id')
  @ApiOkResponse({
    description: 'Produto desativado',
  })
  async deactivateProduct(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<void> {
    await this.deactivateProductUseCase.execute({ id, requesterId: req.user.userId });
  }

  @Patch(':id')
  @ApiOkResponse({
    description: 'Produto ativado',
  })
  async activateProduct(@Param('id') id: string, @Req() req: AuthenticatedRequest): Promise<void> {
    await this.activateProductUseCase.execute({ id, requesterId: req.user.userId });
  }
}
