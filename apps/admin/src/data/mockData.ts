// ═══════════════════════════════════════════════════════════════════════════════
// ── CENTRALIZED MOCK DATA ────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

export interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  industry: string;
  projects: number;
  revenue: number;
  status: "Active" | "Lead" | "Churned";
  joined: string;
  lastContact: string;
  avatarColor: string;
}

export const clients: Client[] = [
  { id: "1", name: "John Doe", email: "john@apexfinance.com", company: "Apex Finance", industry: "FinTech", projects: 2, revenue: 125000, status: "Active", joined: "2026-01-15", lastContact: "2026-03-25", avatarColor: "#6C63FF" },
  { id: "2", name: "Sarah Chen", email: "sarah@medcore.io", company: "MedCore", industry: "Healthcare", projects: 1, revenue: 50000, status: "Active", joined: "2026-02-01", lastContact: "2026-03-22", avatarColor: "#00D4AA" },
  { id: "3", name: "Marcus Johnson", email: "marcus@logitrack.com", company: "LogiTrack", industry: "Logistics", projects: 1, revenue: 75000, status: "Active", joined: "2026-02-20", lastContact: "2026-03-20", avatarColor: "#8B85FF" },
  { id: "4", name: "Elena Rodriguez", email: "elena@edunova.com", company: "EduNova", industry: "Education", projects: 0, revenue: 0, status: "Lead", joined: "2026-03-15", lastContact: "2026-03-28", avatarColor: "#F59E0B" },
  { id: "5", name: "David Kim", email: "david@nexgen.io", company: "NexGen", industry: "Analytics", projects: 3, revenue: 95000, status: "Active", joined: "2025-11-10", lastContact: "2026-03-18", avatarColor: "#EF4444" },
  { id: "6", name: "Amara Okafor", email: "amara@greenpulse.co", company: "GreenPulse", industry: "CleanTech", projects: 1, revenue: 40000, status: "Active", joined: "2025-12-05", lastContact: "2026-03-15", avatarColor: "#10B981" },
  { id: "7", name: "Li Wei", email: "wei@skybridge.ai", company: "SkyBridge AI", industry: "AI/ML", projects: 2, revenue: 180000, status: "Active", joined: "2025-10-20", lastContact: "2026-03-27", avatarColor: "#6C63FF" },
  { id: "8", name: "James Patterson", email: "james@retailmax.com", company: "RetailMax", industry: "Retail", projects: 0, revenue: 0, status: "Lead", joined: "2026-03-20", lastContact: "2026-03-26", avatarColor: "#8B5CF6" },
  { id: "9", name: "Nina Petrov", email: "nina@fitlife.app", company: "FitLife", industry: "Health & Fitness", projects: 1, revenue: 25000, status: "Active", joined: "2026-01-10", lastContact: "2026-03-24", avatarColor: "#00D4AA" },
  { id: "10", name: "Omar Hassan", email: "omar@smarthome.io", company: "SmartHome Inc", industry: "IoT", projects: 0, revenue: 0, status: "Lead", joined: "2026-03-22", lastContact: "2026-03-28", avatarColor: "#F59E0B" },
  { id: "11", name: "Sophie Martin", email: "sophie@dataviz.co", company: "DataViz", industry: "Analytics", projects: 1, revenue: 25000, status: "Active", joined: "2025-09-15", lastContact: "2026-03-10", avatarColor: "#8B85FF" },
  { id: "12", name: "Carlos Mendez", email: "carlos@proptech.lat", company: "PropTech LATAM", industry: "Real Estate", projects: 0, revenue: 0, status: "Churned", joined: "2025-08-01", lastContact: "2026-01-15", avatarColor: "#94A3B8" },
];

export interface Project {
  id: string;
  name: string;
  clientId: string;
  client: string;
  type: "Web App" | "Mobile App" | "AI/ML" | "SaaS Platform" | "API Integration";
  status: "In Progress" | "Completed" | "On Hold" | "Planning" | "Review";
  progress: number;
  team: string[];
  budget: number;
  startDate: string;
  endDate: string;
}

