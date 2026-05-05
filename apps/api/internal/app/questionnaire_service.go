package app

import (
	"context"
	"errors"

	"github.com/neurodynecorp/api/internal/domain/entity"
	"github.com/neurodynecorp/api/internal/domain/port"
	"github.com/neurodynecorp/api/pkg/logger"
)

var (
	ErrQuestionnaireNotFound = errors.New("questionnaire response not found")
	ErrQuestionNotFound      = errors.New("question not found")
)

type QuestionnaireService struct {
	questionRepo   port.QuestionRepository
	responseRepo   port.QuestionnaireResponseRepository
	projectRepo    port.ProjectRepository
	events         port.EventPublisher
	log            *logger.Logger
}

func NewQuestionnaireService(
	questionRepo port.QuestionRepository,
	responseRepo port.QuestionnaireResponseRepository,
	projectRepo port.ProjectRepository,
	events port.EventPublisher,
	log *logger.Logger,
) *QuestionnaireService {
	return &QuestionnaireService{
		questionRepo: questionRepo,
		responseRepo: responseRepo,
		projectRepo:  projectRepo,
		events:       events,
		log:          log.WithComponent("questionnaire_service"),
	}
}

func (s *QuestionnaireService) GetQuestions(ctx context.Context, category string) ([]*entity.Question, error) {
	if category != "" {
		return s.questionRepo.GetByCategory(ctx, category)
	}
	return s.questionRepo.GetAll(ctx)
}

func (s *QuestionnaireService) GetAdaptiveQuestions(ctx context.Context, answers []entity.Answer) ([]*entity.Question, error) {
	allQuestions, err := s.questionRepo.GetAll(ctx)
	if err != nil {
		return nil, err
	}

	answerMap := make(map[string]string)
	for _, a := range answers {
		answerMap[a.QuestionID] = a.Value
	}

	var filtered []*entity.Question
	for _, q := range allQuestions {
		if q.DependsOn == nil {
			filtered = append(filtered, q)
			continue
		}
		if val, ok := answerMap[q.DependsOn.QuestionID]; ok && val == q.DependsOn.Answer {
			filtered = append(filtered, q)
		}
	}

	return filtered, nil
}

func (s *QuestionnaireService) SaveResponse(ctx context.Context, projectID, clientID string, answers []entity.Answer) (*entity.QuestionnaireResponse, error) {
	existing, _ := s.responseRepo.GetByProjectID(ctx, projectID)
	if existing != nil {
		existing.Answers = answers
		if err := s.responseRepo.Update(ctx, existing); err != nil {
			return nil, err
		}
		return existing, nil
	}

	response := entity.NewQuestionnaireResponse(projectID, clientID)
	response.Answers = answers
	if err := s.responseRepo.Create(ctx, response); err != nil {
		return nil, err
	}

	return response, nil
}

func (s *QuestionnaireService) CompleteQuestionnaire(ctx context.Context, projectID string) (*entity.QuestionnaireResponse, error) {
	response, err := s.responseRepo.GetByProjectID(ctx, projectID)
	if err != nil {
		return nil, ErrQuestionnaireNotFound
	}

	response.Completed = true
	if err := s.responseRepo.Update(ctx, response); err != nil {
		return nil, err
	}

	s.log.Info().Str("project_id", projectID).Msg("questionnaire completed")

	return response, nil
}
