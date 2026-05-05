import { Router } from "express";
import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import { ValidationError } from "../../../middleware/error-handler.js";

// ---- Validation schemas ----

const contactFormSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  company: z.string().max(200).optional(),
  phone: z.string().max(30).optional(),
  subject: z.string().min(1).max(300),
  message: z.string().min(10).max(5000),
  projectType: z.enum(["web_app", "mobile_app", "ai_system", "blockchain"]).optional(),
});

// ---- Service interface ----

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  subject: string;
  message: string;
  projectType?: string;
  createdAt: Date;
}

export interface ContactService {
  submit(input: {
    name: string;
    email: string;
    company?: string;
    phone?: string;
    subject: string;
    message: string;
    projectType?: string;
  }): Promise<ContactSubmission>;
}

// ---- Route factory ----

export function createContactRoutes(contactService: ContactService): Router {
  const router = Router();

  // POST /api/v1/contact (public)
  router.post("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = contactFormSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError("Invalid contact form data", parsed.error.flatten());
      }

      const submission = await contactService.submit(parsed.data);
      res.status(201).json({ message: "Thank you for your inquiry. We will be in touch shortly.", id: submission.id });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
