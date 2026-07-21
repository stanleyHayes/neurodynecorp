import { Router } from "express";
import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import { authMiddleware, requirePermission, type TokenService } from "../../../middleware/auth.js";
import { ValidationError, NotFoundError } from "../../../middleware/error-handler.js";
import {
  createStatusComponent,
  createIncident,
  type StatusComponent,
  type Incident,
} from "../../../domain/entity/status.js";
import type { MongoStatusRepository } from "../../driven/mongodb/status-repository.js";

// ── Email service interface ──────────────────────────────────────────────────

interface EmailService {
  sendEmail(to: string, subject: string, html: string): Promise<void>;
}

// ── Validation schemas ───────────────────────────────────────────────────────

const subscribeSchema = z.object({
  email: z.string().email(),
});

const createComponentSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(["operational", "degraded", "partial_outage", "major_outage", "maintenance"]).optional(),
  order: z.number().optional(),
});

const updateComponentSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(["operational", "degraded", "partial_outage", "major_outage", "maintenance"]).optional(),
  order: z.number().optional(),
});

const createIncidentSchema = z.object({
  title: z.string().min(1),
  impact: z.enum(["none", "minor", "major", "critical"]).optional(),
  status: z.enum(["investigating", "identified", "monitoring", "resolved"]).optional(),
  affectedComponents: z.array(z.string()).optional(),
  body: z.string().optional(),
});

const updateIncidentSchema = z.object({
  title: z.string().min(1).optional(),
  impact: z.enum(["none", "minor", "major", "critical"]).optional(),
  status: z.enum(["investigating", "identified", "monitoring", "resolved"]).optional(),
  affectedComponents: z.array(z.string()).optional(),
  update: z.object({ status: z.string().min(1), body: z.string().min(1) }).optional(),
});

// ── Helpers ──────────────────────────────────────────────────────────────────

const COMPONENT_SEVERITY: Record<string, number> = {
  operational: 0,
  maintenance: 1,
  degraded: 2,
  partial_outage: 3,
  major_outage: 4,
};

function worstComponentStatus(components: StatusComponent[]): string {
  let worst = "operational";
  let worstRank = 0;
  for (const c of components) {
    const rank = COMPONENT_SEVERITY[c.status] ?? 0;
    if (rank > worstRank) {
      worstRank = rank;
      worst = c.status;
    }
  }
  return worst;
}

// ── Route factory ────────────────────────────────────────────────────────────

export function createStatusRoutes(
  repo: MongoStatusRepository,
  emailService: EmailService,
  tokenService: TokenService,
): Router {
  const router = Router();
  const auth = authMiddleware(tokenService);

  // GET / — PUBLIC summary
  router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const components = await repo.listComponents();
      const activeIncidents = await repo.listIncidents({ active: true });

      let overallStatus: string;
      if (components.length === 0 && activeIncidents.length === 0) {
        overallStatus = "operational";
      } else {
        overallStatus = worstComponentStatus(components);
        const hasSevereIncident = activeIncidents.some(
          (i) => i.impact === "major" || i.impact === "critical",
        );
        if (hasSevereIncident) overallStatus = "major_outage";
      }

      res.json({
        overallStatus,
        components,
        activeIncidents,
        updatedAt: new Date(),
      });
    } catch (err) {
      next(err);
    }
  });

  // GET /incidents — PUBLIC, most recent first
  router.get("/incidents", async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const items = await repo.listIncidents();
      res.json({ items });
    } catch (err) {
      next(err);
    }
  });

  // GET /incidents/:id — PUBLIC
  router.get("/incidents/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const incident = await repo.getIncident(String(req.params.id));
      if (!incident) throw new NotFoundError("incident", String(req.params.id));
      res.json(incident);
    } catch (err) {
      next(err);
    }
  });

  // POST /subscribe — PUBLIC
  router.post("/subscribe", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = subscribeSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Invalid data", parsed.error.flatten());

      await repo.addSubscriber(parsed.data.email);
      try {
        await emailService.sendEmail(
          parsed.data.email,
          "Subscribed to status updates",
          "<p>You will be notified about incidents.</p>",
        );
      } catch {
        // best-effort notification; ignore failures
      }

      res.status(201).json({ status: "subscribed" });
    } catch (err) {
      next(err);
    }
  });

  // POST /components — create (incidents:create)
  router.post("/components", auth, requirePermission("incidents:create"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createComponentSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Invalid data", parsed.error.flatten());

      const component = createStatusComponent({
        name: parsed.data.name,
        description: parsed.data.description,
        status: parsed.data.status ?? "operational",
        order: parsed.data.order ?? 0,
      });
      const created = await repo.createComponent(component);
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  });

  // PATCH /components/:id — update (incidents:update)
  router.patch("/components/:id", auth, requirePermission("incidents:update"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = updateComponentSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Invalid data", parsed.error.flatten());

      const existing = (await repo.listComponents()).find((c) => c.id === String(req.params.id));
      if (!existing) throw new NotFoundError("component", String(req.params.id));

      const updated = await repo.updateComponent({ ...existing, ...parsed.data, id: existing.id });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  });

  // DELETE /components/:id — delete (incidents:delete)
  router.delete("/components/:id", auth, requirePermission("incidents:delete"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      await repo.deleteComponent(String(req.params.id));
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  // POST /incidents — create (incidents:create)
  router.post("/incidents", auth, requirePermission("incidents:create"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createIncidentSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Invalid data", parsed.error.flatten());

      const now = new Date();
      const status = parsed.data.status ?? "investigating";
      const incident = createIncident({
        title: parsed.data.title,
        impact: parsed.data.impact ?? "none",
        status,
        affectedComponents: parsed.data.affectedComponents ?? [],
        updates: [{ status, body: parsed.data.body ?? parsed.data.title, createdAt: now }],
        startedAt: now,
        resolvedAt: status === "resolved" ? now : undefined,
      });
      const created = await repo.createIncident(incident);
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  });

  // PATCH /incidents/:id — update (incidents:update)
  router.patch("/incidents/:id", auth, requirePermission("incidents:update"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = updateIncidentSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Invalid data", parsed.error.flatten());

      const existing = await repo.getIncident(String(req.params.id));
      if (!existing) throw new NotFoundError("incident", String(req.params.id));

      const next_: Incident = { ...existing, id: existing.id };
      if (parsed.data.title !== undefined) next_.title = parsed.data.title;
      if (parsed.data.impact !== undefined) next_.impact = parsed.data.impact;
      if (parsed.data.affectedComponents !== undefined) next_.affectedComponents = parsed.data.affectedComponents;

      const now = new Date();
      const newStatus = parsed.data.status ?? existing.status;
      next_.status = newStatus;

      const updates = [...existing.updates];
      if (parsed.data.update) {
        updates.push({ status: parsed.data.update.status, body: parsed.data.update.body, createdAt: now });
      }
      next_.updates = updates;

      if (newStatus === "resolved") {
        next_.resolvedAt = now;
      }

      const updated = await repo.updateIncident(next_);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
