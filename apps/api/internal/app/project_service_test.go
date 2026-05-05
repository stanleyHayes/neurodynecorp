package app

import (
	"context"
	"errors"
	"testing"

	"github.com/neurodynecorp/api/internal/domain/entity"
	"github.com/neurodynecorp/api/internal/domain/port"
	"github.com/neurodynecorp/api/pkg/logger"
)

// --- Mock ProjectRepository ---

type mockProjectRepo struct {
	projects map[string]*entity.Project
}

func newMockProjectRepo() *mockProjectRepo {
	return &mockProjectRepo{projects: make(map[string]*entity.Project)}
}

func (m *mockProjectRepo) Create(_ context.Context, project *entity.Project) error {
	m.projects[project.ID] = project
	return nil
}

func (m *mockProjectRepo) GetByID(_ context.Context, id string) (*entity.Project, error) {
	p, ok := m.projects[id]
	if !ok {
		return nil, errors.New("project not found")
	}
	return p, nil
}

func (m *mockProjectRepo) Update(_ context.Context, project *entity.Project) error {
	m.projects[project.ID] = project
	return nil
}

func (m *mockProjectRepo) Delete(_ context.Context, id string) error {
	delete(m.projects, id)
	return nil
}

func (m *mockProjectRepo) ListByClient(_ context.Context, _ string, _, _ int) ([]*entity.Project, int64, error) {
	return nil, 0, nil
}

func (m *mockProjectRepo) ListByStatus(_ context.Context, _ entity.ProjectStatus, _, _ int) ([]*entity.Project, int64, error) {
	return nil, 0, nil
}

func (m *mockProjectRepo) List(_ context.Context, _ port.ProjectFilter) ([]*entity.Project, int64, error) {
	var result []*entity.Project
	for _, p := range m.projects {
		result = append(result, p)
	}
	return result, int64(len(result)), nil
}

// --- Mock SpecificationRepository ---

type mockSpecRepo struct {
	specs map[string]*entity.Specification
}

func newMockSpecRepo() *mockSpecRepo {
	return &mockSpecRepo{specs: make(map[string]*entity.Specification)}
}

func (m *mockSpecRepo) Create(_ context.Context, spec *entity.Specification) error {
	m.specs[spec.ID] = spec
	return nil
}

func (m *mockSpecRepo) GetByID(_ context.Context, id string) (*entity.Specification, error) {
	s, ok := m.specs[id]
	if !ok {
		return nil, errors.New("spec not found")
	}
	return s, nil
}

func (m *mockSpecRepo) GetByProjectID(_ context.Context, projectID string) (*entity.Specification, error) {
	for _, s := range m.specs {
		if s.ProjectID == projectID {
			return s, nil
		}
	}
	return nil, errors.New("spec not found")
}

func (m *mockSpecRepo) Update(_ context.Context, spec *entity.Specification) error {
	m.specs[spec.ID] = spec
	return nil
}

func (m *mockSpecRepo) ListVersions(_ context.Context, _ string) ([]*entity.Specification, error) {
	return nil, nil
}

// --- Helper ---

func newTestProjectService() (*ProjectService, *mockProjectRepo) {
	repo := newMockProjectRepo()
	svc := NewProjectService(
		repo,
		newMockSpecRepo(),
		&mockEventPublisher{},
		newMockCache(),
		logger.New("test"),
	)
	return svc, repo
}

// --- Tests ---

func TestProjectService_CreateProject(t *testing.T) {
	svc, _ := newTestProjectService()
	ctx := context.Background()

	project, err := svc.CreateProject(ctx, CreateProjectInput{
		ClientID:    "client-1",
		Title:       "My App",
		Description: "A description",
		Type:        entity.ProjectTypeWebApp,
		Features: []entity.Feature{
			{ID: "f1", Name: "Auth", Description: "User auth", Priority: "high"},
		},
		UserRoles: []string{"admin", "user"},
		BudgetRange: entity.BudgetRange{Min: 5000, Max: 10000, Currency: "USD"},
		Timeline:    entity.Timeline{DurationWeeks: 12},
	})

	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if project == nil {
		t.Fatal("expected project, got nil")
	}
	if project.ClientID != "client-1" {
		t.Errorf("expected client ID %q, got %q", "client-1", project.ClientID)
	}
	if project.Status != entity.ProjectStatusLead {
		t.Errorf("expected status %q, got %q", entity.ProjectStatusLead, project.Status)
	}
	if len(project.Features) != 1 {
		t.Errorf("expected 1 feature, got %d", len(project.Features))
	}
	if len(project.UserRoles) != 2 {
		t.Errorf("expected 2 user roles, got %d", len(project.UserRoles))
	}
}

func TestProjectService_GetProject(t *testing.T) {
	t.Run("found", func(t *testing.T) {
		svc, _ := newTestProjectService()
		ctx := context.Background()

		created, _ := svc.CreateProject(ctx, CreateProjectInput{
			ClientID:    "client-1",
			Title:       "Test",
			Description: "desc",
			Type:        entity.ProjectTypeWebApp,
		})

		project, err := svc.GetProject(ctx, created.ID)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if project.ID != created.ID {
			t.Errorf("expected ID %q, got %q", created.ID, project.ID)
		}
	})

	t.Run("not found", func(t *testing.T) {
		svc, _ := newTestProjectService()
		ctx := context.Background()

		_, err := svc.GetProject(ctx, "nonexistent")
		if !errors.Is(err, ErrProjectNotFound) {
			t.Errorf("expected ErrProjectNotFound, got %v", err)
		}
	})
}

func TestProjectService_UpdateStatus(t *testing.T) {
	t.Run("valid transition", func(t *testing.T) {
		svc, _ := newTestProjectService()
		ctx := context.Background()

		project, _ := svc.CreateProject(ctx, CreateProjectInput{
			ClientID:    "client-1",
			Title:       "Test",
			Description: "desc",
			Type:        entity.ProjectTypeWebApp,
		})

		updated, err := svc.UpdateStatus(ctx, project.ID, entity.ProjectStatusUnderReview)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if updated.Status != entity.ProjectStatusUnderReview {
			t.Errorf("expected status %q, got %q", entity.ProjectStatusUnderReview, updated.Status)
		}
	})

	t.Run("invalid transition", func(t *testing.T) {
		svc, _ := newTestProjectService()
		ctx := context.Background()

		project, _ := svc.CreateProject(ctx, CreateProjectInput{
			ClientID:    "client-1",
			Title:       "Test",
			Description: "desc",
			Type:        entity.ProjectTypeWebApp,
		})

		_, err := svc.UpdateStatus(ctx, project.ID, entity.ProjectStatusDelivered)
		if !errors.Is(err, ErrInvalidTransition) {
			t.Errorf("expected ErrInvalidTransition, got %v", err)
		}
	})

	t.Run("project not found", func(t *testing.T) {
		svc, _ := newTestProjectService()
		ctx := context.Background()

		_, err := svc.UpdateStatus(ctx, "nonexistent", entity.ProjectStatusUnderReview)
		if !errors.Is(err, ErrProjectNotFound) {
			t.Errorf("expected ErrProjectNotFound, got %v", err)
		}
	})
}
