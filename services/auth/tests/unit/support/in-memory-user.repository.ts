import type { UserRepository } from '@/application/port/user-repository.port';
import { UserEntity } from '@/domain/entities/user.entity';

export class InMemoryUserRepository implements UserRepository {
  private readonly users = new Map<string, UserEntity>();

  async findById(id: string): Promise<UserEntity | null> {
    return this.users.get(id) ?? null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return [...this.users.values()].find((user) => user.email.toString() === email) ?? null;
  }

  async create(user: UserEntity): Promise<void> {
    this.users.set(user.id, user);
  }

  async update(user: UserEntity): Promise<void> {
    this.users.set(user.id, user);
  }
}
