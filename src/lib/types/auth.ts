export type AuthCheckResult = {
  authenticated: boolean;
  authorized: boolean;
  error?: string;
  userRoles?: string[];
};
