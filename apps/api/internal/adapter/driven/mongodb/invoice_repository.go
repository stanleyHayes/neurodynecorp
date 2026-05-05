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

type InvoiceRepository struct {
	collection *mongo.Collection
	metrics    *metrics.Metrics
}

func NewInvoiceRepository(client *Client, m *metrics.Metrics) *InvoiceRepository {
	return &InvoiceRepository{
		collection: client.Collection("invoices"),
		metrics:    m,
	}
}

func (r *InvoiceRepository) Create(ctx context.Context, invoice *entity.Invoice) error {
	start := time.Now()
	defer func() {
		r.metrics.MongoLatency.WithLabelValues("invoices", "insert").Observe(time.Since(start).Seconds())
		r.metrics.MongoOperations.WithLabelValues("invoices", "insert").Inc()
	}()
	_, err := r.collection.InsertOne(ctx, invoice)
	return err
}

func (r *InvoiceRepository) GetByID(ctx context.Context, id string) (*entity.Invoice, error) {
	start := time.Now()
	defer func() {
		r.metrics.MongoLatency.WithLabelValues("invoices", "find_one").Observe(time.Since(start).Seconds())
		r.metrics.MongoOperations.WithLabelValues("invoices", "find_one").Inc()
	}()
	var inv entity.Invoice
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&inv)
	if err != nil {
		return nil, err
	}
	return &inv, nil
}

func (r *InvoiceRepository) ListByClient(ctx context.Context, clientID string, page, pageSize int) ([]*entity.Invoice, int64, error) {
	start := time.Now()
	defer func() {
		r.metrics.MongoLatency.WithLabelValues("invoices", "find").Observe(time.Since(start).Seconds())
		r.metrics.MongoOperations.WithLabelValues("invoices", "find").Inc()
	}()
	query := bson.M{"client_id": clientID}
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
	var invoices []*entity.Invoice
	if err := cursor.All(ctx, &invoices); err != nil {
		return nil, 0, err
	}
	return invoices, total, nil
}

func (r *InvoiceRepository) ListByProject(ctx context.Context, projectID string) ([]*entity.Invoice, error) {
	start := time.Now()
	defer func() {
		r.metrics.MongoLatency.WithLabelValues("invoices", "find").Observe(time.Since(start).Seconds())
		r.metrics.MongoOperations.WithLabelValues("invoices", "find").Inc()
	}()
	opts := options.Find().SetSort(bson.M{"created_at": -1})
	cursor, err := r.collection.Find(ctx, bson.M{"project_id": projectID}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	var invoices []*entity.Invoice
	if err := cursor.All(ctx, &invoices); err != nil {
		return nil, err
	}
	return invoices, nil
}

func (r *InvoiceRepository) Update(ctx context.Context, invoice *entity.Invoice) error {
	start := time.Now()
	defer func() {
		r.metrics.MongoLatency.WithLabelValues("invoices", "update").Observe(time.Since(start).Seconds())
		r.metrics.MongoOperations.WithLabelValues("invoices", "update").Inc()
	}()
	invoice.UpdatedAt = time.Now()
	_, err := r.collection.ReplaceOne(ctx, bson.M{"_id": invoice.ID}, invoice)
	return err
}

var _ port.InvoiceRepository = (*InvoiceRepository)(nil)