export const projects: Project[] = [
  { id: "p1", name: "Apex Trading Platform", clientId: "1", client: "Apex Finance", type: "Web App", status: "In Progress", progress: 65, team: ["JD", "SC", "MK"], budget: 75000, startDate: "2026-01-20", endDate: "2026-06-30" },
  { id: "p2", name: "MedCore Patient Portal", clientId: "2", client: "MedCore", type: "SaaS Platform", status: "Review", progress: 90, team: ["ER", "DK"], budget: 50000, startDate: "2026-02-01", endDate: "2026-05-15" },
  { id: "p3", name: "LogiTrack Fleet Manager", clientId: "3", client: "LogiTrack", type: "Mobile App", status: "In Progress", progress: 40, team: ["MJ", "SC", "AL"], budget: 75000, startDate: "2026-03-01", endDate: "2026-08-01" },
  { id: "p4", name: "EduNova LMS", clientId: "4", client: "EduNova", type: "Web App", status: "Planning", progress: 10, team: ["JD", "ER"], budget: 60000, startDate: "2026-04-01", endDate: "2026-09-30" },
  { id: "p5", name: "NexGen Analytics Engine", clientId: "5", client: "NexGen", type: "AI/ML", status: "Completed", progress: 100, team: ["DK", "MK", "AL", "SC"], budget: 95000, startDate: "2025-11-01", endDate: "2026-02-28" },
  { id: "p6", name: "NexGen API Gateway", clientId: "5", client: "NexGen", type: "API Integration", status: "On Hold", progress: 25, team: ["MJ"], budget: 30000, startDate: "2026-01-15", endDate: "2026-04-30" },
  { id: "p7", name: "SkyBridge ML Pipeline", clientId: "7", client: "SkyBridge AI", type: "AI/ML", status: "In Progress", progress: 55, team: ["DK", "AL"], budget: 120000, startDate: "2025-12-01", endDate: "2026-06-01" },
  { id: "p8", name: "SkyBridge Dashboard", clientId: "7", client: "SkyBridge AI", type: "Web App", status: "Completed", progress: 100, team: ["SC", "MK"], budget: 60000, startDate: "2025-10-15", endDate: "2026-01-30" },
  { id: "p9", name: "FitLife Tracker", clientId: "9", client: "FitLife", type: "Mobile App", status: "In Progress", progress: 70, team: ["JW", "MS"], budget: 25000, startDate: "2026-01-10", endDate: "2026-04-15" },
  { id: "p10", name: "GreenPulse Monitor", clientId: "6", client: "GreenPulse", type: "Web App", status: "Review", progress: 85, team: ["AP", "CD"], budget: 40000, startDate: "2025-12-10", endDate: "2026-03-30" },
  { id: "p11", name: "DataViz Insights", clientId: "11", client: "DataViz", type: "AI/ML", status: "Completed", progress: 100, team: ["DK"], budget: 25000, startDate: "2025-09-15", endDate: "2025-12-20" },
  { id: "p12", name: "Apex Mobile Wallet", clientId: "1", client: "Apex Finance", type: "Mobile App", status: "Planning", progress: 5, team: ["JW"], budget: 50000, startDate: "2026-04-01", endDate: "2026-09-01" },
];

export interface SpecSection {
  title: string;
  content: string;
}

export interface Spec {
  id: string;
  project: string;
  projectId: string;
  client: string;
  version: number;
  status: "Draft" | "Generated" | "Under Review" | "Approved" | "Rejected";
  date: string;
  overview?: string;
  techStack?: string[];
  features?: string[];
  sections?: SpecSection[];
  timeline?: string;
  budget?: string;
}

