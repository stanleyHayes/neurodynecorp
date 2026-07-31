/**
 * Portfolio seed data — real projects from the TS directory
 * Used to populate NeuroDyne's project management platform with
 * historically accurate project data.
 */

import { ObjectId } from "mongodb";
import { createHash } from "crypto";
import type { Project } from "../../../domain/entity/project.js";

let oidSeq = 0;
/**
 * Deterministic seed ids.
 *
 * These used to be `new ObjectId()`, which minted fresh ids on every run — so
 * re-seeding never collided on _id and inserted a second copy of every row.
 * A single `pnpm seed` duplicated the entire portfolio and most demo data.
 * Deriving the id from a stable counter makes re-seeding idempotent: the same
 * row keeps the same _id, the insert hits a duplicate-key error and is skipped.
 */
function oid(): string {
  oidSeq += 1;
  return createHash("sha1").update(`neurodyne:portfolio:${oidSeq}`).digest("hex").slice(0, 24);
}

function d(iso: string): Date {
  return new Date(iso);
}

// Re-use existing client IDs from seed-data.ts so these projects
// appear under real demo accounts.  Rotated across the 3 seeded clients.
import { IDS } from "./seed-data.js";

const C1 = IDS.client1; // david.kim@acmecorp.com
const C2 = IDS.client2; // fatima.hassan@greenleaf.io
const C3 = IDS.client3; // lucas.berg@nordicsaas.com

const CLIENT_24HOUR = C1;
const CLIENT_JDPLUS = C1;
const CLIENT_RENTOS = C2;
const CLIENT_AEJ = C2;
const CLIENT_BACK2U = C3;
const CLIENT_BDR = C1;
const CLIENT_BESTPRICE = C2;
const CLIENT_DAADD = C3;
const CLIENT_EASYLIFE = C1;
const CLIENT_EDUCORE = C2;
const CLIENT_FASTCARE = C3;
const CLIENT_ILIVVON = C1;
const CLIENT_NEMESIS = C2;
const CLIENT_SHAMASH = C3;
const CLIENT_CIVITAS = C1;
const CLIENT_CLUBOS = C2;
const CLIENT_KRAKEN = C3;
const CLIENT_LEKMA = C1;
const CLIENT_UBUNTU = C2;
const CLIENT_UPOSA = C3;
const CLIENT_LEVIATHAN = C1;
const CLIENT_LIBRERATUM = C2;
const CLIENT_YENARA = C3;
const CLIENT_EXODUS = C1;
const CLIENT_RUDERALIS = C2;
const CLIENT_TRIBUTE = C3;
const CLIENT_INTELlica = C1;
const CLIENT_ALTAR = C2;
const CLIENT_ENCORE = C3;
const CLIENT_ICHOOSE = C1;
const CLIENT_PEOPLE = C2;
const CLIENT_HABIB = C3;
const CLIENT_IBRAHIM = C1;
const CLIENT_LINGUA = C2;
const CLIENT_BRIANSFOMO = C3;
const CLIENT_CIRCL = C1;
const CLIENT_LEBIBU = C2;
const CLIENT_MFA = C3;
const CLIENT_PORTFOLIO_DASHBOARD = C1;
const CLIENT_JDPLUS_LIMITED = C2;

