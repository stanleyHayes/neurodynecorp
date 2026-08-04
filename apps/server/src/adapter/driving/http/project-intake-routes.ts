import { Router, type NextFunction, type Request, type Response } from "express";
import { z } from "zod";
import { authMiddleware, requireRole, type TokenService } from "../../../middleware/auth.js";
import { ValidationError } from "../../../middleware/error-handler.js";
import { rateLimit } from "../../../middleware/rate-limit.js";
import { createProjectIntake, hashResumeToken, type ProjectIntake, type ProjectIntakeStatus } from "../../../domain/entity/project-intake.js";

interface Repo {
  create(i: ProjectIntake): Promise<ProjectIntake>;
  findById(id: string): Promise<ProjectIntake | null>;
  findByOwner(ownerId: string): Promise<ProjectIntake[]>;
  findAll(status?: ProjectIntakeStatus): Promise<ProjectIntake[]>;
  update(i: ProjectIntake): Promise<ProjectIntake>;
}
interface Mailer { sendEmail(to: string, subject: string, html: string): Promise<unknown>; }

const category = z.enum([
  "general", "professional_services", "ecommerce", "healthcare", "education", "nonprofit",
  "hospitality_food", "real_estate", "construction_home_services", "beauty_wellness", "events",
  "media_creative", "government", "transport_logistics", "personal_brand", "cleaning",
  "photography", "interior_finishing",
]);
const payload = z.object({
  category,
  title: z.string().max(240).optional().default(""),
  contactName: z.string().max(200).optional().default(""),
  contactEmail: z.string().max(320).optional().default(""),
  company: z.string().max(240).optional(),
  answers: z.record(z.string(), z.unknown()).optional().default({}),
  currentSection: z.number().int().min(0).max(100).optional().default(0),
});
const patchPayload = payload.partial();
const publicKey = z.object({ resumeToken: z.string().min(20).max(200) });

