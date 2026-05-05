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

type MessageRepository struct {
	collection *mongo.Collection
	metrics    *metrics.Metrics
}

func NewMessageRepository(client *Client, m *metrics.Metrics) *MessageRepository {
	return &MessageRepository{
		collection: client.Collection("messages"),
		metrics:    m,
	}
}

func (r *MessageRepository) Create(ctx context.Context, msg *entity.Message) error {
	start := time.Now()
	defer func() {
		r.metrics.MongoLatency.WithLabelValues("messages", "insert").Observe(time.Since(start).Seconds())
		r.metrics.MongoOperations.WithLabelValues("messages", "insert").Inc()
	}()
	_, err := r.collection.InsertOne(ctx, msg)
	return err
}

func (r *MessageRepository) GetByThread(ctx context.Context, threadID string, page, pageSize int) ([]*entity.Message, int64, error) {
	start := time.Now()
	defer func() {
		r.metrics.MongoLatency.WithLabelValues("messages", "find").Observe(time.Since(start).Seconds())
		r.metrics.MongoOperations.WithLabelValues("messages", "find").Inc()
	}()
	query := bson.M{"thread_id": threadID}
	total, err := r.collection.CountDocuments(ctx, query)
	if err != nil {
		return nil, 0, err
	}
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 50
	}
	opts := options.Find().SetSkip(int64((page - 1) * pageSize)).SetLimit(int64(pageSize)).SetSort(bson.M{"created_at": 1})
	cursor, err := r.collection.Find(ctx, query, opts)
	if err != nil {
		return nil, 0, err
	}
	defer cursor.Close(ctx)
	var msgs []*entity.Message
	if err := cursor.All(ctx, &msgs); err != nil {
		return nil, 0, err
	}
	return msgs, total, nil
}

func (r *MessageRepository) ListByProject(ctx context.Context, projectID string, page, pageSize int) ([]*entity.Message, int64, error) {
	start := time.Now()
	defer func() {
		r.metrics.MongoLatency.WithLabelValues("messages", "find").Observe(time.Since(start).Seconds())
		r.metrics.MongoOperations.WithLabelValues("messages", "find").Inc()
	}()
	query := bson.M{"project_id": projectID}
	total, err := r.collection.CountDocuments(ctx, query)
	if err != nil {
		return nil, 0, err
	}
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 50
	}
	opts := options.Find().SetSkip(int64((page - 1) * pageSize)).SetLimit(int64(pageSize)).SetSort(bson.M{"created_at": -1})
	cursor, err := r.collection.Find(ctx, query, opts)
	if err != nil {
		return nil, 0, err
	}
	defer cursor.Close(ctx)
	var msgs []*entity.Message
	if err := cursor.All(ctx, &msgs); err != nil {
		return nil, 0, err
	}
	return msgs, total, nil
}

var _ port.MessageRepository = (*MessageRepository)(nil)

// --- ThreadRepository ---

type ThreadRepository struct {
	collection *mongo.Collection
	metrics    *metrics.Metrics
}

func NewThreadRepository(client *Client, m *metrics.Metrics) *ThreadRepository {
	return &ThreadRepository{
		collection: client.Collection("threads"),
		metrics:    m,
	}
}

func (r *ThreadRepository) Create(ctx context.Context, thread *entity.Thread) error {
	_, err := r.collection.InsertOne(ctx, thread)
	return err
}

func (r *ThreadRepository) GetByID(ctx context.Context, id string) (*entity.Thread, error) {
	var thread entity.Thread
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&thread)
	if err != nil {
		return nil, err
	}
	return &thread, nil
}

func (r *ThreadRepository) ListByProject(ctx context.Context, projectID string) ([]*entity.Thread, error) {
	opts := options.Find().SetSort(bson.M{"last_message": -1})
	cursor, err := r.collection.Find(ctx, bson.M{"project_id": projectID}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	var threads []*entity.Thread
	if err := cursor.All(ctx, &threads); err != nil {
		return nil, err
	}
	return threads, nil
}

var _ port.ThreadRepository = (*ThreadRepository)(nil)
