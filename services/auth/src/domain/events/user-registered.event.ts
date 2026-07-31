export type UserRegisteredEvent = {
  type: 'user.registered';
  occurredAt: Date;
  payload: {
    userId: string;
    email: string;
    name: string;
    role: 'customer' | 'establishment' | 'courier';
  };
};
