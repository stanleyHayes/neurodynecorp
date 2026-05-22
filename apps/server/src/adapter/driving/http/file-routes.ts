import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { authMiddleware, type TokenService } from "../../../middleware/auth.js";
import { ValidationError } from "../../../middleware/error-handler.js";

// ---- Service interface ----

export interface UploadedFile {
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

export interface FileService {
  upload(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    uploadedBy: string,
    projectId?: string,
  ): Promise<UploadedFile>;
  getById(id: string): Promise<UploadedFile>;
  listByProject(projectId: string): Promise<UploadedFile[]>;
  delete(id: string): Promise<void>;
}

// ---- Multer-like type for the uploaded file on req ----

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

// Extend request to include multer file
declare global {
  namespace Express {
    interface Request {
      file?: MulterFile;
    }
  }
}

// ---- Route factory ----

export function createFileRoutes(
  fileService: FileService,
  tokenService: TokenService,
  multerUpload: { single(fieldName: string): import("express").RequestHandler },
): Router {
  const router = Router();
  const auth = authMiddleware(tokenService);

  router.use(auth);

  // POST /api/v1/files/upload
  router.post(
    "/upload",
    multerUpload.single("file"),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.file) {
          throw new ValidationError("No file provided");
        }

        const maxSize = 10 * 1024 * 1024; // 10MB
        if (req.file.size > maxSize) {
          throw new ValidationError("File size exceeds 10MB limit");
        }

        const projectId = req.body?.projectId as string | undefined;

        const uploaded = await fileService.upload(
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype,
          req.userId!,
          projectId,
        );
        res.status(201).json(uploaded);
      } catch (err) {
        next(err);
      }
    },
  );

  // GET /api/v1/files/:id
  router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const file = await fileService.getById(req.params.id!);
      res.status(200).json(file);
    } catch (err) {
      next(err);
    }
  });

  // GET /api/v1/files?projectId=
  router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectId = req.query["projectId"] as string;
      if (!projectId) {
        throw new ValidationError("projectId query parameter is required");
      }

      const files = await fileService.listByProject(projectId);
      res.status(200).json(files);
    } catch (err) {
      next(err);
    }
  });

  // DELETE /api/v1/files/:id
  router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fileService.delete(req.params.id!);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  return router;
}
