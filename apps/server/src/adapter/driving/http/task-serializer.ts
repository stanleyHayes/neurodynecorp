import type { Task, Sprint } from "../../../domain/entity/task.js";

/** Dual-case task payload for admin/client consumers that expect snake_case. */
export function toApiTask(task: Task): Record<string, unknown> {
  return {
    ...task,
    project_id: task.projectId,
    sprint_id: task.sprintId,
    assignee_id: task.assigneeId,
    reporter_id: task.reporterId,
    story_points: task.storyPoints,
    due_date: task.dueDate,
    created_at: task.createdAt,
    updated_at: task.updatedAt,
  };
}

export function toApiSprint(sprint: Sprint): Record<string, unknown> {
  return {
    ...sprint,
    project_id: sprint.projectId,
    start_date: sprint.startDate,
    end_date: sprint.endDate,
    created_at: sprint.createdAt,
    updated_at: sprint.updatedAt,
  };
}
