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

type NotificationRepository struct {
	collection *mongo.Collection
	metrics    *metrics.Metrics
}

func NewNotificationRepository(client *Client, m *metrics.Metrics) *NotificationRepository {
	return &NotificationRepository{
		collection: client.Collection("notifications"),
		metrics:    m,
	}
}

func (r *NotificationRepository) Create(ctx context.Context, notif *entity.Notification) error {
	start := time.Now()
	defer func() {
		r.metrics.MongoLatency.WithLabelValues("notifications", "insert").Observe(time.Since(start).Seconds())
		r.metrics.MongoOperations.WithLabelValues("notifications", "insert").Inc()
	}()
	_, err := r.collection.InsertOne(ctx, notif)
	return err
}

func (r *NotificationRepository) GetByUser(ctx context.Context, userID string, page, pageSize int) ([]*entity.Notification, int64, error) {
	start := time.Now()
	defer func() {
		r.metrics.MongoLatency.WithLabelValues("notifications", "find").Observe(time.Since(start).Seconds())
		r.metrics.MongoOperations.WithLabelValues("notifications", "find").Inc()
	}()
	query := bson.M{"user_id": userID}
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
	opts := options.Find().SetSkip(int64((page - 1) * pageSize)).SetLimit(int64(pageSize)).SetSort(bson.M{"created_at": -1})
	cursor, err := r.collection.Find(ctx, query, opts)
	if err != nil {
		return nil, 0, err
	}
	defer cursor.Close(ctx)
	var notifs []*entity.Notification
	if err := cursor.All(ctx, &notifs); err != nil {
		return nil, 0, err
	}
	return notifs, total, nil
}

func (r *NotificationRepository) MarkAsRead(ctx context.Context, id string) error {
	_, err := r.collection.UpdateOne(ctx, bson.M{"_id": id}, bson.M{
		"$set": bson.M{"read": true, "read_at": time.Now()},
	})
	return err
}

func (r *NotificationRepository) MarkAllAsRead(ctx context.Context, userID string) error {
	_, err := r.collection.UpdateMany(ctx, bson.M{"user_id": userID, "read": false}, bson.M{
		"$set": bson.M{"read": true, "read_at": time.Now()},
	})
	return err
}

func (r *NotificationRepository) CountUnread(ctx context.Context, userID string) (int64, error) {
	return r.collection.CountDocuments(ctx, bson.M{"user_id": userID, "read": false})
}

var _ port.NotificationRepository = (*NotificationRepository)(nil)
