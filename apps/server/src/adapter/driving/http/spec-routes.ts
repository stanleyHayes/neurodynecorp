import { Router } from "express";
import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import { authMiddleware, requirePermission, type TokenService } from "../../../middleware/auth.js";
import { ValidationError, NotFoundError, AppError } from "../../../middleware/error-handler.js";
import type { SpecService } from "../../../app/spec-service.js";
import { SpecNotFoundError, ProjectNotFoundError, QuestionnaireIncompleteError } from "../../../app/spec-service.js";
import type { Specification } from "../../../app/spec-service.js";

// ---- Validation schemas ----

const generateSpecSchema = z.object({
  projectId: z.string().min(1),
});

const addNoteSchema = z.object({
  content: z.string().min(1).max(5000),
});

const rejectSchema = z.object({
  reason: z.string().min(1).max(2000).optional(),
});

// ---- Minimal PDF builder ----

function buildSpecPdf(spec: Specification): Buffer {
  const lines: string[] = [];

  lines.push("%PDF-1.4");
  const content = buildPdfContent(spec);
  const streamBytes = Buffer.from(content, "utf-8");

  lines.push("1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj");
  lines.push("2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj");
  lines.push(`3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj`);
  lines.push(`4 0 obj<</Length ${streamBytes.length}>>stream`);
  lines.push(content);
  lines.push("endstream endobj");
  lines.push("5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj");
  lines.push("xref");
  lines.push("0 6");
  lines.push("0000000000 65535 f ");
  lines.push("0000000009 00000 n ");
  lines.push("0000000058 00000 n ");
  lines.push("0000000115 00000 n ");
  lines.push("0000000266 00000 n ");
  lines.push(`0000000${String(350 + streamBytes.length).padStart(3, "0")} 00000 n `);
  lines.push("trailer<</Size 6/Root 1 0 R>>");
  lines.push("startxref");
  lines.push("0");
  lines.push("%%EOF");

  return Buffer.from(lines.join("\n"), "utf-8");
}

function buildPdfContent(spec: Specification): string {
  const textLines: string[] = [];
  let y = 750;
  const lineHeight = 14;

  function addLine(text: string, size = 12) {
    if (y < 50) return;
    textLines.push(`BT /F1 ${size} Tf ${50} ${y} Td (${escapePdf(text)}) Tj ET`);
    y -= lineHeight + (size > 12 ? 6 : 0);
  }

  addLine("NeuroDyne Corp - Project Specification", 18);
  y -= 10;
  addLine(`Project ID: ${spec.projectId}`);
  addLine(`Status: ${spec.status}`);
  addLine(`Version: ${spec.version}`);
  addLine(`Generated: ${spec.createdAt.toISOString()}`);
  y -= 10;

  addLine("Overview", 14);
  addLine(spec.overview.slice(0, 120));
  y -= 6;

  if (spec.objectives.length > 0) {
    addLine("Objectives", 14);
    for (const obj of spec.objectives.slice(0, 10)) {
      addLine(`  - ${obj.slice(0, 100)}`);
    }
    y -= 6;
  }

  if (spec.featureBreakdown.length > 0) {
    addLine("Features", 14);
    for (const f of spec.featureBreakdown.slice(0, 8)) {
      addLine(`  ${f.name} [${f.priority}]: ${f.description.slice(0, 80)}`);
    }
    y -= 6;
  }

  addLine(`Timeline: ${spec.timelineEstimate.totalWeeks} weeks`, 14);
  addLine(`Cost: ${spec.costEstimate.currency} ${spec.costEstimate.totalMin.toLocaleString()} - ${spec.costEstimate.totalMax.toLocaleString()}`);

  return textLines.join("\n");
}

function escapePdf(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

// ---- Route factory ----

export function createSpecRoutes(specService: SpecService, tokenService: TokenService): Router {
  const router = Router();
  const auth = authMiddleware(tokenService);

  // POST /api/v1/specifications - generate spec
  router.post("/", auth, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = generateSpecSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError("Invalid specification data", parsed.error.flatten());
      }

      const spec = await specService.generateSpec(parsed.data.projectId);
      res.status(201).json(spec);
    } catch (err) {
      if (err instanceof ProjectNotFoundError) {
        return next(new NotFoundError("Project"));
      }
      if (err instanceof QuestionnaireIncompleteError) {
        return next(new AppError(err.message, 422));
      }
      next(err);
    }
  });

  // GET /api/v1/specifications?project_id= - get by project
  router.get("/", auth, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectId = req.query["project_id"] as string | undefined;
      if (!projectId) {
        throw new ValidationError("project_id query parameter is required");
      }

      const spec = await specService.getByProject(projectId);
      res.status(200).json(spec);
    } catch (err) {
      if (err instanceof SpecNotFoundError) {
        return next(new NotFoundError("Specification"));
      }
      next(err);
    }
  });

  // GET /api/v1/specifications/:id
  router.get("/:id", auth, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const spec = await specService.getSpec(req.params.id!);
      res.status(200).json(spec);
    } catch (err) {
      if (err instanceof SpecNotFoundError) {
        return next(new NotFoundError("Specification", req.params.id));
      }
      next(err);
    }
  });

  // POST /api/v1/specifications/:id/approve
  router.post(
    "/:id/approve",
    auth,
    requirePermission("specifications:update"),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const spec = await specService.approveSpec(req.params.id!, req.userId!);
        res.status(200).json(spec);
      } catch (err) {
        if (err instanceof SpecNotFoundError) {
          return next(new NotFoundError("Specification", req.params.id));
        }
        next(err);
      }
    },
  );

  // POST /api/v1/specifications/:id/reject
  router.post(
    "/:id/reject",
    auth,
    requirePermission("specifications:update"),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        rejectSchema.parse(req.body); // validate but reason is optional metadata
        const spec = await specService.rejectSpec(req.params.id!);
        res.status(200).json(spec);
      } catch (err) {
        if (err instanceof SpecNotFoundError) {
          return next(new NotFoundError("Specification", req.params.id));
        }
        next(err);
      }
    },
  );

  // POST /api/v1/specifications/:id/notes - add internal note
  router.post(
    "/:id/notes",
    auth,
    requirePermission("specifications:read"),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const parsed = addNoteSchema.safeParse(req.body);
        if (!parsed.success) {
          throw new ValidationError("Invalid note data", parsed.error.flatten());
        }

        const spec = await specService.addInternalNote(req.params.id!, req.userId!, parsed.data.content);
        res.status(201).json(spec);
      } catch (err) {
        if (err instanceof SpecNotFoundError) {
          return next(new NotFoundError("Specification", req.params.id));
        }
        next(err);
      }
    },
  );

  // GET /api/v1/specifications/:id/pdf - generate and download PDF
  router.get("/:id/pdf", auth, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const spec = await specService.getSpec(req.params.id!);
      const pdf = buildSpecPdf(spec);

      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="spec-${spec.id}.pdf"`,
        "Content-Length": String(pdf.length),
      });
      res.end(pdf);
    } catch (err) {
      if (err instanceof SpecNotFoundError) {
        return next(new NotFoundError("Specification", req.params.id));
      }
      next(err);
    }
  });

  return router;
}
