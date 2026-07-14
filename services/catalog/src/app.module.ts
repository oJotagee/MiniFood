import { Module } from '@nestjs/common';

import { EstablishmentPrismaRepository } from './infrastructure/repositories/establishment-prisma.repository';
import { FindEstablishmentByIdUseCase } from './application/use-cases/find-establishment-by-id.use-case';
import { FindAllEstablishmentsUseCase } from './application/use-cases/find-all-establishments.use-case';
import { CreateEstablishmentUseCase } from './application/use-cases/create-establishment.use-case';
import { UpdateEstablishmentUseCase } from './application/use-cases/update-establishment.use-case';
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
  ],
})
export class AppModule {}
