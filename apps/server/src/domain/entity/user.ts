import { ObjectId } from "mongodb";

export type Role =
  | "admin"
  | "project_manager"
  | "developer"
  | "qa"
  | "client";

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: Role;
  roleId?: string;
  permissions: string[];
  avatar?: string;
  phone?: string;
  company?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: Role;
  roleId?: string;
  permissions?: string[];
  avatar?: string;
  phone?: string;
  company?: string;
}

export function createUser(input: CreateUserInput): User {
  const now = new Date();
  return {
    id: new ObjectId().toHexString(),
    email: input.email,
    passwordHash: input.passwordHash,
    firstName: input.firstName,
    lastName: input.lastName,
    role: input.role,
    roleId: input.roleId,
    permissions: input.permissions ?? [],
    avatar: input.avatar,
    phone: input.phone,
    company: input.company,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };
}

export function fullName(user: User): string {
  return `${user.firstName} ${user.lastName}`;
}

export function isInternal(user: User): boolean {
  return user.role !== "client";
}