export const specs: Spec[] = [
  {
    id: "s1", project: "Apex Trading Platform", projectId: "p1", client: "Apex Finance", version: 2, status: "Generated", date: "2026-03-20",
    overview: "A comprehensive web-based trading platform enabling retail and institutional investors to execute trades, monitor portfolios, and access real-time market analytics. The platform prioritizes low-latency data feeds, regulatory compliance (SEC/FINRA), and an intuitive dashboard experience.",
    techStack: ["React 19", "TypeScript", "Go (gRPC)", "PostgreSQL", "Redis", "Kafka", "AWS EKS"],
    features: ["Real-time market data via WebSocket feeds", "Portfolio management with P&L tracking", "Multi-asset order execution (equities, options, crypto)", "Risk management alerts and position limits", "KYC/AML compliance workflows", "Two-factor authentication with hardware key support", "Role-based access control (trader, analyst, admin)", "Audit trail logging for all transactions"],
    sections: [
      { title: "Architecture", content: "Microservices architecture deployed on AWS EKS. The system is composed of an API Gateway (Go), Order Management Service, Market Data Service, Portfolio Service, and Notification Service. Inter-service communication uses gRPC with Kafka for event-driven workflows. Redis handles session caching and rate limiting." },
      { title: "Data Model", content: "Core entities: User, Account, Portfolio, Position, Order, Trade, MarketData, Alert. PostgreSQL for transactional data with read replicas. TimescaleDB extension for time-series market data. Redis for real-time position caching." },
      { title: "Security Requirements", content: "SOC 2 Type II compliant infrastructure. All data encrypted at rest (AES-256) and in transit (TLS 1.3). API rate limiting at 100 req/s per user. IP allowlisting for institutional accounts. Session timeout after 15 minutes of inactivity." },
      { title: "Performance Requirements", content: "Order execution latency < 50ms (p99). Market data feed latency < 100ms. Dashboard load time < 2s. Support for 10,000 concurrent users. 99.95% uptime SLA." },
      { title: "Integration Points", content: "Market data providers: Bloomberg, Refinitiv. Payment processing: Stripe, ACH via Plaid. Identity verification: Jumio KYC. Regulatory reporting: FINRA OATS, SEC EDGAR." },
    ],
    timeline: "6 months (Jan 2026 – Jun 2026)",
    budget: "$75,000",
  },
  {
    id: "s2", project: "MedCore Patient Portal", projectId: "p2", client: "MedCore", version: 1, status: "Approved", date: "2026-03-15",
    overview: "A HIPAA-compliant patient portal allowing healthcare providers to manage patient records, appointments, prescriptions, and secure messaging. The platform integrates with existing EHR systems and provides a patient-facing mobile-responsive interface.",
    techStack: ["React 19", "TypeScript", "Node.js", "MongoDB", "Redis", "AWS (HIPAA BAA)", "Docker"],
    features: ["Patient health records with versioning", "Appointment scheduling and reminders", "Secure provider-patient messaging", "Prescription management and refill requests", "Lab results viewing with trend charts", "Insurance and billing integration", "Telehealth video consultation", "Emergency contact and allergy alerts"],
    sections: [
      { title: "Architecture", content: "Monolithic modular architecture on AWS with HIPAA Business Associate Agreement. The application server runs on ECS Fargate behind an ALB. MongoDB Atlas (HIPAA-compliant) for document storage. Redis for session management. All PHI data encrypted with customer-managed KMS keys." },
      { title: "Compliance", content: "Full HIPAA compliance including: access controls, audit logging, automatic session timeouts, encryption at rest and in transit, breach notification procedures, and business associate agreements with all third-party vendors." },
      { title: "EHR Integration", content: "HL7 FHIR R4 API for interoperability with existing EHR systems (Epic, Cerner). Bidirectional data sync for patient demographics, encounters, and lab results. CCD/CDA document import/export." },
    ],
    timeline: "4 months (Feb 2026 – May 2026)",
    budget: "$50,000",
  },
  {
    id: "s3", project: "LogiTrack Fleet Manager", projectId: "p3", client: "LogiTrack", version: 1, status: "Under Review", date: "2026-03-18",
    overview: "A cross-platform mobile application for fleet management, providing real-time GPS tracking, route optimization, driver performance monitoring, and maintenance scheduling for logistics companies managing 50-500 vehicles.",
    techStack: ["React Native", "TypeScript", "Go", "PostgreSQL", "PostGIS", "Redis", "Google Maps API", "Firebase"],
    features: ["Real-time GPS vehicle tracking on map", "AI-powered route optimization", "Driver behavior scoring (harsh braking, speeding)", "Fuel consumption analytics", "Maintenance scheduling with predictive alerts", "Geofencing with entry/exit notifications", "Digital proof of delivery with photo capture", "Driver hours-of-service (HOS) compliance"],
    sections: [
      { title: "Architecture", content: "React Native mobile app with Go backend. PostGIS for geospatial queries. Vehicle telemetry ingested via MQTT broker into Kafka, processed by Go consumers, and stored in TimescaleDB. Firebase for push notifications and crash analytics." },
      { title: "Route Optimization", content: "Uses Google OR-Tools for vehicle routing problems (VRP). Considers time windows, vehicle capacity, driver hours, traffic conditions, and delivery priorities. Recalculates routes in real-time when conditions change." },
    ],
    timeline: "5 months (Mar 2026 – Aug 2026)",
    budget: "$75,000",
  },
  {
    id: "s4", project: "EduNova LMS", projectId: "p4", client: "EduNova", version: 1, status: "Draft", date: "2026-03-22",
    overview: "A modern learning management system with adaptive learning paths, gamification, real-time collaboration, and AI-assisted content creation for K-12 and higher education institutions.",
    techStack: ["Next.js 15", "TypeScript", "Python (FastAPI)", "PostgreSQL", "Redis", "OpenAI API", "WebRTC"],
    features: ["Adaptive learning paths based on student performance", "Real-time collaborative whiteboard", "AI-generated quizzes and study guides", "Gamification with badges and leaderboards", "Video lectures with timestamped notes", "Parent/guardian dashboard", "Plagiarism detection", "LTI 1.3 integration for third-party tools"],
    sections: [
      { title: "Architecture", content: "Next.js frontend with Python FastAPI backend for ML workloads. PostgreSQL for relational data, Redis for caching and real-time features. WebRTC for live collaboration and video. OpenAI API for content generation and adaptive assessment." },
    ],
    timeline: "6 months (Apr 2026 – Sep 2026)",
    budget: "$60,000",
  },
  {
    id: "s5", project: "NexGen Analytics Engine", projectId: "p5", client: "NexGen", version: 3, status: "Approved", date: "2026-02-28",
    overview: "A real-time analytics platform processing 2M+ events per day, providing interactive dashboards, custom report building, anomaly detection, and predictive forecasting for business intelligence teams.",
    techStack: ["React 19", "TypeScript", "Python", "Apache Kafka", "ClickHouse", "Redis", "TensorFlow", "Kubernetes"],
    features: ["Real-time event ingestion at 2M+ events/day", "Drag-and-drop dashboard builder", "Custom SQL query editor", "Automated anomaly detection with ML", "Predictive forecasting models", "Scheduled report generation (PDF/CSV)", "Role-based data access controls", "Embeddable analytics via iframe SDK"],
    sections: [
      { title: "Architecture", content: "Event-driven architecture with Kafka for ingestion. ClickHouse for OLAP queries with sub-second response times. Python ML services for anomaly detection and forecasting. React frontend with WebSocket for real-time dashboard updates." },
      { title: "Data Pipeline", content: "Events flow from client SDKs → API Gateway → Kafka → Stream processors → ClickHouse. Materialized views for pre-aggregated metrics. Cold storage tier in S3 for data older than 90 days." },
      { title: "ML Models", content: "Anomaly detection using Isolation Forest and LSTM autoencoders. Forecasting using Prophet for trend decomposition. Models retrained nightly on latest data. Served via TensorFlow Serving on Kubernetes." },
    ],
    timeline: "4 months (Nov 2025 – Feb 2026)",
    budget: "$95,000",
  },
  {
    id: "s6", project: "SkyBridge ML Pipeline", projectId: "p7", client: "SkyBridge AI", version: 2, status: "Under Review", date: "2026-03-25",
    overview: "An end-to-end machine learning pipeline platform enabling data scientists to build, train, deploy, and monitor ML models at scale with automated feature engineering, experiment tracking, and model versioning.",
    techStack: ["React 19", "Python", "FastAPI", "Kubernetes", "MLflow", "Apache Airflow", "PostgreSQL", "MinIO"],
    features: ["Visual pipeline builder with DAG editor", "Automated feature engineering", "Experiment tracking with MLflow integration", "One-click model deployment to Kubernetes", "A/B testing for model variants", "Model performance monitoring and drift detection", "GPU cluster management", "Dataset versioning with DVC"],
    sections: [
      { title: "Architecture", content: "React frontend with FastAPI backend. Apache Airflow for pipeline orchestration. MLflow for experiment tracking. Models deployed as Kubernetes services with autoscaling. MinIO for artifact storage (S3-compatible)." },
      { title: "Infrastructure", content: "Multi-tenant Kubernetes cluster with namespace isolation. GPU nodes (NVIDIA A100) for training workloads. Spot instances for cost optimization. Prometheus + Grafana for infrastructure monitoring." },
    ],
    timeline: "7 months (Dec 2025 – Jun 2026)",
    budget: "$120,000",
  },
  {
    id: "s7", project: "FitLife Tracker", projectId: "p9", client: "FitLife", version: 1, status: "Generated", date: "2026-03-10",
    overview: "A mobile fitness application with AI-powered workout recommendations, nutrition tracking, health insights, and social features for community engagement and accountability.",
    techStack: ["React Native", "TypeScript", "Node.js", "MongoDB", "TensorFlow Lite", "Firebase", "Apple HealthKit", "Google Fit"],
    features: ["AI workout recommendations based on goals and history", "Nutrition tracking with barcode scanner", "Health metrics dashboard (steps, heart rate, sleep)", "Social feed with workout sharing", "Challenge system for community engagement", "Wearable device integration (Apple Watch, Fitbit)", "Progress photos with body composition tracking", "Personalized meal plans"],
    sections: [
      { title: "Architecture", content: "React Native app with Node.js backend. MongoDB for user data and workout logs. TensorFlow Lite for on-device workout form analysis. Firebase for push notifications and real-time social features. HealthKit/Google Fit for health data integration." },
    ],
    timeline: "3 months (Jan 2026 – Apr 2026)",
    budget: "$25,000",
  },
  {
    id: "s8", project: "GreenPulse Monitor", projectId: "p10", client: "GreenPulse", version: 1, status: "Approved", date: "2026-03-01",
    overview: "An environmental monitoring platform for CleanTech companies to track carbon emissions, energy consumption, and sustainability KPIs across facilities with automated ESG reporting.",
    techStack: ["React 19", "TypeScript", "Go", "PostgreSQL", "TimescaleDB", "Grafana", "MQTT"],
    features: ["Real-time emissions monitoring per facility", "Energy consumption dashboards", "ESG report generation (GRI, SASB)", "Carbon offset tracking and verification", "IoT sensor data ingestion via MQTT", "Regulatory compliance alerts", "Supply chain emissions (Scope 3) calculator", "Sustainability goal tracking with milestones"],
    sections: [
      { title: "Architecture", content: "React frontend with Go backend. IoT sensor data ingested via MQTT into TimescaleDB for time-series storage. Grafana dashboards embedded for real-time monitoring. Automated ESG report generation using Go templates with PDF export." },
      { title: "Data Sources", content: "IoT sensors for real-time energy/emissions data. Utility API integrations for billing data. Supply chain data via CSV/API imports. Weather data for renewable energy forecasting." },
    ],
    timeline: "4 months (Dec 2025 – Mar 2026)",
    budget: "$40,000",
  },
];

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  projects: number;
  avatar: string;
  utilization: number;
}

