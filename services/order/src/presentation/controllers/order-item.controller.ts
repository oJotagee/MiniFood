import { ApiBearerAuth, ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { Body, Controller, Get, Param, Put, Query, Req, UseGuards } from '@nestjs/common';

import { FindOrderItemByIdUseCase } from '@/application/use-cases/order-item/find-order-item-by-id.use-case';
import { FindAllOrderItemsUseCase } from '@/application/use-cases/order-item/find-all-order-items.use-case';
import { UpdateOrderItemUseCase } from '@/application/use-cases/order-item/update-order-item.use-case';
import type { AuthenticatedRequest } from '@/infrastructure/auth/authenticated-request';
import { UpdateOrderItemDto } from '../dtos/order-item/update-order-item.dto';
import { JwtAuthGuard } from '@/infrastructure/auth/jwt-auth.guard';
import { FilterOrderDto } from '../dtos/order/filter-order.dto';
import { RolesGuard } from '@/infrastructure/auth/roles.guard';
import { Roles } from '@/infrastructure/auth/roles.decorator';
import {
  OrderItemResponseDto,
  PaginatedOrderItemResponseDto,
} from '../dtos/order-item/response-order-item.dto';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('customer')
@Controller('orders/:orderId/items')
export class OrderItemController {
  constructor(
    private readonly findAllOrderItemsUseCase: FindAllOrderItemsUseCase,
    private readonly findOrderItemByIdUseCase: FindOrderItemByIdUseCase,
    private readonly updateOrderItemUseCase: UpdateOrderItemUseCase,
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
    description: 'Lista de itens do pedido',
    type: PaginatedOrderItemResponseDto,
  })
  findAllOrderItems(
    @Param('orderId') orderId: string,
    @Query() filter: FilterOrderDto,
  ): Promise<PaginatedOrderItemResponseDto> {
    return this.findAllOrderItemsUseCase.execute({ orderId, ...filter });
  }

  @Get(':id')
  @ApiOkResponse({
    description: 'Item do pedido encontrado',
    type: OrderItemResponseDto,
  })
  findOrderItemById(@Param('id') id: string): Promise<OrderItemResponseDto> {
    return this.findOrderItemByIdUseCase.execute({ id });
  }

  @Put(':id')
  @ApiOkResponse({
    description: 'Item do pedido atualizado',
    type: OrderItemResponseDto,
  })
  updateOrderItem(
    @Param('orderId') orderId: string,
    @Param('id') id: string,
    @Body() body: UpdateOrderItemDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<Omit<OrderItemResponseDto, 'createdAt'>> {
    return this.updateOrderItemUseCase.execute({
      orderId,
      itemId: id,
      requesterId: req.user.userId,
      ...body,
    });
  }
}
