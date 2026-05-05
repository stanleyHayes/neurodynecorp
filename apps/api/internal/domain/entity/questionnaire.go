package entity

import (
	"time"

	"github.com/google/uuid"
)

type QuestionType string

const (
	QuestionTypeBoolean       QuestionType = "boolean"
	QuestionTypeMultiChoice   QuestionType = "multi_choice"
	QuestionTypeDropdown      QuestionType = "dropdown"
	QuestionTypeFreeText      QuestionType = "free_text"
	QuestionTypeFileUpload    QuestionType = "file_upload"
	QuestionTypeBudgetSelect  QuestionType = "budget_selector"
	QuestionTypeTimelineSelect QuestionType = "timeline_selector"
)

type Question struct {
	ID           string       `bson:"_id" json:"id"`
	Text         string       `bson:"text" json:"text"`
	Type         QuestionType `bson:"type" json:"type"`
	Options      []string     `bson:"options,omitempty" json:"options,omitempty"`
	Required     bool         `bson:"required" json:"required"`
	Order        int          `bson:"order" json:"order"`
	Category     string       `bson:"category" json:"category"`
	DependsOn    *Dependency  `bson:"depends_on,omitempty" json:"depends_on,omitempty"`
	HelpText     string       `bson:"help_text,omitempty" json:"help_text,omitempty"`
}

type Dependency struct {
	QuestionID string `bson:"question_id" json:"question_id"`
	Answer     string `bson:"answer" json:"answer"`
}

type QuestionnaireResponse struct {
	ID         string    `bson:"_id" json:"id"`
	ProjectID  string    `bson:"project_id" json:"project_id"`
	ClientID   string    `bson:"client_id" json:"client_id"`
	Answers    []Answer  `bson:"answers" json:"answers"`
	Completed  bool      `bson:"completed" json:"completed"`
	CreatedAt  time.Time `bson:"created_at" json:"created_at"`
	UpdatedAt  time.Time `bson:"updated_at" json:"updated_at"`
}

type Answer struct {
	QuestionID string   `bson:"question_id" json:"question_id"`
	Value      string   `bson:"value" json:"value"`
	Values     []string `bson:"values,omitempty" json:"values,omitempty"`
	FileURLs   []string `bson:"file_urls,omitempty" json:"file_urls,omitempty"`
}

func NewQuestionnaireResponse(projectID, clientID string) *QuestionnaireResponse {
	now := time.Now()
	return &QuestionnaireResponse{
		ID:        uuid.New().String(),
		ProjectID: projectID,
		ClientID:  clientID,
		Completed: false,
		CreatedAt: now,
		UpdatedAt: now,
	}
}
