import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiQuery } from '@nestjs/swagger';

import { FindOrderByIdUseCase } from '@/application/use-cases/order/find-order-by-id.use-case';
import { FindAllOrdersUseCase } from '@/application/use-cases/order/find-all-orders.use-case';
import { CreateOrderUseCase } from '@/application/use-cases/order/create-order.use-case';
import type { AuthenticatedRequest } from '@/infrastructure/auth/authenticated-request';
import { OrderDto, PaginatedOrderResponseDto } from '../dtos/order/response-order.dto';
import { JwtAuthGuard } from '@/infrastructure/auth/jwt-auth.guard';
import { FilterOrderDto } from '../dtos/order/filter-order.dto';
import { CreateOrderDto } from '../dtos/order/create-order.dto';
import { RolesGuard } from '@/infrastructure/auth/roles.guard';
import { Roles } from '@/infrastructure/auth/roles.decorator';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('customer')
@Controller('orders')
export class OrderController {
  constructor(
    private readonly findAllOrdersUseCase: FindAllOrdersUseCase,
    private readonly findOrderByIdUseCase: FindOrderByIdUseCase,
    private readonly createOrderUseCase: CreateOrderUseCase,
  ) {}

  @Get()
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
    description: 'Lista de pedidos',
    type: PaginatedOrderResponseDto,
  })
  findAllOrders(
    @Query() filter: FilterOrderDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<PaginatedOrderResponseDto> {
    return this.findAllOrdersUseCase.execute({ ownerId: req.user.userId, ...filter });
  }

  @Get(':id')
  @ApiOkResponse({
    description: 'Pedido encontrado',
    type: OrderDto,
  })
  findOrderById(@Param('id') id: string, @Req() req: AuthenticatedRequest): Promise<OrderDto> {
    return this.findOrderByIdUseCase.execute({ id, requesterId: req.user.userId });
  }

  @Post()
  @ApiOkResponse({
    description: 'Pedido criado',
    type: OrderDto,
  })
  createOrder(@Body() body: CreateOrderDto, @Req() req: AuthenticatedRequest): Promise<OrderDto> {
    return this.createOrderUseCase.execute({
      ...body,
      customerId: req.user.userId,
    });
  }
}
