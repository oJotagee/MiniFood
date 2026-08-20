import { ApproveOrderApprovalUseCase } from '../src/application/use-cases/order-approval/approve-order-approval.use-case';
import { OrderApprovalPrismaRepository } from '../src/infrastructure/repositories/order-approval-prisma.repository';
import { EstablishmentPrismaRepository } from '../src/infrastructure/repositories/establishment-prisma.repository';
import { OutboxPrismaRepository } from '../src/infrastructure/repositories/outbox-prisma.repository';
import { PrismaService } from '../src/infrastructure/prisma/prisma.service';

async function main() {
  const prisma = new PrismaService();
  await prisma.onModuleInit();

  const outbox = new OutboxPrismaRepository(prisma);
  const orderApprovals = new OrderApprovalPrismaRepository(prisma, outbox);
  const establishments = new EstablishmentPrismaRepository(prisma);

  const useCase = new ApproveOrderApprovalUseCase(orderApprovals, establishments);

  await useCase.execute({ orderId: 'e2e2-order-1', requesterId: 'owner-e2e-2' });

  console.log('Approved manually by owner-e2e-2');
  await prisma.onModuleDestroy();
}
main();
