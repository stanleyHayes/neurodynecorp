package entity

import (
	"time"

	"github.com/google/uuid"
)

type ProjectStatus string

const (
	ProjectStatusLead          ProjectStatus = "lead"
	ProjectStatusUnderReview   ProjectStatus = "under_review"
	ProjectStatusApproved      ProjectStatus = "approved"
	ProjectStatusInDevelopment ProjectStatus = "in_development"
	ProjectStatusQA            ProjectStatus = "qa"
	ProjectStatusDelivered     ProjectStatus = "delivered"
)

type ProjectType string

const (
	ProjectTypeWebApp     ProjectType = "web_app"
	ProjectTypeMobileApp  ProjectType = "mobile_app"
	ProjectTypeAISystem   ProjectType = "ai_system"
	ProjectTypeBlockchain ProjectType = "blockchain"
)

type Project struct {
	ID               string        `bson:"_id" json:"id"`
	ClientID         string        `bson:"client_id" json:"client_id"`
	Title            string        `bson:"title" json:"title"`
	Description      string        `bson:"description" json:"description"`
	Type             ProjectType   `bson:"type" json:"type"`
	Status           ProjectStatus `bson:"status" json:"status"`
	Features         []Feature     `bson:"features" json:"features"`
	UserRoles        []string      `bson:"user_roles" json:"user_roles"`
	Integrations     []string      `bson:"integrations" json:"integrations"`
	DesignNotes      string        `bson:"design_notes,omitempty" json:"design_notes,omitempty"`
	BudgetRange      BudgetRange   `bson:"budget_range" json:"budget_range"`
	Timeline         Timeline      `bson:"timeline" json:"timeline"`
	Attachments      []Attachment  `bson:"attachments,omitempty" json:"attachments,omitempty"`
	AssignedTeam     []string      `bson:"assigned_team,omitempty" json:"assigned_team,omitempty"`
	SpecificationID  string        `bson:"specification_id,omitempty" json:"specification_id,omitempty"`
	Progress         float64       `bson:"progress" json:"progress"`
	Milestones       []Milestone   `bson:"milestones,omitempty" json:"milestones,omitempty"`
	CreatedAt        time.Time     `bson:"created_at" json:"created_at"`
	UpdatedAt        time.Time     `bson:"updated_at" json:"updated_at"`
}

type Feature struct {
	ID          string `bson:"id" json:"id"`
	Name        string `bson:"name" json:"name"`
	Description string `bson:"description" json:"description"`
	Priority    string `bson:"priority" json:"priority"`
	Complexity  string `bson:"complexity" json:"complexity"`
}

type BudgetRange struct {
	Min      float64 `bson:"min" json:"min"`
	Max      float64 `bson:"max" json:"max"`
	Currency string  `bson:"currency" json:"currency"`
}

type Timeline struct {
	ExpectedStart    time.Time `bson:"expected_start,omitempty" json:"expected_start,omitempty"`
	ExpectedEnd      time.Time `bson:"expected_end,omitempty" json:"expected_end,omitempty"`
	DurationWeeks    int       `bson:"duration_weeks" json:"duration_weeks"`
	PreferredUrgency string    `bson:"preferred_urgency" json:"preferred_urgency"`
}

type Attachment struct {
	ID        string    `bson:"id" json:"id"`
	Name      string    `bson:"name" json:"name"`
	URL       string    `bson:"url" json:"url"`
	Type      string    `bson:"type" json:"type"`
	Size      int64     `bson:"size" json:"size"`
	UploadedAt time.Time `bson:"uploaded_at" json:"uploaded_at"`
}

type Milestone struct {
	ID          string    `bson:"id" json:"id"`
	Title       string    `bson:"title" json:"title"`
	Description string    `bson:"description,omitempty" json:"description,omitempty"`
	DueDate     time.Time `bson:"due_date" json:"due_date"`
	Completed   bool      `bson:"completed" json:"completed"`
	CompletedAt time.Time `bson:"completed_at,omitempty" json:"completed_at,omitempty"`
}

func NewProject(clientID, title, description string, projectType ProjectType) *Project {
	now := time.Now()
	return &Project{
		ID:          uuid.New().String(),
		ClientID:    clientID,
		Title:       title,
		Description: description,
		Type:        projectType,
		Status:      ProjectStatusLead,
		Progress:    0,
		CreatedAt:   now,
		UpdatedAt:   now,
	}
}

func (p *Project) CanTransitionTo(next ProjectStatus) bool {
	transitions := map[ProjectStatus][]ProjectStatus{
		ProjectStatusLead:          {ProjectStatusUnderReview},
		ProjectStatusUnderReview:   {ProjectStatusApproved, ProjectStatusLead},
		ProjectStatusApproved:      {ProjectStatusInDevelopment},
		ProjectStatusInDevelopment: {ProjectStatusQA},
		ProjectStatusQA:            {ProjectStatusInDevelopment, ProjectStatusDelivered},
		ProjectStatusDelivered:     {},
	}

	allowed, ok := transitions[p.Status]
	if !ok {
		return false
	}

	for _, s := range allowed {
		if s == next {
			return true
		}
	}
	return false
}

func (p *Project) TransitionTo(next ProjectStatus) bool {
	if !p.CanTransitionTo(next) {
		return false
	}
	p.Status = next
	p.UpdatedAt = time.Now()
	return true
}
