import { ObjectId } from "mongodb";

export interface RBACRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean; // system roles can't be deleted
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRoleInput {
  name: string;
  description: string;
  permissions: string[];
  isSystem?: boolean;
}

export function createRole(input: CreateRoleInput): RBACRole {
  const now = new Date();
  return {
    id: new ObjectId().toHexString(),
    name: input.name,
    description: input.description,
    permissions: input.permissions,
    isSystem: input.isSystem ?? false,
    createdAt: now,
    updatedAt: now,
  };
}
