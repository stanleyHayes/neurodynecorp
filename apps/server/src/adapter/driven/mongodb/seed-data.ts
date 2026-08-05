/**
 * Seed data for all collections.
 * Uses pre-generated MongoDB ObjectId hex strings so relationships are consistent.
 */

import { createHash } from "crypto";
import type { User } from "../../../domain/entity/user.js";
import type { Project } from "../../../domain/entity/project.js";
import type { Specification } from "../../../domain/entity/specification.js";
import type { Task, Sprint } from "../../../domain/entity/task.js";
import type { Invoice } from "../../../domain/entity/billing.js";
import type { Notification } from "../../../domain/entity/notification.js";
import type { Thread, Message } from "../../../domain/entity/message.js";
import type { QuestionnaireResponse } from "../../../domain/entity/questionnaire.js";
import type { RBACRole as Role } from "../../../domain/entity/role.js";
import { perm, RESOURCES, ACTIONS, type Permission } from "../../../domain/entity/permission.js";

// ── Pre-generated ObjectId hex strings ──────────────────────────────────────
// Generated once so foreign-key references are consistent across collections.

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
  return createHash("sha1").update(`neurodyne:core:${oidSeq}`).digest("hex").slice(0, 24);
}

export const IDS = {
  // Users
  founder: oid(),
  admin: oid(),
  pm1: oid(),
  pm2: oid(),
  dev1: oid(),
  dev2: oid(),
  dev3: oid(),
  qa1: oid(),
  client1: oid(),
  client2: oid(),
  client3: oid(),

  // Projects
  proj1: oid(),
  proj2: oid(),
  proj3: oid(),
  proj4: oid(),

  // Specifications
  spec1: oid(),
  spec2: oid(),

  // Sprints
  sprint1: oid(),
  sprint2: oid(),

  // Tasks
  task1: oid(),
  task2: oid(),
  task3: oid(),
  task4: oid(),
  task5: oid(),
  task6: oid(),
  task7: oid(),
  task8: oid(),

  // Invoices
  inv1: oid(),
  inv2: oid(),
  inv3: oid(),

  // Threads
  thread1: oid(),
  thread2: oid(),

  // Messages
  msg1: oid(),
  msg2: oid(),
  msg3: oid(),
  msg4: oid(),
  msg5: oid(),

  // Notifications
  notif1: oid(),
  notif2: oid(),
  notif3: oid(),
  notif4: oid(),
  notif5: oid(),
  notif6: oid(),

  // Questionnaire responses
  qr1: oid(),
  qr2: oid(),
};

// ── Role IDs ───────────────────────────────────────────────────────────────

export const ROLE_IDS = {
  admin: oid(),
  project_manager: oid(),
  developer: oid(),
  qa: oid(),
  client: oid(),
};

// ── Helper ──────────────────────────────────────────────────────────────────

function d(iso: string): Date {
  return new Date(iso);
}

/** All actions for a resource */
function allActions(resource: string): Permission[] {
  return ACTIONS.map((a) => `${resource}:${a}` as Permission);
}

/** All permissions for all resources */
function fullPermissions(): string[] {
  return RESOURCES.flatMap((r) => allActions(r));
}

// All passwords are bcrypt hash of "Password123!" (cost 10)
const PASSWORD_HASH =
  "$2a$10$2J4N8bUwDHvRcCHzvYlxueuQVIIfK/AL2jahstegQfoKnM2GWUt.e";

// ── Default role permission sets ──────────────────────────────────────────

const ADMIN_PERMISSIONS = fullPermissions();

const PM_PERMISSIONS = [
  ...allActions("dashboard"),
  ...allActions("pipeline"),
  ...allActions("analytics"),
  ...allActions("clients"),
  ...allActions("projects"),
  ...allActions("specifications"),
  ...allActions("tasks"),
  ...allActions("team"),
  ...allActions("messages"),
  ...allActions("finance"),
  ...allActions("blog"),
  ...allActions("portfolio"),
  ...allActions("testimonials"),
  ...allActions("services"),
  ...allActions("contact_submissions"),
  ...allActions("tickets"),
  perm("settings", "read"),
  perm("settings", "update"),
  perm("roles", "read"),
];

const DEVELOPER_PERMISSIONS = [
  perm("dashboard", "read"),
  perm("projects", "read"),
  perm("specifications", "read"),
  ...allActions("tasks"),
  perm("messages", "read"),
  perm("messages", "create"),
  perm("team", "read"),
  perm("settings", "read"),
  perm("settings", "update"),
];

const QA_PERMISSIONS = [
  perm("dashboard", "read"),
  perm("projects", "read"),
  perm("specifications", "read"),
  perm("tasks", "read"),
  perm("tasks", "create"),
  perm("tasks", "update"),
  perm("messages", "read"),
  perm("messages", "create"),
  perm("team", "read"),
  perm("settings", "read"),
  perm("settings", "update"),
];

