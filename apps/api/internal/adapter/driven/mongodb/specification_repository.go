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

type SpecificationRepository struct {
	collection *mongo.Collection
	metrics    *metrics.Metrics
}

func NewSpecificationRepository(client *Client, m *metrics.Metrics) *SpecificationRepository {
	return &SpecificationRepository{
		collection: client.Collection("specifications"),
		metrics:    m,
	}
}

func (r *SpecificationRepository) Create(ctx context.Context, spec *entity.Specification) error {
	start := time.Now()
	defer func() {
		r.metrics.MongoLatency.WithLabelValues("specifications", "insert").Observe(time.Since(start).Seconds())
		r.metrics.MongoOperations.WithLabelValues("specifications", "insert").Inc()
	}()
	_, err := r.collection.InsertOne(ctx, spec)
	return err
}

func (r *SpecificationRepository) GetByID(ctx context.Context, id string) (*entity.Specification, error) {
	start := time.Now()
	defer func() {
		r.metrics.MongoLatency.WithLabelValues("specifications", "find_one").Observe(time.Since(start).Seconds())
		r.metrics.MongoOperations.WithLabelValues("specifications", "find_one").Inc()
	}()
	var spec entity.Specification
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&spec)
	if err != nil {
		return nil, err
	}
	return &spec, nil
}

func (r *SpecificationRepository) GetByProjectID(ctx context.Context, projectID string) (*entity.Specification, error) {
	start := time.Now()
	defer func() {
		r.metrics.MongoLatency.WithLabelValues("specifications", "find_one").Observe(time.Since(start).Seconds())
		r.metrics.MongoOperations.WithLabelValues("specifications", "find_one").Inc()
	}()
	opts := options.FindOne().SetSort(bson.M{"version": -1})
	var spec entity.Specification
	err := r.collection.FindOne(ctx, bson.M{"project_id": projectID}, opts).Decode(&spec)
	if err != nil {
		return nil, err
	}
	return &spec, nil
}

func (r *SpecificationRepository) Update(ctx context.Context, spec *entity.Specification) error {
	start := time.Now()
	defer func() {
		r.metrics.MongoLatency.WithLabelValues("specifications", "update").Observe(time.Since(start).Seconds())
		r.metrics.MongoOperations.WithLabelValues("specifications", "update").Inc()
	}()
	spec.UpdatedAt = time.Now()
	_, err := r.collection.ReplaceOne(ctx, bson.M{"_id": spec.ID}, spec)
	return err
}

func (r *SpecificationRepository) ListVersions(ctx context.Context, projectID string) ([]*entity.Specification, error) {
	start := time.Now()
	defer func() {
		r.metrics.MongoLatency.WithLabelValues("specifications", "find").Observe(time.Since(start).Seconds())
		r.metrics.MongoOperations.WithLabelValues("specifications", "find").Inc()
	}()
	opts := options.Find().SetSort(bson.M{"version": -1})
	cursor, err := r.collection.Find(ctx, bson.M{"project_id": projectID}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	var specs []*entity.Specification
	if err := cursor.All(ctx, &specs); err != nil {
		return nil, err
	}
	return specs, nil
}

var _ port.SpecificationRepository = (*SpecificationRepository)(nil)
