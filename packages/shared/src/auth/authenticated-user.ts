export type AuthenticatedPlayer = {
  userId: string;
  username: string;
  email?: string;
  roles: string[];
};