export const portfolioProjects: Project[] = [
  {
    id: oid(),
    name: "24-Hour Economy Investment Intelligence Platform",
    description:
      "Comprehensive investment intelligence and management platform for Ghana's 24-hour economy policy. Features real-time market analytics, portfolio tracking, and ML-driven investment recommendations.",
    clientId: CLIENT_24HOUR,
    status: "in_development",
    type: "web_app",
    features: [
      { id: oid(), name: "Real-time market dashboard", description: "Live market data visualization with sector breakdowns", priority: "critical" },
      { id: oid(), name: "ML investment scoring", description: "Machine learning models for investment opportunity ranking", priority: "high" },
      { id: oid(), name: "Portfolio analytics", description: "Advanced portfolio performance tracking and reporting", priority: "high" },
      { id: oid(), name: "Mobile companion", description: "React Native app for on-the-go investment monitoring", priority: "medium" },
    ],
    userRoles: ["Investor", "Fund Manager", "Analyst", "Admin"],
    integrations: ["Bloomberg API", "Alpha Vantage", "MongoDB Atlas", "TensorFlow"],
    budgetRange: { min: 150000, max: 300000, currency: "USD" },
    timeline: { startDate: d("2025-06-01"), endDate: d("2026-06-01"), estimatedWeeks: 52 },
    attachments: [],
    assignedTeam: [],
    progress: 65,
    milestones: [
      { id: oid(), name: "Data pipeline MVP", description: "Core data ingestion and processing pipeline", dueDate: d("2025-09-01"), status: "completed", completedAt: d("2025-08-28") },
      { id: oid(), name: "Dashboard v1", description: "Initial analytics dashboard release", dueDate: d("2025-12-01"), status: "completed", completedAt: d("2025-11-20") },
      { id: oid(), name: "ML models integration", description: "Production ML scoring system", dueDate: d("2026-03-01"), status: "in_progress" },
      { id: oid(), name: "Mobile launch", description: "React Native app store release", dueDate: d("2026-06-01"), status: "pending" },
    ],
    createdAt: d("2025-05-15T09:00:00Z"),
    updatedAt: d("2026-03-20T09:00:00Z"),
  },

  {
    id: oid(),
    name: "JDPlus AC — Service Management Platform",
    description:
      "Air-conditioning sales, installation, and service platform with QR-coded follow-up system. Every AC installation gets a QR sticker holding full service history, with SMS reminders 14 days before scheduled service.",
    clientId: CLIENT_JDPLUS,
    status: "delivered",
    type: "web_app",
    features: [
      { id: oid(), name: "QR service tracking", description: "QR-code-based service history tracking per unit", priority: "critical" },
      { id: oid(), name: "SMS reminders", description: "Automated SMS service reminders 14 days prior", priority: "high" },
      { id: oid(), name: "Technician dispatch", description: "Field technician scheduling and route optimization", priority: "high" },
      { id: oid(), name: "Customer portal", description: "Self-service portal for customers to view service history", priority: "medium" },
    ],
    userRoles: ["Customer", "Technician", "Dispatcher", "Admin"],
    integrations: ["Twilio", "MongoDB Atlas", "Google Maps"],
    budgetRange: { min: 35000, max: 60000, currency: "USD" },
    timeline: { startDate: d("2024-08-01"), endDate: d("2025-02-01"), estimatedWeeks: 26 },
    attachments: [],
    assignedTeam: [],
    progress: 100,
    milestones: [
      { id: oid(), name: "Backend & Auth", description: "Go API with JWT auth and MongoDB setup", dueDate: d("2024-09-15"), status: "completed", completedAt: d("2024-09-10") },
      { id: oid(), name: "QR system", description: "QR generation and scanning workflow", dueDate: d("2024-11-01"), status: "completed", completedAt: d("2024-10-28") },
      { id: oid(), name: "SMS integration", description: "Twilio SMS scheduling and reminders", dueDate: d("2024-12-15"), status: "completed", completedAt: d("2024-12-10") },
      { id: oid(), name: "Production launch", description: "Go-live with JDPlus AC operations", dueDate: d("2025-02-01"), status: "completed", completedAt: d("2025-01-25") },
    ],
    createdAt: d("2024-07-10T09:00:00Z"),
    updatedAt: d("2025-02-01T09:00:00Z"),
  },

  {
    id: oid(),
    name: "JDPlus Electronics — Admin & E-commerce Platform",
    description:
      "Full-stack operations platform for a Ghanaian electronics showroom. Manages inventory, sales, invoicing, installment agreements, staff access, and public marketing website from a single admin panel.",
    clientId: CLIENT_JDPLUS,
    status: "delivered",
    type: "web_app",
    features: [
      { id: oid(), name: "Inventory management", description: "Real-time stock tracking with low-stock alerts", priority: "critical" },
      { id: oid(), name: "Installment tracking", description: "Customer installment plan management and payment tracking", priority: "critical" },
      { id: oid(), name: "Invoicing system", description: "Automated invoice generation with PDF export", priority: "high" },
      { id: oid(), name: "Staff RBAC", description: "Role-based access control for showroom staff", priority: "medium" },
    ],
    userRoles: ["Admin", "Sales Staff", "Accountant", "Manager"],
    integrations: ["Paystack", "MongoDB", "Cloudinary"],
    budgetRange: { min: 25000, max: 45000, currency: "USD" },
    timeline: { startDate: d("2024-03-01"), endDate: d("2024-10-01"), estimatedWeeks: 30 },
    attachments: [],
    assignedTeam: [],
    progress: 100,
    milestones: [
      { id: oid(), name: "Admin MVP", description: "Core admin dashboard with inventory CRUD", dueDate: d("2024-05-01"), status: "completed", completedAt: d("2024-04-28") },
      { id: oid(), name: "Payments & Invoicing", description: "Paystack integration and invoice system", dueDate: d("2024-07-01"), status: "completed", completedAt: d("2024-06-25") },
      { id: oid(), name: "Marketing site", description: "Public-facing product catalog and contact", dueDate: d("2024-09-01"), status: "completed", completedAt: d("2024-08-30") },
      { id: oid(), name: "Launch", description: "Production deployment and staff training", dueDate: d("2024-10-01"), status: "completed", completedAt: d("2024-09-28") },
    ],
    createdAt: d("2024-02-15T09:00:00Z"),
    updatedAt: d("2024-10-01T09:00:00Z"),
  },

  {
    id: oid(),
    name: "RentOS Ghana — National Rental Housing Platform",
    description:
      "Ghana's national digital rental housing platform. Find properties, sign legally compliant agreements, pay rent via mobile money, build credit score, and resolve disputes — all in one platform.",
    clientId: CLIENT_RENTOS,
    status: "in_development",
    type: "web_app",
    features: [
      { id: oid(), name: "Property listings", description: "Advanced property search with filters and maps", priority: "critical" },
      { id: oid(), name: "Digital agreements", description: "Legally compliant e-signature rental contracts", priority: "critical" },
      { id: oid(), name: "Mobile money payments", description: "MTN MoMo and Vodafone Cash rent payments", priority: "critical" },
      { id: oid(), name: "Credit scoring", description: "Tenant credit score building through rental history", priority: "high" },
      { id: oid(), name: "Dispute resolution", description: "In-app mediation and escrow for disputes", priority: "medium" },
    ],
    userRoles: ["Tenant", "Landlord", "Agent", "Mediator", "Admin"],
    integrations: ["Paystack", "Google Maps", "MongoDB", "Redis"],
    budgetRange: { min: 120000, max: 200000, currency: "USD" },
    timeline: { startDate: d("2025-01-01"), endDate: d("2026-01-01"), estimatedWeeks: 52 },
    attachments: [],
    assignedTeam: [],
    progress: 55,
    milestones: [
      { id: oid(), name: "Property engine", description: "Listing management and search infrastructure", dueDate: d("2025-04-01"), status: "completed", completedAt: d("2025-03-28") },
      { id: oid(), name: "Payments & Agreements", description: "MoMo integration and digital contract flow", dueDate: d("2025-08-01"), status: "completed", completedAt: d("2025-07-25") },
      { id: oid(), name: "Credit system", description: "Tenant scoring algorithm and history tracking", dueDate: d("2025-12-01"), status: "in_progress" },
      { id: oid(), name: "National launch", description: "Full Ghana rollout with partner agencies", dueDate: d("2026-01-01"), status: "pending" },
    ],
    createdAt: d("2024-11-01T09:00:00Z"),
    updatedAt: d("2026-03-15T09:00:00Z"),
  },

  {
    id: oid(),
    name: "AEJ Travel & Tours — Operations System",
    description:
      "Sports travel and visa operations system for AEJ Travel & Tours Ltd (Accra, Ghana). Unified Next.js app absorbing intake, case management, document tracking, and client communications.",
    clientId: CLIENT_AEJ,
    status: "delivered",
    type: "web_app",
    features: [
      { id: oid(), name: "Case management", description: "End-to-end visa and travel case tracking", priority: "critical" },
      { id: oid(), name: "Document portal", description: "Client document upload and verification workflow", priority: "high" },
      { id: oid(), name: "Communication hub", description: "Integrated email and SMS client communications", priority: "high" },
      { id: oid(), name: "Reporting", description: "Operational dashboards and financial reports", priority: "medium" },
    ],
    userRoles: ["Client", "Case Officer", "Manager", "Admin"],
    integrations: ["Resend", "MongoDB", "Vercel"],
    budgetRange: { min: 20000, max: 40000, currency: "USD" },
    timeline: { startDate: d("2024-06-01"), endDate: d("2024-12-01"), estimatedWeeks: 26 },
    attachments: [],
    assignedTeam: [],
    progress: 100,
    milestones: [
      { id: oid(), name: "Intake system", description: "Online application and document collection", dueDate: d("2024-08-01"), status: "completed", completedAt: d("2024-07-28") },
      { id: oid(), name: "Case workflow", description: "Internal case tracking and status updates", dueDate: d("2024-10-01"), status: "completed", completedAt: d("2024-09-25") },
      { id: oid(), name: "Client portal", description: "Self-service status checking and messaging", dueDate: d("2024-11-15"), status: "completed", completedAt: d("2024-11-10") },
      { id: oid(), name: "Launch", description: "Full operations migration to new platform", dueDate: d("2024-12-01"), status: "completed", completedAt: d("2024-11-28") },
    ],
    createdAt: d("2024-05-10T09:00:00Z"),
    updatedAt: d("2024-12-01T09:00:00Z"),
  },

  {
    id: oid(),
    name: "Back2u — Smart Lost & Found Ecosystem",
    description:
      "AI-powered platform that reunites people with their lost belongings. Hexagonal-architecture Express backend with four React + MUI web apps and an Expo mobile app.",
    clientId: CLIENT_BACK2U,
    status: "qa",
    type: "mobile_app",
    features: [
      { id: oid(), name: "AI item matching", description: "Computer vision-based lost item identification and matching", priority: "critical" },
      { id: oid(), name: "Multi-tenant web apps", description: "Four separate web apps for different user personas", priority: "high" },
      { id: oid(), name: "Mobile reporting", description: "Expo-based mobile app for on-the-go item reporting", priority: "high" },
      { id: oid(), name: "Reward system", description: "Integrated reward and verification system for returns", priority: "medium" },
    ],
    userRoles: ["Finder", "Owner", "Verifier", "Admin"],
    integrations: ["OpenAI Vision", "MongoDB", "Redis", "Cloudinary"],
    budgetRange: { min: 80000, max: 140000, currency: "USD" },
    timeline: { startDate: d("2025-03-01"), endDate: d("2026-03-01"), estimatedWeeks: 52 },
    attachments: [],
    assignedTeam: [],
    progress: 85,
    milestones: [
      { id: oid(), name: "Backend architecture", description: "Hexagonal Express API with test coverage", dueDate: d("2025-06-01"), status: "completed", completedAt: d("2025-05-28") },
      { id: oid(), name: "Web apps suite", description: "All four React web applications delivered", dueDate: d("2025-10-01"), status: "completed", completedAt: d("2025-09-25") },
      { id: oid(), name: "Mobile app", description: "Expo app with camera and location services", dueDate: d("2025-12-01"), status: "completed", completedAt: d("2025-11-20") },
      { id: oid(), name: "AI integration", description: "Vision API integration for item matching", dueDate: d("2026-02-01"), status: "in_progress" },
    ],
    createdAt: d("2025-02-01T09:00:00Z"),
    updatedAt: d("2026-03-10T09:00:00Z"),
  },

  {
    id: oid(),
    name: "BDR Ghana — Open Vital Statistics Platform",
    description:
      "Redesign of births and deaths registry of Ghana (bdr.gov.gh) as a data-driven, brand-aligned, API-first platform. Modernizes civil registration with digital workflows and public dashboards.",
    clientId: CLIENT_BDR,
    status: "approved",
    type: "web_app",
    features: [
      { id: oid(), name: "Digital registration", description: "Online birth and death certificate applications", priority: "critical" },
      { id: oid(), name: "API gateway", description: "RESTful API for third-party integrations (NHIS, banks)", priority: "critical" },
      { id: oid(), name: "Public dashboards", description: "Open vital statistics visualization and reporting", priority: "high" },
      { id: oid(), name: "Field officer app", description: "Mobile data collection for remote registrations", priority: "medium" },
    ],
    userRoles: ["Citizen", "Registrar", "Field Officer", "Admin", "Analyst"],
    integrations: ["NHIS API", "GhanaCard", "MongoDB", "Redis"],
    budgetRange: { min: 200000, max: 350000, currency: "USD" },
    timeline: { startDate: d("2026-04-01"), endDate: d("2027-04-01"), estimatedWeeks: 52 },
    attachments: [],
    assignedTeam: [],
    progress: 10,
    milestones: [
      { id: oid(), name: "Discovery & Design", description: "User research, UX audit, and design system", dueDate: d("2026-06-01"), status: "in_progress" },
      { id: oid(), name: "API foundation", description: "Core API with auth and database schemas", dueDate: d("2026-09-01"), status: "pending" },
      { id: oid(), name: "Public portal", description: "Citizen-facing registration and tracking", dueDate: d("2026-12-01"), status: "pending" },
      { id: oid(), name: "Dashboards", description: "Analytics and open data visualization", dueDate: d("2027-03-01"), status: "pending" },
    ],
    createdAt: d("2026-01-15T09:00:00Z"),
    updatedAt: d("2026-03-28T09:00:00Z"),
  },

  {
    id: oid(),
    name: "BestPriceGH — E-commerce with Installments",
    description:
      "Full-stack recreation of bestpricegh.com with installment payments. Customer web, admin web, mobile (Expo), and Go backend in hexagonal architecture.",
    clientId: CLIENT_BESTPRICE,
    status: "delivered",
    type: "web_app",
    features: [
      { id: oid(), name: "Product catalog", description: "Advanced product browsing with filters and search", priority: "critical" },
      { id: oid(), name: "Installment engine", description: "Buy-now-pay-later with automated payment scheduling", priority: "critical" },
      { id: oid(), name: "Admin dashboard", description: "Inventory, orders, and customer management", priority: "high" },
      { id: oid(), name: "Mobile shopping", description: "Expo-based iOS and Android shopping app", priority: "medium" },
    ],
    userRoles: ["Shopper", "Merchant", "Admin", "Delivery Agent"],
    integrations: ["Paystack", "MongoDB", "Cloudinary", "Redis"],
    budgetRange: { min: 45000, max: 80000, currency: "USD" },
    timeline: { startDate: d("2024-05-01"), endDate: d("2024-12-01"), estimatedWeeks: 30 },
    attachments: [],
    assignedTeam: [],
    progress: 100,
    milestones: [
      { id: oid(), name: "Backend API", description: "Hexagonal Go API with full test coverage", dueDate: d("2024-07-01"), status: "completed", completedAt: d("2024-06-25") },
      { id: oid(), name: "Web storefront", description: "Customer-facing Next.js shopping experience", dueDate: d("2024-09-01"), status: "completed", completedAt: d("2024-08-28") },
      { id: oid(), name: "Installment system", description: "Payment plan creation and automated collection", dueDate: d("2024-10-15"), status: "completed", completedAt: d("2024-10-10") },
      { id: oid(), name: "Mobile apps", description: "iOS and Android release", dueDate: d("2024-12-01"), status: "completed", completedAt: d("2024-11-25") },
    ],
    createdAt: d("2024-04-01T09:00:00Z"),
    updatedAt: d("2024-12-01T09:00:00Z"),
  },

  {
    id: oid(),
    name: "DAADD — AdTech & Analytics Platform",
    description:
      "Two-sided AdTech and analytics platform connecting advertisers with publishers. Intelligent campaign management, real-time analytics, geographic heatmaps, AI-powered optimization, and cross-device attribution.",
    clientId: CLIENT_DAADD,
    status: "in_development",
    type: "web_app",
    features: [
      { id: oid(), name: "Campaign manager", description: "Multi-channel campaign creation and management", priority: "critical" },
      { id: oid(), name: "Real-time analytics", description: "Sub-second impression and click analytics", priority: "critical" },
      { id: oid(), name: "Heatmap visualization", description: "Geographic campaign performance heatmaps", priority: "high" },
      { id: oid(), name: "AI optimization", description: "Automated bid and budget optimization", priority: "high" },
      { id: oid(), name: "Cross-device attribution", description: "User journey tracking across devices", priority: "medium" },
    ],
    userRoles: ["Advertiser", "Publisher", "Account Manager", "Admin"],
    integrations: ["MongoDB", "Redis", "Kafka", "TensorFlow"],
    budgetRange: { min: 180000, max: 300000, currency: "USD" },
    timeline: { startDate: d("2025-04-01"), endDate: d("2026-06-01"), estimatedWeeks: 60 },
    attachments: [],
    assignedTeam: [],
    progress: 45,
    milestones: [
      { id: oid(), name: "Ad server MVP", description: "Core ad serving and tracking infrastructure", dueDate: d("2025-08-01"), status: "completed", completedAt: d("2025-07-28") },
      { id: oid(), name: "Analytics engine", description: "Real-time clickstream processing pipeline", dueDate: d("2025-12-01"), status: "completed", completedAt: d("2025-11-20") },
      { id: oid(), name: "AI optimization", description: "Machine learning bid optimization models", dueDate: d("2026-03-01"), status: "in_progress" },
      { id: oid(), name: "Publisher network", description: "Self-service publisher onboarding and management", dueDate: d("2026-06-01"), status: "pending" },
    ],
    createdAt: d("2025-03-01T09:00:00Z"),
    updatedAt: d("2026-03-20T09:00:00Z"),
  },

  {
    id: oid(),
    name: "EasyLife — Consumer Electronics E-commerce",
    description:
      "Multi-platform consumer-electronics e-commerce platform for Ghana. Storefront, admin dashboard, mobile apps (iOS + Android), and Go backend — one monorepo.",
    clientId: CLIENT_EASYLIFE,
    status: "delivered",
    type: "web_app",
    features: [
      { id: oid(), name: "Multi-vendor marketplace", description: "Vendor onboarding and product management", priority: "critical" },
      { id: oid(), name: "Mobile money checkout", description: "MTN MoMo, Vodafone Cash, and card payments", priority: "critical" },
      { id: oid(), name: "Delivery tracking", description: "Real-time order tracking and delivery notifications", priority: "high" },
      { id: oid(), name: "Mobile apps", description: "Native-like shopping experience on iOS and Android", priority: "medium" },
    ],
    userRoles: ["Buyer", "Vendor", "Delivery Agent", "Admin"],
    integrations: ["Paystack", "MongoDB", "Redis", "Firebase"],
    budgetRange: { min: 60000, max: 100000, currency: "USD" },
    timeline: { startDate: d("2024-08-01"), endDate: d("2025-04-01"), estimatedWeeks: 34 },
    attachments: [],
    assignedTeam: [],
    progress: 100,
    milestones: [
      { id: oid(), name: "Go backend", description: "RESTful API with full test coverage", dueDate: d("2024-10-01"), status: "completed", completedAt: d("2024-09-25") },
      { id: oid(), name: "Web storefront", description: "React + Vite customer shopping experience", dueDate: d("2024-12-01"), status: "completed", completedAt: d("2024-11-20") },
      { id: oid(), name: "Mobile apps", description: "Expo-based iOS and Android release", dueDate: d("2025-02-15"), status: "completed", completedAt: d("2025-02-10") },
      { id: oid(), name: "Production launch", description: "Full Ghana market launch", dueDate: d("2025-04-01"), status: "completed", completedAt: d("2025-03-28") },
    ],
    createdAt: d("2024-07-01T09:00:00Z"),
    updatedAt: d("2025-04-01T09:00:00Z"),
  },

  {
    id: oid(),
    name: "EduCore — SHS Management Platform",
    description:
      "Senior High School management platform for Ghana. Handles admissions, academics, attendance, grading, fee collection, and parent communication in one unified system.",
    clientId: CLIENT_EDUCORE,
    status: "in_development",
    type: "web_app",
    features: [
      { id: oid(), name: "Student information system", description: "Complete student records and academic tracking", priority: "critical" },
      { id: oid(), name: "Grading & transcripts", description: "Automated grading with WAEC-compatible transcripts", priority: "critical" },
      { id: oid(), name: "Fee management", description: "School fee collection with mobile money", priority: "high" },
      { id: oid(), name: "Parent portal", description: "Real-time academic progress and communication", priority: "medium" },
    ],
    userRoles: ["Student", "Teacher", "Parent", "Administrator", "Accountant"],
    integrations: ["Paystack", "MongoDB", "SMS Gateway"],
    budgetRange: { min: 80000, max: 150000, currency: "USD" },
    timeline: { startDate: d("2025-07-01"), endDate: d("2026-07-01"), estimatedWeeks: 52 },
    attachments: [],
    assignedTeam: [],
    progress: 35,
    milestones: [
      { id: oid(), name: "Core SIS", description: "Student records and class management", dueDate: d("2025-10-01"), status: "completed", completedAt: d("2025-09-28") },
      { id: oid(), name: "Grading module", description: "Assessment and report card generation", dueDate: d("2026-01-01"), status: "in_progress" },
      { id: oid(), name: "Fee system", description: "Payment collection and receipt management", dueDate: d("2026-04-01"), status: "pending" },
      { id: oid(), name: "Pilot deployment", description: "Beta launch with partner schools", dueDate: d("2026-07-01"), status: "pending" },
    ],
    createdAt: d("2025-06-01T09:00:00Z"),
    updatedAt: d("2026-03-15T09:00:00Z"),
  },

  {
    id: oid(),
    name: "FastCare Clinics — Healthcare Management Platform",
    description:
      "Complete healthcare management platform for modern African clinics. Digital patient records, clinical workflows, financial operations, NHIS integration, and real-time dashboards.",
    clientId: CLIENT_FASTCARE,
    status: "delivered",
    type: "web_app",
    features: [
      { id: oid(), name: "Electronic health records", description: "HIPAA-compliant digital patient records", priority: "critical" },
      { id: oid(), name: "NHIS integration", description: "Direct National Health Insurance claims processing", priority: "critical" },
      { id: oid(), name: "Clinical workflows", description: "Triage, diagnosis, prescription, and referral tracking", priority: "high" },
      { id: oid(), name: "Financial operations", description: "Billing, insurance claims, and revenue reporting", priority: "high" },
    ],
    userRoles: ["Patient", "Doctor", "Nurse", "Receptionist", "Admin", "Accountant"],
    integrations: ["NHIS API", "Paystack", "MongoDB", "Redis"],
    budgetRange: { min: 100000, max: 180000, currency: "USD" },
    timeline: { startDate: d("2024-09-01"), endDate: d("2025-07-01"), estimatedWeeks: 44 },
    attachments: [],
    assignedTeam: [],
    progress: 100,
    milestones: [
      { id: oid(), name: "EHR foundation", description: "Patient records and appointment system", dueDate: d("2024-12-01"), status: "completed", completedAt: d("2024-11-25") },
      { id: oid(), name: "NHIS integration", description: "Insurance verification and claims processing", dueDate: d("2025-02-15"), status: "completed", completedAt: d("2025-02-10") },
      { id: oid(), name: "Clinical modules", description: "Prescription, lab, and referral workflows", dueDate: d("2025-05-01"), status: "completed", completedAt: d("2025-04-25") },
      { id: oid(), name: "Clinic launch", description: "Production deployment across partner clinics", dueDate: d("2025-07-01"), status: "completed", completedAt: d("2025-06-28") },
    ],
    createdAt: d("2024-08-01T09:00:00Z"),
    updatedAt: d("2025-07-01T09:00:00Z"),
  },

  {
    id: oid(),
    name: "Ilivvon — Healthcare Ecosystem",
    description:
      "Comprehensive healthcare management platform connecting hospitals, patients, and administrators through dedicated web and mobile interfaces, backed by a unified API.",
    clientId: CLIENT_ILIVVON,
    status: "delivered",
    type: "mobile_app",
    features: [
      { id: oid(), name: "Hospital management", description: "Bed management, staff scheduling, and resource allocation", priority: "critical" },
      { id: oid(), name: "Patient portal", description: "Appointments, prescriptions, and health records", priority: "critical" },
      { id: oid(), name: "Telemedicine", description: "Video consultations and remote monitoring", priority: "high" },
      { id: oid(), name: "Mobile apps", description: "Dedicated iOS and Android apps for patients and staff", priority: "medium" },
    ],
    userRoles: ["Patient", "Doctor", "Hospital Admin", "Super Admin"],
    integrations: ["MongoDB", "Redis", "WebRTC", "Firebase"],
    budgetRange: { min: 120000, max: 200000, currency: "USD" },
    timeline: { startDate: d("2024-04-01"), endDate: d("2025-02-01"), estimatedWeeks: 44 },
    attachments: [],
    assignedTeam: [],
    progress: 100,
    milestones: [
      { id: oid(), name: "Unified API", description: "GraphQL API with auth and real-time subscriptions", dueDate: d("2024-07-01"), status: "completed", completedAt: d("2024-06-25") },
      { id: oid(), name: "Hospital web", description: "Admin and clinical staff dashboards", dueDate: d("2024-09-01"), status: "completed", completedAt: d("2024-08-28") },
      { id: oid(), name: "Patient apps", description: "Mobile apps with appointment booking", dueDate: d("2024-11-15"), status: "completed", completedAt: d("2024-11-10") },
      { id: oid(), name: "Telemedicine", description: "Video consultation and remote vitals", dueDate: d("2025-02-01"), status: "completed", completedAt: d("2025-01-25") },
    ],
    createdAt: d("2024-03-01T09:00:00Z"),
    updatedAt: d("2025-02-01T09:00:00Z"),
  },

  {
    id: oid(),
    name: "NEMESIS — Scam Detection & Cyber-Intelligence",
    description:
      "AI-powered scam detection and cyber-intelligence ecosystem for Africa, starting in Ghana. Citizens paste suspicious messages, phone numbers, or URLs for instant risk assessment.",
    clientId: CLIENT_NEMESIS,
    status: "in_development",
    type: "ai_system",
    features: [
      { id: oid(), name: "Risk scanner", description: "Instant risk assessment for messages, URLs, and numbers", priority: "critical" },
      { id: oid(), name: "Threat intelligence", description: "Crowdsourced and ML-enriched threat database", priority: "critical" },
      { id: oid(), name: "Citizen reporting", description: "Community-driven scam reporting and verification", priority: "high" },
      { id: oid(), name: "Law enforcement API", description: "Secure API for police and regulatory bodies", priority: "medium" },
    ],
    userRoles: ["Citizen", "Analyst", "Law Enforcement", "Admin"],
    integrations: ["OpenAI", "MongoDB", "Redis", "Kafka"],
    budgetRange: { min: 150000, max: 250000, currency: "USD" },
    timeline: { startDate: d("2025-08-01"), endDate: d("2026-08-01"), estimatedWeeks: 52 },
    attachments: [],
    assignedTeam: [],
    progress: 30,
    milestones: [
      { id: oid(), name: "ML models", description: "NLP and URL risk classification models", dueDate: d("2025-12-01"), status: "completed", completedAt: d("2025-11-20") },
      { id: oid(), name: "Mobile app", description: "React Native citizen scanner app", dueDate: d("2026-02-01"), status: "in_progress" },
      { id: oid(), name: "Threat database", description: "Real-time threat intel aggregation pipeline", dueDate: d("2026-05-01"), status: "pending" },
      { id: oid(), name: "Gov integration", description: "Police and regulatory dashboards", dueDate: d("2026-08-01"), status: "pending" },
    ],
    createdAt: d("2025-07-01T09:00:00Z"),
    updatedAt: d("2026-03-10T09:00:00Z"),
  },

  {
    id: oid(),
    name: "SHAMASH — National Traffic Enforcement Infrastructure",
    description:
      "Sovereign-scale Rust-based platform for automated traffic enforcement, road infrastructure health monitoring, and national mobility intelligence. Named for the Mesopotamian god of justice.",
    clientId: CLIENT_SHAMASH,
    status: "approved",
    type: "ai_system",
    features: [
      { id: oid(), name: "ANPR system", description: "Automatic number plate recognition across highways", priority: "critical" },
      { id: oid(), name: "Speed enforcement", description: "Radar and camera-based speed violation detection", priority: "critical" },
      { id: oid(), name: "Road health sensors", description: "IoT sensor network for pothole and bridge monitoring", priority: "high" },
      { id: oid(), name: "Mobility intelligence", description: "National traffic flow optimization and planning", priority: "medium" },
    ],
    userRoles: ["Traffic Officer", "Engineer", "Analyst", "System Admin"],
    integrations: ["Rust", "Kafka", "TimescaleDB", "OpenCV"],
    budgetRange: { min: 400000, max: 700000, currency: "USD" },
    timeline: { startDate: d("2026-05-01"), endDate: d("2027-05-01"), estimatedWeeks: 52 },
    attachments: [],
    assignedTeam: [],
    progress: 5,
    milestones: [
      { id: oid(), name: "Architecture design", description: "Distributed systems architecture and hardware specs", dueDate: d("2026-07-01"), status: "in_progress" },
      { id: oid(), name: "ANPR prototype", description: "Camera + ML prototype on test highway", dueDate: d("2026-11-01"), status: "pending" },
      { id: oid(), name: "Sensor network", description: "IoT deployment on major roads", dueDate: d("2027-02-01"), status: "pending" },
      { id: oid(), name: "National rollout", description: "Full deployment across all regions", dueDate: d("2027-05-01"), status: "pending" },
    ],
    createdAt: d("2026-02-01T09:00:00Z"),
    updatedAt: d("2026-03-28T09:00:00Z"),
  },

  {
    id: oid(),
    name: "Civitas — Digital Parliament & Governance",
    description:
      "Digital infrastructure for parliament, governance, and citizen engagement. Enables transparent legislative processes, public consultations, and constituent services.",
    clientId: CLIENT_CIVITAS,
    status: "in_development",
    type: "web_app",
    features: [
      { id: oid(), name: "Legislative tracking", description: "Bill tracking from introduction to assent", priority: "critical" },
      { id: oid(), name: "Public consultations", description: "Citizen feedback and petition management", priority: "high" },
      { id: oid(), name: "Hansard digitization", description: "Searchable parliamentary proceedings archive", priority: "high" },
      { id: oid(), name: "Constituent portal", description: "MP-constituent communication and case management", priority: "medium" },
    ],
    userRoles: ["Citizen", "MP", "Clerk", "Journalist", "Admin"],
    integrations: ["MongoDB", "Elasticsearch", "Redis"],
    budgetRange: { min: 200000, max: 350000, currency: "USD" },
    timeline: { startDate: d("2025-09-01"), endDate: d("2026-09-01"), estimatedWeeks: 52 },
    attachments: [],
    assignedTeam: [],
    progress: 40,
    milestones: [
      { id: oid(), name: "Core platform", description: "Authentication and content management", dueDate: d("2025-12-01"), status: "completed", completedAt: d("2025-11-20") },
      { id: oid(), name: "Bill tracker", description: "Legislative workflow and status tracking", dueDate: d("2026-03-01"), status: "in_progress" },
      { id: oid(), name: "Public portal", description: "Citizen engagement and petitions", dueDate: d("2026-06-01"), status: "pending" },
      { id: oid(), name: "Hansard launch", description: "Full parliamentary archive digitization", dueDate: d("2026-09-01"), status: "pending" },
    ],
    createdAt: d("2025-08-01T09:00:00Z"),
    updatedAt: d("2026-03-20T09:00:00Z"),
  },

  {
    id: oid(),
    name: "Kraken — Business Compliance OS",
    description:
      "Business compliance operating system for Ghana. Handles business registration, tax filing, regulatory compliance tracking, and statutory reminders for SMEs and enterprises.",
    clientId: CLIENT_KRAKEN,
    status: "qa",
    type: "web_app",
    features: [
      { id: oid(), name: "Compliance calendar", description: "Automated statutory deadline tracking and reminders", priority: "critical" },
      { id: oid(), name: "Document vault", description: "Secure storage for certificates, licenses, and filings", priority: "high" },
      { id: oid(), name: "Regulatory API", description: "Direct integration with GRA, RGD, and other agencies", priority: "high" },
      { id: oid(), name: "Audit trail", description: "Immutable compliance history and reporting", priority: "medium" },
    ],
    userRoles: ["Business Owner", "Accountant", "Compliance Officer", "Admin"],
    integrations: ["GRA API", "RGD API", "MongoDB", "Redis"],
    budgetRange: { min: 100000, max: 180000, currency: "USD" },
    timeline: { startDate: d("2025-05-01"), endDate: d("2026-03-01"), estimatedWeeks: 44 },
    attachments: [],
    assignedTeam: [],
    progress: 90,
    milestones: [
      { id: oid(), name: "Compliance engine", description: "Rule engine for statutory requirements", dueDate: d("2025-08-01"), status: "completed", completedAt: d("2025-07-25") },
      { id: oid(), name: "Document vault", description: "Secure document storage and version control", dueDate: d("2025-11-01"), status: "completed", completedAt: d("2025-10-20") },
      { id: oid(), name: "Agency integrations", description: "GRA and RGD API connections", dueDate: d("2026-01-01"), status: "completed", completedAt: d("2025-12-15") },
      { id: oid(), name: "Production launch", description: "Public launch with SME onboarding", dueDate: d("2026-03-01"), status: "in_progress" },
    ],
    createdAt: d("2025-04-01T09:00:00Z"),
    updatedAt: d("2026-03-25T09:00:00Z"),
  },

  {
    id: oid(),
    name: "ClubOS Africa — Fan Engagement Platform",
    description:
      "Engagement platform for African sports and entertainment clubs. Connects clubs with super-fans through memberships, exclusive content, merchandise, and event access.",
    clientId: CLIENT_CLUBOS,
    status: "in_development",
    type: "mobile_app",
    features: [
      { id: oid(), name: "Membership tiers", description: "Subscription-based fan membership with perks", priority: "critical" },
      { id: oid(), name: "Exclusive content", description: "Behind-the-scenes videos and player interviews", priority: "high" },
      { id: oid(), name: "Merch store", description: "Integrated merchandise and ticket sales", priority: "high" },
      { id: oid(), name: "Fan mobile app", description: "iOS and Android app for fan engagement", priority: "medium" },
    ],
    userRoles: ["Fan", "Club Admin", "Content Manager", "Merchant"],
    integrations: ["Paystack", "MongoDB", "Redis", "Cloudinary"],
    budgetRange: { min: 80000, max: 140000, currency: "USD" },
    timeline: { startDate: d("2025-06-01"), endDate: d("2026-04-01"), estimatedWeeks: 44 },
    attachments: [],
    assignedTeam: [],
    progress: 50,
    milestones: [
      { id: oid(), name: "Membership system", description: "Tier management and payment processing", dueDate: d("2025-09-01"), status: "completed", completedAt: d("2025-08-28") },
      { id: oid(), name: "Content platform", description: "Video streaming and article publishing", dueDate: d("2025-12-01"), status: "completed", completedAt: d("2025-11-20") },
      { id: oid(), name: "Mobile apps", description: "Super-fan iOS and Android release", dueDate: d("2026-02-01"), status: "in_progress" },
      { id: oid(), name: "Club launch", description: "Pilot with premier football clubs", dueDate: d("2026-04-01"), status: "pending" },
    ],
    createdAt: d("2025-05-01T09:00:00Z"),
    updatedAt: d("2026-03-15T09:00:00Z"),
  },

  {
    id: oid(),
    name: "LeKMA — Municipal Assembly Platform",
    description:
      "Rebuild of lekma.gov.gh for the Ledzokuku Municipal Assembly. Modern citizen services, revenue collection, permit applications, and public works reporting.",
    clientId: CLIENT_LEKMA,
    status: "delivered",
    type: "web_app",
    features: [
      { id: oid(), name: "Revenue collection", description: "Digital property rate and business permit payments", priority: "critical" },
      { id: oid(), name: "Permit applications", description: "Online building and business permit applications", priority: "critical" },
      { id: oid(), name: "Public works reporting", description: "Citizen reporting of potholes, sanitation, and streetlights", priority: "high" },
      { id: oid(), name: "Transparency portal", description: "Budget and procurement public disclosure", priority: "medium" },
    ],
    userRoles: ["Resident", "Business Owner", "Assembly Staff", "Admin"],
    integrations: ["Paystack", "MongoDB", "Mapbox"],
    budgetRange: { min: 60000, max: 100000, currency: "USD" },
    timeline: { startDate: d("2024-10-01"), endDate: d("2025-06-01"), estimatedWeeks: 34 },
    attachments: [],
    assignedTeam: [],
    progress: 100,
    milestones: [
      { id: oid(), name: "Revenue module", description: "Property rate and permit payment system", dueDate: d("2024-12-15"), status: "completed", completedAt: d("2024-12-10") },
      { id: oid(), name: "Permits workflow", description: "End-to-end permit application and approval", dueDate: d("2025-02-15"), status: "completed", completedAt: d("2025-02-10") },
      { id: oid(), name: "Public works", description: "Citizen reporting and work order management", dueDate: d("2025-04-15"), status: "completed", completedAt: d("2025-04-10") },
      { id: oid(), name: "Launch", description: "Official municipal adoption", dueDate: d("2025-06-01"), status: "completed", completedAt: d("2025-05-25") },
    ],
    createdAt: d("2024-09-01T09:00:00Z"),
    updatedAt: d("2025-06-01T09:00:00Z"),
  },

  {
    id: oid(),
    name: "Ubuntu Fund — Investment Platform",
    description:
      "Community-driven investment and fund management platform. Enables pooled investments, micro-loans, and financial literacy tracking for cooperative societies.",
    clientId: CLIENT_UBUNTU,
    status: "in_development",
    type: "web_app",
    features: [
      { id: oid(), name: "Pooled investments", description: "Group savings and investment tracking", priority: "critical" },
      { id: oid(), name: "Micro-loans", description: "Peer-to-peer lending with credit scoring", priority: "critical" },
      { id: oid(), name: "Financial literacy", description: "Interactive learning modules and quizzes", priority: "high" },
      { id: oid(), name: "Mobile wallet", description: "In-app wallet with mobile money integration", priority: "medium" },
    ],
    userRoles: ["Member", "Trustee", "Loan Officer", "Admin"],
    integrations: ["Paystack", "MongoDB", "Redis"],
    budgetRange: { min: 70000, max: 120000, currency: "USD" },
    timeline: { startDate: d("2025-08-01"), endDate: d("2026-06-01"), estimatedWeeks: 44 },
    attachments: [],
    assignedTeam: [],
    progress: 40,
    milestones: [
      { id: oid(), name: "Wallet system", description: "Core wallet and transaction engine", dueDate: d("2025-11-01"), status: "completed", completedAt: d("2025-10-25") },
      { id: oid(), name: "Investment pools", description: "Group savings and ROI tracking", dueDate: d("2026-01-01"), status: "in_progress" },
      { id: oid(), name: "Micro-loans", description: "Lending workflow and repayment tracking", dueDate: d("2026-04-01"), status: "pending" },
      { id: oid(), name: "Co-op launch", description: "Pilot with registered cooperatives", dueDate: d("2026-06-01"), status: "pending" },
    ],
    createdAt: d("2025-07-01T09:00:00Z"),
    updatedAt: d("2026-03-20T09:00:00Z"),
  },

  {
    id: oid(),
    name: "UPOSA — Alumni Association Platform",
    description:
      "University Practice Old Students Association monorepo. Alumni networking, event management, fundraising, and mentorship matching for secondary school alumni.",
    clientId: CLIENT_UPOSA,
    status: "delivered",
    type: "web_app",
    features: [
      { id: oid(), name: "Alumni directory", description: "Searchable alumni database with networking", priority: "critical" },
      { id: oid(), name: "Event management", description: "Reunions, fundraisers, and meetup organization", priority: "critical" },
      { id: oid(), name: "Giving portal", description: "Donation collection for school development projects", priority: "high" },
      { id: oid(), name: "Mentorship", description: "Alumni-student mentorship matching", priority: "medium" },
    ],
    userRoles: ["Alumnus", "Student", "Chapter President", "National Exec", "Admin"],
    integrations: ["Paystack", "MongoDB", "Redis"],
    budgetRange: { min: 40000, max: 70000, currency: "USD" },
    timeline: { startDate: d("2024-06-01"), endDate: d("2024-12-01"), estimatedWeeks: 26 },
    attachments: [],
    assignedTeam: [],
    progress: 100,
    milestones: [
      { id: oid(), name: "Directory", description: "Alumni registration and search", dueDate: d("2024-08-01"), status: "completed", completedAt: d("2024-07-25") },
      { id: oid(), name: "Events", description: "Event creation and ticketing", dueDate: d("2024-09-15"), status: "completed", completedAt: d("2024-09-10") },
      { id: oid(), name: "Giving", description: "Donation campaigns and project tracking", dueDate: d("2024-11-01"), status: "completed", completedAt: d("2024-10-25") },
      { id: oid(), name: "Launch", description: "National rollout to all chapters", dueDate: d("2024-12-01"), status: "completed", completedAt: d("2024-11-25") },
    ],
    createdAt: d("2024-05-01T09:00:00Z"),
    updatedAt: d("2024-12-01T09:00:00Z"),
  },

  {
    id: oid(),
    name: "Leviathan — Go Engineering Mastery Platform",
    description:
      "Full-stack learning platform with comprehensive Go backend engineering curriculum, hands-on coding exercises, sandboxed code execution, progress tracking, and gamification.",
    clientId: CLIENT_LEVIATHAN,
    status: "qa",
    type: "web_app",
    features: [
      { id: oid(), name: "Curriculum engine", description: "Structured Go learning paths from beginner to advanced", priority: "critical" },
      { id: oid(), name: "Sandbox execution", description: "Browser-based Go code execution environment", priority: "critical" },
      { id: oid(), name: "Progress tracking", description: "Spaced repetition and skill tree visualization", priority: "high" },
      { id: oid(), name: "Gamification", description: "Badges, leaderboards, and achievement system", priority: "medium" },
    ],
    userRoles: ["Learner", "Mentor", "Admin"],
    integrations: ["Go Playground API", "MongoDB", "Redis", "Docker"],
    budgetRange: { min: 90000, max: 150000, currency: "USD" },
    timeline: { startDate: d("2025-04-01"), endDate: d("2026-02-01"), estimatedWeeks: 44 },
    attachments: [],
    assignedTeam: [],
    progress: 88,
    milestones: [
      { id: oid(), name: "Content engine", description: "Lesson creation and markdown rendering", dueDate: d("2025-07-01"), status: "completed", completedAt: d("2025-06-25") },
      { id: oid(), name: "Sandbox", description: "Secure Go code execution in containers", dueDate: d("2025-10-01"), status: "completed", completedAt: d("2025-09-20") },
      { id: oid(), name: "Gamification", description: "Achievement and leaderboard system", dueDate: d("2025-12-01"), status: "completed", completedAt: d("2025-11-15") },
      { id: oid(), name: "Public launch", description: "Open registration and first cohort", dueDate: d("2026-02-01"), status: "in_progress" },
    ],
    createdAt: d("2025-03-01T09:00:00Z"),
    updatedAt: d("2026-03-25T09:00:00Z"),
  },

  {
    id: oid(),
    name: "Unlock Broker — IMEI Unlock Marketplace",
    description:
      "IMEI unlock marketplace and workflow platform. Customers and resellers submit IMEIs; the platform routes orders to upstream wholesalers, collects payment, tracks status, and pays providers from margin.",
    clientId: CLIENT_LIBRERATUM,
    status: "approved",
    type: "web_app",
    features: [
      { id: oid(), name: "Order routing", description: "Automated IMEI order routing to wholesalers", priority: "critical" },
      { id: oid(), name: "Payment collection", description: "Customer payment and margin calculation", priority: "critical" },
      { id: oid(), name: "Status tracking", description: "Real-time unlock status with auto-reroute on failure", priority: "high" },
      { id: oid(), name: "Reseller portal", description: "White-label reseller dashboard and API", priority: "medium" },
    ],
    userRoles: ["Customer", "Reseller", "Wholesaler", "Admin"],
    integrations: ["Dhru-Fusion", "Paystack", "PostgreSQL", "Redis"],
    budgetRange: { min: 60000, max: 100000, currency: "USD" },
    timeline: { startDate: d("2026-04-01"), endDate: d("2026-10-01"), estimatedWeeks: 26 },
    attachments: [],
    assignedTeam: [],
    progress: 15,
    milestones: [
      { id: oid(), name: "Routing engine", description: "Order matching and wholesaler selection", dueDate: d("2026-05-15"), status: "in_progress" },
      { id: oid(), name: "Payment flow", description: "Checkout and margin distribution", dueDate: d("2026-07-01"), status: "pending" },
      { id: oid(), name: "Reseller API", description: "White-label and API access", dueDate: d("2026-09-01"), status: "pending" },
      { id: oid(), name: "Launch", description: "Public marketplace opening", dueDate: d("2026-10-01"), status: "pending" },
    ],
    createdAt: d("2026-02-15T09:00:00Z"),
    updatedAt: d("2026-03-28T09:00:00Z"),
  },

  {
    id: oid(),
    name: "Yenara — Cultural Heritage Platform",
    description:
      "Digital preservation and exploration platform for African civilizations, cultural codes, and historical narratives. Features interactive timelines, 3D artifacts, and educational storytelling.",
    clientId: CLIENT_YENARA,
    status: "in_development",
    type: "web_app",
    features: [
      { id: oid(), name: "Civilization explorer", description: "Interactive maps and timelines of African empires", priority: "critical" },
      { id: oid(), name: "Artifact gallery", description: "3D-scanned artifacts with contextual storytelling", priority: "high" },
      { id: oid(), name: "Code system", description: "Cultural code taxonomy and relationship mapping", priority: "high" },
      { id: oid(), name: "Pledge engine", description: "Community pledges for heritage preservation", priority: "medium" },
    ],
    userRoles: ["Visitor", "Researcher", "Contributor", "Curator", "Admin"],
    integrations: ["Three.js", "MongoDB", "Cloudinary", "Mapbox"],
    budgetRange: { min: 50000, max: 90000, currency: "USD" },
    timeline: { startDate: d("2025-10-01"), endDate: d("2026-08-01"), estimatedWeeks: 44 },
    attachments: [],
    assignedTeam: [],
    progress: 50,
    milestones: [
      { id: oid(), name: "Explorer MVP", description: "Civilization timeline and map interface", dueDate: d("2026-01-01"), status: "completed", completedAt: d("2025-12-20") },
      { id: oid(), name: "Artifact viewer", description: "3D artifact display and annotations", dueDate: d("2026-04-01"), status: "in_progress" },
      { id: oid(), name: "Code taxonomy", description: "Cultural classification system", dueDate: d("2026-06-01"), status: "pending" },
      { id: oid(), name: "Public launch", description: "Museum and school partnerships", dueDate: d("2026-08-01"), status: "pending" },
    ],
    createdAt: d("2025-09-01T09:00:00Z"),
    updatedAt: d("2026-03-20T09:00:00Z"),
  },

  {
    id: oid(),
    name: "Exodus — Capability Verification Platform",
    description:
      "Capability verification and admission platform. Organizations verify candidate skills through structured assessments, portfolios, and peer validation before admission or hiring.",
    clientId: CLIENT_EXODUS,
    status: "qa",
    type: "web_app",
    features: [
      { id: oid(), name: "Skill assessments", description: "Customizable technical and soft-skill evaluations", priority: "critical" },
      { id: oid(), name: "Portfolio validation", description: "Peer review and expert verification of work samples", priority: "critical" },
      { id: oid(), name: "Admission workflow", description: "End-to-end application and decision pipeline", priority: "high" },
      { id: oid(), name: "Partner portal", description: "Institution and employer dashboard", priority: "medium" },
    ],
    userRoles: ["Candidate", "Assessor", "Admissions Officer", "Partner", "Admin"],
    integrations: ["MongoDB", "Redis", "WebRTC", "PDF Generation"],
    budgetRange: { min: 70000, max: 120000, currency: "USD" },
    timeline: { startDate: d("2025-05-01"), endDate: d("2026-01-01"), estimatedWeeks: 34 },
    attachments: [],
    assignedTeam: [],
    progress: 92,
    milestones: [
      { id: oid(), name: "Assessment engine", description: "Quiz and coding challenge infrastructure", dueDate: d("2025-08-01"), status: "completed", completedAt: d("2025-07-25") },
      { id: oid(), name: "Portfolio review", description: "Peer review and expert matching system", dueDate: d("2025-10-01"), status: "completed", completedAt: d("2025-09-20") },
      { id: oid(), name: "Partner API", description: "Institution integration and webhooks", dueDate: d("2025-12-01"), status: "completed", completedAt: d("2025-11-15") },
      { id: oid(), name: "Production launch", description: "First cohort admission cycle", dueDate: d("2026-01-01"), status: "in_progress" },
    ],
    createdAt: d("2025-04-01T09:00:00Z"),
    updatedAt: d("2026-03-25T09:00:00Z"),
  },

  {
    id: oid(),
    name: "Ruderalis — Cannabis B2B Marketplace",
    description:
      "B2B platform connecting licensed cannabis cultivators with pharmaceutical buyers worldwide. Compliance-first design with full seed-to-sale tracking and regulatory reporting.",
    clientId: CLIENT_RUDERALIS,
    status: "in_development",
    type: "web_app",
    features: [
      { id: oid(), name: "Seed-to-sale tracking", description: "Full cultivation batch tracking and chain of custody", priority: "critical" },
      { id: oid(), name: "Compliance engine", description: "Automated regulatory reporting per jurisdiction", priority: "critical" },
      { id: oid(), name: "Buyer marketplace", description: "Pharmaceutical buyer procurement portal", priority: "high" },
      { id: oid(), name: "Lab integration", description: "Third-party lab result ingestion and display", priority: "medium" },
    ],
    userRoles: ["Cultivator", "Buyer", "Lab Technician", "Regulator", "Admin"],
    integrations: ["MongoDB", "Redis", "Blockchain", "DocuSign"],
    budgetRange: { min: 150000, max: 250000, currency: "USD" },
    timeline: { startDate: d("2025-09-01"), endDate: d("2026-09-01"), estimatedWeeks: 52 },
    attachments: [],
    assignedTeam: [],
    progress: 40,
    milestones: [
      { id: oid(), name: "Tracking MVP", description: "Batch creation and QR tracking system", dueDate: d("2025-12-01"), status: "completed", completedAt: d("2025-11-20") },
      { id: oid(), name: "Compliance module", description: "Regulatory report generation", dueDate: d("2026-03-01"), status: "in_progress" },
      { id: oid(), name: "Buyer portal", description: "Procurement and order management", dueDate: d("2026-06-01"), status: "pending" },
      { id: oid(), name: "Global launch", description: "Multi-jurisdiction compliance rollout", dueDate: d("2026-09-01"), status: "pending" },
    ],
    createdAt: d("2025-08-01T09:00:00Z"),
    updatedAt: d("2026-03-15T09:00:00Z"),
  },

  {
    id: oid(),
    name: "Tribute — Memorial & Legacy Platform",
    description:
      "Digital memorial platform for creating, sharing, and preserving tributes to loved ones. Interactive timelines, photo galleries, condolence books, and legacy fundraising.",
    clientId: CLIENT_TRIBUTE,
    status: "delivered",
    type: "web_app",
    features: [
      { id: oid(), name: "Memorial pages", description: "Customizable tribute pages with timelines and media", priority: "critical" },
      { id: oid(), name: "Condolence book", description: "Guest book with moderated messages and memories", priority: "high" },
      { id: oid(), name: "Legacy fundraising", description: "Crowdfunding for causes important to the deceased", priority: "high" },
      { id: oid(), name: "Mobile app", description: "iOS and Android app for sharing and visiting memorials", priority: "medium" },
    ],
    userRoles: ["Family Member", "Friend", "Visitor", "Admin"],
    integrations: ["Paystack", "MongoDB", "Cloudinary", "Redis"],
    budgetRange: { min: 35000, max: 60000, currency: "USD" },
    timeline: { startDate: d("2024-07-01"), endDate: d("2025-01-01"), estimatedWeeks: 26 },
    attachments: [],
    assignedTeam: [],
    progress: 100,
    milestones: [
      { id: oid(), name: "Memorial builder", description: "Page creation and customization tools", dueDate: d("2024-09-01"), status: "completed", completedAt: d("2024-08-25") },
      { id: oid(), name: "Social features", description: "Sharing, condolences, and notifications", dueDate: d("2024-10-15"), status: "completed", completedAt: d("2024-10-10") },
      { id: oid(), name: "Fundraising", description: "Donation collection and disbursement", dueDate: d("2024-11-15"), status: "completed", completedAt: d("2024-11-10") },
      { id: oid(), name: "Launch", description: "Public platform launch", dueDate: d("2025-01-01"), status: "completed", completedAt: d("2024-12-20") },
    ],
    createdAt: d("2024-06-01T09:00:00Z"),
    updatedAt: d("2025-01-01T09:00:00Z"),
  },

  {
    id: oid(),
    name: "Intellica / Cognera — Decentralized Employment",
    description:
      "Decentralized problem-solving employment platform. Matches organizations with verified solvers for micro-tasks, bounties, and project-based work with escrow and reputation.",
    clientId: CLIENT_INTELlica,
    status: "in_development",
    type: "web_app",
    features: [
      { id: oid(), name: "Bounty marketplace", description: "Task posting with skill-based matching", priority: "critical" },
      { id: oid(), name: "Escrow system", description: "Milestone-based payment release with dispute resolution", priority: "critical" },
      { id: oid(), name: "Reputation engine", description: "Decentralized reputation and skill verification", priority: "high" },
      { id: oid(), name: "Solver mobile app", description: "Mobile app for task discovery and submission", priority: "medium" },
    ],
    userRoles: ["Poster", "Solver", "Arbitrator", "Admin"],
    integrations: ["MongoDB", "Redis", "Stripe", "Smart Contracts"],
    budgetRange: { min: 120000, max: 200000, currency: "USD" },
    timeline: { startDate: d("2025-07-01"), endDate: d("2026-07-01"), estimatedWeeks: 52 },
    attachments: [],
    assignedTeam: [],
    progress: 45,
    milestones: [
      { id: oid(), name: "Marketplace MVP", description: "Task posting and application flow", dueDate: d("2025-10-01"), status: "completed", completedAt: d("2025-09-25") },
      { id: oid(), name: "Escrow", description: "Payment holding and milestone release", dueDate: d("2026-01-01"), status: "in_progress" },
      { id: oid(), name: "Reputation", description: "On-chain reputation and skill badges", dueDate: d("2026-04-01"), status: "pending" },
      { id: oid(), name: "Public launch", description: "Open marketplace with first 1000 users", dueDate: d("2026-07-01"), status: "pending" },
    ],
    createdAt: d("2025-06-01T09:00:00Z"),
    updatedAt: d("2026-03-20T09:00:00Z"),
  },

  {
    id: oid(),
    name: "Altar OS — Church Management Platform",
    description:
      "Comprehensive church management platform with admin dashboard, member portal, API, marketing site, and mobile app. Handles attendance, giving, events, and communications.",
    clientId: CLIENT_ALTAR,
    status: "qa",
    type: "web_app",
    features: [
      { id: oid(), name: "Member management", description: "Directory, groups, and attendance tracking", priority: "critical" },
      { id: oid(), name: "Digital giving", description: "Tithes, offerings, and pledge management", priority: "critical" },
      { id: oid(), name: "Event management", description: "Service planning, registration, and check-in", priority: "high" },
      { id: oid(), name: "Mobile app", description: "Congregation app for sermons, giving, and groups", priority: "medium" },
    ],
    userRoles: ["Member", "Leader", "Pastor", "Admin"],
    integrations: ["Paystack", "MongoDB", "Redis", "Cloudinary"],
    budgetRange: { min: 50000, max: 90000, currency: "USD" },
    timeline: { startDate: d("2025-04-01"), endDate: d("2026-02-01"), estimatedWeeks: 44 },
    attachments: [],
    assignedTeam: [],
    progress: 88,
    milestones: [
      { id: oid(), name: "Core platform", description: "Member directory and group management", dueDate: d("2025-07-01"), status: "completed", completedAt: d("2025-06-25") },
      { id: oid(), name: "Giving module", description: "Online giving and pledge tracking", dueDate: d("2025-09-15"), status: "completed", completedAt: d("2025-09-10") },
      { id: oid(), name: "Mobile app", description: "iOS and Android congregation app", dueDate: d("2025-12-01"), status: "completed", completedAt: d("2025-11-20") },
      { id: oid(), name: "Launch", description: "Denomination-wide rollout", dueDate: d("2026-02-01"), status: "in_progress" },
    ],
    createdAt: d("2025-03-01T09:00:00Z"),
    updatedAt: d("2026-03-25T09:00:00Z"),
  },

  {
    id: oid(),
    name: "Encore — Business Services Marketplace",
    description:
      "Marketplace connecting businesses with service providers. Features business profiles, service listings, reviews, bookings, and payment processing across multiple verticals.",
    clientId: CLIENT_ENCORE,
    status: "in_development",
    type: "web_app",
    features: [
      { id: oid(), name: "Business profiles", description: "Verified business listings with portfolios", priority: "critical" },
      { id: oid(), name: "Booking system", description: "Appointment and service booking with calendar sync", priority: "critical" },
      { id: oid(), name: "Review engine", description: "Verified customer reviews and ratings", priority: "high" },
      { id: oid(), name: "Mobile apps", description: "Business and consumer mobile apps", priority: "medium" },
    ],
    userRoles: ["Consumer", "Business Owner", "Service Provider", "Admin"],
    integrations: ["Paystack", "MongoDB", "Redis", "Google Calendar"],
    budgetRange: { min: 80000, max: 140000, currency: "USD" },
    timeline: { startDate: d("2025-08-01"), endDate: d("2026-06-01"), estimatedWeeks: 44 },
    attachments: [],
    assignedTeam: [],
    progress: 35,
    milestones: [
      { id: oid(), name: "Directory", description: "Business registration and search", dueDate: d("2025-11-01"), status: "completed", completedAt: d("2025-10-25") },
      { id: oid(), name: "Booking", description: "Appointment scheduling and reminders", dueDate: d("2026-01-01"), status: "in_progress" },
      { id: oid(), name: "Payments", description: "In-platform payment and escrow", dueDate: d("2026-04-01"), status: "pending" },
      { id: oid(), name: "Launch", description: "City-wide rollout", dueDate: d("2026-06-01"), status: "pending" },
    ],
    createdAt: d("2025-07-01T09:00:00Z"),
    updatedAt: d("2026-03-15T09:00:00Z"),
  },

  {
    id: oid(),
    name: "iChoose — Decision Support Platform",
    description:
      "Decision support platform helping users make informed choices through structured comparison, expert reviews, and community insights across products, services, and life decisions.",
    clientId: CLIENT_ICHOOSE,
    status: "approved",
    type: "web_app",
    features: [
      { id: oid(), name: "Comparison engine", description: "Side-by-side structured comparison with scoring", priority: "critical" },
      { id: oid(), name: "Expert reviews", description: "Curated expert analysis and recommendations", priority: "high" },
      { id: oid(), name: "Community insights", description: "Crowdsourced reviews and decision journals", priority: "high" },
      { id: oid(), name: "Decision tracker", description: "Post-decision outcome tracking and learning", priority: "medium" },
    ],
    userRoles: ["Decision Maker", "Expert", "Moderator", "Admin"],
    integrations: ["MongoDB", "Elasticsearch", "Redis"],
    budgetRange: { min: 45000, max: 75000, currency: "USD" },
    timeline: { startDate: d("2026-04-01"), endDate: d("2026-10-01"), estimatedWeeks: 26 },
    attachments: [],
    assignedTeam: [],
    progress: 10,
    milestones: [
      { id: oid(), name: "Comparison MVP", description: "Core comparison and scoring engine", dueDate: d("2026-05-15"), status: "in_progress" },
      { id: oid(), name: "Expert network", description: "Expert onboarding and review workflow", dueDate: d("2026-07-01"), status: "pending" },
      { id: oid(), name: "Community", description: "User reviews and discussion features", dueDate: d("2026-08-15"), status: "pending" },
      { id: oid(), name: "Launch", description: "Public beta release", dueDate: d("2026-10-01"), status: "pending" },
    ],
    createdAt: d("2026-02-01T09:00:00Z"),
    updatedAt: d("2026-03-28T09:00:00Z"),
  },

  {
    id: oid(),
    name: "People Who Inspire — Profile Platform",
    description:
      "Platform celebrating inspirational figures across Africa. Curated profiles, stories, interviews, and legacy preservation for leaders, innovators, and changemakers.",
    clientId: CLIENT_PEOPLE,
    status: "delivered",
    type: "web_app",
    features: [
      { id: oid(), name: "Profile pages", description: "Rich media profiles with timelines and achievements", priority: "critical" },
      { id: oid(), name: "Story engine", description: "Long-form storytelling with video and audio", priority: "high" },
      { id: oid(), name: "Interview series", description: "Structured interview publishing workflow", priority: "medium" },
      { id: oid(), name: "Community", description: "User nominations and memory sharing", priority: "medium" },
    ],
    userRoles: ["Reader", "Contributor", "Editor", "Admin"],
    integrations: ["MongoDB", "Cloudinary", "Redis"],
    budgetRange: { min: 25000, max: 45000, currency: "USD" },
    timeline: { startDate: d("2024-08-01"), endDate: d("2025-02-01"), estimatedWeeks: 26 },
    attachments: [],
    assignedTeam: [],
    progress: 100,
    milestones: [
      { id: oid(), name: "CMS", description: "Content management and publishing workflow", dueDate: d("2024-10-01"), status: "completed", completedAt: d("2024-09-25") },
      { id: oid(), name: "Profiles", description: "Interactive profile templates and search", dueDate: d("2024-11-15"), status: "completed", completedAt: d("2024-11-10") },
      { id: oid(), name: "Community", description: "User submissions and moderation", dueDate: d("2025-01-15"), status: "completed", completedAt: d("2025-01-10") },
      { id: oid(), name: "Launch", description: "Public launch with first 50 profiles", dueDate: d("2025-02-01"), status: "completed", completedAt: d("2025-01-25") },
    ],
    createdAt: d("2024-07-01T09:00:00Z"),
    updatedAt: d("2025-02-01T09:00:00Z"),
  },

  {
    id: oid(),
    name: "Habib Andani — Profile Site",
    description:
      "Single-page profile site for Habib Andani — a connector, coordinator and project manager. Content-driven with every visible piece editable via a central data file.",
    clientId: CLIENT_HABIB,
    status: "delivered",
    type: "web_app",
    features: [
      { id: oid(), name: "Content-driven design", description: "All copy editable from central data file", priority: "critical" },
      { id: oid(), name: "Portfolio section", description: "Project showcase with case studies", priority: "medium" },
      { id: oid(), name: "Contact integration", description: "Direct email and social links", priority: "low" },
    ],
    userRoles: ["Visitor"],
    integrations: ["Next.js", "Vercel"],
    budgetRange: { min: 3000, max: 6000, currency: "USD" },
    timeline: { startDate: d("2024-09-01"), endDate: d("2024-10-01"), estimatedWeeks: 4 },
    attachments: [],
    assignedTeam: [],
    progress: 100,
    milestones: [
      { id: oid(), name: "Design", description: "Single-page layout and animations", dueDate: d("2024-09-15"), status: "completed", completedAt: d("2024-09-10") },
      { id: oid(), name: "Launch", description: "Vercel deployment", dueDate: d("2024-10-01"), status: "completed", completedAt: d("2024-09-28") },
    ],
    createdAt: d("2024-08-15T09:00:00Z"),
    updatedAt: d("2024-10-01T09:00:00Z"),
  },

  {
    id: oid(),
    name: "Ibrahim Mahama — Portfolio Monorepo",
    description:
      "Portfolio sites, admin dashboards, and backends for three Ghanaian public figures. Unified design system with separate branded experiences per personality.",
    clientId: CLIENT_IBRAHIM,
    status: "delivered",
    type: "web_app",
    features: [
      { id: oid(), name: "Multi-site engine", description: "Shared backend powering three distinct brands", priority: "critical" },
      { id: oid(), name: "Admin dashboard", description: "Unified content management for all three sites", priority: "high" },
      { id: oid(), name: "Media gallery", description: "High-performance image and video galleries", priority: "medium" },
      { id: oid(), name: "Event calendar", description: "Public appearances and event listings", priority: "medium" },
    ],
    userRoles: ["Visitor", "Content Manager", "Admin"],
    integrations: ["MongoDB", "Cloudinary", "Redis"],
    budgetRange: { min: 35000, max: 60000, currency: "USD" },
    timeline: { startDate: d("2024-05-01"), endDate: d("2024-11-01"), estimatedWeeks: 26 },
    attachments: [],
    assignedTeam: [],
    progress: 100,
    milestones: [
      { id: oid(), name: "Backend", description: "Shared API with multi-tenant support", dueDate: d("2024-07-01"), status: "completed", completedAt: d("2024-06-25") },
      { id: oid(), name: "Site 1", description: "First public figure site launch", dueDate: d("2024-08-15"), status: "completed", completedAt: d("2024-08-10") },
      { id: oid(), name: "Sites 2 & 3", description: "Remaining portfolio sites", dueDate: d("2024-10-01"), status: "completed", completedAt: d("2024-09-25") },
      { id: oid(), name: "Admin", description: "Unified dashboard delivery", dueDate: d("2024-11-01"), status: "completed", completedAt: d("2024-10-28") },
    ],
    createdAt: d("2024-04-01T09:00:00Z"),
    updatedAt: d("2024-11-01T09:00:00Z"),
  },

  {
    id: oid(),
    name: "Lingua Latina — Digital Latin Curriculum",
    description:
      "Six-volume Latin curriculum from A1 to C2 with a companion digital platform. Interactive exercises, pronunciation guides, progress tracking, and teacher dashboards.",
    clientId: CLIENT_LINGUA,
    status: "in_development",
    type: "web_app",
    features: [
      { id: oid(), name: "Curriculum platform", description: "Digital companion to six-volume book series", priority: "critical" },
      { id: oid(), name: "Interactive exercises", description: "Grammar, vocabulary, and translation drills", priority: "critical" },
      { id: oid(), name: "Audio engine", description: "Latin pronunciation guides and listening exercises", priority: "high" },
      { id: oid(), name: "Teacher dashboard", description: "Class management and progress tracking", priority: "medium" },
    ],
    userRoles: ["Student", "Teacher", "Parent", "Admin"],
    integrations: ["MongoDB", "Redis", "Audio APIs"],
    budgetRange: { min: 60000, max: 100000, currency: "USD" },
    timeline: { startDate: d("2025-09-01"), endDate: d("2026-09-01"), estimatedWeeks: 52 },
    attachments: [],
    assignedTeam: [],
    progress: 30,
    milestones: [
      { id: oid(), name: "Volume 1", description: "A1 digital content and exercises", dueDate: d("2025-12-01"), status: "completed", completedAt: d("2025-11-20") },
      { id: oid(), name: "Volume 2", description: "A2 content with audio integration", dueDate: d("2026-03-01"), status: "in_progress" },
      { id: oid(), name: "Teacher tools", description: "Class management and analytics", dueDate: d("2026-06-01"), status: "pending" },
      { id: oid(), name: "Full launch", description: "All six volumes and platform public release", dueDate: d("2026-09-01"), status: "pending" },
    ],
    createdAt: d("2025-08-01T09:00:00Z"),
    updatedAt: d("2026-03-20T09:00:00Z"),
  },

  {
    id: oid(),
    name: "BriansFOMO — Admin Dashboard",
    description:
      "Feature-rich admin dashboard for BriansFOMO operations. Covers analytics, user management, content moderation, financial reporting, and system configuration.",
    clientId: CLIENT_BRIANSFOMO,
    status: "delivered",
    type: "web_app",
    features: [
      { id: oid(), name: "Analytics suite", description: "Real-time metrics and cohort analysis", priority: "critical" },
      { id: oid(), name: "User management", description: "RBAC, bans, and verification workflows", priority: "high" },
      { id: oid(), name: "Content moderation", description: "AI-assisted content review and appeals", priority: "high" },
      { id: oid(), name: "Financial reporting", description: "Revenue, payouts, and audit logs", priority: "medium" },
    ],
    userRoles: ["Analyst", "Moderator", "Finance", "Super Admin"],
    integrations: ["MongoDB", "Redis", "Stripe"],
    budgetRange: { min: 30000, max: 50000, currency: "USD" },
    timeline: { startDate: d("2024-10-01"), endDate: d("2025-03-01"), estimatedWeeks: 22 },
    attachments: [],
    assignedTeam: [],
    progress: 100,
    milestones: [
      { id: oid(), name: "Analytics", description: "Dashboard and reporting infrastructure", dueDate: d("2024-11-15"), status: "completed", completedAt: d("2024-11-10") },
      { id: oid(), name: "User tools", description: "Management and moderation workflows", dueDate: d("2025-01-15"), status: "completed", completedAt: d("2025-01-10") },
      { id: oid(), name: "Finance", description: "Revenue and payout management", dueDate: d("2025-02-15"), status: "completed", completedAt: d("2025-02-10") },
      { id: oid(), name: "Launch", description: "Production deployment", dueDate: d("2025-03-01"), status: "completed", completedAt: d("2025-02-25") },
    ],
    createdAt: d("2024-09-01T09:00:00Z"),
    updatedAt: d("2025-03-01T09:00:00Z"),
  },

  {
    id: oid(),
    name: "Circl — Social Events & Dining Platform",
    description:
      "Social events and dining platform with table bookings, real-time chat, digital wallet, subscriptions, and discovery. Monorepo with React web app, React Native mobile app, and Node.js/Express API.",
    clientId: CLIENT_CIRCL,
    status: "in_development",
    type: "mobile_app",
    features: [
      { id: oid(), name: "Table discovery & booking", description: "Browse and reserve tables at venues with real-time availability", priority: "critical" },
      { id: oid(), name: "Real-time chat", description: "Socket.io-powered messaging between guests and hosts", priority: "critical" },
      { id: oid(), name: "Digital wallet", description: "In-app wallet for payments, tipping, and splitting bills", priority: "high" },
      { id: oid(), name: "Subscription tiers", description: "Premium memberships with exclusive venue access and perks", priority: "high" },
      { id: oid(), name: "Event creation", description: "Hosts can create and manage private and public events", priority: "medium" },
    ],
    userRoles: ["Guest", "Host", "Venue Manager", "Admin"],
    integrations: ["MongoDB", "Redis", "Socket.io", "Stripe", "Expo"],
    budgetRange: { min: 80000, max: 150000, currency: "USD" },
    timeline: { startDate: d("2025-02-01"), endDate: d("2025-12-01"), estimatedWeeks: 44 },
    attachments: [],
    assignedTeam: [],
    progress: 55,
    milestones: [
      { id: oid(), name: "Auth & profiles", description: "User registration, verification, and profile management", dueDate: d("2025-04-01"), status: "completed", completedAt: d("2025-03-25") },
      { id: oid(), name: "Table booking MVP", description: "Core discovery and reservation flow", dueDate: d("2025-06-01"), status: "completed", completedAt: d("2025-05-28") },
      { id: oid(), name: "Chat & wallet", description: "Real-time messaging and payment infrastructure", dueDate: d("2025-09-01"), status: "in_progress" },
      { id: oid(), name: "Mobile launch", description: "React Native app store release", dueDate: d("2025-11-01"), status: "pending" },
      { id: oid(), name: "Public launch", description: "Full platform launch with subscriptions", dueDate: d("2025-12-01"), status: "pending" },
    ],
    createdAt: d("2025-01-15T09:00:00Z"),
    updatedAt: d("2026-03-20T09:00:00Z"),
  },

  {
    id: oid(),
    name: "LEBIBU — Agency Landing Page & Lead Engine",
    description:
      "High-performance interactive landing page and lead-generation platform for a modern software engineering agency. Features a real-time mockup engine, conversational chatbot onboarding, 3D parallax universe, and Supabase backend for lead capture.",
    clientId: CLIENT_LEBIBU,
    status: "delivered",
    type: "web_app",
    features: [
      { id: oid(), name: "Interactive prototype generator", description: "Dynamic engine that generates live website mockups from user input", priority: "critical" },
      { id: oid(), name: "Conversational lead capture", description: "Custom chatbot UI for onboarding and gathering project requirements", priority: "critical" },
      { id: oid(), name: "3D parallax universe", description: "Hardware-accelerated multi-depth starry background with mouse reactivity", priority: "high" },
      { id: oid(), name: "Portfolio carousel", description: "Scroll-snapping project showcase with responsive touch support", priority: "medium" },
      { id: oid(), name: "SEO & accessibility", description: "Semantic HTML, aria labels, JSON-LD schema markup", priority: "medium" },
    ],
    userRoles: ["Visitor", "Prospect", "Admin"],
    integrations: ["Supabase", "PostgreSQL"],
    budgetRange: { min: 15000, max: 25000, currency: "USD" },
    timeline: { startDate: d("2024-08-01"), endDate: d("2024-11-01"), estimatedWeeks: 14 },
    attachments: [],
    assignedTeam: [],
    progress: 100,
    milestones: [
      { id: oid(), name: "Design system", description: "Visual identity and component library", dueDate: d("2024-08-15"), status: "completed", completedAt: d("2024-08-12") },
      { id: oid(), name: "Mockup engine", description: "Interactive prototype generator", dueDate: d("2024-09-15"), status: "completed", completedAt: d("2024-09-10") },
      { id: oid(), name: "Chatbot integration", description: "Conversational onboarding and Supabase lead capture", dueDate: d("2024-10-15"), status: "completed", completedAt: d("2024-10-12") },
      { id: oid(), name: "Launch", description: "Production deployment and SEO optimization", dueDate: d("2024-11-01"), status: "completed", completedAt: d("2024-10-28") },
    ],
    createdAt: d("2024-07-01T09:00:00Z"),
    updatedAt: d("2024-11-01T09:00:00Z"),
  },

  {
    id: oid(),
    name: "MFA — Multi-Factor Authentication System",
    description:
      "Enterprise multi-factor authentication system with React client dashboard, React admin panel, and Node.js API. Supports TOTP, SMS, email OTP, backup codes, and device management.",
    clientId: CLIENT_MFA,
    status: "in_development",
    type: "web_app",
    features: [
      { id: oid(), name: "TOTP generation", description: "Time-based one-time password with QR code enrollment", priority: "critical" },
      { id: oid(), name: "SMS & email OTP", description: "Fallback authentication via SMS and email one-time codes", priority: "critical" },
      { id: oid(), name: "Backup codes", description: "Single-use recovery codes for account recovery", priority: "high" },
      { id: oid(), name: "Device management", description: "Trusted device registration and remote revocation", priority: "high" },
      { id: oid(), name: "Admin dashboard", description: "User management, audit logs, and security policy configuration", priority: "medium" },
    ],
    userRoles: ["End User", "Security Admin", "System Admin"],
    integrations: ["MongoDB", "Redis", "Twilio", "SendGrid", "Cloudinary"],
    budgetRange: { min: 40000, max: 70000, currency: "USD" },
    timeline: { startDate: d("2025-04-01"), endDate: d("2025-10-01"), estimatedWeeks: 26 },
    attachments: [],
    assignedTeam: [],
    progress: 40,
    milestones: [
      { id: oid(), name: "Core auth API", description: "TOTP and OTP generation and verification", dueDate: d("2025-05-15"), status: "completed", completedAt: d("2025-05-10") },
      { id: oid(), name: "Client dashboard", description: "User-facing MFA enrollment and management", dueDate: d("2025-07-01"), status: "completed", completedAt: d("2025-06-28") },
      { id: oid(), name: "Admin panel", description: "Security admin dashboard and audit logs", dueDate: d("2025-08-15"), status: "in_progress" },
      { id: oid(), name: "Device trust", description: "Trusted device registration and revocation", dueDate: d("2025-09-15"), status: "pending" },
      { id: oid(), name: "Production", description: "Enterprise hardening and deployment", dueDate: d("2025-10-01"), status: "pending" },
    ],
    createdAt: d("2025-03-01T09:00:00Z"),
    updatedAt: d("2026-03-20T09:00:00Z"),
  },

  {
    id: oid(),
    name: "Portfolio Dashboard — NeuroDyne Internal Tool",
    description:
      "Internal portfolio management dashboard for NeuroDyne Corp. API backend with admin interface for tracking projects, clients, milestones, and team assignments. Powers the public portfolio site.",
    clientId: CLIENT_PORTFOLIO_DASHBOARD,
    status: "in_development",
    type: "web_app",
    features: [
      { id: oid(), name: "Project tracking", description: "CRUD for projects with status, timeline, and milestone management", priority: "critical" },
      { id: oid(), name: "Client management", description: "Client profiles, contacts, and project history", priority: "high" },
      { id: oid(), name: "Team assignments", description: "Engineer allocation and workload visualization", priority: "high" },
      { id: oid(), name: "Portfolio API", description: "REST API powering the public marketing portfolio site", priority: "critical" },
      { id: oid(), name: "Admin dashboard", description: "MUI-based admin interface with data tables and forms", priority: "medium" },
    ],
    userRoles: ["Project Manager", "Engineer", "Admin"],
    integrations: ["MongoDB", "Cloudinary", "Node.js", "React", "MUI"],
    budgetRange: { min: 25000, max: 40000, currency: "USD" },
    timeline: { startDate: d("2025-01-01"), endDate: d("2025-06-01"), estimatedWeeks: 22 },
    attachments: [],
    assignedTeam: [],
    progress: 70,
    milestones: [
      { id: oid(), name: "API foundation", description: "Core project and client CRUD endpoints", dueDate: d("2025-02-15"), status: "completed", completedAt: d("2025-02-10") },
      { id: oid(), name: "Admin UI v1", description: "Initial dashboard with project tables", dueDate: d("2025-04-01"), status: "completed", completedAt: d("2025-03-28") },
      { id: oid(), name: "Portfolio integration", description: "Public site API and data sync", dueDate: d("2025-05-15"), status: "in_progress" },
      { id: oid(), name: "Internal launch", description: "Team onboarding and production deployment", dueDate: d("2025-06-01"), status: "pending" },
    ],
    createdAt: d("2024-12-01T09:00:00Z"),
    updatedAt: d("2026-03-20T09:00:00Z"),
  },

  {
    id: oid(),
    name: "JDPlus Limited — Parent Company Platform",
    description:
      "Parent company platform for the JDPlus ecosystem. Go backend with Fiber v3, React admin SPA, and React marketing SPA. Handles customers, products, suppliers, AC service requests, susu collections, loans, and analytics.",
    clientId: CLIENT_JDPLUS_LIMITED,
    status: "in_development",
    type: "web_app",
    features: [
      { id: oid(), name: "Customer management", description: "Full CRM with contact history and segmentation", priority: "critical" },
      { id: oid(), name: "Product inventory", description: "AC units, electronics, and spare parts catalog", priority: "critical" },
      { id: oid(), name: "Supplier portal", description: "Vendor management and purchase order workflows", priority: "high" },
      { id: oid(), name: "Service requests", description: "AC installation and maintenance scheduling with QR tracking", priority: "high" },
      { id: oid(), name: "Susu collections", description: "Rotational savings group management with automated reminders", priority: "high" },
      { id: oid(), name: "Loan management", description: "Micro-loan origination, disbursement, and repayment tracking", priority: "medium" },
      { id: oid(), name: "Analytics dashboard", description: "Business intelligence with revenue, churn, and operational KPIs", priority: "medium" },
    ],
    userRoles: ["Customer", "Sales Rep", "Service Technician", "Finance Officer", "Admin"],
    integrations: ["PostgreSQL", "Redis", "Twilio", "Docker", "Go", "React"],
    budgetRange: { min: 120000, max: 200000, currency: "USD" },
    timeline: { startDate: d("2025-03-01"), endDate: d("2026-03-01"), estimatedWeeks: 52 },
    attachments: [],
    assignedTeam: [],
    progress: 45,
    milestones: [
      { id: oid(), name: "Backend foundation", description: "Go API with auth, customers, and products", dueDate: d("2025-05-01"), status: "completed", completedAt: d("2025-04-28") },
      { id: oid(), name: "Admin SPA", description: "React admin dashboard with MUI v9", dueDate: d("2025-07-01"), status: "completed", completedAt: d("2025-06-25") },
      { id: oid(), name: "Service module", description: "AC service requests and QR-coded tracking", dueDate: d("2025-09-01"), status: "in_progress" },
      { id: oid(), name: "Susu & loans", description: "Susu group and micro-loan management", dueDate: d("2025-12-01"), status: "pending" },
      { id: oid(), name: "Marketing site", description: "Public-facing marketing SPA", dueDate: d("2026-01-15"), status: "pending" },
      { id: oid(), name: "Production", description: "Dockerized deployment with CI/CD", dueDate: d("2026-03-01"), status: "pending" },
    ],
    createdAt: d("2025-02-01T09:00:00Z"),
    updatedAt: d("2026-03-20T09:00:00Z"),
  },
];
