import { ObjectId } from "mongodb";
import { randomBytes, createHash } from "node:crypto";

export type ProjectIntakeStatus = "draft" | "submitted";

export interface ProjectIntake {
  id: string;
  ownerId?: string;
  resumeTokenHash?: string;
  category: string;
  title: string;
  contactName: string;
  contactEmail: string;
  company?: string;
  answers: Record<string, unknown>;
  currentSection: number;
  status: ProjectIntakeStatus;
  submittedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export function hashResumeToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function createProjectIntake(input: {
  ownerId?: string;
  category: string;
  title?: string;
  contactName?: string;
  contactEmail?: string;
  company?: string;
  answers?: Record<string, unknown>;
  currentSection?: number;
}): { intake: ProjectIntake; resumeToken?: string } {
  const now = new Date();
  const resumeToken = input.ownerId ? undefined : randomBytes(32).toString("base64url");
  return {
    intake: {
      id: new ObjectId().toHexString(),
      ownerId: input.ownerId,
      resumeTokenHash: resumeToken ? hashResumeToken(resumeToken) : undefined,
      category: input.category,
      title: input.title?.trim() ?? "",
      contactName: input.contactName?.trim() ?? "",
      contactEmail: input.contactEmail?.trim().toLowerCase() ?? "",
      company: input.company?.trim() || undefined,
      answers: input.answers ?? {},
      currentSection: input.currentSection ?? 0,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    },
    resumeToken,
  };
}
