import type { EventEnvelope } from './event-envelope';

export type AuthUserRegistered = EventEnvelope<
  'auth.user.registered',
  {
    userId: string;
    email: string;
    name: string;
    role: 'customer' | 'establishment' | 'courier';
  }
>;

export type AuthUserProfileUpdated = EventEnvelope<
  'auth.user.profile-updated',
  {
    userId: string;
    email: string;
    name: string;
  }
>;

export type AuthUserDeactivated = EventEnvelope<'auth.user.deactivated', { userId: string }>;

export type AuthEvent = AuthUserRegistered | AuthUserProfileUpdated | AuthUserDeactivated;