export const team: TeamMember[] = [
  { id: "t1", name: "Alex Mercer", role: "Admin", email: "alex@neurodynecorp.com", projects: 5, avatar: "AM", utilization: 90 },
  { id: "t2", name: "Priya Sharma", role: "Project Manager", email: "priya@neurodynecorp.com", projects: 4, avatar: "PS", utilization: 85 },
  { id: "t3", name: "David Kim", role: "Developer", email: "david@neurodynecorp.com", projects: 3, avatar: "DK", utilization: 95 },
  { id: "t4", name: "Maria Santos", role: "Developer", email: "maria@neurodynecorp.com", projects: 3, avatar: "MS", utilization: 80 },
  { id: "t5", name: "James Wright", role: "Developer", email: "james@neurodynecorp.com", projects: 2, avatar: "JW", utilization: 70 },
  { id: "t6", name: "Aisha Patel", role: "Developer", email: "aisha@neurodynecorp.com", projects: 2, avatar: "AP", utilization: 75 },
  { id: "t7", name: "Carlos Diaz", role: "QA", email: "carlos@neurodynecorp.com", projects: 4, avatar: "CD", utilization: 88 },
  { id: "t8", name: "Lisa Wong", role: "Project Manager", email: "lisa@neurodynecorp.com", projects: 3, avatar: "LW", utilization: 82 },
];

