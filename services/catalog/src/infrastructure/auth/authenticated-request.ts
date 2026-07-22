import type { AuthenticatedUser } from '@miniFood/shared/auth';

export type { AuthenticatedUser };

export type AuthenticatedRequest = {
  user: AuthenticatedUser;
};
