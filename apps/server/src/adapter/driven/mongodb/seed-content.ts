import { ObjectId } from "mongodb";
import type {
  BlogPost,
  Testimonial,
  ServiceItem,
  CaseStudy,
  ContactSubmission,
} from "../../../domain/entity/content.js";

function oid(): string {
  return new ObjectId().toHexString();
}

function d(iso: string): Date {
  return new Date(iso);
}

const SAMPLE_MD = `## Introduction

Building scalable microservices is more than just splitting a monolith into smaller pieces. It requires careful consideration of **domain boundaries**, communication patterns, and operational concerns.

## Hexagonal Architecture

The hexagonal architecture (also known as ports and adapters) separates business logic from external concerns:

- **Domain Layer** — Pure business logic with no external dependencies
- **Ports** — Interfaces that define how the domain interacts with the outside world
- **Adapters** — Concrete implementations (HTTP handlers, database repositories, etc.)

### Why It Works

> The key insight is that your business rules shouldn't know or care whether data comes from a REST API, a gRPC call, or a message queue.

## Code Example

\`\`\`go
type ProjectService struct {
    repo   ProjectRepository
    events EventPublisher
}

func (s *ProjectService) Create(ctx context.Context, cmd CreateProjectCmd) (*Project, error) {
    project := NewProject(cmd.Name, cmd.ClientID)
    if err := s.repo.Save(ctx, project); err != nil {
        return nil, err
    }
    s.events.Publish(ctx, ProjectCreatedEvent{ID: project.ID})
    return project, nil
}
\`\`\`

## Key Takeaways

1. Start with clear domain boundaries
2. Use \`gRPC\` for internal service communication
3. Implement circuit breakers for resilience
4. Always have observability from day one
`;

// ── Blog Posts ──────────────────────────────────────────────────────────────

export const blogPosts: BlogPost[] = [
  { id: oid(), title: "Building Scalable Microservices with Go and gRPC", slug: "building-scalable-microservices-go-grpc", excerpt: "A deep dive into hexagonal architecture patterns for production-grade Go microservices.", content: SAMPLE_MD, category: "Engineering", status: "published", author: "Stanley Asoku Hayford", authorId: "", readTime: "8 min", tags: ["Go", "gRPC", "Microservices"], createdAt: d("2026-03-20T09:00:00Z"), updatedAt: d("2026-03-20T09:00:00Z") },
  { id: oid(), title: "The Future of AI-Assisted Software Specification", slug: "future-ai-assisted-software-specification", excerpt: "How machine learning is transforming the way we capture and structure software requirements.", content: "", category: "AI/ML", status: "published", author: "Stanley Asoku Hayford", authorId: "", readTime: "6 min", tags: ["AI", "Specifications"], createdAt: d("2026-03-15T09:00:00Z"), updatedAt: d("2026-03-15T09:00:00Z") },
  { id: oid(), title: "React Router v7: What's New for Enterprise Apps", slug: "react-router-v7-enterprise-apps", excerpt: "Exploring the latest features in React Router v7 and how they improve large-scale applications.", content: "", category: "Tutorial", status: "published", author: "Sarah Chen", authorId: "", readTime: "5 min", tags: ["React", "Frontend"], createdAt: d("2026-03-10T09:00:00Z"), updatedAt: d("2026-03-10T09:00:00Z") },
  { id: oid(), title: "Why We Chose MongoDB for Our Multi-Tenant Platform", slug: "why-we-chose-mongodb-multi-tenant", excerpt: "The technical reasoning behind our database choice and how it scales with our architecture.", content: "", category: "Engineering", status: "published", author: "Maria Gonzalez", authorId: "", readTime: "7 min", tags: ["MongoDB", "Architecture"], createdAt: d("2026-03-05T09:00:00Z"), updatedAt: d("2026-03-05T09:00:00Z") },
  { id: oid(), title: "Productizing Software Development: Lessons from 36 Projects", slug: "productizing-software-development", excerpt: "What we learned shipping 36+ projects across fintech, govtech, healthcare, and education in Africa.", content: "", category: "Thought Leadership", status: "published", author: "Stanley Asoku Hayford", authorId: "", readTime: "10 min", tags: ["Business", "Product", "Africa"], createdAt: d("2026-02-28T09:00:00Z"), updatedAt: d("2026-02-28T09:00:00Z") },
  { id: oid(), title: "Implementing Real-Time Features with Kafka and WebSockets", slug: "real-time-kafka-websockets", excerpt: "A practical guide to building real-time notification and messaging systems.", content: "", category: "Tutorial", status: "published", author: "Maria Gonzalez", authorId: "", readTime: "9 min", tags: ["Kafka", "WebSocket", "Real-time"], createdAt: d("2026-02-20T09:00:00Z"), updatedAt: d("2026-02-20T09:00:00Z") },
  { id: oid(), title: "Shipping GovTech in Ghana: BDR and LeKMA Case Studies", slug: "shipping-govtech-ghana", excerpt: "Lessons from rebuilding government digital infrastructure — from vital statistics to municipal services.", content: "", category: "Engineering", status: "draft", author: "Stanley Asoku Hayford", authorId: "", readTime: "7 min", tags: ["GovTech", "Ghana", "Case Study"], createdAt: d("2026-03-28T09:00:00Z"), updatedAt: d("2026-03-28T09:00:00Z") },
  { id: oid(), title: "Design Systems at Scale", slug: "design-systems-at-scale", excerpt: "How we maintain consistency across three frontends with a shared design token layer.", content: "", category: "Tutorial", status: "draft", author: "Sarah Chen", authorId: "", readTime: "6 min", tags: ["Design", "Frontend"], createdAt: d("2026-03-27T09:00:00Z"), updatedAt: d("2026-03-27T09:00:00Z") },
];

