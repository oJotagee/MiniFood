import { Controller, Get, Param, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiQuery } from '@nestjs/swagger';

import { FindAllOrderApprovalsUseCase } from '@/application/use-cases/order-approval/find-all-order-approvals.use-case';
import { FindOrderApprovalByIdUseCase } from '@/application/use-cases/order-approval/find-order-approval-by-id.use-case';
import { ApproveOrderApprovalUseCase } from '@/application/use-cases/order-approval/approve-order-approval.use-case';
import { RejectOrderApprovalUseCase } from '@/application/use-cases/order-approval/reject-order-approval.use-case';
import { FilterOrderApprovalDto } from '../dtos/order-approval/filter-order-approval.dto';
import type { AuthenticatedRequest } from '@/infrastructure/auth/authenticated-request';
import { JwtAuthGuard } from '@/infrastructure/auth/jwt-auth.guard';
import { RolesGuard } from '@/infrastructure/auth/roles.guard';
import { Roles } from '@/infrastructure/auth/roles.decorator';
import {
  OrderApprovalDto,
  PaginatedOrderApprovalResponseDto,
} from '../dtos/order-approval/response-order-approval.dto';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('company')
@Controller('order-approvals')
export class OrderApprovalController {
  constructor(
    private readonly findAllOrderApprovalsUseCase: FindAllOrderApprovalsUseCase,
    private readonly findOrderApprovalByIdUseCase: FindOrderApprovalByIdUseCase,
    private readonly approveOrderApprovalUseCase: ApproveOrderApprovalUseCase,
    private readonly rejectOrderApprovalUseCase: RejectOrderApprovalUseCase,
  ) {}

  @Get()
  @ApiQuery({
    name: 'status',
    required: false,
    example: 'PENDING',
    description: 'Filtra pelo status da aprovação',
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
    description: 'Lista de aprovações de pedido dos estabelecimentos do dono autenticado',
    type: PaginatedOrderApprovalResponseDto,
  })
  findAllOrderApprovals(
    @Query() filter: FilterOrderApprovalDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<PaginatedOrderApprovalResponseDto> {
    return this.findAllOrderApprovalsUseCase.execute({
      ...filter,
      requesterId: req.user.userId,
    });
  }

  @Get(':orderId')
  @ApiOkResponse({
    description: 'Aprovação de pedido encontrada',
    type: OrderApprovalDto,
  })
  findOrderApprovalById(
    @Param('orderId') orderId: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<OrderApprovalDto> {
    return this.findOrderApprovalByIdUseCase.execute({ orderId, requesterId: req.user.userId });
  }

  @Patch(':orderId/approve')
  @ApiOkResponse({
    description: 'Pedido aprovado pelo dono do estabelecimento',
  })
  async approveOrderApproval(
    @Param('orderId') orderId: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<void> {
    await this.approveOrderApprovalUseCase.execute({ orderId, requesterId: req.user.userId });
  }

  @Patch(':orderId/reject')
  @ApiOkResponse({
    description: 'Pedido recusado pelo dono do estabelecimento',
  })
  async rejectOrderApproval(
    @Param('orderId') orderId: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<void> {
    await this.rejectOrderApprovalUseCase.execute({ orderId, requesterId: req.user.userId });
  }
}