// ── Chart data ────────────────────────────────────────────────────────────────

export const revenueTimeSeries = [
  { month: "Apr", revenue: 42000, costs: 28000, profit: 14000 },
  { month: "May", revenue: 55000, costs: 34000, profit: 21000 },
  { month: "Jun", revenue: 48000, costs: 31000, profit: 17000 },
  { month: "Jul", revenue: 62000, costs: 38000, profit: 24000 },
  { month: "Aug", revenue: 58000, costs: 35000, profit: 23000 },
  { month: "Sep", revenue: 71000, costs: 42000, profit: 29000 },
  { month: "Oct", revenue: 68000, costs: 40000, profit: 28000 },
  { month: "Nov", revenue: 82000, costs: 48000, profit: 34000 },
  { month: "Dec", revenue: 78000, costs: 45000, profit: 33000 },
  { month: "Jan", revenue: 95000, costs: 55000, profit: 40000 },
  { month: "Feb", revenue: 110000, costs: 62000, profit: 48000 },
  { month: "Mar", revenue: 125000, costs: 68000, profit: 57000 },
];

export const projectsByStatus = [
  { name: "In Progress", value: 4, color: "#F59E0B" },
  { name: "Completed", value: 3, color: "#10B981" },
  { name: "Review", value: 2, color: "#8B5CF6" },
  { name: "Planning", value: 2, color: "#94A3B8" },
  { name: "On Hold", value: 1, color: "#EF4444" },
];