// ── Testimonials ───────────────────────────────────────────────────────────

export const testimonials: Testimonial[] = [
  { id: oid(), name: "David Kim", role: "CEO", company: "Acme Corp", content: "Stanley and the NeuroDyne team transformed our vague idea into a comprehensive specification in days. The structured process was exactly what we needed.", rating: 5, status: "active", avatarColor: "#6C63FF", createdAt: d("2026-03-18T09:00:00Z"), updatedAt: d("2026-03-18T09:00:00Z") },
  { id: oid(), name: "Fatima Hassan", role: "Founder", company: "GreenLeaf Technologies", content: "The transparency and professionalism from spec to delivery was outstanding. We could track every milestone in real-time on the dashboard.", rating: 5, status: "active", avatarColor: "#00D4AA", createdAt: d("2026-03-10T09:00:00Z"), updatedAt: d("2026-03-10T09:00:00Z") },
  { id: oid(), name: "Lucas Berg", role: "CTO", company: "Nordic SaaS", content: "Their productized approach caught requirements we hadn't even considered. Truly next-level engineering partner for our AI chatbot project.", rating: 5, status: "active", avatarColor: "#8B85FF", createdAt: d("2026-02-25T09:00:00Z"), updatedAt: d("2026-02-25T09:00:00Z") },
  { id: oid(), name: "James Okafor", role: "Project Manager", company: "NeuroDyne Corp", content: "Working with Stanley means every project starts with clarity. The spec-first approach saves weeks of back-and-forth.", rating: 5, status: "active", avatarColor: "#F59E0B", createdAt: d("2026-02-15T09:00:00Z"), updatedAt: d("2026-02-15T09:00:00Z") },
  { id: oid(), name: "Maria Gonzalez", role: "Lead Engineer", company: "NeuroDyne Corp", content: "The depth of projects we've shipped — from govtech to healthcare to fintech — keeps every day challenging and meaningful.", rating: 5, status: "active", avatarColor: "#10B981", createdAt: d("2026-01-20T09:00:00Z"), updatedAt: d("2026-01-20T09:00:00Z") },
  { id: oid(), name: "Priya Sharma", role: "QA Lead", company: "NeuroDyne Corp", content: "36+ projects and counting. The variety of domains we work in makes NeuroDyne one of the most exciting engineering studios in Africa.", rating: 5, status: "active", avatarColor: "#8B5CF6", createdAt: d("2025-12-10T09:00:00Z"), updatedAt: d("2025-12-10T09:00:00Z") },
];