const CLIENT_PERMISSIONS: string[] = [
  perm("dashboard", "read"),
  perm("projects", "read"),
  // Clients approve/reject specs (README + portal); read required by weight rules.
  perm("specifications", "read"),
  perm("specifications", "update"),
  perm("messages", "read"),
  perm("messages", "create"),
  perm("billing", "read"),
  perm("notifications", "read"),
  perm("documents", "read"),
  perm("settings", "read"),
  perm("settings", "update"),
];

// ── Roles ──────────────────────────────────────────────────────────────────

export const roles: Role[] = [
  {
    id: ROLE_IDS.admin,
    name: "admin",
    description: "Full system access with all permissions",
    permissions: ADMIN_PERMISSIONS,
    isSystem: true,
    createdAt: d("2025-01-01T00:00:00Z"),
    updatedAt: d("2025-01-01T00:00:00Z"),
  },
  {
    id: ROLE_IDS.project_manager,
    name: "project_manager",
    description: "Manages projects, clients, team, and content",
    permissions: PM_PERMISSIONS,
    isSystem: true,
    createdAt: d("2025-01-01T00:00:00Z"),
    updatedAt: d("2025-01-01T00:00:00Z"),
  },
  {
    id: ROLE_IDS.developer,
    name: "developer",
    description: "Develops features, manages tasks, views project info",
    permissions: DEVELOPER_PERMISSIONS,
    isSystem: true,
    createdAt: d("2025-01-01T00:00:00Z"),
    updatedAt: d("2025-01-01T00:00:00Z"),
  },
  {
    id: ROLE_IDS.qa,
    name: "qa",
    description: "Quality assurance, manages tasks and bug reports",
    permissions: QA_PERMISSIONS,
    isSystem: true,
    createdAt: d("2025-01-01T00:00:00Z"),
    updatedAt: d("2025-01-01T00:00:00Z"),
  },
  {
    id: ROLE_IDS.client,
    name: "client",
    description: "External client with limited portal access",
    permissions: CLIENT_PERMISSIONS,
    isSystem: true,
    createdAt: d("2025-01-01T00:00:00Z"),
    updatedAt: d("2025-01-01T00:00:00Z"),
  },
];

// ── Users ───────────────────────────────────────────────────────────────────