export const projectsByType = [
  { name: "Web App", value: 5, color: "#6C63FF" },
  { name: "Mobile App", value: 3, color: "#00D4AA" },
  { name: "AI/ML", value: 3, color: "#8B85FF" },
  { name: "SaaS Platform", value: 1, color: "#F59E0B" },
  { name: "API Integration", value: 1, color: "#EF4444" },
];

export const clientAcquisition = [
  { month: "Apr", newClients: 1, churned: 0 },
  { month: "May", newClients: 0, churned: 0 },
  { month: "Jun", newClients: 2, churned: 0 },
  { month: "Jul", newClients: 1, churned: 0 },
  { month: "Aug", newClients: 0, churned: 1 },
  { month: "Sep", newClients: 1, churned: 0 },
  { month: "Oct", newClients: 2, churned: 0 },
  { month: "Nov", newClients: 1, churned: 0 },
  { month: "Dec", newClients: 1, churned: 0 },
  { month: "Jan", newClients: 2, churned: 0 },
  { month: "Feb", newClients: 1, churned: 0 },
  { month: "Mar", newClients: 3, churned: 1 },
];

export const taskCompletion = [
  { week: "W1", completed: 8, created: 12 },
  { week: "W2", completed: 11, created: 9 },
  { week: "W3", completed: 6, created: 10 },
  { week: "W4", completed: 14, created: 8 },
  { week: "W5", completed: 9, created: 11 },
  { week: "W6", completed: 12, created: 7 },
  { week: "W7", completed: 10, created: 13 },
  { week: "W8", completed: 15, created: 9 },
  { week: "W9", completed: 7, created: 12 },
  { week: "W10", completed: 13, created: 10 },
  { week: "W11", completed: 11, created: 8 },
  { week: "W12", completed: 16, created: 11 },
];

export const revenueByClient = [
  { client: "SkyBridge AI", revenue: 180000, color: "#6C63FF" },
  { client: "Apex Finance", revenue: 125000, color: "#00D4AA" },
  { client: "NexGen", revenue: 95000, color: "#8B85FF" },
  { client: "LogiTrack", revenue: 75000, color: "#F59E0B" },
  { client: "MedCore", revenue: 50000, color: "#EF4444" },
  { client: "GreenPulse", revenue: 40000, color: "#10B981" },
];

export const pipelineConversion = [
  { stage: "Lead", count: 8, rate: "100%" },
  { stage: "Review", count: 5, rate: "63%" },
  { stage: "Approved", count: 4, rate: "80%" },
  { stage: "Development", count: 4, rate: "100%" },
  { stage: "QA", count: 3, rate: "75%" },
  { stage: "Delivered", count: 3, rate: "100%" },
];

// ── Content Management ───────────────────────────────────────────────────────

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  status: "Published" | "Draft" | "Archived";
  author: string;
  date: string;
  readTime: string;
  color: string;
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

