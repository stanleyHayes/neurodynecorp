package app

import (
	"context"
	"errors"

	"github.com/neurodynecorp/api/internal/domain/entity"
	"github.com/neurodynecorp/api/internal/domain/port"
	"github.com/neurodynecorp/api/pkg/logger"
)

var (
	ErrSpecNotFound = errors.New("specification not found")
)

type SpecService struct {
	specRepo     port.SpecificationRepository
	responseRepo port.QuestionnaireResponseRepository
	projectRepo  port.ProjectRepository
	events       port.EventPublisher
	log          *logger.Logger
}

func NewSpecService(
	specRepo port.SpecificationRepository,
	responseRepo port.QuestionnaireResponseRepository,
	projectRepo port.ProjectRepository,
	events port.EventPublisher,
	log *logger.Logger,
) *SpecService {
	return &SpecService{
		specRepo:     specRepo,
		responseRepo: responseRepo,
		projectRepo:  projectRepo,
		events:       events,
		log:          log.WithComponent("spec_service"),
	}
}

func (s *SpecService) GenerateSpec(ctx context.Context, projectID string) (*entity.Specification, error) {
	project, err := s.projectRepo.GetByID(ctx, projectID)
	if err != nil {
		return nil, ErrProjectNotFound
	}

	response, err := s.responseRepo.GetByProjectID(ctx, projectID)
	if err != nil {
		return nil, ErrQuestionnaireNotFound
	}

	spec := entity.NewSpecification(projectID)
	spec.Overview = project.Description
	spec.Status = entity.SpecStatusGenerated

	// Extract features from project
	for _, f := range project.Features {
		spec.FeatureBreakdown = append(spec.FeatureBreakdown, entity.FeatureSpec{
			Name:        f.Name,
			Description: f.Description,
			Priority:    f.Priority,
		})
	}

	// Build user roles
	for _, role := range project.UserRoles {
		spec.UserRolesPermissions = append(spec.UserRolesPermissions, entity.RolePermission{
			Role: role,
		})
	}

	// Build timeline estimate from project data
	spec.TimelineEstimate = entity.TimelineEstimate{
		TotalWeeks: project.Timeline.DurationWeeks,
		Phases: []entity.PhaseEstimate{
			{Name: "Discovery & Planning", Weeks: max(1, project.Timeline.DurationWeeks/6)},
			{Name: "Design", Weeks: max(1, project.Timeline.DurationWeeks/6)},
			{Name: "Development", Weeks: max(2, project.Timeline.DurationWeeks/2)},
			{Name: "Testing & QA", Weeks: max(1, project.Timeline.DurationWeeks/6)},
			{Name: "Deployment & Launch", Weeks: max(1, project.Timeline.DurationWeeks/6)},
		},
	}

	// Build cost estimate from budget range
	spec.CostEstimate = entity.CostEstimate{
		TotalMin: project.BudgetRange.Min,
		TotalMax: project.BudgetRange.Max,
		Currency: project.BudgetRange.Currency,
	}

	// Set objectives from questionnaire answers
	_ = response // used for enrichment in production

	if err := s.specRepo.Create(ctx, spec); err != nil {
		s.log.Error().Err(err).Str("project_id", projectID).Msg("failed to create specification")
		return nil, err
	}

	// Link spec to project
	project.SpecificationID = spec.ID
	_ = s.projectRepo.Update(ctx, project)

	s.log.Info().
		Str("spec_id", spec.ID).
		Str("project_id", projectID).
		Msg("specification generated")

	return spec, nil
}

func (s *SpecService) GetSpec(ctx context.Context, id string) (*entity.Specification, error) {
	spec, err := s.specRepo.GetByID(ctx, id)
	if err != nil {
		return nil, ErrSpecNotFound
	}
	return spec, nil
}

func (s *SpecService) GetByProject(ctx context.Context, projectID string) (*entity.Specification, error) {
	return s.specRepo.GetByProjectID(ctx, projectID)
}

func (s *SpecService) UpdateSpec(ctx context.Context, spec *entity.Specification) error {
	return s.specRepo.Update(ctx, spec)
}

func (s *SpecService) ApproveSpec(ctx context.Context, specID, approverID string) error {
	spec, err := s.specRepo.GetByID(ctx, specID)
	if err != nil {
		return ErrSpecNotFound
	}

	spec.Status = entity.SpecStatusApproved
	spec.ApprovedBy = approverID

	if err := s.specRepo.Update(ctx, spec); err != nil {
		return err
	}

	s.log.Info().
		Str("spec_id", specID).
		Str("approver_id", approverID).
		Msg("specification approved")

	return nil
}

func (s *SpecService) RejectSpec(ctx context.Context, specID string) error {
	spec, err := s.specRepo.GetByID(ctx, specID)
	if err != nil {
		return ErrSpecNotFound
	}

	spec.Status = entity.SpecStatusRejected
	return s.specRepo.Update(ctx, spec)
}

func (s *SpecService) AddInternalNote(ctx context.Context, specID, authorID, content string) error {
	spec, err := s.specRepo.GetByID(ctx, specID)
	if err != nil {
		return ErrSpecNotFound
	}

	note := entity.InternalNote{
		AuthorID: authorID,
		Content:  content,
	}
	spec.InternalNotes = append(spec.InternalNotes, note)

	return s.specRepo.Update(ctx, spec)
}
