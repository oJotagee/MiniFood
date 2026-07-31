import { Injectable } from '@nestjs/common';

import { PasswordResetTokenRepository } from '@/application/port/password-reset-token-repository.port';
import { PasswordResetTokenEntity } from '@/domain/entities/password-reset-token.entity';
import { PasswordResetTokenMapper } from '../persistence/password-reset-token.mapper';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PasswordResetTokenPrismaRepository implements PasswordResetTokenRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findByTokenHash(tokenHash: string): Promise<PasswordResetTokenEntity | null> {
    const token = await this.prismaService.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!token) return null;

    return PasswordResetTokenMapper.toDomain(token);
  }

  async create(token: PasswordResetTokenEntity): Promise<void> {
    const persistence = PasswordResetTokenMapper.toPersistence(token);

    await this.prismaService.passwordResetToken.create({ data: persistence });
  }

  async markAsUsed(token: PasswordResetTokenEntity): Promise<void> {
    const persistence = PasswordResetTokenMapper.toPersistence(token);

    await this.prismaService.passwordResetToken.update({
      where: { id: token.id },
      data: { usedAt: persistence.usedAt },
    });
  }
}
