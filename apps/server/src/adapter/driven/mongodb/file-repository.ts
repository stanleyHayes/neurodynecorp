import { ObjectId } from "mongodb";
import type { Collection } from "mongodb";
import type { MongoDBClient } from "./client.js";

export interface StoredFile {
  id: string;
  fileName: string;
  fileURL: string;
  publicId: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  projectId?: string;
  createdAt: Date;
}

interface FileDoc {
  _id: ObjectId;
  file_name: string;
  file_url: string;
  public_id: string;
  file_size: number;
  mime_type: string;
  uploaded_by: string;
  project_id?: string;
  created_at: Date;
}

function toDoc(f: StoredFile): FileDoc {
  return {
    _id: new ObjectId(f.id),
    file_name: f.fileName,
    file_url: f.fileURL,
    public_id: f.publicId,
    file_size: f.fileSize,
    mime_type: f.mimeType,
    uploaded_by: f.uploadedBy,
    project_id: f.projectId,
    created_at: f.createdAt,
  };
}

function fromDoc(d: FileDoc): StoredFile {
  return {
    id: d._id.toHexString(),
    fileName: d.file_name,
    fileURL: d.file_url,
    publicId: d.public_id,
    fileSize: d.file_size,
    mimeType: d.mime_type,
    uploadedBy: d.uploaded_by,
    projectId: d.project_id,
    createdAt: d.created_at,
  };
}

export class MongoFileRepository {
  private readonly col: Collection<FileDoc>;

  constructor(client: MongoDBClient) {
    this.col = client.collection<FileDoc>("files");
  }

  async create(file: StoredFile): Promise<StoredFile> {
    await this.col.insertOne(toDoc(file));
    return file;
  }

  async findById(id: string): Promise<StoredFile | null> {
    if (!ObjectId.isValid(id)) return null;
    const doc = await this.col.findOne({ _id: new ObjectId(id) });
    return doc ? fromDoc(doc) : null;
  }

  async listByProject(projectId: string): Promise<StoredFile[]> {
    const docs = await this.col
      .find({ project_id: projectId })
      .sort({ created_at: -1 })
      .toArray();
    return docs.map(fromDoc);
  }

  async delete(id: string): Promise<void> {
    if (!ObjectId.isValid(id)) return;
    await this.col.deleteOne({ _id: new ObjectId(id) });
  }
}