// ── Services ───────────────────────────────────────────────────────────────
// Services are derived from real portfolio projects in ~/Desktop/Dev/TS

export const serviceItems: ServiceItem[] = [
  {
    id: oid(),
    title: "Full-Stack Web Development",
    description: "End-to-end web platforms from marketing sites to complex SaaS dashboards. React, Next.js, Vite, MUI — built for scale.",
    icon: "code",
    features: ["React / Next.js / Vite", "SaaS platforms", "Admin dashboards", "Marketing websites", "API-first architecture"],
    status: "active",
    projectCount: 33,
    color: "#6C63FF",
    order: 1,
    createdAt: d("2025-01-01T00:00:00Z"),
    updatedAt: d("2025-01-01T00:00:00Z"),
  },
  {
    id: oid(),
    title: "Mobile App Development",
    description: "Cross-platform mobile experiences with React Native and Expo. From consumer apps to field-service tools.",
    icon: "phone",
    features: ["iOS & Android", "React Native / Expo", "Push notifications", "Offline-first", "Mobile money integration"],
    status: "active",
    projectCount: 13,
    color: "#00D4AA",
    order: 2,
    createdAt: d("2025-01-01T00:00:00Z"),
    updatedAt: d("2025-01-01T00:00:00Z"),
  },
  {
    id: oid(),
    title: "Backend & API Engineering",
    description: "Production-grade APIs in Go and Node.js with hexagonal architecture, test coverage, and event-driven design.",
    icon: "dns",
    features: ["Go / Node.js / Express", "gRPC & REST", "Hexagonal architecture", "Kafka event streaming", "Redis caching"],
    status: "active",
    projectCount: 36,
    color: "#8B85FF",
    order: 3,
    createdAt: d("2025-01-01T00:00:00Z"),
    updatedAt: d("2025-01-01T00:00:00Z"),
  },
  {
    id: oid(),
    title: "AI / ML Systems",
    description: "Intelligent systems for risk detection, predictive analytics, NLP, and computer vision — trained on real African data.",
    icon: "psychology",
    features: ["Predictive analytics", "NLP & scam detection", "Computer vision", "ML pipelines", "Real-time scoring"],
    status: "active",
    projectCount: 4,
    color: "#F59E0B",
    order: 4,
    createdAt: d("2025-01-01T00:00:00Z"),
    updatedAt: d("2025-01-01T00:00:00Z"),
  },
  {
    id: oid(),
    title: "Fintech & Payment Integration",
    description: "Mobile money, installment plans, escrow, and compliance-first financial platforms for African markets.",
    icon: "payments",
    features: ["Paystack / Stripe", "Mobile money (MoMo)", "Installment engines", "Escrow & payouts", "Compliance reporting"],
    status: "active",
    projectCount: 5,
    color: "#33DDBB",
    order: 5,
    createdAt: d("2025-01-01T00:00:00Z"),
    updatedAt: d("2025-01-01T00:00:00Z"),
  },
  {
    id: oid(),
    title: "E-commerce & Marketplaces",
    description: "Multi-vendor marketplaces, B2B procurement platforms, and retail systems with inventory and order management.",
    icon: "shopping_cart",
    features: ["Multi-vendor platforms", "B2B marketplaces", "Inventory management", "Order routing", "Seller dashboards"],
    status: "active",
    projectCount: 6,
    color: "#10B981",
    order: 6,
    createdAt: d("2025-01-01T00:00:00Z"),
    updatedAt: d("2025-01-01T00:00:00Z"),
  },
  {
    id: oid(),
    title: "GovTech & Public Sector",
    description: "Digital infrastructure for government agencies — from municipal portals to national compliance and vital statistics.",
    icon: "account_balance",
    features: ["Municipal portals", "National registries", "Compliance OS", "Public transparency", "Citizen engagement"],
    status: "active",
    projectCount: 4,
    color: "#3B82F6",
    order: 7,
    createdAt: d("2025-01-01T00:00:00Z"),
    updatedAt: d("2025-01-01T00:00:00Z"),
  },
  {
    id: oid(),
    title: "Healthcare Technology",
    description: "HIPAA-aligned clinic management, patient portals, telemedicine, and health insurance integrations.",
    icon: "health_and_safety",
    features: ["Electronic health records", "NHIS integration", "Telemedicine", "Patient portals", "Clinical workflows"],
    status: "active",
    projectCount: 2,
    color: "#EF4444",
    order: 8,
    createdAt: d("2025-01-01T00:00:00Z"),
    updatedAt: d("2025-01-01T00:00:00Z"),
  },
  {
    id: oid(),
    title: "EdTech & Learning Platforms",
    description: "School management systems, alumni platforms, coding academies, and digital curriculum delivery.",
    icon: "school",
    features: ["School management (SIS)", "Alumni networks", "Coding sandboxes", "Digital curricula", "Progress tracking"],
    status: "active",
    projectCount: 4,
    color: "#8B5CF6",
    order: 9,
    createdAt: d("2025-01-01T00:00:00Z"),
    updatedAt: d("2025-01-01T00:00:00Z"),
  },
  {
    id: oid(),
    title: "DevOps & Cloud Infrastructure",
    description: "Docker, Kubernetes, CI/CD, and cloud deployments on AWS, GCP, and Render — with monitoring from day one.",
    icon: "cloud",
    features: ["AWS / GCP / Render", "Docker & Kubernetes", "CI/CD pipelines", "Prometheus monitoring", "Auto-scaling"],
    status: "active",
    projectCount: 36,
    color: "#6C63FF",
    order: 10,
    createdAt: d("2025-01-01T00:00:00Z"),
    updatedAt: d("2025-01-01T00:00:00Z"),
  },
];

