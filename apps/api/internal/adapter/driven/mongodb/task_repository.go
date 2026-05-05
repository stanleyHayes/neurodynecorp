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

type TaskRepository struct {
	collection *mongo.Collection
	metrics    *metrics.Metrics
}

func NewTaskRepository(client *Client, m *metrics.Metrics) *TaskRepository {
	return &TaskRepository{
		collection: client.Collection("tasks"),
		metrics:    m,
	}
}

func (r *TaskRepository) Create(ctx context.Context, task *entity.Task) error {
	start := time.Now()
	defer func() {
		r.metrics.MongoLatency.WithLabelValues("tasks", "insert").Observe(time.Since(start).Seconds())
		r.metrics.MongoOperations.WithLabelValues("tasks", "insert").Inc()
	}()
	_, err := r.collection.InsertOne(ctx, task)
	return err
}

func (r *TaskRepository) GetByID(ctx context.Context, id string) (*entity.Task, error) {
	start := time.Now()
	defer func() {
		r.metrics.MongoLatency.WithLabelValues("tasks", "find_one").Observe(time.Since(start).Seconds())
		r.metrics.MongoOperations.WithLabelValues("tasks", "find_one").Inc()
	}()
	var task entity.Task
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&task)
	if err != nil {
		return nil, err
	}
	return &task, nil
}

func (r *TaskRepository) Update(ctx context.Context, task *entity.Task) error {
	start := time.Now()
	defer func() {
		r.metrics.MongoLatency.WithLabelValues("tasks", "update").Observe(time.Since(start).Seconds())
		r.metrics.MongoOperations.WithLabelValues("tasks", "update").Inc()
	}()
	task.UpdatedAt = time.Now()
	_, err := r.collection.ReplaceOne(ctx, bson.M{"_id": task.ID}, task)
	return err
}

func (r *TaskRepository) Delete(ctx context.Context, id string) error {
	start := time.Now()
	defer func() {
		r.metrics.MongoLatency.WithLabelValues("tasks", "delete").Observe(time.Since(start).Seconds())
		r.metrics.MongoOperations.WithLabelValues("tasks", "delete").Inc()
	}()
	_, err := r.collection.DeleteOne(ctx, bson.M{"_id": id})
	return err
}

func (r *TaskRepository) ListByProject(ctx context.Context, projectID string, filter port.TaskFilter) ([]*entity.Task, int64, error) {
	start := time.Now()
	defer func() {
		r.metrics.MongoLatency.WithLabelValues("tasks", "find").Observe(time.Since(start).Seconds())
		r.metrics.MongoOperations.WithLabelValues("tasks", "find").Inc()
	}()
	query := bson.M{"project_id": projectID}
	if filter.Status != "" {
		query["status"] = filter.Status
	}
	if filter.AssigneeID != "" {
		query["assignee_id"] = filter.AssigneeID
	}
	if filter.Priority != "" {
		query["priority"] = filter.Priority
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
		pageSize = 50
	}
	opts := options.Find().SetSkip(int64((page - 1) * pageSize)).SetLimit(int64(pageSize)).SetSort(bson.M{"created_at": -1})
	cursor, err := r.collection.Find(ctx, query, opts)
	if err != nil {
		return nil, 0, err
	}
	defer cursor.Close(ctx)
	var tasks []*entity.Task
	if err := cursor.All(ctx, &tasks); err != nil {
		return nil, 0, err
	}
	return tasks, total, nil
}

func (r *TaskRepository) ListBySprint(ctx context.Context, sprintID string) ([]*entity.Task, error) {
	start := time.Now()
	defer func() {
		r.metrics.MongoLatency.WithLabelValues("tasks", "find").Observe(time.Since(start).Seconds())
		r.metrics.MongoOperations.WithLabelValues("tasks", "find").Inc()
	}()
	cursor, err := r.collection.Find(ctx, bson.M{"sprint_id": sprintID})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	var tasks []*entity.Task
	if err := cursor.All(ctx, &tasks); err != nil {
		return nil, err
	}
	return tasks, nil
}

var _ port.TaskRepository = (*TaskRepository)(nil)

// --- SprintRepository ---

type SprintRepository struct {
	collection *mongo.Collection
	metrics    *metrics.Metrics
}

func NewSprintRepository(client *Client, m *metrics.Metrics) *SprintRepository {
	return &SprintRepository{
		collection: client.Collection("sprints"),
		metrics:    m,
	}
}

func (r *SprintRepository) Create(ctx context.Context, sprint *entity.Sprint) error {
	_, err := r.collection.InsertOne(ctx, sprint)
	return err
}

func (r *SprintRepository) GetByID(ctx context.Context, id string) (*entity.Sprint, error) {
	var sprint entity.Sprint
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&sprint)
	if err != nil {
		return nil, err
	}
	return &sprint, nil
}

func (r *SprintRepository) Update(ctx context.Context, sprint *entity.Sprint) error {
	sprint.UpdatedAt = time.Now()
	_, err := r.collection.ReplaceOne(ctx, bson.M{"_id": sprint.ID}, sprint)
	return err
}

func (r *SprintRepository) ListByProject(ctx context.Context, projectID string) ([]*entity.Sprint, error) {
	opts := options.Find().SetSort(bson.M{"start_date": -1})
	cursor, err := r.collection.Find(ctx, bson.M{"project_id": projectID}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	var sprints []*entity.Sprint
	if err := cursor.All(ctx, &sprints); err != nil {
		return nil, err
	}
	return sprints, nil
}

func (r *SprintRepository) GetActive(ctx context.Context, projectID string) (*entity.Sprint, error) {
	var sprint entity.Sprint
	err := r.collection.FindOne(ctx, bson.M{"project_id": projectID, "is_active": true}).Decode(&sprint)
	if err != nil {
		return nil, err
	}
	return &sprint, nil
}

var _ port.SprintRepository = (*SprintRepository)(nil)
