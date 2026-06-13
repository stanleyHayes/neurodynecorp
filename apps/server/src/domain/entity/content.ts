import { ObjectId } from "mongodb";

// ── Blog Post ──────────────────────────────────────────────────────────────

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  status: "published" | "draft" | "archived";
  author: string;
  authorId: string;
  readTime: string;
  tags: string[];
  coverImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export function createBlogPost(input: Omit<BlogPost, "id" | "createdAt" | "updatedAt">): BlogPost {
  const now = new Date();
  return { id: new ObjectId().toHexString(), ...input, createdAt: now, updatedAt: now };
}

// ── Testimonial ────────────────────────────────────────────────────────────

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  status: "active" | "hidden";
  avatarColor: string;
  createdAt: Date;
  updatedAt: Date;
}

export function createTestimonial(input: Omit<Testimonial, "id" | "createdAt" | "updatedAt">): Testimonial {
  const now = new Date();
  return { id: new ObjectId().toHexString(), ...input, createdAt: now, updatedAt: now };
}

// ── Service ────────────────────────────────────────────────────────────────

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  status: "active" | "coming_soon" | "inactive";
  projectCount: number;
  color: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export function createServiceItem(input: Omit<ServiceItem, "id" | "createdAt" | "updatedAt">): ServiceItem {
  const now = new Date();
  return { id: new ObjectId().toHexString(), ...input, createdAt: now, updatedAt: now };
}

// ── Portfolio / Case Study ─────────────────────────────────────────────────

export interface CaseStudy {
  id: string;
  title: string;
  slug: string;
  client: string;
  category: string;
  tags: string[];
  description: string;
  impact: string;
  results: string[];
  status: "published" | "draft";
  coverImage?: string;
  color: string;
  // ── Case Dossier facets (declassified-brief format) ──────────────────────
  sector?: string;
  serviceLine?: string;
  scale?: string;
  stage?: string;
  // ── Declassified-brief narrative ─────────────────────────────────────────
  brief?: string;
  constraints?: string[];
  architecture?: string;
  shipped?: string[];
  retained?: string[];
  learnt?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export function createCaseStudy(input: Omit<CaseStudy, "id" | "createdAt" | "updatedAt">): CaseStudy {
  const now = new Date();
  return { id: new ObjectId().toHexString(), ...input, createdAt: now, updatedAt: now };
}

// ── Contact Submission ─────────────────────────────────────────────────────

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  subject: string;
  projectType: string;
  message: string;
  status: "new" | "read" | "replied" | "archived";
  createdAt: Date;
  updatedAt: Date;
}

export function createContactSubmission(input: Omit<ContactSubmission, "id" | "createdAt" | "updatedAt">): ContactSubmission {
  const now = new Date();
  return { id: new ObjectId().toHexString(), ...input, createdAt: now, updatedAt: now };
}
