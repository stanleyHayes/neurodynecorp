package app

import (
	"context"
	"encoding/json"
	"errors"

	"github.com/neurodynecorp/api/internal/domain/entity"
	"github.com/neurodynecorp/api/internal/domain/port"
	"github.com/neurodynecorp/api/pkg/logger"
)

var (
	ErrProjectNotFound     = errors.New("project not found")
	ErrInvalidTransition   = errors.New("invalid status transition")
	ErrUnauthorized        = errors.New("unauthorized")
)

type ProjectService struct {
	projectRepo port.ProjectRepository
	specRepo    port.SpecificationRepository
	events      port.EventPublisher
	cache       port.CacheService
	log         *logger.Logger
}

func NewProjectService(
	projectRepo port.ProjectRepository,
	specRepo port.SpecificationRepository,
	events port.EventPublisher,
	cache port.CacheService,
	log *logger.Logger,
) *ProjectService {
	return &ProjectService{
		projectRepo: projectRepo,
		specRepo:    specRepo,
		events:      events,
		cache:       cache,
		log:         log.WithComponent("project_service"),
	}
}

type CreateProjectInput struct {
	ClientID    string
	Title       string
	Description string
	Type        entity.ProjectType
	Features    []entity.Feature
	UserRoles   []string
	BudgetRange entity.BudgetRange
	Timeline    entity.Timeline
}

func (s *ProjectService) CreateProject(ctx context.Context, input CreateProjectInput) (*entity.Project, error) {
	project := entity.NewProject(input.ClientID, input.Title, input.Description, input.Type)
	project.Features = input.Features
	project.UserRoles = input.UserRoles
	project.BudgetRange = input.BudgetRange
	project.Timeline = input.Timeline

	if err := s.projectRepo.Create(ctx, project); err != nil {
		s.log.Error().Err(err).Str("client_id", input.ClientID).Msg("failed to create project")
		return nil, err
	}

	// Publish event
	payload, _ := json.Marshal(map[string]string{
		"project_id": project.ID,
		"client_id":  project.ClientID,
		"status":     string(project.Status),
	})
	_ = s.events.Publish(ctx, "project.created", project.ID, payload)

	s.log.Info().
		Str("project_id", project.ID).
		Str("client_id", input.ClientID).
		Str("type", string(input.Type)).
		Msg("project created")

	return project, nil
}

func (s *ProjectService) GetProject(ctx context.Context, id string) (*entity.Project, error) {
	project, err := s.projectRepo.GetByID(ctx, id)
	if err != nil {
		return nil, ErrProjectNotFound
	}
	return project, nil
}

func (s *ProjectService) ListProjects(ctx context.Context, filter port.ProjectFilter) ([]*entity.Project, int64, error) {
	return s.projectRepo.List(ctx, filter)
}

func (s *ProjectService) UpdateStatus(ctx context.Context, projectID string, newStatus entity.ProjectStatus) (*entity.Project, error) {
	project, err := s.projectRepo.GetByID(ctx, projectID)
	if err != nil {
		return nil, ErrProjectNotFound
	}

	if !project.TransitionTo(newStatus) {
		s.log.Warn().
			Str("project_id", projectID).
			Str("current", string(project.Status)).
			Str("requested", string(newStatus)).
			Msg("invalid status transition")
		return nil, ErrInvalidTransition
	}

	if err := s.projectRepo.Update(ctx, project); err != nil {
		return nil, err
	}

	// Invalidate cache
	_ = s.cache.Delete(ctx, "project:"+projectID)

	payload, _ := json.Marshal(map[string]string{
		"project_id": project.ID,
		"old_status": string(project.Status),
		"new_status": string(newStatus),
	})
	_ = s.events.Publish(ctx, "project.status_changed", project.ID, payload)

	s.log.Info().
		Str("project_id", projectID).
		Str("new_status", string(newStatus)).
		Msg("project status updated")

	return project, nil
}

func (s *ProjectService) AssignTeam(ctx context.Context, projectID string, teamIDs []string) error {
	project, err := s.projectRepo.GetByID(ctx, projectID)
	if err != nil {
		return ErrProjectNotFound
	}

	project.AssignedTeam = teamIDs
	return s.projectRepo.Update(ctx, project)
}

func (s *ProjectService) UpdateProgress(ctx context.Context, projectID string, progress float64) error {
	project, err := s.projectRepo.GetByID(ctx, projectID)
	if err != nil {
		return ErrProjectNotFound
	}

	project.Progress = progress
	return s.projectRepo.Update(ctx, project)
}