export const blogPosts: BlogPost[] = [
  { id: "bp1", title: "Building Scalable Microservices with Go and gRPC", excerpt: "A deep dive into hexagonal architecture patterns for production-grade Go microservices.", content: SAMPLE_MD, category: "Engineering", status: "Published", author: "Alex Mercer", date: "2026-03-20", readTime: "8 min", color: "#6C63FF" },
  { id: "bp2", title: "The Future of AI-Assisted Software Specification", excerpt: "How machine learning is transforming the way we capture and structure software requirements.", content: "", category: "AI/ML", status: "Published", author: "Alex Mercer", date: "2026-03-15", readTime: "6 min", color: "#00D4AA" },
  { id: "bp3", title: "React Router v7: What's New for Enterprise Apps", excerpt: "Exploring the latest features in React Router v7 and how they improve large-scale applications.", content: "", category: "Tutorial", status: "Published", author: "Priya Sharma", date: "2026-03-10", readTime: "5 min", color: "#8B85FF" },
  { id: "bp4", title: "Why We Chose MongoDB for Our Multi-Tenant Platform", excerpt: "The technical reasoning behind our database choice and how it scales with our architecture.", content: "", category: "Engineering", status: "Published", author: "David Kim", date: "2026-03-05", readTime: "7 min", color: "#33DDBB" },
  { id: "bp5", title: "Productizing Software Development: Lessons Learned", excerpt: "What we learned building a productized software engineering platform from scratch.", content: "", category: "Thought Leadership", status: "Published", author: "Alex Mercer", date: "2026-02-28", readTime: "10 min", color: "#6C63FF" },
  { id: "bp6", title: "Implementing Real-Time Features with Kafka and WebSockets", excerpt: "A practical guide to building real-time notification and messaging systems.", content: "", category: "Tutorial", status: "Published", author: "David Kim", date: "2026-02-20", readTime: "9 min", color: "#00D4AA" },
  { id: "bp7", title: "Edge Computing for IoT Applications", excerpt: "Bringing compute to the edge — patterns and pitfalls for latency-sensitive IoT workloads.", content: "", category: "Engineering", status: "Draft", author: "Maria Santos", date: "2026-03-28", readTime: "7 min", color: "#F59E0B" },
  { id: "bp8", title: "Design Systems at Scale", excerpt: "How we maintain consistency across three frontends with a shared design token layer.", content: "", category: "Tutorial", status: "Draft", author: "Priya Sharma", date: "2026-03-27", readTime: "6 min", color: "#8B5CF6" },
];

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  status: "Active" | "Hidden";
  date: string;
  avatarColor: string;
}

export const testimonials: Testimonial[] = [
  { id: "tm1", name: "Sarah Chen", role: "CTO", company: "FinanceFlow", content: "NeuroDyne Corp transformed our vague idea into a comprehensive specification in days. The structured process was exactly what we needed.", rating: 5, status: "Active", date: "2026-03-18", avatarColor: "#6C63FF" },
  { id: "tm2", name: "Marcus Johnson", role: "Founder", company: "HealthTrack", content: "The transparency and professionalism from spec to delivery was outstanding. We could track every milestone in real-time.", rating: 5, status: "Active", date: "2026-03-10", avatarColor: "#00D4AA" },
  { id: "tm3", name: "Elena Rodriguez", role: "VP Engineering", company: "LogiChain", content: "Their AI-powered specification engine caught requirements we hadn't even considered. Truly next-level engineering partner.", rating: 5, status: "Active", date: "2026-02-25", avatarColor: "#8B85FF" },
  { id: "tm4", name: "David Kim", role: "CEO", company: "NexGen Analytics", content: "From the initial questionnaire to the final deployment — every step was transparent and well-managed. Best vendor experience we've had.", rating: 4, status: "Active", date: "2026-02-15", avatarColor: "#F59E0B" },
  { id: "tm5", name: "Amara Okafor", role: "Product Lead", company: "GreenPulse", content: "The CleanTech sector needs partners who understand sustainability constraints. NeuroDyne delivered on time and on spec.", rating: 5, status: "Active", date: "2026-01-20", avatarColor: "#10B981" },
  { id: "tm6", name: "Li Wei", role: "Head of AI", company: "SkyBridge AI", content: "We needed a team that could handle complex ML pipelines at scale. NeuroDyne was the only firm that truly got it.", rating: 5, status: "Hidden", date: "2025-12-10", avatarColor: "#8B5CF6" },
];

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: "Active" | "Coming Soon" | "Inactive";
  projectCount: number;
  color: string;
}

export const services: Service[] = [
  { id: "sv1", title: "Custom Software", description: "Full-stack development tailored to your business workflows and growth trajectory.", icon: "code", status: "Active", projectCount: 5, color: "#6C63FF" },
  { id: "sv2", title: "Mobile Apps", description: "Native and cross-platform mobile experiences that delight users and drive engagement.", icon: "phone", status: "Active", projectCount: 3, color: "#00D4AA" },
  { id: "sv3", title: "AI / ML", description: "Intelligent systems that learn, automate, and unlock insights from your data.", icon: "psychology", status: "Active", projectCount: 3, color: "#8B85FF" },
  { id: "sv4", title: "Blockchain", description: "Smart contracts, tokenization, and decentralized platforms built for trust.", icon: "token", status: "Active", projectCount: 0, color: "#33DDBB" },
  { id: "sv5", title: "DevOps", description: "Cloud infrastructure, CI/CD pipelines, and monitoring that keeps your stack reliable.", icon: "cloud", status: "Active", projectCount: 2, color: "#6C63FF" },
  { id: "sv6", title: "Data Engineering", description: "ETL pipelines, data warehouses, and real-time analytics infrastructure.", icon: "storage", status: "Coming Soon", projectCount: 0, color: "#F59E0B" },
];

