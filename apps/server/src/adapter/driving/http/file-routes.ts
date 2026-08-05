import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { authMiddleware, type TokenService } from "../../../middleware/auth.js";
import { isClientActor } from "../../../middleware/rbac-helpers.js";
import { ValidationError, NotFoundError } from "../../../middleware/error-handler.js";

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

/** Returns the owning client's userId for a project, or null if unknown. */
type ProjectOwnerLookup = (projectId: string) => Promise<string | null>;

// ---- Route factory ----

export function createFileRoutes(
  fileService: FileService,
  tokenService: TokenService,
  multerUpload: { single(fieldName: string): import("express").RequestHandler },
  getProjectOwnerId: ProjectOwnerLookup,
): Router {
  const router = Router();
  const auth = authMiddleware(tokenService);

  router.use(auth);

  const STAFF_ROLES = new Set(["admin", "project_manager", "developer", "qa"]);

  function isStaff(req: Request): boolean {
    return !!req.userRole && STAFF_ROLES.has(req.userRole);
  }

  async function assertProjectAccess(req: Request, projectId: string): Promise<void> {
    if (isClientActor(req.userRole)) {
      const ownerId = await getProjectOwnerId(projectId);
      if (!ownerId || ownerId !== req.userId) throw new NotFoundError("project", projectId);
    }
  }

  async function assertFileAccess(req: Request, file: UploadedFile): Promise<void> {
    if (isStaff(req)) return;
    if (file.uploadedBy === req.userId) return;
    if (file.projectId) {
      await assertProjectAccess(req, file.projectId);
      return;
    }
    throw new NotFoundError("File", file.id);
  }

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
        if (projectId) {
          await assertProjectAccess(req, projectId);
        }

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

  // GET /api/v1/files?projectId=  (must be before /:id)
  router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectId = req.query["projectId"] as string;
      if (!projectId) {
        throw new ValidationError("projectId query parameter is required");
      }

      await assertProjectAccess(req, projectId);

      const files = await fileService.listByProject(projectId);
      res.status(200).json(files);
    } catch (err) {
      next(err);
    }
  });

  // GET /api/v1/files/:id
  router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const file = await fileService.getById(String(req.params.id));
      try {
        await assertFileAccess(req, file);
      } catch {
        res.status(404).json({ error: "File not found" });
        return;
      }
      res.status(200).json(file);
    } catch (err) {
      next(err);
    }
  });

  // DELETE /api/v1/files/:id
  router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Deletion had no ownership or permission check at all: any
      // authenticated user could destroy any stored asset by id.
      const existing = await fileService.getById(String(req.params.id));
      const canDelete =
        !!existing &&
        (req.userRole === "admin" ||
          req.userRole === "project_manager" ||
          existing.uploadedBy === req.userId);
      if (!existing || !canDelete) {
        res.status(404).json({ error: "File not found" });
        return;
      }

      await fileService.delete(String(req.params.id));
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  return router;
}