export const users: User[] = [
  {
    id: IDS.founder,
    email: "stanley@neurodynecorp.com",
    passwordHash: PASSWORD_HASH,
    firstName: "Stanley",
    lastName: "Hayford",
    role: "admin",
    roleId: ROLE_IDS.admin,
    permissions: ADMIN_PERMISSIONS,
    phone: "+233-55-000-0001",
    company: "NeuroDyne Corp",
    isActive: true,
    lastLoginAt: d("2026-03-28T15:30:00Z"),
    createdAt: d("2025-01-01T09:00:00Z"),
    updatedAt: d("2026-03-28T15:30:00Z"),
  },
  {
    id: IDS.admin,
    email: "admin@neurodynecorp.com",
    passwordHash: PASSWORD_HASH,
    firstName: "Ayo",
    lastName: "Adeyemi",
    role: "admin",
    roleId: ROLE_IDS.admin,
    permissions: ADMIN_PERMISSIONS,
    phone: "+1-555-0100",
    isActive: true,
    lastLoginAt: d("2026-03-28T14:00:00Z"),
    createdAt: d("2025-01-10T09:00:00Z"),
    updatedAt: d("2026-03-28T14:00:00Z"),
  },
  {
    id: IDS.pm1,
    email: "sarah.chen@neurodynecorp.com",
    passwordHash: PASSWORD_HASH,
    firstName: "Sarah",
    lastName: "Chen",
    role: "project_manager",
    roleId: ROLE_IDS.project_manager,
    permissions: PM_PERMISSIONS,
    phone: "+1-555-0101",
    isActive: true,
    lastLoginAt: d("2026-03-28T10:30:00Z"),
    createdAt: d("2025-02-15T09:00:00Z"),
    updatedAt: d("2026-03-28T10:30:00Z"),
  },
  {
    id: IDS.pm2,
    email: "james.okafor@neurodynecorp.com",
    passwordHash: PASSWORD_HASH,
    firstName: "James",
    lastName: "Okafor",
    role: "project_manager",
    roleId: ROLE_IDS.project_manager,
    permissions: PM_PERMISSIONS,
    phone: "+1-555-0102",
    isActive: true,
    createdAt: d("2025-03-01T09:00:00Z"),
    updatedAt: d("2025-03-01T09:00:00Z"),
  },
  {
    id: IDS.dev1,
    email: "maria.gonzalez@neurodynecorp.com",
    passwordHash: PASSWORD_HASH,
    firstName: "Maria",
    lastName: "Gonzalez",
    role: "developer",
    roleId: ROLE_IDS.developer,
    permissions: DEVELOPER_PERMISSIONS,
    phone: "+1-555-0201",
    isActive: true,
    lastLoginAt: d("2026-03-28T16:00:00Z"),
    createdAt: d("2025-02-20T09:00:00Z"),
    updatedAt: d("2026-03-28T16:00:00Z"),
  },
  {
    id: IDS.dev2,
    email: "kwame.mensah@neurodynecorp.com",
    passwordHash: PASSWORD_HASH,
    firstName: "Kwame",
    lastName: "Mensah",
    role: "developer",
    roleId: ROLE_IDS.developer,
    permissions: DEVELOPER_PERMISSIONS,
    phone: "+1-555-0202",
    isActive: true,
    lastLoginAt: d("2026-03-27T18:00:00Z"),
    createdAt: d("2025-04-01T09:00:00Z"),
    updatedAt: d("2026-03-27T18:00:00Z"),
  },
  {
    id: IDS.dev3,
    email: "yuki.tanaka@neurodynecorp.com",
    passwordHash: PASSWORD_HASH,
    firstName: "Yuki",
    lastName: "Tanaka",
    role: "developer",
    roleId: ROLE_IDS.developer,
    permissions: DEVELOPER_PERMISSIONS,
    isActive: true,
    createdAt: d("2025-05-10T09:00:00Z"),
    updatedAt: d("2025-05-10T09:00:00Z"),
  },
  {
    id: IDS.qa1,
    email: "priya.sharma@neurodynecorp.com",
    passwordHash: PASSWORD_HASH,
    firstName: "Priya",
    lastName: "Sharma",
    role: "qa",
    roleId: ROLE_IDS.qa,
    permissions: QA_PERMISSIONS,
    phone: "+1-555-0301",
    isActive: true,
    lastLoginAt: d("2026-03-28T12:00:00Z"),
    createdAt: d("2025-03-15T09:00:00Z"),
    updatedAt: d("2026-03-28T12:00:00Z"),
  },
  {
    id: IDS.client1,
    email: "david.kim@acmecorp.com",
    passwordHash: PASSWORD_HASH,
    firstName: "David",
    lastName: "Kim",
    role: "client",
    roleId: ROLE_IDS.client,
    permissions: CLIENT_PERMISSIONS,
    company: "Acme Corp",
    phone: "+1-555-0401",
    isActive: true,
    lastLoginAt: d("2026-03-27T09:00:00Z"),
    createdAt: d("2025-06-01T09:00:00Z"),
    updatedAt: d("2026-03-27T09:00:00Z"),
  },
  {
    id: IDS.client2,
    email: "fatima.hassan@greenleaf.io",
    passwordHash: PASSWORD_HASH,
    firstName: "Fatima",
    lastName: "Hassan",
    role: "client",
    roleId: ROLE_IDS.client,
    permissions: CLIENT_PERMISSIONS,
    company: "GreenLeaf Technologies",
    phone: "+1-555-0402",
    isActive: true,
    lastLoginAt: d("2026-03-26T11:00:00Z"),
    createdAt: d("2025-07-15T09:00:00Z"),
    updatedAt: d("2026-03-26T11:00:00Z"),
  },
  {
    id: IDS.client3,
    email: "lucas.berg@nordicsaas.com",
    passwordHash: PASSWORD_HASH,
    firstName: "Lucas",
    lastName: "Berg",
    role: "client",
    roleId: ROLE_IDS.client,
    permissions: CLIENT_PERMISSIONS,
    company: "Nordic SaaS",
    phone: "+1-555-0403",
    isActive: true,
    createdAt: d("2025-09-01T09:00:00Z"),
    updatedAt: d("2025-09-01T09:00:00Z"),
  },
];

// ── Projects ────────────────────────────────────────────────────────────────

export const projects: Project[] = [
  // The four placeholder client projects (Acme Logistics, GreenLeaf, Nordic
  // SaaS, Acme Inventory) were removed — the portfolio holds the real work.
  // Their ids live on: seed-portfolio pins them onto real projects, so the
  // specifications, sprints, tasks, invoices, threads, messages and
  // notifications below stay attached to something real.
];

// ── Specifications ──────────────────────────────────────────────────────────