export interface CaseStudy {
  id: string;
  title: string;
  client: string;
  category: string;
  tags: string[];
  description: string;
  impact: string;
  status: "Published" | "Draft";
  date: string;
  color: string;
}

export const caseStudies: CaseStudy[] = [
  { id: "cs1", title: "FinanceFlow", client: "Apex Finance", category: "Fintech", tags: ["React", "Go", "AI"], description: "AI-powered financial analytics — 50K+ users, 3x faster reporting.", impact: "50K+ users", status: "Published", date: "2026-03-12", color: "#6C63FF" },
  { id: "cs2", title: "HealthTrack", client: "MedCore", category: "Healthcare", tags: ["React Native", "Node.js", "ML"], description: "HIPAA-compliant patient monitoring — 95% early detection rate.", impact: "95% detection rate", status: "Published", date: "2026-02-28", color: "#00D4AA" },
  { id: "cs3", title: "LogiChain", client: "LogiTrack", category: "Supply Chain", tags: ["Blockchain", "Go", "React"], description: "Blockchain supply chain transparency — 60% fraud reduction.", impact: "60% fraud reduction", status: "Published", date: "2026-02-10", color: "#8B85FF" },
  { id: "cs4", title: "NexGen Insights", client: "NexGen Analytics", category: "Analytics", tags: ["Python", "React", "Kafka"], description: "Real-time analytics dashboard processing 2M events/day.", impact: "2M events/day", status: "Draft", date: "2026-03-25", color: "#F59E0B" },
];

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  subject: string;
  projectType: string;
  message: string;
  status: "New" | "Read" | "Replied" | "Archived";
  date: string;
}

export const contactSubmissions: ContactSubmission[] = [
  { id: "ct1", name: "James Patterson", email: "james@retailmax.com", phone: "+1 555-0101", company: "RetailMax", subject: "E-Commerce Platform", projectType: "Web Application", message: "We need a scalable e-commerce platform to replace our legacy system. Looking for a team that can handle 100K+ SKUs and real-time inventory sync.", status: "New", date: "2026-03-28" },
  { id: "ct2", name: "Omar Hassan", email: "omar@smarthome.io", phone: "+1 555-0202", company: "SmartHome Inc", subject: "IoT Dashboard", projectType: "Web Application", message: "We're building a smart home management platform and need a dashboard for device monitoring and automation rules.", status: "New", date: "2026-03-27" },
  { id: "ct3", name: "Elena Rodriguez", email: "elena@edunova.com", phone: "+1 555-0303", company: "EduNova", subject: "Learning Management System", projectType: "Web Application", message: "Looking for a partner to build a modern LMS with adaptive learning paths, gamification, and real-time collaboration.", status: "Read", date: "2026-03-25" },
  { id: "ct4", name: "Nina Petrov", email: "nina@fitlife.app", phone: "+1 555-0404", company: "FitLife", subject: "Mobile Fitness Tracker", projectType: "Mobile App", message: "We want to add AI-powered workout recommendations and health insights to our existing fitness app.", status: "Replied", date: "2026-03-20" },
  { id: "ct5", name: "Sophie Martin", email: "sophie@dataviz.co", phone: "+1 555-0505", company: "DataViz", subject: "Analytics Dashboard Revamp", projectType: "AI / ML System", message: "Our current analytics tool is outdated. Need a modern, real-time dashboard with predictive analytics capabilities.", status: "Replied", date: "2026-03-15" },
  { id: "ct6", name: "Carlos Mendez", email: "carlos@proptech.lat", phone: "+1 555-0606", company: "PropTech LATAM", subject: "Property Management Platform", projectType: "Web Application", message: "Building a property management SaaS for the Latin American market. Need multi-tenant architecture with localization.", status: "Archived", date: "2026-02-28" },
  { id: "ct7", name: "Aisha Rahman", email: "aisha@greenearth.org", phone: "+1 555-0707", company: "Green Earth NGO", subject: "Impact Tracking Platform", projectType: "Web Application", message: "We need a platform to track and visualize our environmental impact metrics across 50+ projects globally.", status: "New", date: "2026-03-29" },
];
