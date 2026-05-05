import { ObjectId } from "mongodb";
import type { Collection, Filter } from "mongodb";
import type { User } from "../../../domain/entity/index.js";
import type { UserRepository, UserFilter } from "../../../domain/port/index.js";
import type { MongoDBClient } from "./client.js";

interface UserDoc {
  _id: ObjectId;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: string;
  role_id?: string;
  permissions: string[];
  avatar?: string;
  phone?: string;
  company?: string;
  is_active: boolean;
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
}

function toDoc(user: User): UserDoc {
  return {
    _id: new ObjectId(user.id),
    email: user.email,
    password_hash: user.passwordHash,
    first_name: user.firstName,
    last_name: user.lastName,
    role: user.role,
    role_id: user.roleId,
    permissions: user.permissions ?? [],
    avatar: user.avatar,
    phone: user.phone,
    company: user.company,
    is_active: user.isActive,
    last_login_at: user.lastLoginAt,
    created_at: user.createdAt,
    updated_at: user.updatedAt,
  };
}

function fromDoc(doc: UserDoc): User {
  return {
    id: doc._id.toHexString(),
    email: doc.email,
    passwordHash: doc.password_hash,
    firstName: doc.first_name,
    lastName: doc.last_name,
    role: doc.role as User["role"],
    roleId: doc.role_id,
    permissions: doc.permissions ?? [],
    avatar: doc.avatar,
    phone: doc.phone,
    company: doc.company,
    isActive: doc.is_active,
    lastLoginAt: doc.last_login_at,
    createdAt: doc.created_at,
    updatedAt: doc.updated_at,
  };
}

export class MongoUserRepository implements UserRepository {
  private readonly col: Collection<UserDoc>;

  constructor(client: MongoDBClient) {
    this.col = client.collection<UserDoc>("users");
  }

  async findById(id: string): Promise<User | null> {
    const doc = await this.col.findOne({ _id: new ObjectId(id) });
    return doc ? fromDoc(doc) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const doc = await this.col.findOne({ email });
    return doc ? fromDoc(doc) : null;
  }

  async findAll(filter?: UserFilter): Promise<User[]> {
    const query: Filter<UserDoc> = {};

    if (filter?.role) {
      query.role = filter.role;
    }
    if (filter?.isActive !== undefined) {
      query.is_active = filter.isActive;
    }
    if (filter?.company) {
      query.company = filter.company;
    }
    if (filter?.search) {
      query.$or = [
        { email: { $regex: filter.search, $options: "i" } },
        { first_name: { $regex: filter.search, $options: "i" } },
        { last_name: { $regex: filter.search, $options: "i" } },
      ];
    }

    const docs = await this.col
      .find(query)
      .sort({ created_at: -1 })
      .toArray();

    return docs.map(fromDoc);
  }

  async create(user: User): Promise<User> {
    const doc = toDoc(user);
    await this.col.insertOne(doc);
    return user;
  }

  async update(idOrUser: string | User, data?: Partial<User>): Promise<User> {
    if (typeof idOrUser === "string") {
      // Partial update by id (used by AuthService)
      const existing = await this.findById(idOrUser);
      if (!existing) {
        throw new Error(`User not found: ${idOrUser}`);
      }
      const merged = { ...existing, ...data, updatedAt: new Date() };
      const doc = toDoc(merged);
      await this.col.replaceOne({ _id: doc._id }, doc);
      return merged;
    }

    // Full object update (used by UserService routes)
    const doc = toDoc({ ...idOrUser, updatedAt: new Date() });
    await this.col.replaceOne({ _id: doc._id }, doc);
    return { ...idOrUser, updatedAt: doc.updated_at };
  }

  async delete(id: string): Promise<void> {
    await this.col.deleteOne({ _id: new ObjectId(id) });
  }
}