export const specifications: Specification[] = [
  {
    id: IDS.spec1,
    projectId: IDS.proj1,
    status: "approved",
    version: 2,
    overview:
      "The Acme Logistics Platform is a cloud-native web application providing real-time fleet management, intelligent route optimization, and comprehensive delivery analytics. The system integrates GPS tracking, traffic data, and machine learning to minimize delivery times and operational costs.",
    objectives: [
      "Reduce average delivery time by 20% through route optimization",
      "Provide real-time visibility into fleet location and status",
      "Automate dispatch and delivery assignment workflows",
      "Generate actionable operational insights through analytics dashboards",
    ],
    featureBreakdown: [
      {
        id: oid(),
        name: "Real-time Fleet Tracking",
        description: "WebSocket-driven live map with vehicle positions, status updates, and geofencing alerts",
        acceptanceCriteria: [
          "Vehicle positions update every 5 seconds on the map",
          "Geofence entry/exit triggers configurable alerts",
          "Historical route playback available for last 30 days",
        ],
        priority: "critical",
        estimatedEffort: "4 weeks",
      },
      {
        id: oid(),
        name: "Route Optimization Engine",
        description: "ML-based route planning considering traffic, weather, time windows, and vehicle capacity",
        acceptanceCriteria: [
          "Generates optimized routes within 3 seconds for up to 100 stops",
          "Accounts for vehicle capacity constraints",
          "Provides alternative route suggestions on disruption",
        ],
        priority: "high",
        estimatedEffort: "6 weeks",
      },
    ],
    userRolesPermissions: [
      {
        role: "Admin",
        permissions: ["manage_users", "manage_fleet", "view_analytics", "manage_settings"],
        description: "Full system access including user and fleet management",
      },
      {
        role: "Dispatcher",
        permissions: ["view_fleet", "manage_routes", "assign_drivers", "view_analytics"],
        description: "Manages daily routing and driver assignments",
      },
      {
        role: "Driver",
        permissions: ["view_assigned_route", "update_delivery_status", "report_issues"],
        description: "Mobile-only access to assigned routes and delivery updates",
      },
    ],
    technicalArchitecture: {
      frontend: "Next.js 15 with React Server Components, Mapbox GL for maps, TailwindCSS",
      backend: "Node.js/Express with TypeScript, hexagonal architecture",
      database: "MongoDB for primary data, Redis for caching and real-time state",
      infrastructure: "AWS ECS Fargate, CloudFront CDN, Route 53, MongoDB Atlas",
      notes: [
        "WebSocket connections through API Gateway for real-time updates",
        "Kafka for event sourcing of vehicle telemetry data",
      ],
    },
    integrationReqs: [
      {
        name: "Google Maps Platform",
        type: "External API",
        description: "Geocoding, directions, and traffic data",
        apiEndpoints: ["Directions API", "Geocoding API", "Roads API"],
        authMethod: "API Key",
      },
      {
        name: "Twilio",
        type: "External API",
        description: "SMS notifications for delivery updates",
        apiEndpoints: ["Messages API"],
        authMethod: "API Key + Auth Token",
      },
    ],
    timelineEstimate: {
      totalWeeks: 26,
      phases: [
        {
          phase: "Foundation",
          description: "Project setup, auth, core API, and database schema",
          durationWeeks: 4,
          dependencies: [],
        },
        {
          phase: "Fleet Tracking",
          description: "GPS integration, real-time map, WebSocket infrastructure",
          durationWeeks: 6,
          dependencies: ["Foundation"],
        },
        {
          phase: "Route Optimization",
          description: "ML model development, route planning engine",
          durationWeeks: 8,
          dependencies: ["Fleet Tracking"],
        },
        {
          phase: "Analytics & Polish",
          description: "Dashboards, reporting, UX refinement",
          durationWeeks: 4,
          dependencies: ["Fleet Tracking"],
        },
        {
          phase: "QA & Launch",
          description: "Integration testing, load testing, deployment",
          durationWeeks: 4,
          dependencies: ["Route Optimization", "Analytics & Polish"],
        },
      ],
    },
    costEstimate: {
      total: 187500,
      currency: "USD",
      breakdown: [
        { category: "Development", description: "Full-stack engineering (3 developers)", amount: 135000, currency: "USD" },
        { category: "Design", description: "UI/UX design and prototyping", amount: 22500, currency: "USD" },
        { category: "Infrastructure", description: "Cloud hosting and third-party APIs (6 months)", amount: 15000, currency: "USD" },
        { category: "QA", description: "Quality assurance and testing", amount: 15000, currency: "USD" },
      ],
    },
    assumptions: [
      "Client will provide access to existing fleet GPS hardware APIs",
      "Maximum fleet size of 500 vehicles at launch",
      "English-only UI for initial release",
    ],
    risks: [
      {
        id: oid(),
        description: "GPS hardware API integration may vary across different vehicle manufacturers",
        likelihood: "medium",
        impact: "high",
        mitigation: "Build an adapter layer to normalize GPS data from multiple hardware sources",
      },
      {
        id: oid(),
        description: "Route optimization accuracy depends on quality of traffic data",
        likelihood: "low",
        impact: "medium",
        mitigation: "Use multiple traffic data providers with fallback strategy",
      },
    ],
    internalNotes: [
      {
        id: oid(),
        authorId: IDS.pm1,
        content: "Client is flexible on timeline but firm on the $250k budget ceiling. Prioritize core fleet tracking over advanced analytics if scope needs trimming.",
        createdAt: d("2026-01-10T10:00:00Z"),
      },
    ],
    generatedBy: IDS.admin,
    approvedBy: IDS.client1,
    approvedAt: d("2026-01-12T15:00:00Z"),
    createdAt: d("2026-01-05T09:00:00Z"),
    updatedAt: d("2026-01-12T15:00:00Z"),
  },
  {
    id: IDS.spec2,
    projectId: IDS.proj2,
    status: "draft",
    version: 1,
    overview:
      "A cross-platform mobile application enabling organizations to track, measure, and report on their environmental sustainability metrics and ESG compliance.",
    objectives: [
      "Automate carbon footprint calculations across all emission scopes",
      "Streamline ESG reporting workflows for compliance teams",
      "Provide actionable insights to reduce organizational environmental impact",
    ],
    featureBreakdown: [],
    userRolesPermissions: [],
    technicalArchitecture: {
      frontend: "React Native with Expo",
      backend: "Go microservices",
      database: "MongoDB with TimescaleDB for metrics",
      infrastructure: "GCP Cloud Run, Firebase for push notifications",
      notes: [],
    },
    integrationReqs: [],
    timelineEstimate: { totalWeeks: 22, phases: [] },
    costEstimate: { total: 0, currency: "USD", breakdown: [] },
    assumptions: [],
    risks: [],
    internalNotes: [],
    createdAt: d("2026-03-18T09:00:00Z"),
    updatedAt: d("2026-03-18T09:00:00Z"),
  },
];

