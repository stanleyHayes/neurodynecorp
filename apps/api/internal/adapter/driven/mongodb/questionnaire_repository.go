package mongodb

import (
	"context"
	"time"

	"github.com/neurodynecorp/api/internal/domain/entity"
	"github.com/neurodynecorp/api/internal/domain/port"
	"github.com/neurodynecorp/api/pkg/metrics"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type QuestionRepository struct {
	collection *mongo.Collection
	metrics    *metrics.Metrics
}

func NewQuestionRepository(client *Client, m *metrics.Metrics) *QuestionRepository {
	return &QuestionRepository{
		collection: client.Collection("questions"),
		metrics:    m,
	}
}

func (r *QuestionRepository) GetAll(ctx context.Context) ([]*entity.Question, error) {
	start := time.Now()
	defer func() {
		r.metrics.MongoLatency.WithLabelValues("questions", "find").Observe(time.Since(start).Seconds())
		r.metrics.MongoOperations.WithLabelValues("questions", "find").Inc()
	}()
	opts := options.Find().SetSort(bson.M{"order": 1})
	cursor, err := r.collection.Find(ctx, bson.M{}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	var questions []*entity.Question
	if err := cursor.All(ctx, &questions); err != nil {
		return nil, err
	}
	return questions, nil
}

func (r *QuestionRepository) GetByCategory(ctx context.Context, category string) ([]*entity.Question, error) {
	start := time.Now()
	defer func() {
		r.metrics.MongoLatency.WithLabelValues("questions", "find").Observe(time.Since(start).Seconds())
		r.metrics.MongoOperations.WithLabelValues("questions", "find").Inc()
	}()
	opts := options.Find().SetSort(bson.M{"order": 1})
	cursor, err := r.collection.Find(ctx, bson.M{"category": category}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	var questions []*entity.Question
	if err := cursor.All(ctx, &questions); err != nil {
		return nil, err
	}
	return questions, nil
}

func (r *QuestionRepository) GetByID(ctx context.Context, id string) (*entity.Question, error) {
	start := time.Now()
	defer func() {
		r.metrics.MongoLatency.WithLabelValues("questions", "find_one").Observe(time.Since(start).Seconds())
		r.metrics.MongoOperations.WithLabelValues("questions", "find_one").Inc()
	}()
	var q entity.Question
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&q)
	if err != nil {
		return nil, err
	}
	return &q, nil
}

func (r *QuestionRepository) Upsert(ctx context.Context, question *entity.Question) error {
	start := time.Now()
	defer func() {
		r.metrics.MongoLatency.WithLabelValues("questions", "upsert").Observe(time.Since(start).Seconds())
		r.metrics.MongoOperations.WithLabelValues("questions", "upsert").Inc()
	}()
	opts := options.Replace().SetUpsert(true)
	_, err := r.collection.ReplaceOne(ctx, bson.M{"_id": question.ID}, question, opts)
	return err
}

var _ port.QuestionRepository = (*QuestionRepository)(nil)

// --- QuestionnaireResponseRepository ---

type QuestionnaireResponseRepository struct {
	collection *mongo.Collection
	metrics    *metrics.Metrics
}

func NewQuestionnaireResponseRepository(client *Client, m *metrics.Metrics) *QuestionnaireResponseRepository {
	return &QuestionnaireResponseRepository{
		collection: client.Collection("questionnaire_responses"),
		metrics:    m,
	}
}

func (r *QuestionnaireResponseRepository) Create(ctx context.Context, resp *entity.QuestionnaireResponse) error {
	start := time.Now()
	defer func() {
		r.metrics.MongoLatency.WithLabelValues("questionnaire_responses", "insert").Observe(time.Since(start).Seconds())
		r.metrics.MongoOperations.WithLabelValues("questionnaire_responses", "insert").Inc()
	}()
	_, err := r.collection.InsertOne(ctx, resp)
	return err
}

func (r *QuestionnaireResponseRepository) GetByID(ctx context.Context, id string) (*entity.QuestionnaireResponse, error) {
	start := time.Now()
	defer func() {
		r.metrics.MongoLatency.WithLabelValues("questionnaire_responses", "find_one").Observe(time.Since(start).Seconds())
		r.metrics.MongoOperations.WithLabelValues("questionnaire_responses", "find_one").Inc()
	}()
	var resp entity.QuestionnaireResponse
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&resp)
	if err != nil {
		return nil, err
	}
	return &resp, nil
}

func (r *QuestionnaireResponseRepository) GetByProjectID(ctx context.Context, projectID string) (*entity.QuestionnaireResponse, error) {
	start := time.Now()
	defer func() {
		r.metrics.MongoLatency.WithLabelValues("questionnaire_responses", "find_one").Observe(time.Since(start).Seconds())
		r.metrics.MongoOperations.WithLabelValues("questionnaire_responses", "find_one").Inc()
	}()
	var resp entity.QuestionnaireResponse
	err := r.collection.FindOne(ctx, bson.M{"project_id": projectID}).Decode(&resp)
	if err != nil {
		return nil, err
	}
	return &resp, nil
}

func (r *QuestionnaireResponseRepository) Update(ctx context.Context, resp *entity.QuestionnaireResponse) error {
	start := time.Now()
	defer func() {
		r.metrics.MongoLatency.WithLabelValues("questionnaire_responses", "update").Observe(time.Since(start).Seconds())
		r.metrics.MongoOperations.WithLabelValues("questionnaire_responses", "update").Inc()
	}()
	resp.UpdatedAt = time.Now()
	_, err := r.collection.ReplaceOne(ctx, bson.M{"_id": resp.ID}, resp)
	return err
}

var _ port.QuestionnaireResponseRepository = (*QuestionnaireResponseRepository)(nil)
