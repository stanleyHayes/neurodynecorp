package app

import (
	"context"
	"errors"
	"testing"

	"github.com/neurodynecorp/api/internal/domain/entity"
	"github.com/neurodynecorp/api/pkg/logger"
)

// --- Helpers ---

func newTestSpecService() (*SpecService, *mockProjectRepo, *mockSpecRepo, *mockResponseRepo) {
	projectRepo := newMockProjectRepo()
	specRepo := newMockSpecRepo()
	responseRepo := newMockResponseRepo()

	svc := NewSpecService(
		specRepo,
		responseRepo,
		projectRepo,
		&mockEventPublisher{},
		logger.New("test"),
	)
	return svc, projectRepo, specRepo, responseRepo
}

func seedProjectWithResponse(t *testing.T, projectRepo *mockProjectRepo, responseRepo *mockResponseRepo) *entity.Project {
	t.Helper()

	project := entity.NewProject("client-1", "Test App", "A test application", entity.ProjectTypeWebApp)
	project.Features = []entity.Feature{
		{ID: "f1", Name: "Auth", Description: "User authentication", Priority: "high"},
	}
	project.UserRoles = []string{"admin", "user"}
	project.BudgetRange = entity.BudgetRange{Min: 5000, Max: 10000, Currency: "USD"}
	project.Timeline = entity.Timeline{DurationWeeks: 12}
	projectRepo.projects[project.ID] = project

	response := entity.NewQuestionnaireResponse(project.ID, "client-1")
	response.Answers = []entity.Answer{
		{QuestionID: "q1", Value: "yes"},
	}
	response.Completed = true
	responseRepo.responses[project.ID] = response

	return project
}

// --- Tests ---

func TestSpecService_GenerateSpec(t *testing.T) {
	t.Run("success", func(t *testing.T) {
		svc, projectRepo, _, responseRepo := newTestSpecService()
		ctx := context.Background()

		project := seedProjectWithResponse(t, projectRepo, responseRepo)

		spec, err := svc.GenerateSpec(ctx, project.ID)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if spec == nil {
			t.Fatal("expected spec, got nil")
		}
		if spec.ProjectID != project.ID {
			t.Errorf("expected project ID %q, got %q", project.ID, spec.ProjectID)
		}
		if spec.Status != entity.SpecStatusGenerated {
			t.Errorf("expected status %q, got %q", entity.SpecStatusGenerated, spec.Status)
		}
		if spec.Overview != project.Description {
			t.Errorf("expected overview %q, got %q", project.Description, spec.Overview)
		}
		if len(spec.FeatureBreakdown) != 1 {
			t.Errorf("expected 1 feature breakdown, got %d", len(spec.FeatureBreakdown))
		}
		if len(spec.UserRolesPermissions) != 2 {
			t.Errorf("expected 2 role permissions, got %d", len(spec.UserRolesPermissions))
		}
		if spec.TimelineEstimate.TotalWeeks != 12 {
			t.Errorf("expected 12 total weeks, got %d", spec.TimelineEstimate.TotalWeeks)
		}
		if spec.CostEstimate.TotalMin != 5000 {
			t.Errorf("expected cost min 5000, got %f", spec.CostEstimate.TotalMin)
		}

		// Verify spec was linked to project
		updatedProject := projectRepo.projects[project.ID]
		if updatedProject.SpecificationID != spec.ID {
			t.Errorf("expected project.SpecificationID = %q, got %q", spec.ID, updatedProject.SpecificationID)
		}
	})

	t.Run("project not found", func(t *testing.T) {
		svc, _, _, _ := newTestSpecService()
		ctx := context.Background()

		_, err := svc.GenerateSpec(ctx, "nonexistent")
		if !errors.Is(err, ErrProjectNotFound) {
			t.Errorf("expected ErrProjectNotFound, got %v", err)
		}
	})

	t.Run("questionnaire not found", func(t *testing.T) {
		svc, projectRepo, _, _ := newTestSpecService()
		ctx := context.Background()

		project := entity.NewProject("client-1", "Test", "desc", entity.ProjectTypeWebApp)
		projectRepo.projects[project.ID] = project

		_, err := svc.GenerateSpec(ctx, project.ID)
		if !errors.Is(err, ErrQuestionnaireNotFound) {
			t.Errorf("expected ErrQuestionnaireNotFound, got %v", err)
		}
	})
}

func TestSpecService_ApproveSpec(t *testing.T) {
	t.Run("success", func(t *testing.T) {
		svc, projectRepo, specRepo, responseRepo := newTestSpecService()
		ctx := context.Background()

		project := seedProjectWithResponse(t, projectRepo, responseRepo)
		spec, _ := svc.GenerateSpec(ctx, project.ID)

		err := svc.ApproveSpec(ctx, spec.ID, "approver-1")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		updated := specRepo.specs[spec.ID]
		if updated.Status != entity.SpecStatusApproved {
			t.Errorf("expected status %q, got %q", entity.SpecStatusApproved, updated.Status)
		}
		if updated.ApprovedBy != "approver-1" {
			t.Errorf("expected approved by %q, got %q", "approver-1", updated.ApprovedBy)
		}
	})

	t.Run("spec not found", func(t *testing.T) {
		svc, _, _, _ := newTestSpecService()
		ctx := context.Background()

		err := svc.ApproveSpec(ctx, "nonexistent", "approver-1")
		if !errors.Is(err, ErrSpecNotFound) {
			t.Errorf("expected ErrSpecNotFound, got %v", err)
		}
	})
}

func TestSpecService_RejectSpec(t *testing.T) {
	t.Run("success", func(t *testing.T) {
		svc, projectRepo, specRepo, responseRepo := newTestSpecService()
		ctx := context.Background()

		project := seedProjectWithResponse(t, projectRepo, responseRepo)
		spec, _ := svc.GenerateSpec(ctx, project.ID)

		err := svc.RejectSpec(ctx, spec.ID)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		updated := specRepo.specs[spec.ID]
		if updated.Status != entity.SpecStatusRejected {
			t.Errorf("expected status %q, got %q", entity.SpecStatusRejected, updated.Status)
		}
	})

	t.Run("spec not found", func(t *testing.T) {
		svc, _, _, _ := newTestSpecService()
		ctx := context.Background()

		err := svc.RejectSpec(ctx, "nonexistent")
		if !errors.Is(err, ErrSpecNotFound) {
			t.Errorf("expected ErrSpecNotFound, got %v", err)
		}
	})
}