// ── Case Studies / Portfolio ───────────────────────────────────────────────

export const caseStudies: CaseStudy[] = [
  {
    id: oid(), title: "RentOS Ghana", slug: "rentos-ghana", client: "RentOS", category: "Proptech",
    sector: "Proptech / Housing", serviceLine: "Web & Digital Platforms", scale: "National", stage: "In Development",
    tags: ["React", "Go", "Mobile Money"],
    description: "National digital rental housing platform with MoMo payments, digital agreements, and credit scoring for Ghana.",
    brief: "Ghana's rental market runs on cash, paper agreements, and informal trust — leaving tenants without records and landlords without recourse. RentOS sets out to formalise it end to end.",
    constraints: ["Mobile-money-only market (MTN MoMo dominant)", "Low-trust landlord/tenant relationships", "Thin or absent formal credit history"],
    architecture: "Hexagonal Go API + React/Vite web, MongoDB, Redis, MTN MoMo integration, document-generation service for agreements.",
    impact: "National rollout",
    results: ["Digital rent agreements", "MTN MoMo integration", "Credit scoring"],
    shipped: ["Digital tenancy agreements", "MoMo rent collection & receipts", "Tenant credit scoring"],
    retained: ["Credit-scoring model as reusable IP", "Payments orchestration layer"],
    learnt: ["Receipts-by-SMS drove trust faster than the app UI itself", "Credit scoring must degrade gracefully where history is thin"],
    status: "published", color: "#6C63FF", createdAt: d("2026-03-12T09:00:00Z"), updatedAt: d("2026-03-12T09:00:00Z"),
  },
  {
    id: oid(), title: "FastCare Clinics", slug: "fastcare-clinics", client: "FastCare", category: "Healthcare",
    sector: "Health", serviceLine: "Healthcare Technology", scale: "Enterprise", stage: "Delivered",
    tags: ["React", "Node.js", "NHIS"],
    description: "Complete healthcare management platform with NHIS integration, EHR, and telemedicine for African clinics.",
    brief: "A growing clinic network was drowning in paper records and manual NHIS claims, with no shared patient history across sites.",
    constraints: ["NHIS claims compliance", "Intermittent connectivity at clinic sites", "Patient-data privacy obligations"],
    architecture: "React/Node.js platform, MongoDB, role-scoped access with audit logging, NHIS claims integration, telemedicine module.",
    impact: "Clinic network",
    results: ["NHIS claims processing", "Digital patient records", "Telemedicine"],
    shipped: ["Electronic health records", "Automated NHIS claims", "Telemedicine consults"],
    retained: ["Claims-automation engine", "Consent-aware EHR core (feeds ILIVVON)"],
    learnt: ["Claims validation at capture point cut rejections dramatically", "Offline-first capture was non-negotiable for rural sites"],
    status: "published", color: "#00D4AA", createdAt: d("2026-02-28T09:00:00Z"), updatedAt: d("2026-02-28T09:00:00Z"),
  },
  {
    id: oid(), title: "BDR Ghana", slug: "bdr-ghana", client: "Births & Deaths Registry", category: "GovTech",
    sector: "Government", serviceLine: "Enterprise & Government", scale: "National", stage: "Approved",
    tags: ["React", "Go", "API-first"],
    description: "Redesign of bdr.gov.gh as a data-driven, API-first vital statistics platform with public dashboards.",
    brief: "The national Births & Deaths Registry needed to move from a brochure site to a data-driven, API-first vital-statistics platform other agencies could consume.",
    constraints: ["Sovereign data handling", "Inter-agency integration requirements", "Public transparency mandate"],
    architecture: "API-first Go backend, React public dashboards, agency integration endpoints, sovereign hosting option.",
    impact: "National registry",
    results: ["Digital registration", "Public dashboards", "Agency integrations"],
    shipped: ["Digital registration flows", "Public vital-statistics dashboards", "Agency integration API"],
    retained: ["API-first registry architecture as reference pattern"],
    learnt: ["Publishing open dashboards built political momentum for the digital programme"],
    status: "published", color: "#8B85FF", createdAt: d("2026-02-10T09:00:00Z"), updatedAt: d("2026-02-10T09:00:00Z"),
  },
  {
    id: oid(), title: "24-Hour Economy Platform", slug: "24-hour-economy-platform", client: "Investment Intelligence", category: "Fintech",
    sector: "Financial Services", serviceLine: "AI & Automation", scale: "National", stage: "In Development",
    tags: ["React", "Node.js", "ML"],
    description: "Investment intelligence platform with ML-driven scoring, real-time analytics, and portfolio tracking.",
    brief: "A national economic programme generates vast investment, donor, and operational data with no single surface to score opportunities or track capital against policy intent.",
    constraints: ["Many heterogeneous data sources", "Explainable, evaluated scoring required", "USD/GHS currency exposure"],
    architecture: "Event-driven ingestion, production ML scoring service with evaluation, React real-time dashboards, mobile companion.",
    impact: "Market intelligence",
    results: ["ML scoring models", "Real-time dashboards", "Mobile companion"],
    shipped: ["Real-time analytics dashboards", "ML opportunity scoring", "Executive mobile companion"],
    retained: ["Scoring models and evaluation harness as Labs IP", "Ingestion pipeline"],
    learnt: ["Authorities trusted scores only once the evaluation harness was visible to them"],
    status: "published", color: "#F59E0B", createdAt: d("2026-03-25T09:00:00Z"), updatedAt: d("2026-03-25T09:00:00Z"),
  },
  {
    id: oid(), title: "ILIVVON Health Ecosystem", slug: "ilivvon-health-ecosystem", client: "ILIVVON", category: "Healthcare",
    sector: "Health", serviceLine: "Healthcare Technology", scale: "National", stage: "In Development",
    tags: ["React", "Expo", "ML", "Interoperability"],
    description: "A health intelligence platform unifying the clinical record, claims, and a predictive layer across clinic networks.",
    brief: "Beyond a single clinic network, the opportunity was an interoperable health record + intelligence layer that any clinic, patient, or payer could plug into.",
    constraints: ["Cross-organisation interoperability", "Consent and data residency", "Low-bandwidth, mobile-first reality"],
    architecture: "Mobile-first PWA (Expo + React), interoperable EHR core, consent-aware access + audit, ML operational layer.",
    impact: "Labs platform",
    results: ["Interoperable patient record", "Claims automation", "Predictive operations layer"],
    shipped: ["Unified patient record", "Claims automation", "Telemedicine"],
    retained: ["Entire platform owned by NeuroDyne Labs (spinning out as ILIVVON Health Systems Ltd)"],
    learnt: ["Interoperability sells the platform; the intelligence layer retains it"],
    status: "published", color: "#00D4AA", createdAt: d("2026-03-01T09:00:00Z"), updatedAt: d("2026-03-01T09:00:00Z"),
  },
  {
    id: oid(), title: "JDPlus Group Platform", slug: "jdplus-group-platform", client: "JDPlus", category: "Commerce",
    sector: "Retail / Commerce", serviceLine: "Web & Digital Platforms", scale: "Enterprise", stage: "Delivered",
    tags: ["Go", "Fiber", "React", "Expo", "Paystack"],
    description: "Parent platform for the JDPlus ecosystem — AC sales & service, susu collections, loans, and analytics.",
    brief: "JDPlus runs AC sales, electronics retail, susu collections, and lending — each on its own tools. They needed one platform with shared customers, products, and money flows.",
    constraints: ["Multiple business lines on one ledger", "Field service in low-connectivity areas", "Mobile-money settlement"],
    architecture: "Go (Fiber v3) backend, React admin SPA, React marketing SPA, Expo field app, MongoDB, Paystack, QR-coded service histories.",
    impact: "Ecosystem platform",
    results: ["Unified customers & products", "QR-coded AC service histories", "Susu & loan management"],
    shipped: ["Customer & product registry", "AC service workflow with QR follow-up", "Susu collections & loans", "Analytics"],
    retained: ["Reusable commerce + collections core"],
    learnt: ["QR-coded service stickers + SMS reminders drove repeat service revenue"],
    status: "published", color: "#33DDBB", createdAt: d("2026-01-20T09:00:00Z"), updatedAt: d("2026-01-20T09:00:00Z"),
  },
  {
    id: oid(), title: "LeKMA Municipal Portal", slug: "lekma-municipal-portal", client: "Ledzokuku Municipal Assembly", category: "GovTech",
    sector: "Government", serviceLine: "Enterprise & Government", scale: "Enterprise", stage: "Delivered",
    tags: ["React", "Node.js", "Payments"],
    description: "Municipal services portal for citizen engagement, permits, and revenue collection.",
    brief: "A municipal assembly needed to bring permits, complaints, and revenue collection online for citizens and staff.",
    constraints: ["Public-sector procurement & accountability", "Mixed digital literacy among users", "Revenue reconciliation"],
    architecture: "React portal, Node.js services, payments integration, role-scoped staff back office.",
    impact: "Municipal rollout",
    results: ["Online permits", "Citizen complaints", "Revenue collection"],
    shipped: ["Permit applications", "Complaint tracking", "Digital revenue collection"],
    retained: ["Municipal portal template"],
    learnt: ["Staff back-office adoption mattered more than the citizen UI for revenue lift"],
    status: "published", color: "#3B82F6", createdAt: d("2025-11-15T09:00:00Z"), updatedAt: d("2025-11-15T09:00:00Z"),
  },
  {
    id: oid(), title: "BestPriceGH Marketplace", slug: "bestpricegh-marketplace", client: "BestPriceGH", category: "E-commerce",
    sector: "Retail / Commerce", serviceLine: "Web & Digital Platforms", scale: "Growth", stage: "Delivered",
    tags: ["React", "Node.js", "Multi-vendor"],
    description: "Multi-vendor e-commerce marketplace with vendor onboarding, catalogue, and order routing.",
    brief: "Independent sellers needed a shared storefront with trustworthy fulfilment in a price-sensitive market.",
    constraints: ["Vendor onboarding at scale", "Payments & payouts", "Logistics in constrained markets"],
    architecture: "React storefront + seller dashboards, Node.js order routing, payments & payouts, inventory management.",
    impact: "Marketplace launch",
    results: ["Vendor onboarding", "Catalogue & search", "Order routing"],
    shipped: ["Multi-vendor catalogue", "Seller dashboards", "Order routing & payouts"],
    retained: ["Marketplace + payouts core"],
    learnt: ["Vendor trust scores reduced disputes more than buyer reviews did"],
    status: "published", color: "#10B981", createdAt: d("2025-10-05T09:00:00Z"), updatedAt: d("2025-10-05T09:00:00Z"),
  },
  {
    id: oid(), title: "UPOSA Alumni Network", slug: "uposa-alumni-network", client: "UPOSA", category: "Education",
    sector: "Education", serviceLine: "Web & Digital Platforms", scale: "Growth", stage: "Delivered",
    tags: ["React", "Node.js"],
    description: "Alumni network platform with directory, events, dues, and giving.",
    brief: "An alumni association needed to reconnect members, run events, and collect dues online.",
    constraints: ["Member data accuracy", "Voluntary dues collection", "Event logistics"],
    architecture: "React platform, Node.js services, payments for dues & giving, events module.",
    impact: "Alumni rollout",
    results: ["Member directory", "Events & RSVPs", "Dues & giving"],
    shipped: ["Alumni directory", "Event management", "Online dues & giving"],
    retained: ["Membership + dues module"],
    learnt: ["Class-cohort framing drove far higher dues conversion than a generic appeal"],
    status: "published", color: "#8B5CF6", createdAt: d("2025-09-10T09:00:00Z"), updatedAt: d("2025-09-10T09:00:00Z"),
  },
  {
    id: oid(), title: "AEJ Travel & Tours", slug: "aej-travel-and-tours", client: "AEJ", category: "Travel",
    sector: "Retail / Commerce", serviceLine: "Web & Digital Platforms", scale: "Growth", stage: "Delivered",
    tags: ["React", "Node.js", "Payments"],
    description: "Travel & tours booking platform with package management and payments.",
    brief: "A travel operator ran bookings over WhatsApp and spreadsheets and needed a real booking platform.",
    constraints: ["Seasonal demand spikes", "Deposit & instalment payments", "Inventory of packages & seats"],
    architecture: "React booking platform, Node.js services, payments with deposits/instalments, package & seat inventory.",
    impact: "Bookings online",
    results: ["Online packages", "Deposit payments", "Booking management"],
    shipped: ["Package catalogue", "Booking & deposits", "Operator dashboard"],
    retained: ["Booking + instalment engine"],
    learnt: ["Instalment deposits unlocked higher-value packages for customers"],
    status: "published", color: "#F59E0B", createdAt: d("2025-08-20T09:00:00Z"), updatedAt: d("2025-08-20T09:00:00Z"),
  },
  {
    id: oid(), title: "EasyLife Lending", slug: "easylife-lending", client: "EasyLife", category: "Fintech",
    sector: "Financial Services", serviceLine: "Fintech & Payments", scale: "Growth", stage: "Delivered",
    tags: ["React", "Node.js", "Mobile Money", "Scoring"],
    description: "Consumer lending platform with mobile-money disbursement, repayments, and risk scoring.",
    brief: "A lender needed to originate, disburse, and collect micro-loans over mobile money with basic risk controls.",
    constraints: ["Mobile-money disbursement & collection", "Default risk with thin credit data", "Regulatory reporting"],
    architecture: "React origination UI, Node.js services, mobile-money disbursement/collection, risk-scoring service, reporting.",
    impact: "Lending live",
    results: ["MoMo disbursement", "Automated repayments", "Risk scoring"],
    shipped: ["Loan origination", "MoMo disbursement & collection", "Risk scoring & reporting"],
    retained: ["Lending + collections engine"],
    learnt: ["Automated repayment reminders cut defaults more than tighter origination rules"],
    status: "published", color: "#00D4AA", createdAt: d("2025-07-12T09:00:00Z"), updatedAt: d("2025-07-12T09:00:00Z"),
  },
  {
    id: oid(), title: "Kraken Compliance OS", slug: "kraken-compliance-os", client: "Confidential", category: "GovTech",
    sector: "Government", serviceLine: "Enterprise & Government", scale: "Enterprise", stage: "QA",
    tags: ["Go", "React", "Workflow", "Audit"],
    description: "Compliance operating system for regulatory workflows, evidence, and audit trails.",
    brief: "A regulator needed to move compliance workflows off email and spreadsheets into an auditable operating system.",
    constraints: ["Sovereign-grade audit trail", "Configurable regulatory workflows", "Evidence handling & retention"],
    architecture: "Go backend, React workflow UI, immutable audit log, configurable workflow engine, evidence vault.",
    impact: "In QA (90%)",
    results: ["Configurable workflows", "Evidence vault", "Immutable audit trail"],
    shipped: ["Workflow engine", "Evidence vault", "Audit trail & exports"],
    retained: ["Compliance workflow engine as IP"],
    learnt: ["An immutable, exportable audit trail was the single feature that won trust"],
    status: "published", color: "#6C63FF", createdAt: d("2026-04-02T09:00:00Z"), updatedAt: d("2026-04-02T09:00:00Z"),
  },
];

