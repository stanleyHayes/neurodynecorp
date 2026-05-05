package app

import (
	"context"
	"encoding/json"

	"github.com/neurodynecorp/api/internal/domain/entity"
	"github.com/neurodynecorp/api/internal/domain/port"
	"github.com/neurodynecorp/api/pkg/logger"
)

type WorkflowEngine struct {
	projectRepo port.ProjectRepository
	notifRepo   port.NotificationRepository
	emailSvc    port.EmailService
	events      port.EventPublisher
	subscriber  port.EventSubscriber
	log         *logger.Logger
}

func NewWorkflowEngine(
	projectRepo port.ProjectRepository,
	notifRepo port.NotificationRepository,
	emailSvc port.EmailService,
	events port.EventPublisher,
	subscriber port.EventSubscriber,
	log *logger.Logger,
) *WorkflowEngine {
	return &WorkflowEngine{
		projectRepo: projectRepo,
		notifRepo:   notifRepo,
		emailSvc:    emailSvc,
		events:      events,
		subscriber:  subscriber,
		log:         log.WithComponent("workflow_engine"),
	}
}

func (w *WorkflowEngine) Start(ctx context.Context) error {
	// Subscribe to project events
	if err := w.subscriber.Subscribe(ctx, "project.created", w.handleProjectCreated); err != nil {
		return err
	}
	if err := w.subscriber.Subscribe(ctx, "project.status_changed", w.handleStatusChanged); err != nil {
		return err
	}
	w.log.Info().Msg("workflow engine started")
	return nil
}

func (w *WorkflowEngine) Stop() error {
	return w.subscriber.Close()
}

func (w *WorkflowEngine) handleProjectCreated(key string, payload []byte) error {
	var data struct {
		ProjectID string `json:"project_id"`
		ClientID  string `json:"client_id"`
		Status    string `json:"status"`
	}
	if err := json.Unmarshal(payload, &data); err != nil {
		w.log.Error().Err(err).Msg("failed to unmarshal project.created event")
		return err
	}

	w.log.Info().Str("project_id", data.ProjectID).Msg("processing project.created event")

	// Create notification for admins
	notif := entity.NewNotification(
		"admin",
		entity.NotificationTypeProjectUpdate,
		"New Project Submitted",
		"A new project has been submitted and needs review.",
	)
	notif.Data = map[string]string{"project_id": data.ProjectID}
	ctx := context.Background()
	if err := w.notifRepo.Create(ctx, notif); err != nil {
		w.log.Error().Err(err).Msg("failed to create notification")
	}

	return nil
}

func (w *WorkflowEngine) handleStatusChanged(key string, payload []byte) error {
	var data struct {
		ProjectID string `json:"project_id"`
		OldStatus string `json:"old_status"`
		NewStatus string `json:"new_status"`
	}
	if err := json.Unmarshal(payload, &data); err != nil {
		w.log.Error().Err(err).Msg("failed to unmarshal project.status_changed event")
		return err
	}

	w.log.Info().
		Str("project_id", data.ProjectID).
		Str("new_status", data.NewStatus).
		Msg("processing project.status_changed event")

	ctx := context.Background()

	// Get project to find client
	project, err := w.projectRepo.GetByID(ctx, data.ProjectID)
	if err != nil {
		w.log.Error().Err(err).Msg("failed to get project for workflow")
		return err
	}

	// Notify client of status change
	notif := entity.NewNotification(
		project.ClientID,
		entity.NotificationTypeStatusChange,
		"Project Status Updated",
		"Your project '"+project.Title+"' status changed to "+data.NewStatus,
	)
	notif.Data = map[string]string{
		"project_id": data.ProjectID,
		"new_status": data.NewStatus,
	}
	if err := w.notifRepo.Create(ctx, notif); err != nil {
		w.log.Error().Err(err).Msg("failed to create client notification")
	}

	// If project is approved, send email invitation to client
	if data.NewStatus == string(entity.ProjectStatusApproved) {
		_ = w.emailSvc.SendEmail(
			ctx,
			"", // would be client email from user lookup
			"Project Approved - NeuroDyne Corp",
			"<h1>Your project has been approved!</h1><p>Your project '"+project.Title+"' has been approved. Log in to your dashboard to see the details.</p>",
		)
	}

	return nil
}
