package app

import (
	"context"
	"errors"
	"testing"

	"github.com/neurodynecorp/api/internal/domain/entity"
	"github.com/neurodynecorp/api/pkg/logger"
)

// --- Mock QuestionRepository ---

type mockQuestionRepo struct {
	questions []*entity.Question
}

func (m *mockQuestionRepo) GetAll(_ context.Context) ([]*entity.Question, error) {
	return m.questions, nil
}

func (m *mockQuestionRepo) GetByCategory(_ context.Context, category string) ([]*entity.Question, error) {
	var result []*entity.Question
	for _, q := range m.questions {
		if q.Category == category {
			result = append(result, q)
		}
	}
	return result, nil
}

func (m *mockQuestionRepo) GetByID(_ context.Context, id string) (*entity.Question, error) {
	for _, q := range m.questions {
		if q.ID == id {
			return q, nil
		}
	}
	return nil, errors.New("question not found")
}

func (m *mockQuestionRepo) Upsert(_ context.Context, question *entity.Question) error {
	for i, q := range m.questions {
		if q.ID == question.ID {
			m.questions[i] = question
			return nil
		}
	}
	m.questions = append(m.questions, question)
	return nil
}

// --- Mock QuestionnaireResponseRepository ---

type mockResponseRepo struct {
	responses map[string]*entity.QuestionnaireResponse // keyed by project ID
}

func newMockResponseRepo() *mockResponseRepo {
	return &mockResponseRepo{responses: make(map[string]*entity.QuestionnaireResponse)}
}

func (m *mockResponseRepo) Create(_ context.Context, response *entity.QuestionnaireResponse) error {
	m.responses[response.ProjectID] = response
	return nil
}

func (m *mockResponseRepo) GetByID(_ context.Context, id string) (*entity.QuestionnaireResponse, error) {
	for _, r := range m.responses {
		if r.ID == id {
			return r, nil
		}
	}
	return nil, errors.New("response not found")
}

func (m *mockResponseRepo) GetByProjectID(_ context.Context, projectID string) (*entity.QuestionnaireResponse, error) {
	r, ok := m.responses[projectID]
	if !ok {
		return nil, errors.New("response not found")
	}
	return r, nil
}

func (m *mockResponseRepo) Update(_ context.Context, response *entity.QuestionnaireResponse) error {
	m.responses[response.ProjectID] = response
	return nil
}

// --- Helpers ---

func newTestQuestionnaireService(questions []*entity.Question) *QuestionnaireService {
	return NewQuestionnaireService(
		&mockQuestionRepo{questions: questions},
		newMockResponseRepo(),
		newMockProjectRepo(),
		&mockEventPublisher{},
		logger.New("test"),
	)
}

// --- Tests ---

func TestQuestionnaireService_GetQuestions(t *testing.T) {
	questions := []*entity.Question{
		{ID: "q1", Text: "What type?", Category: "general"},
		{ID: "q2", Text: "Budget?", Category: "budget"},
		{ID: "q3", Text: "Timeline?", Category: "general"},
	}

	t.Run("all questions", func(t *testing.T) {
		svc := newTestQuestionnaireService(questions)
		ctx := context.Background()

		result, err := svc.GetQuestions(ctx, "")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if len(result) != 3 {
			t.Errorf("expected 3 questions, got %d", len(result))
		}
	})

	t.Run("filter by category", func(t *testing.T) {
		svc := newTestQuestionnaireService(questions)
		ctx := context.Background()

		result, err := svc.GetQuestions(ctx, "general")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if len(result) != 2 {
			t.Errorf("expected 2 questions, got %d", len(result))
		}
	})
}

