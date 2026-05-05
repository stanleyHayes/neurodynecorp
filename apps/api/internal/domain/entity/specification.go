package entity

import (
	"time"

	"github.com/google/uuid"
)

type SpecStatus string

const (
	SpecStatusDraft     SpecStatus = "draft"
	SpecStatusGenerated SpecStatus = "generated"
	SpecStatusReviewed  SpecStatus = "reviewed"
	SpecStatusApproved  SpecStatus = "approved"
	SpecStatusRejected  SpecStatus = "rejected"
)

type Specification struct {
	ID                    string              `bson:"_id" json:"id"`
	ProjectID             string              `bson:"project_id" json:"project_id"`
	Version               int                 `bson:"version" json:"version"`
	Status                SpecStatus          `bson:"status" json:"status"`
	Overview              string              `bson:"overview" json:"overview"`
	Objectives            []string            `bson:"objectives" json:"objectives"`
	FeatureBreakdown      []FeatureSpec       `bson:"feature_breakdown" json:"feature_breakdown"`
	UserRolesPermissions  []RolePermission    `bson:"user_roles_permissions" json:"user_roles_permissions"`
	TechnicalArchitecture TechArchitecture    `bson:"technical_architecture" json:"technical_architecture"`
	IntegrationReqs       []IntegrationReq    `bson:"integration_requirements" json:"integration_requirements"`
	TimelineEstimate      TimelineEstimate    `bson:"timeline_estimate" json:"timeline_estimate"`
	CostEstimate          CostEstimate        `bson:"cost_estimate" json:"cost_estimate"`
	Assumptions           []string            `bson:"assumptions" json:"assumptions"`
	Risks                 []Risk              `bson:"risks" json:"risks"`
	InternalNotes         []InternalNote      `bson:"internal_notes,omitempty" json:"internal_notes,omitempty"`
	ApprovedBy            string              `bson:"approved_by,omitempty" json:"approved_by,omitempty"`
	ApprovedAt            time.Time           `bson:"approved_at,omitempty" json:"approved_at,omitempty"`
	CreatedAt             time.Time           `bson:"created_at" json:"created_at"`
	UpdatedAt             time.Time           `bson:"updated_at" json:"updated_at"`
}

type FeatureSpec struct {
	Name         string   `bson:"name" json:"name"`
	Description  string   `bson:"description" json:"description"`
	SubFeatures  []string `bson:"sub_features" json:"sub_features"`
	Priority     string   `bson:"priority" json:"priority"`
	EstimatedHrs float64  `bson:"estimated_hours" json:"estimated_hours"`
}

type RolePermission struct {
	Role        string   `bson:"role" json:"role"`
	Permissions []string `bson:"permissions" json:"permissions"`
}

type TechArchitecture struct {
	Frontend       []string `bson:"frontend" json:"frontend"`
	Backend        []string `bson:"backend" json:"backend"`
	Database       []string `bson:"database" json:"database"`
	Infrastructure []string `bson:"infrastructure" json:"infrastructure"`
	Suggestions    string   `bson:"suggestions,omitempty" json:"suggestions,omitempty"`
}

type IntegrationReq struct {
	Name        string `bson:"name" json:"name"`
	Type        string `bson:"type" json:"type"`
	Description string `bson:"description" json:"description"`
}

type TimelineEstimate struct {
	TotalWeeks int             `bson:"total_weeks" json:"total_weeks"`
	Phases     []PhaseEstimate `bson:"phases" json:"phases"`
}

type PhaseEstimate struct {
	Name     string `bson:"name" json:"name"`
	Weeks    int    `bson:"weeks" json:"weeks"`
	Details  string `bson:"details,omitempty" json:"details,omitempty"`
}

type CostEstimate struct {
	TotalMin  float64         `bson:"total_min" json:"total_min"`
	TotalMax  float64         `bson:"total_max" json:"total_max"`
	Currency  string          `bson:"currency" json:"currency"`
	Breakdown []CostBreakdown `bson:"breakdown" json:"breakdown"`
}

type CostBreakdown struct {
	Category string  `bson:"category" json:"category"`
	Min      float64 `bson:"min" json:"min"`
	Max      float64 `bson:"max" json:"max"`
}

type Risk struct {
	Description string `bson:"description" json:"description"`
	Impact      string `bson:"impact" json:"impact"`
	Mitigation  string `bson:"mitigation" json:"mitigation"`
}

type InternalNote struct {
	AuthorID  string    `bson:"author_id" json:"author_id"`
	Content   string    `bson:"content" json:"content"`
	CreatedAt time.Time `bson:"created_at" json:"created_at"`
}

func NewSpecification(projectID string) *Specification {
	now := time.Now()
	return &Specification{
		ID:        uuid.New().String(),
		ProjectID: projectID,
		Version:   1,
		Status:    SpecStatusDraft,
		CreatedAt: now,
		UpdatedAt: now,
	}
}
