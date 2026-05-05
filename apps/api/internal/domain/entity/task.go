package entity

import (
	"time"

	"github.com/google/uuid"
)

type TaskStatus string

const (
	TaskStatusBacklog    TaskStatus = "backlog"
	TaskStatusTodo       TaskStatus = "todo"
	TaskStatusInProgress TaskStatus = "in_progress"
	TaskStatusReview     TaskStatus = "review"
	TaskStatusDone       TaskStatus = "done"
)

type TaskPriority string

const (
	TaskPriorityLow      TaskPriority = "low"
	TaskPriorityMedium   TaskPriority = "medium"
	TaskPriorityHigh     TaskPriority = "high"
	TaskPriorityCritical TaskPriority = "critical"
)

type Task struct {
	ID          string       `bson:"_id" json:"id"`
	ProjectID   string       `bson:"project_id" json:"project_id"`
	SprintID    string       `bson:"sprint_id,omitempty" json:"sprint_id,omitempty"`
	Title       string       `bson:"title" json:"title"`
	Description string       `bson:"description,omitempty" json:"description,omitempty"`
	Status      TaskStatus   `bson:"status" json:"status"`
	Priority    TaskPriority `bson:"priority" json:"priority"`
	AssigneeID  string       `bson:"assignee_id,omitempty" json:"assignee_id,omitempty"`
	Labels      []string     `bson:"labels,omitempty" json:"labels,omitempty"`
	DueDate     time.Time    `bson:"due_date,omitempty" json:"due_date,omitempty"`
	CreatedAt   time.Time    `bson:"created_at" json:"created_at"`
	UpdatedAt   time.Time    `bson:"updated_at" json:"updated_at"`
}

type Sprint struct {
	ID        string    `bson:"_id" json:"id"`
	ProjectID string    `bson:"project_id" json:"project_id"`
	Name      string    `bson:"name" json:"name"`
	Goal      string    `bson:"goal,omitempty" json:"goal,omitempty"`
	StartDate time.Time `bson:"start_date" json:"start_date"`
	EndDate   time.Time `bson:"end_date" json:"end_date"`
	IsActive  bool      `bson:"is_active" json:"is_active"`
	CreatedAt time.Time `bson:"created_at" json:"created_at"`
	UpdatedAt time.Time `bson:"updated_at" json:"updated_at"`
}

func NewTask(projectID, title string, priority TaskPriority) *Task {
	now := time.Now()
	return &Task{
		ID:        uuid.New().String(),
		ProjectID: projectID,
		Title:     title,
		Status:    TaskStatusBacklog,
		Priority:  priority,
		CreatedAt: now,
		UpdatedAt: now,
	}
}

func NewSprint(projectID, name string, start, end time.Time) *Sprint {
	now := time.Now()
	return &Sprint{
		ID:        uuid.New().String(),
		ProjectID: projectID,
		Name:      name,
		StartDate: start,
		EndDate:   end,
		IsActive:  false,
		CreatedAt: now,
		UpdatedAt: now,
	}
}
