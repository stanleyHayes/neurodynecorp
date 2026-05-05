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

type ProjectRepository struct {
	collection *mongo.Collection
	metrics    *metrics.Metrics
}

func NewProjectRepository(client *Client, m *metrics.Metrics) *ProjectRepository {
	return &ProjectRepository{
		collection: client.Collection("projects"),
		metrics:    m,
	}
}

func (r *ProjectRepository) Create(ctx context.Context, project *entity.Project) error {
	start := time.Now()
	defer func() {
		r.metrics.MongoLatency.WithLabelValues("projects", "insert").Observe(time.Since(start).Seconds())
		r.metrics.MongoOperations.WithLabelValues("projects", "insert").Inc()
	}()

	_, err := r.collection.InsertOne(ctx, project)
	return err
}

func (r *ProjectRepository) GetByID(ctx context.Context, id string) (*entity.Project, error) {
	start := time.Now()
	defer func() {
		r.metrics.MongoLatency.WithLabelValues("projects", "find_one").Observe(time.Since(start).Seconds())
		r.metrics.MongoOperations.WithLabelValues("projects", "find_one").Inc()
	}()

	var project entity.Project
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&project)
	if err != nil {
		return nil, err
	}
	return &project, nil
}

func (r *ProjectRepository) Update(ctx context.Context, project *entity.Project) error {
	start := time.Now()
	defer func() {
		r.metrics.MongoLatency.WithLabelValues("projects", "update").Observe(time.Since(start).Seconds())
		r.metrics.MongoOperations.WithLabelValues("projects", "update").Inc()
	}()

	project.UpdatedAt = time.Now()
	_, err := r.collection.ReplaceOne(ctx, bson.M{"_id": project.ID}, project)
	return err
}

func (r *ProjectRepository) Delete(ctx context.Context, id string) error {
	start := time.Now()
	defer func() {
		r.metrics.MongoLatency.WithLabelValues("projects", "delete").Observe(time.Since(start).Seconds())
		r.metrics.MongoOperations.WithLabelValues("projects", "delete").Inc()
	}()

	_, err := r.collection.DeleteOne(ctx, bson.M{"_id": id})
	return err
}

func (r *ProjectRepository) ListByClient(ctx context.Context, clientID string, page, pageSize int) ([]*entity.Project, int64, error) {
	return r.list(ctx, bson.M{"client_id": clientID}, page, pageSize)
}

func (r *ProjectRepository) ListByStatus(ctx context.Context, status entity.ProjectStatus, page, pageSize int) ([]*entity.Project, int64, error) {
	return r.list(ctx, bson.M{"status": status}, page, pageSize)
}

func (r *ProjectRepository) List(ctx context.Context, filter port.ProjectFilter) ([]*entity.Project, int64, error) {
	query := bson.M{}
	if filter.ClientID != "" {
		query["client_id"] = filter.ClientID
	}
	if filter.Status != "" {
		query["status"] = filter.Status
	}
	if filter.Type != "" {
		query["type"] = filter.Type
	}
	if filter.Search != "" {
		query["$or"] = []bson.M{
			{"title": bson.M{"$regex": filter.Search, "$options": "i"}},
			{"description": bson.M{"$regex": filter.Search, "$options": "i"}},
		}
	}
	return r.list(ctx, query, filter.Page, filter.PageSize)
}

func (r *ProjectRepository) list(ctx context.Context, query bson.M, page, pageSize int) ([]*entity.Project, int64, error) {
	start := time.Now()
	defer func() {
		r.metrics.MongoLatency.WithLabelValues("projects", "find").Observe(time.Since(start).Seconds())
		r.metrics.MongoOperations.WithLabelValues("projects", "find").Inc()
	}()

	total, err := r.collection.CountDocuments(ctx, query)
	if err != nil {
		return nil, 0, err
	}

	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 20
	}

	opts := options.Find().
		SetSkip(int64((page - 1) * pageSize)).
		SetLimit(int64(pageSize)).
		SetSort(bson.M{"created_at": -1})

	cursor, err := r.collection.Find(ctx, query, opts)
	if err != nil {
		return nil, 0, err
	}
	defer cursor.Close(ctx)

	var projects []*entity.Project
	if err := cursor.All(ctx, &projects); err != nil {
		return nil, 0, err
	}

	return projects, total, nil
}

var _ port.ProjectRepository = (*ProjectRepository)(nil)