// ── Contact Submissions ────────────────────────────────────────────────────

export const contactSubmissions: ContactSubmission[] = [
  { id: oid(), name: "James Patterson", email: "james@retailmax.com", phone: "+1 555-0101", company: "RetailMax", subject: "E-Commerce Platform", projectType: "Web Application", message: "We need a scalable e-commerce platform to replace our legacy system. Looking for a team that can handle 100K+ SKUs and real-time inventory sync.", status: "new", createdAt: d("2026-03-28T09:00:00Z"), updatedAt: d("2026-03-28T09:00:00Z") },
  { id: oid(), name: "Omar Hassan", email: "omar@smarthome.io", phone: "+1 555-0202", company: "SmartHome Inc", subject: "IoT Dashboard", projectType: "Web Application", message: "We're building a smart home management platform and need a dashboard for device monitoring and automation rules.", status: "new", createdAt: d("2026-03-27T09:00:00Z"), updatedAt: d("2026-03-27T09:00:00Z") },
  { id: oid(), name: "Elena Rodriguez", email: "elena@edunova.com", phone: "+1 555-0303", company: "EduNova", subject: "Learning Management System", projectType: "Web Application", message: "Looking for a partner to build a modern LMS with adaptive learning paths, gamification, and real-time collaboration.", status: "read", createdAt: d("2026-03-25T09:00:00Z"), updatedAt: d("2026-03-25T09:00:00Z") },
  { id: oid(), name: "Nina Petrov", email: "nina@fitlife.app", phone: "+1 555-0404", company: "FitLife", subject: "Mobile Fitness Tracker", projectType: "Mobile App", message: "We want to add AI-powered workout recommendations and health insights to our existing fitness app.", status: "replied", createdAt: d("2026-03-20T09:00:00Z"), updatedAt: d("2026-03-20T09:00:00Z") },
  { id: oid(), name: "Sophie Martin", email: "sophie@dataviz.co", phone: "+1 555-0505", company: "DataViz", subject: "Analytics Dashboard Revamp", projectType: "AI / ML System", message: "Our current analytics tool is outdated. Need a modern, real-time dashboard with predictive analytics capabilities.", status: "replied", createdAt: d("2026-03-15T09:00:00Z"), updatedAt: d("2026-03-15T09:00:00Z") },
  { id: oid(), name: "Carlos Mendez", email: "carlos@proptech.lat", phone: "+1 555-0606", company: "PropTech LATAM", subject: "Property Management Platform", projectType: "Web Application", message: "Building a property management SaaS for the Latin American market. Need multi-tenant architecture with localization.", status: "archived", createdAt: d("2026-02-28T09:00:00Z"), updatedAt: d("2026-02-28T09:00:00Z") },
  { id: oid(), name: "Aisha Rahman", email: "aisha@greenearth.org", phone: "+1 555-0707", company: "Green Earth NGO", subject: "Impact Tracking Platform", projectType: "Web Application", message: "We need a platform to track and visualize our environmental impact metrics across 50+ projects globally.", status: "new", createdAt: d("2026-03-29T09:00:00Z"), updatedAt: d("2026-03-29T09:00:00Z") },
];