// ── Sprints ─────────────────────────────────────────────────────────────────

export const sprints: Sprint[] = [
  {
    id: IDS.sprint1,
    projectId: IDS.proj1,
    name: "Sprint 5 – Fleet Map UI",
    goal: "Implement the interactive fleet map with live vehicle markers and basic geofencing",
    startDate: d("2026-03-17T00:00:00Z"),
    endDate: d("2026-03-31T00:00:00Z"),
    status: "active",
    createdAt: d("2026-03-16T09:00:00Z"),
    updatedAt: d("2026-03-17T09:00:00Z"),
  },
  {
    id: IDS.sprint2,
    projectId: IDS.proj1,
    name: "Sprint 6 – GPS Integration",
    goal: "Connect vehicle GPS hardware APIs and normalize telemetry data pipeline",
    startDate: d("2026-03-31T00:00:00Z"),
    endDate: d("2026-04-14T00:00:00Z"),
    status: "planning",
    createdAt: d("2026-03-25T09:00:00Z"),
    updatedAt: d("2026-03-25T09:00:00Z"),
  },
];

// ── Tasks ───────────────────────────────────────────────────────────────────

export const tasks: Task[] = [
  {
    id: IDS.task1,
    projectId: IDS.proj1,
    sprintId: IDS.sprint1,
    title: "Implement Mapbox GL map component",
    description: "Create the base map component with satellite/street toggle, zoom controls, and dark mode support",
    status: "done",
    priority: "critical",
    assigneeId: IDS.dev1,
    reporterId: IDS.pm1,
    labels: ["frontend", "map"],
    storyPoints: 5,
    completedAt: d("2026-03-20T16:00:00Z"),
    createdAt: d("2026-03-17T09:00:00Z"),
    updatedAt: d("2026-03-20T16:00:00Z"),
  },
  {
    id: IDS.task2,
    projectId: IDS.proj1,
    sprintId: IDS.sprint1,
    title: "Add vehicle marker layer with real-time updates",
    description: "WebSocket-driven vehicle markers on the map that update position every 5 seconds. Include status coloring (green=active, yellow=idle, red=issue).",
    status: "in_progress",
    priority: "critical",
    assigneeId: IDS.dev1,
    reporterId: IDS.pm1,
    labels: ["frontend", "map", "websocket"],
    storyPoints: 8,
    createdAt: d("2026-03-17T09:00:00Z"),
    updatedAt: d("2026-03-28T10:00:00Z"),
  },
  {
    id: IDS.task3,
    projectId: IDS.proj1,
    sprintId: IDS.sprint1,
    title: "Build geofence CRUD API",
    description: "REST endpoints for creating, updating, and deleting geofence zones. Store as GeoJSON polygons in MongoDB.",
    status: "in_review",
    priority: "high",
    assigneeId: IDS.dev2,
    reporterId: IDS.pm1,
    labels: ["backend", "api", "geofence"],
    storyPoints: 5,
    createdAt: d("2026-03-17T09:00:00Z"),
    updatedAt: d("2026-03-27T14:00:00Z"),
  },
  {
    id: IDS.task4,
    projectId: IDS.proj1,
    sprintId: IDS.sprint1,
    title: "Geofence rendering on map",
    description: "Render geofence polygons on the map with edit handles for resizing. Show entry/exit event indicators.",
    status: "todo",
    priority: "high",
    assigneeId: IDS.dev1,
    reporterId: IDS.pm1,
    labels: ["frontend", "map", "geofence"],
    storyPoints: 5,
    dueDate: d("2026-03-31T00:00:00Z"),
    createdAt: d("2026-03-17T09:00:00Z"),
    updatedAt: d("2026-03-17T09:00:00Z"),
  },
  {
    id: IDS.task5,
    projectId: IDS.proj1,
    sprintId: IDS.sprint1,
    title: "Write integration tests for fleet tracking WebSocket",
    description: "Test WebSocket connection lifecycle, vehicle position broadcast, and reconnection handling",
    status: "todo",
    priority: "medium",
    assigneeId: IDS.qa1,
    reporterId: IDS.pm1,
    labels: ["testing", "websocket"],
    storyPoints: 3,
    dueDate: d("2026-03-31T00:00:00Z"),
    createdAt: d("2026-03-17T09:00:00Z"),
    updatedAt: d("2026-03-17T09:00:00Z"),
  },
  // Sprint 2 backlog tasks
  {
    id: IDS.task6,
    projectId: IDS.proj1,
    sprintId: IDS.sprint2,
    title: "Build GPS hardware adapter layer",
    description: "Create adapter interfaces for normalizing GPS data from different vehicle hardware manufacturers (Samsara, Geotab, CalAmp)",
    status: "backlog",
    priority: "critical",
    assigneeId: IDS.dev2,
    reporterId: IDS.pm1,
    labels: ["backend", "integration", "gps"],
    storyPoints: 8,
    createdAt: d("2026-03-25T09:00:00Z"),
    updatedAt: d("2026-03-25T09:00:00Z"),
  },
  {
    id: IDS.task7,
    projectId: IDS.proj1,
    sprintId: IDS.sprint2,
    title: "Implement telemetry data pipeline",
    description: "Kafka consumer for vehicle telemetry events with MongoDB persistence and Redis caching for latest positions",
    status: "backlog",
    priority: "high",
    assigneeId: IDS.dev2,
    reporterId: IDS.pm1,
    labels: ["backend", "kafka", "data-pipeline"],
    storyPoints: 8,
    createdAt: d("2026-03-25T09:00:00Z"),
    updatedAt: d("2026-03-25T09:00:00Z"),
  },
  // Unassigned backlog
  {
    id: IDS.task8,
    projectId: IDS.proj1,
    title: "Design analytics dashboard wireframes",
    description: "Create wireframes for the operational analytics dashboard showing delivery KPIs, fleet utilization, and cost metrics",
    status: "backlog",
    priority: "low",
    reporterId: IDS.pm1,
    labels: ["design", "analytics"],
    storyPoints: 3,
    createdAt: d("2026-03-20T09:00:00Z"),
    updatedAt: d("2026-03-20T09:00:00Z"),
  },
];

