import { ObjectId } from "mongodb";
import type { Collection } from "mongodb";
import type { RBACRole as Role } from "../../../domain/entity/role.js";
import type { RoleRepository } from "../../../domain/port/repository.js";
import type { MongoDBClient } from "./client.js";

interface RoleDoc {
  _id: ObjectId;
  name: string;
  description: string;
  permissions: string[];
  is_system: boolean;
  created_at: Date;
  updated_at: Date;
}

function toDoc(role: Role): RoleDoc {
  return {
    _id: new ObjectId(role.id),
    name: role.name,
    description: role.description,
    permissions: role.permissions,
    is_system: role.isSystem,
    created_at: role.createdAt,
    updated_at: role.updatedAt,
  };
}

function fromDoc(doc: RoleDoc): Role {
  return {
    id: doc._id.toHexString(),
    name: doc.name,
    description: doc.description,
    permissions: doc.permissions,
    isSystem: doc.is_system,
    createdAt: doc.created_at,
    updatedAt: doc.updated_at,
  };
}

export class MongoRoleRepository implements RoleRepository {
  private readonly col: Collection<RoleDoc>;

  constructor(client: MongoDBClient) {
    this.col = client.collection<RoleDoc>("roles");
  }

  async findById(id: string): Promise<Role | null> {
    const doc = await this.col.findOne({ _id: new ObjectId(id) });
    return doc ? fromDoc(doc) : null;
  }

  async findByName(name: string): Promise<Role | null> {
    const doc = await this.col.findOne({ name });
    return doc ? fromDoc(doc) : null;
  }

  async findAll(): Promise<Role[]> {
    const docs = await this.col.find().sort({ created_at: 1 }).toArray();
    return docs.map(fromDoc);
  }

  async create(role: Role): Promise<Role> {
    const doc = toDoc(role);
    await this.col.insertOne(doc);
    return role;
  }

  async update(role: Role): Promise<Role> {
    const doc = toDoc({ ...role, updatedAt: new Date() });
    await this.col.replaceOne({ _id: doc._id }, doc);
    return { ...role, updatedAt: doc.updated_at };
  }

  async delete(id: string): Promise<void> {
    await this.col.deleteOne({ _id: new ObjectId(id) });
  }
}
