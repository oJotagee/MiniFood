import { beforeEach, describe, expect, it, mock } from 'bun:test';

import type { AuthenticatedRequest } from '@/infrastructure/auth/authenticated-request';
import { UserController } from '@/presentation/controllers/user.controller';

function requestFor(userId: string): AuthenticatedRequest {
  return { user: { userId, username: 'joao', email: 'joao@example.com', roles: [] } };
}

const userFixture = {
  id: 'user-1',
  name: 'Joao',
  email: 'joao@example.com',
  role: 'customer',
  twoFactorEnabled: false,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
};

describe('UserController', () => {
  let registerUserUseCase: { execute: ReturnType<typeof mock> };
  let loginUseCase: { execute: ReturnType<typeof mock> };
  let verifyTwoFactorUseCase: { execute: ReturnType<typeof mock> };
  let findUserByIdUseCase: { execute: ReturnType<typeof mock> };
  let updateProfileUseCase: { execute: ReturnType<typeof mock> };
  let setTwoFactorEnabledUseCase: { execute: ReturnType<typeof mock> };
  let refreshTokenUseCase: { execute: ReturnType<typeof mock> };
  let resetPasswordRequestUseCase: { execute: ReturnType<typeof mock> };
  let resetPasswordConfirmUseCase: { execute: ReturnType<typeof mock> };
  let controller: UserController;

  beforeEach(() => {
    registerUserUseCase = { execute: mock() };
    loginUseCase = { execute: mock() };
    verifyTwoFactorUseCase = { execute: mock() };
    findUserByIdUseCase = { execute: mock() };
    updateProfileUseCase = { execute: mock() };
    setTwoFactorEnabledUseCase = { execute: mock() };
    refreshTokenUseCase = { execute: mock() };
    resetPasswordRequestUseCase = { execute: mock() };
    resetPasswordConfirmUseCase = { execute: mock() };

    controller = new UserController(
      registerUserUseCase as never,
      loginUseCase as never,
      verifyTwoFactorUseCase as never,
      findUserByIdUseCase as never,
      updateProfileUseCase as never,
      setTwoFactorEnabledUseCase as never,
      refreshTokenUseCase as never,
      resetPasswordRequestUseCase as never,
      resetPasswordConfirmUseCase as never,
    );
  });

  it('register delegates to the use case', async () => {
    registerUserUseCase.execute.mockResolvedValue(userFixture);

    const body = { name: 'Joao', email: 'joao@example.com', password: 'senha-123', role: 'customer' };
    const result = await controller.register(body as never);

    expect(registerUserUseCase.execute).toHaveBeenCalledWith(body);
    expect(result).toBe(userFixture);
  });

  it('login delegates to the use case', async () => {
    const expected = { requiresTwoFactor: false, accessToken: 'a', refreshToken: 'r', expiresIn: 300 };
    loginUseCase.execute.mockResolvedValue(expected);

    const body = { email: 'joao@example.com', password: 'senha-123' };
    const result = await controller.login(body as never);

    expect(loginUseCase.execute).toHaveBeenCalledWith(body);
    expect(result).toBe(expected);
  });

  it('verifyTwoFactor delegates to the use case', async () => {
    const expected = { accessToken: 'a', refreshToken: 'r', expiresIn: 300 };
    verifyTwoFactorUseCase.execute.mockResolvedValue(expected);

    const body = { challengeId: 'challenge-1', code: '123456' };
    const result = await controller.verifyTwoFactor(body as never);

    expect(verifyTwoFactorUseCase.execute).toHaveBeenCalledWith(body);
    expect(result).toBe(expected);
  });

  it('me uses the requester id from the token, not from the body', async () => {
    findUserByIdUseCase.execute.mockResolvedValue(userFixture);

    const result = await controller.me(requestFor('user-1'));

    expect(findUserByIdUseCase.execute).toHaveBeenCalledWith({ id: 'user-1' });
    expect(result).toBe(userFixture);
  });

  it('updateProfile merges the requester id from the token with the body', async () => {
    updateProfileUseCase.execute.mockResolvedValue(userFixture);

    const body = { name: 'Joao Silva' };
    const result = await controller.updateProfile(body as never, requestFor('user-1'));

    expect(updateProfileUseCase.execute).toHaveBeenCalledWith({ id: 'user-1', ...body });
    expect(result).toBe(userFixture);
  });

  it('setTwoFactorEnabled merges the requester id from the token with the body', async () => {
    setTwoFactorEnabledUseCase.execute.mockResolvedValue(userFixture);

    const body = { enabled: true };
    const result = await controller.setTwoFactorEnabled(body as never, requestFor('user-1'));

    expect(setTwoFactorEnabledUseCase.execute).toHaveBeenCalledWith({ id: 'user-1', ...body });
    expect(result).toBe(userFixture);
  });

  it('refreshToken delegates to the use case', async () => {
    const expected = { accessToken: 'a', refreshToken: 'r', expiresIn: 300 };
    refreshTokenUseCase.execute.mockResolvedValue(expected);

    const body = { refreshToken: 'old-refresh-token' };
    const result = await controller.refreshToken(body as never);

    expect(refreshTokenUseCase.execute).toHaveBeenCalledWith(body);
    expect(result).toBe(expected);
  });

  it('resetPasswordRequest delegates to the use case', async () => {
    const body = { email: 'joao@example.com' };

    await controller.resetPasswordRequest(body as never);

    expect(resetPasswordRequestUseCase.execute).toHaveBeenCalledWith(body);
  });

  it('resetPasswordConfirm delegates to the use case', async () => {
    const body = { token: 'reset-token', newPassword: 'nova-senha-123' };

    await controller.resetPasswordConfirm(body as never);

    expect(resetPasswordConfirmUseCase.execute).toHaveBeenCalledWith(body);
  });
});