const safe = (i: ProjectIntake) => {
  const { resumeTokenHash: _secret, ...record } = i;
  return record;
};
const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function createProjectIntakeRoutes(repo: Repo, tokens: TokenService, mailer: Mailer, notifyTo: string, openAI?: { apiKey?: string; model?: string }): Router {
  const router = Router();
  const auth = authMiddleware(tokens);
  const draftLimiter = rateLimit("project-intake-draft", { max: 30, windowMs: 60 * 60 * 1000 });
  const submitLimiter = rateLimit("project-intake-submit", { max: 10, windowMs: 60 * 60 * 1000 });
  const copilotLimiter = rateLimit("project-intake-copilot", { max: 12, windowMs: 60 * 1000, message: "The brief copilot is receiving too many requests. Please wait a minute." });

  const create = async (req: Request, res: Response, next: NextFunction, ownerId?: string) => {
    try {
      const parsed = payload.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Invalid project intake", parsed.error.flatten());
      const made = createProjectIntake({
        ownerId,
        category: parsed.data.category!,
        title: parsed.data.title,
        contactName: parsed.data.contactName,
        contactEmail: parsed.data.contactEmail,
        company: parsed.data.company,
        answers: parsed.data.answers,
        currentSection: parsed.data.currentSection,
      });
      const saved = await repo.create(made.intake);
      res.status(201).json({ ...safe(saved), resumeToken: made.resumeToken });
    } catch (e) { next(e); }
  };
  router.post("/drafts", draftLimiter, (req, res, next) => void create(req, res, next));
  router.post("/mine", auth, (req, res, next) => void create(req, res, next, req.userId));

  router.get("/mine", auth, async (req, res, next) => {
    try { res.json({ items: (await repo.findByOwner(req.userId!)).map(safe) }); } catch (e) { next(e); }
  });

  router.post("/copilot", copilotLimiter, async (req, res, next) => {
    try {
      const parsed = z.object({ category, section: z.string().max(120), message: z.string().min(1).max(2000), answers: z.record(z.string(), z.unknown()).default({}) }).safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Invalid copilot request", parsed.error.flatten());
      const answered = Object.entries(parsed.data.answers).filter(([, v]) => v !== "" && (!Array.isArray(v) || v.length)).slice(0, 80);
      let reply = "Start with the outcome: who should use this website, what should they do first, and what business result would make the project successful? Add one concrete example for each.";
      if (openAI?.apiKey) {
        const response = await fetch("https://api.openai.com/v1/responses", {
          method: "POST",
          headers: { Authorization: `Bearer ${openAI.apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: openAI.model || "gpt-5-mini",
            store: false,
            max_output_tokens: 500,
            instructions: "You are NeuroDyne's project discovery copilot. Help a client clarify a website brief. Be concise, specific, commercially practical, and ask at most two follow-up questions. Never invent facts. Refer only to the supplied answers. Return plain text with: one refined suggestion, missing decisions, and next question.",
            input: JSON.stringify({ category: parsed.data.category, section: parsed.data.section, clientMessage: parsed.data.message, currentAnswers: Object.fromEntries(answered) }),
          }),
        });
        if (response.ok) {
          const data = await response.json() as { output_text?: string; output?: Array<{ content?: Array<{ type?: string; text?: string }> }> };
          reply = data.output_text || data.output?.flatMap(o => o.content ?? []).find(c => c.type === "output_text")?.text || reply;
        }
      } else if (answered.length) {
        const missing = ["target audience", "primary action", "success measure", "deadline", "budget"].filter(k => !Object.keys(parsed.data.answers).some(id => id.includes(k.replace(" ", "_"))));
        reply = `You already have ${answered.length} useful answer${answered.length === 1 ? "" : "s"}. Make the brief more decisive by adding a measurable outcome and one real customer scenario.${missing.length ? ` Still worth clarifying: ${missing.slice(0, 3).join(", ")}.` : ""} What must be true 90 days after launch for you to call the website successful?`;
      }
      res.json({ reply, poweredByAI: Boolean(openAI?.apiKey) });
    } catch (e) { next(e); }
  });

  router.get("/drafts/:id", async (req, res, next) => {
    try {
      const key = publicKey.safeParse(req.query);
      const item = await repo.findById(String(req.params.id));
      if (!key.success || !item || item.ownerId || item.resumeTokenHash !== hashResumeToken(key.data.resumeToken)) return res.status(404).json({ error: "Project intake not found" });
      res.json(safe(item));
    } catch (e) { next(e); }
  });

  const update = async (req: Request, res: Response, next: NextFunction, ownerId?: string) => {
    try {
      const parsed = patchPayload.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Invalid project intake", parsed.error.flatten());
      const item = await repo.findById(String(req.params.id));
      const tokenValid = !ownerId && typeof req.body.resumeToken === "string" && item?.resumeTokenHash === hashResumeToken(req.body.resumeToken);
      if (!item || (ownerId ? item.ownerId !== ownerId : item.ownerId || !tokenValid)) return res.status(404).json({ error: "Project intake not found" });
      if (item.status === "submitted") return res.status(409).json({ error: "Submitted project intakes cannot be changed" });
      const { resumeToken: _ignored, ...body } = req.body;
      const updated = await repo.update({ ...item, ...body, answers: parsed.data.answers ?? item.answers });
      res.json(safe(updated));
    } catch (e) { next(e); }
  };
  router.patch("/drafts/:id", (req, res, next) => void update(req, res, next));
  router.patch("/mine/:id", auth, (req, res, next) => void update(req, res, next, req.userId));

  const submit = async (req: Request, res: Response, next: NextFunction, ownerId?: string) => {
    try {
      const item = await repo.findById(String(req.params.id));
      const tokenValid = !ownerId && typeof req.body.resumeToken === "string" && item?.resumeTokenHash === hashResumeToken(req.body.resumeToken);
      if (!item || (ownerId ? item.ownerId !== ownerId : item.ownerId || !tokenValid)) return res.status(404).json({ error: "Project intake not found" });
      if (!item.title.trim() || !item.contactName.trim() || !z.string().email().safeParse(item.contactEmail).success) return res.status(422).json({ error: "Project title, contact name, and a valid email are required before submission" });
      const submitted = item.status === "submitted" ? item : await repo.update({ ...item, status: "submitted", submittedAt: new Date() });
      if (item.status !== "submitted") {
        const summary = esc(JSON.stringify(submitted.answers, null, 2));
        void mailer.sendEmail(notifyTo, `New project brief: ${submitted.title}`, `<h2>${esc(submitted.title)}</h2><p>${esc(submitted.contactName)} &lt;${esc(submitted.contactEmail)}&gt; · ${esc(submitted.category)}</p><pre>${summary}</pre>`).catch(() => undefined);
        void mailer.sendEmail(submitted.contactEmail, "Your NeuroDyne project brief is submitted", `<p>Hi ${esc(submitted.contactName)},</p><p>We received <strong>${esc(submitted.title)}</strong>. We will review it and contact you with the next step.</p>`).catch(() => undefined);
      }
      res.json(safe(submitted));
    } catch (e) { next(e); }
  };
  router.post("/drafts/:id/submit", submitLimiter, (req, res, next) => void submit(req, res, next));
  router.post("/mine/:id/submit", auth, (req, res, next) => void submit(req, res, next, req.userId));

  router.get("/admin", auth, requireRole("admin", "project_manager"), async (req, res, next) => {
    try {
      const status = req.query.status === "draft" || req.query.status === "submitted" ? req.query.status : undefined;
      res.json({ items: (await repo.findAll(status)).map(safe) });
    } catch (e) { next(e); }
  });
  router.get("/admin/:id", auth, requireRole("admin", "project_manager"), async (req, res, next) => {
    try { const i = await repo.findById(String(req.params.id)); if (!i) return res.status(404).json({ error: "Project intake not found" }); res.json(safe(i)); } catch (e) { next(e); }
  });
  return router;
}
