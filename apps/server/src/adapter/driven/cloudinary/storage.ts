import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { Readable } from "node:stream";
import type { FileStorage } from "../../../domain/port/index.js";

export interface CloudinaryStorageConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

export class CloudinaryFileStorage implements FileStorage {
  constructor(config: CloudinaryStorageConfig) {
    cloudinary.config({
      cloud_name: config.cloudName,
      api_key: config.apiKey,
      api_secret: config.apiSecret,
      secure: true,
    });
  }

  async upload(
    file: Buffer,
    fileName: string,
    _mimeType: string,
  ): Promise<{ url: string; publicId: string }> {
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          public_id: fileName.replace(/\.[^.]+$/, ""),
          resource_type: "auto",
          folder: "neurodyne",
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result!);
        },
      );

      const readable = Readable.from(file);
      readable.pipe(stream);
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  }

  async delete(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }

  getURL(publicId: string): string {
    return cloudinary.url(publicId, { secure: true });
  }
}