func TestQuestionnaireService_GetAdaptiveQuestions(t *testing.T) {
	questions := []*entity.Question{
		{ID: "q1", Text: "Do you need auth?", Category: "general"},
		{ID: "q2", Text: "Which auth provider?", Category: "general", DependsOn: &entity.Dependency{QuestionID: "q1", Answer: "yes"}},
		{ID: "q3", Text: "Budget?", Category: "budget"},
		{ID: "q4", Text: "Custom domain?", Category: "general", DependsOn: &entity.Dependency{QuestionID: "q1", Answer: "no"}},
	}

	t.Run("shows questions with satisfied dependencies", func(t *testing.T) {
		svc := newTestQuestionnaireService(questions)
		ctx := context.Background()

		answers := []entity.Answer{
			{QuestionID: "q1", Value: "yes"},
		}

		result, err := svc.GetAdaptiveQuestions(ctx, answers)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		// Should include q1 (no dependency), q2 (dependency satisfied), q3 (no dependency)
		// Should NOT include q4 (dependency not satisfied: q1=yes, needs q1=no)
		if len(result) != 3 {
			t.Errorf("expected 3 questions, got %d", len(result))
		}

		ids := make(map[string]bool)
		for _, q := range result {
			ids[q.ID] = true
		}
		if ids["q4"] {
			t.Error("expected q4 to be filtered out")
		}
		if !ids["q2"] {
			t.Error("expected q2 to be included")
		}
	})

	t.Run("no answers shows only independent questions", func(t *testing.T) {
		svc := newTestQuestionnaireService(questions)
		ctx := context.Background()

		result, err := svc.GetAdaptiveQuestions(ctx, nil)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		// Only q1 and q3 have no dependencies
		if len(result) != 2 {
			t.Errorf("expected 2 questions, got %d", len(result))
		}
	})
}

func TestQuestionnaireService_SaveResponse(t *testing.T) {
	t.Run("create new response", func(t *testing.T) {
		svc := newTestQuestionnaireService(nil)
		ctx := context.Background()

		answers := []entity.Answer{
			{QuestionID: "q1", Value: "yes"},
		}

		resp, err := svc.SaveResponse(ctx, "proj-1", "client-1", answers)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp.ProjectID != "proj-1" {
			t.Errorf("expected project ID %q, got %q", "proj-1", resp.ProjectID)
		}
		if resp.ClientID != "client-1" {
			t.Errorf("expected client ID %q, got %q", "client-1", resp.ClientID)
		}
		if len(resp.Answers) != 1 {
			t.Errorf("expected 1 answer, got %d", len(resp.Answers))
		}
	})

	t.Run("update existing response", func(t *testing.T) {
		svc := newTestQuestionnaireService(nil)
		ctx := context.Background()

		answers1 := []entity.Answer{{QuestionID: "q1", Value: "yes"}}
		resp1, _ := svc.SaveResponse(ctx, "proj-1", "client-1", answers1)

		answers2 := []entity.Answer{
			{QuestionID: "q1", Value: "no"},
			{QuestionID: "q2", Value: "maybe"},
		}
		resp2, err := svc.SaveResponse(ctx, "proj-1", "client-1", answers2)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp2.ID != resp1.ID {
			t.Error("expected same response ID for update")
		}
		if len(resp2.Answers) != 2 {
			t.Errorf("expected 2 answers after update, got %d", len(resp2.Answers))
		}
	})
}

func TestQuestionnaireService_CompleteQuestionnaire(t *testing.T) {
	t.Run("success", func(t *testing.T) {
		svc := newTestQuestionnaireService(nil)
		ctx := context.Background()

		answers := []entity.Answer{{QuestionID: "q1", Value: "yes"}}
		_, _ = svc.SaveResponse(ctx, "proj-1", "client-1", answers)

		resp, err := svc.CompleteQuestionnaire(ctx, "proj-1")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if !resp.Completed {
			t.Error("expected response to be marked as completed")
		}
	})

	t.Run("not found", func(t *testing.T) {
		svc := newTestQuestionnaireService(nil)
		ctx := context.Background()

		_, err := svc.CompleteQuestionnaire(ctx, "nonexistent")
		if !errors.Is(err, ErrQuestionnaireNotFound) {
			t.Errorf("expected ErrQuestionnaireNotFound, got %v", err)
		}
	})
}
