export type UserProfileUpdatedEvent = {
  type: 'user.profile-updated';
  occurredAt: Date;
  payload: {
    userId: string;
    email: string;
    name: string;
  };
};
