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

type UserRepository struct {
	collection *mongo.Collection
	metrics    *metrics.Metrics
}

func NewUserRepository(client *Client, m *metrics.Metrics) *UserRepository {
	return &UserRepository{
		collection: client.Collection("users"),
		metrics:    m,
	}
}

func (r *UserRepository) Create(ctx context.Context, user *entity.User) error {
	start := time.Now()
	defer func() {
		r.metrics.MongoLatency.WithLabelValues("users", "insert").Observe(time.Since(start).Seconds())
		r.metrics.MongoOperations.WithLabelValues("users", "insert").Inc()
	}()

	_, err := r.collection.InsertOne(ctx, user)
	return err
}

func (r *UserRepository) GetByID(ctx context.Context, id string) (*entity.User, error) {
	start := time.Now()
	defer func() {
		r.metrics.MongoLatency.WithLabelValues("users", "find_one").Observe(time.Since(start).Seconds())
		r.metrics.MongoOperations.WithLabelValues("users", "find_one").Inc()
	}()

	var user entity.User
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*entity.User, error) {
	start := time.Now()
	defer func() {
		r.metrics.MongoLatency.WithLabelValues("users", "find_one").Observe(time.Since(start).Seconds())
		r.metrics.MongoOperations.WithLabelValues("users", "find_one").Inc()
	}()

	var user entity.User
	err := r.collection.FindOne(ctx, bson.M{"email": email}).Decode(&user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) Update(ctx context.Context, user *entity.User) error {
	start := time.Now()
	defer func() {
		r.metrics.MongoLatency.WithLabelValues("users", "update").Observe(time.Since(start).Seconds())
		r.metrics.MongoOperations.WithLabelValues("users", "update").Inc()
	}()

	user.UpdatedAt = time.Now()
	_, err := r.collection.ReplaceOne(ctx, bson.M{"_id": user.ID}, user)
	return err
}

func (r *UserRepository) Delete(ctx context.Context, id string) error {
	start := time.Now()
	defer func() {
		r.metrics.MongoLatency.WithLabelValues("users", "delete").Observe(time.Since(start).Seconds())
		r.metrics.MongoOperations.WithLabelValues("users", "delete").Inc()
	}()

	_, err := r.collection.DeleteOne(ctx, bson.M{"_id": id})
	return err
}

func (r *UserRepository) List(ctx context.Context, filter port.UserFilter) ([]*entity.User, int64, error) {
	start := time.Now()
	defer func() {
		r.metrics.MongoLatency.WithLabelValues("users", "find").Observe(time.Since(start).Seconds())
		r.metrics.MongoOperations.WithLabelValues("users", "find").Inc()
	}()

	query := bson.M{}
	if filter.Role != "" {
		query["role"] = filter.Role
	}
	if filter.IsActive != nil {
		query["is_active"] = *filter.IsActive
	}
	if filter.Search != "" {
		query["$or"] = []bson.M{
			{"email": bson.M{"$regex": filter.Search, "$options": "i"}},
			{"first_name": bson.M{"$regex": filter.Search, "$options": "i"}},
			{"last_name": bson.M{"$regex": filter.Search, "$options": "i"}},
		}
	}

	total, err := r.collection.CountDocuments(ctx, query)
	if err != nil {
		return nil, 0, err
	}

	page := filter.Page
	if page < 1 {
		page = 1
	}
	pageSize := filter.PageSize
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

	var users []*entity.User
	if err := cursor.All(ctx, &users); err != nil {
		return nil, 0, err
	}

	return users, total, nil
}

// Compile-time interface check
var _ port.UserRepository = (*UserRepository)(nil)
