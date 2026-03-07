export const ROLES = {
  ADMIN: "admin",
  CLIENT: "client",
} as const;

export type AppRole = (typeof ROLES)[keyof typeof ROLES];
