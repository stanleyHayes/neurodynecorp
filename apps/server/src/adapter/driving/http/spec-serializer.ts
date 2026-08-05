import type { Specification } from "../../../app/spec-service.js";

/** Dual-case specification payload for admin/client snake_case consumers. */
export function toApiSpec(spec: Specification): Record<string, unknown> {
  return {
    ...spec,
    project_id: spec.projectId,
    feature_breakdown: (spec.featureBreakdown ?? []).map((f) => ({
      ...f,
      sub_features: f.subFeatures,
      estimated_hours: f.estimatedHours,
    })),
    timeline_estimate: spec.timelineEstimate
      ? {
          ...spec.timelineEstimate,
          total_weeks: spec.timelineEstimate.totalWeeks,
        }
      : undefined,
    cost_estimate: spec.costEstimate
      ? {
          ...spec.costEstimate,
          total_min: spec.costEstimate.totalMin,
          total_max: spec.costEstimate.totalMax,
        }
      : undefined,
    internal_notes: (spec.internalNotes ?? []).map((n) => ({
      ...n,
      author_id: n.authorId,
      created_at: n.createdAt,
    })),
    approved_by: spec.approvedBy,
    approved_at: spec.approvedAt,
    created_at: spec.createdAt,
    updated_at: spec.updatedAt,
  };
}