// ── Invoices ────────────────────────────────────────────────────────────────

export const invoices: Invoice[] = [
  {
    id: IDS.inv1,
    projectId: IDS.proj1,
    clientId: IDS.client1,
    invoiceNumber: "INV-2026-001",
    status: "paid",
    lineItems: [
      { id: oid(), description: "Foundation Phase – Backend & Auth (Milestone 1)", quantity: 1, unitPrice: 45000, amount: 45000 },
    ],
    subtotal: 45000,
    tax: 0,
    total: 45000,
    currency: "USD",
    dueDate: d("2026-03-15T00:00:00Z"),
    paidAt: d("2026-03-10T14:30:00Z"),
    paymentProvider: "stripe",
    paymentReference: "pi_3abc123def456",
    createdAt: d("2026-02-28T09:00:00Z"),
    updatedAt: d("2026-03-10T14:30:00Z"),
  },
  {
    id: IDS.inv2,
    projectId: IDS.proj1,
    clientId: IDS.client1,
    invoiceNumber: "INV-2026-002",
    status: "sent",
    lineItems: [
      { id: oid(), description: "Fleet Tracking Module – Development (Milestone 2, partial)", quantity: 1, unitPrice: 30000, amount: 30000 },
      { id: oid(), description: "Infrastructure & third-party API costs (Q1)", quantity: 1, unitPrice: 5000, amount: 5000 },
    ],
    subtotal: 35000,
    tax: 0,
    total: 35000,
    currency: "USD",
    dueDate: d("2026-04-15T00:00:00Z"),
    createdAt: d("2026-03-28T09:00:00Z"),
    updatedAt: d("2026-03-28T09:00:00Z"),
  },
  {
    id: IDS.inv3,
    projectId: IDS.proj2,
    clientId: IDS.client2,
    invoiceNumber: "INV-2026-003",
    status: "draft",
    lineItems: [
      { id: oid(), description: "Project kickoff and discovery phase", quantity: 1, unitPrice: 15000, amount: 15000 },
    ],
    subtotal: 15000,
    tax: 0,
    total: 15000,
    currency: "USD",
    dueDate: d("2026-04-30T00:00:00Z"),
    createdAt: d("2026-03-25T09:00:00Z"),
    updatedAt: d("2026-03-25T09:00:00Z"),
  },
];

