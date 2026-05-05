package mongodb

import (
	"context"
	"time"

	"github.com/neurodynecorp/api/pkg/logger"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

type Client struct {
	client   *mongo.Client
	database *mongo.Database
	log      *logger.Logger
}

func NewClient(ctx context.Context, uri, dbName string, log *logger.Logger) (*Client, error) {
	l := log.WithComponent("mongodb")

	clientOpts := options.Client().
		ApplyURI(uri).
		SetMaxPoolSize(100).
		SetMinPoolSize(10).
		SetMaxConnIdleTime(30 * time.Second)

	client, err := mongo.Connect(ctx, clientOpts)
	if err != nil {
		l.Error().Err(err).Msg("failed to connect to MongoDB")
		return nil, err
	}

	if err := client.Ping(ctx, readpref.Primary()); err != nil {
		l.Error().Err(err).Msg("failed to ping MongoDB")
		return nil, err
	}

	l.Info().Str("database", dbName).Msg("connected to MongoDB")

	db := client.Database(dbName)

	c := &Client{
		client:   client,
		database: db,
		log:      l,
	}

	if err := c.ensureIndexes(ctx); err != nil {
		l.Warn().Err(err).Msg("failed to create some indexes")
	}

	return c, nil
}

func (c *Client) Collection(name string) *mongo.Collection {
	return c.database.Collection(name)
}

func (c *Client) Close(ctx context.Context) error {
	return c.client.Disconnect(ctx)
}

func (c *Client) ensureIndexes(ctx context.Context) error {
	// Users indexes
	usersCol := c.Collection("users")
	_, err := usersCol.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys:    map[string]interface{}{"email": 1},
		Options: options.Index().SetUnique(true),
	})
	if err != nil {
		return err
	}

	// Projects indexes
	projectsCol := c.Collection("projects")
	_, err = projectsCol.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{Keys: map[string]interface{}{"client_id": 1}},
		{Keys: map[string]interface{}{"status": 1}},
		{Keys: map[string]interface{}{"created_at": -1}},
	})
	if err != nil {
		return err
	}

	// Specifications indexes
	specsCol := c.Collection("specifications")
	_, err = specsCol.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: map[string]interface{}{"project_id": 1},
	})
	if err != nil {
		return err
	}

	// Notifications indexes
	notifCol := c.Collection("notifications")
	_, err = notifCol.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{Keys: map[string]interface{}{"user_id": 1, "created_at": -1}},
		{Keys: map[string]interface{}{"user_id": 1, "read": 1}},
	})
	if err != nil {
		return err
	}

	// Messages indexes
	msgCol := c.Collection("messages")
	_, err = msgCol.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{Keys: map[string]interface{}{"project_id": 1, "created_at": -1}},
		{Keys: map[string]interface{}{"thread_id": 1, "created_at": -1}},
	})
	if err != nil {
		return err
	}

	// Tasks indexes
	taskCol := c.Collection("tasks")
	_, err = taskCol.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{Keys: map[string]interface{}{"project_id": 1, "status": 1}},
		{Keys: map[string]interface{}{"sprint_id": 1}},
		{Keys: map[string]interface{}{"assignee_id": 1}},
	})

	return err
}
