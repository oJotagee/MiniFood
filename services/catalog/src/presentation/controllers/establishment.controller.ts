import { Body, Controller, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiQuery } from '@nestjs/swagger';

import { FindEstablishmentByIdUseCase } from '@/application/use-cases/establishment/find-establishment-by-id.use-case';
import { FindAllEstablishmentsUseCase } from '@/application/use-cases/establishment/find-all-establishments.use-case';
import { CreateEstablishmentUseCase } from '@/application/use-cases/establishment/create-establishment.use-case';
import { UpdateEstablishmentUseCase } from '@/application/use-cases/establishment/update-establishment.use-case';
import type { AuthenticatedRequest } from '@/infrastructure/auth/authenticated-request';
import { FilterEstablishmentDto } from '../dtos/establishment/filter-establishment.dto';
import { CreateEstablishmentDto } from '../dtos/establishment/create-establishment.dto';
import { UpdateEstablishmentDto } from '../dtos/establishment/update-establishment.dto';
import { JwtAuthGuard } from '@/infrastructure/auth/jwt-auth.guard';
import {
  EstablishmentDto,
  PaginatedEstablishmentResponseDto,
} from '../dtos/establishment/response-establishment.dto';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('establishments')
export class EstablishmentController {
  constructor(
    private readonly findAllEstablishmentsUseCase: FindAllEstablishmentsUseCase,
    private readonly findEstablishmentByIdUseCase: FindEstablishmentByIdUseCase,
    private readonly createEstablishmentUseCase: CreateEstablishmentUseCase,
    private readonly updateEstablishmentUseCase: UpdateEstablishmentUseCase,
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
    description: 'Lista de estabelecimentos',
    type: [PaginatedEstablishmentResponseDto],
  })
  findAllEstablishments(
    @Query() filter: FilterEstablishmentDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<PaginatedEstablishmentResponseDto> {
    return this.findAllEstablishmentsUseCase.execute({ ownerId: req.user.userId, ...filter });
  }

  @Get(':id')
  @ApiOkResponse({
    description: 'Estabelecimento encontrado',
    type: EstablishmentDto,
  })
  findEstablishmentById(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<EstablishmentDto> {
    return this.findEstablishmentByIdUseCase.execute({ id, requesterId: req.user.userId });
  }

  @Post()
  @ApiOkResponse({
    description: 'Estabelecimento criado',
    type: EstablishmentDto,
  })
  createEstablishment(
    @Body() body: CreateEstablishmentDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<EstablishmentDto> {
    return this.createEstablishmentUseCase.execute({ ownerId: req.user.userId, ...body });
  }

  @Put(':id')
  @ApiOkResponse({
    description: 'Estabelecimento atualizado',
    type: EstablishmentDto,
  })
  updateEstablishment(
    @Param('id') id: string,
    @Body() body: UpdateEstablishmentDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<EstablishmentDto> {
    return this.updateEstablishmentUseCase.execute({ id, requesterId: req.user.userId, ...body });
  }
}