// ── Threads & Messages ──────────────────────────────────────────────────────

export const threads: Thread[] = [
  {
    id: IDS.thread1,
    projectId: IDS.proj1,
    title: "Fleet map UX feedback",
    participantIds: [IDS.pm1, IDS.dev1, IDS.client1],
    lastMessageAt: d("2026-03-28T11:15:00Z"),
    createdAt: d("2026-03-22T09:00:00Z"),
    updatedAt: d("2026-03-28T11:15:00Z"),
  },
  {
    id: IDS.thread2,
    projectId: IDS.proj1,
    title: "GPS hardware integration questions",
    participantIds: [IDS.pm1, IDS.dev2, IDS.client1],
    lastMessageAt: d("2026-03-27T16:45:00Z"),
    createdAt: d("2026-03-25T10:00:00Z"),
    updatedAt: d("2026-03-27T16:45:00Z"),
  },
];

export const messages: Message[] = [
  {
    id: IDS.msg1,
    threadId: IDS.thread1,
    senderId: IDS.client1,
    content: "The map looks great so far! Can we add a search bar to quickly locate a specific vehicle by ID or driver name?",
    attachments: [],
    readBy: [IDS.client1, IDS.pm1, IDS.dev1],
    createdAt: d("2026-03-22T09:30:00Z"),
    updatedAt: d("2026-03-22T09:30:00Z"),
  },
  {
    id: IDS.msg2,
    threadId: IDS.thread1,
    senderId: IDS.pm1,
    content: "Good idea, David. @Maria – can we add a vehicle search to the map header? Should be a quick win.",
    attachments: [],
    readBy: [IDS.pm1, IDS.dev1],
    createdAt: d("2026-03-22T10:00:00Z"),
    updatedAt: d("2026-03-22T10:00:00Z"),
  },
  {
    id: IDS.msg3,
    threadId: IDS.thread1,
    senderId: IDS.dev1,
    content: "Sure – I'll add a search/filter component. Will have it in the next push, probably by Thursday.",
    attachments: [],
    readBy: [IDS.dev1, IDS.pm1],
    createdAt: d("2026-03-28T11:15:00Z"),
    updatedAt: d("2026-03-28T11:15:00Z"),
  },
  {
    id: IDS.msg4,
    threadId: IDS.thread2,
    senderId: IDS.dev2,
    content: "David – does your fleet use Samsara or Geotab for GPS tracking? We need to know which hardware APIs to integrate first.",
    attachments: [],
    readBy: [IDS.dev2, IDS.pm1, IDS.client1],
    createdAt: d("2026-03-25T10:30:00Z"),
    updatedAt: d("2026-03-25T10:30:00Z"),
  },
  {
    id: IDS.msg5,
    threadId: IDS.thread2,
    senderId: IDS.client1,
    content: "We primarily use Samsara for the main fleet (about 300 vehicles) and Geotab for the newer vans (around 50). Would be great to support both from day one.",
    attachments: [],
    readBy: [IDS.client1, IDS.dev2],
    createdAt: d("2026-03-27T16:45:00Z"),
    updatedAt: d("2026-03-27T16:45:00Z"),
  },
];

// ── Notifications ───────────────────────────────────────────────────────────

