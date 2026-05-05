import { ObjectId } from "mongodb";

export type SpecStatus =
  | "draft"
  | "generated"
  | "reviewed"
  | "approved"
  | "rejected";

export interface FeatureSpec {
  id: string;
  name: string;
  description: string;
  acceptanceCriteria: string[];
  priority: "low" | "medium" | "high" | "critical";
  estimatedEffort: string;
}

export interface RolePermission {
  role: string;
  permissions: string[];
  description: string;
}

export interface TechArchitecture {
  frontend: string;
  backend: string;
  database: string;
  infrastructure: string;
  diagram?: string;
  notes: string[];
}

export interface IntegrationReq {
  name: string;
  type: string;
  description: string;
  apiEndpoints: string[];
  authMethod: string;
}

export interface PhaseEstimate {
  phase: string;
  description: string;
  durationWeeks: number;
  dependencies: string[];
}

export interface TimelineEstimate {
  totalWeeks: number;
  phases: PhaseEstimate[];
}

export interface CostBreakdown {
  category: string;
  description: string;
  amount: number;
  currency: string;
}

export interface CostEstimate {
  total: number;
  currency: string;
  breakdown: CostBreakdown[];
}

export interface Risk {
  id: string;
  description: string;
  likelihood: "low" | "medium" | "high";
  impact: "low" | "medium" | "high";
  mitigation: string;
}

export interface InternalNote {
  id: string;
  authorId: string;
  content: string;
  createdAt: Date;
}

export interface Specification {
  id: string;
  projectId: string;
  status: SpecStatus;
  version: number;
  overview: string;
  objectives: string[];
  featureBreakdown: FeatureSpec[];
  userRolesPermissions: RolePermission[];
  technicalArchitecture: TechArchitecture;
  integrationReqs: IntegrationReq[];
  timelineEstimate: TimelineEstimate;
  costEstimate: CostEstimate;
  assumptions: string[];
  risks: Risk[];
  internalNotes: InternalNote[];
  generatedBy?: string;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSpecificationInput {
  projectId: string;
  overview?: string;
  objectives?: string[];
}

export function createSpecification(
  input: CreateSpecificationInput,
): Specification {
  const now = new Date();
  return {
    id: new ObjectId().toHexString(),
    projectId: input.projectId,
    status: "draft",
    version: 1,
    overview: input.overview ?? "",
    objectives: input.objectives ?? [],
    featureBreakdown: [],
    userRolesPermissions: [],
    technicalArchitecture: {
      frontend: "",
      backend: "",
      database: "",
      infrastructure: "",
      notes: [],
    },
    integrationReqs: [],
    timelineEstimate: { totalWeeks: 0, phases: [] },
    costEstimate: { total: 0, currency: "USD", breakdown: [] },
    assumptions: [],
    risks: [],
    internalNotes: [],
    createdAt: now,
    updatedAt: now,
  };
}