export const notifications: Notification[] = [
  {
    id: IDS.notif1,
    userId: IDS.client1,
    type: "invoice_sent",
    title: "New Invoice",
    message: "Invoice INV-2026-002 for $35,000 has been sent for the Acme Logistics Platform.",
    resourceId: IDS.inv2,
    resourceType: "invoice",
    read: false,
    createdAt: d("2026-03-28T09:00:00Z"),
  },
  {
    id: IDS.notif2,
    userId: IDS.dev1,
    type: "task_assigned",
    title: "New Task Assigned",
    message: "You have been assigned 'Add vehicle marker layer with real-time updates' on Acme Logistics Platform.",
    resourceId: IDS.task2,
    resourceType: "task",
    read: true,
    readAt: d("2026-03-17T09:30:00Z"),
    createdAt: d("2026-03-17T09:05:00Z"),
  },
  {
    id: IDS.notif3,
    userId: IDS.pm1,
    type: "task_completed",
    title: "Task Completed",
    message: "Maria Gonzalez completed 'Implement Mapbox GL map component'.",
    resourceId: IDS.task1,
    resourceType: "task",
    read: true,
    readAt: d("2026-03-20T17:00:00Z"),
    createdAt: d("2026-03-20T16:00:00Z"),
  },
  {
    id: IDS.notif4,
    userId: IDS.pm1,
    type: "message_received",
    title: "New Message",
    message: "David Kim posted in 'Fleet map UX feedback': The map looks great so far!",
    resourceId: IDS.thread1,
    resourceType: "thread",
    read: true,
    readAt: d("2026-03-22T09:45:00Z"),
    createdAt: d("2026-03-22T09:30:00Z"),
  },
  {
    id: IDS.notif5,
    userId: IDS.client2,
    type: "project_update",
    title: "Project Approved",
    message: "Your project 'GreenLeaf Sustainability Tracker' has been approved and is ready to begin development.",
    resourceId: IDS.proj2,
    resourceType: "project",
    read: false,
    createdAt: d("2026-03-20T09:00:00Z"),
  },
  {
    id: IDS.notif6,
    userId: IDS.admin,
    type: "system",
    title: "New Lead",
    message: "Nordic SaaS has submitted a new project inquiry: 'Nordic SaaS AI Chatbot'.",
    resourceId: IDS.proj3,
    resourceType: "project",
    read: true,
    readAt: d("2026-03-15T10:00:00Z"),
    createdAt: d("2026-03-15T09:05:00Z"),
  },
];

// ── Questionnaire Responses ─────────────────────────────────────────────────

export const questionnaireResponses: QuestionnaireResponse[] = [
  {
    id: IDS.qr1,
    projectId: IDS.proj1,
    respondentId: IDS.client1,
    answers: [
      { questionId: "q1", value: ["Web App"] },
      { questionId: "q2", value: "We need a logistics platform to track our delivery fleet in real-time, optimize routes, and provide analytics on delivery performance." },
      { questionId: "q3", value: "Admin, Dispatcher, Driver, Warehouse Manager" },
      { questionId: "q4", value: "Google Maps for routing, Twilio for SMS notifications to customers, Stripe for billing" },
      { questionId: "q5", value: "Clean, modern dashboard similar to Samsara's fleet management UI" },
      { questionId: "q6", value: true },
      { questionId: "q_web_auth", value: "Email/Password" },
      { questionId: "q_web_realtime", value: true },
      { questionId: "q_budget", value: "$100,000 - $250,000" },
      { questionId: "q_timeline", value: "4-6 months" },
      { questionId: "q_urgency", value: "Moderate - within the quarter" },
    ],
    completedAt: d("2025-12-01T10:30:00Z"),
    createdAt: d("2025-12-01T09:00:00Z"),
    updatedAt: d("2025-12-01T10:30:00Z"),
  },
  {
    id: IDS.qr2,
    projectId: IDS.proj3,
    respondentId: IDS.client3,
    answers: [
      { questionId: "q1", value: ["AI System", "Web App"] },
      { questionId: "q2", value: "We want an AI-powered chatbot for our customer support that can handle queries in multiple Nordic languages and escalate to human agents when needed." },
      { questionId: "q3", value: "Admin, Support Agent, Customer" },
      { questionId: "q4", value: "Zendesk for ticketing, Slack for internal notifications, OpenAI for language models" },
      { questionId: "q5", value: "Minimalist Scandinavian design, similar to Intercom's chat widget" },
      { questionId: "q6", value: false },
      { questionId: "q_ai_type", value: "NLP" },
      { questionId: "q_ai_dataset", value: true },
      { questionId: "q_ai_training", value: true },
      { questionId: "q_web_auth", value: "SSO/SAML" },
      { questionId: "q_web_realtime", value: true },
      { questionId: "q_budget", value: "$50,000 - $100,000" },
      { questionId: "q_timeline", value: "4-6 months" },
      { questionId: "q_urgency", value: "Not urgent - flexible timeline" },
    ],
    completedAt: d("2026-03-15T11:00:00Z"),
    createdAt: d("2026-03-15T09:30:00Z"),
    updatedAt: d("2026-03-15T11:00:00Z"),
  },
];
