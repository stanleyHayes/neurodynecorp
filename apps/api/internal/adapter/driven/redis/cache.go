package redis

import (
	"context"
	"encoding/json"
	"time"

	"github.com/neurodynecorp/api/internal/domain/port"
	"github.com/neurodynecorp/api/pkg/logger"
	"github.com/neurodynecorp/api/pkg/metrics"
	goredis "github.com/redis/go-redis/v9"
)

type CacheService struct {
	client  *goredis.Client
	log     *logger.Logger
	metrics *metrics.Metrics
}

func NewCacheService(addr, password string, db int, log *logger.Logger, m *metrics.Metrics) (*CacheService, error) {
	l := log.WithComponent("redis")

	client := goredis.NewClient(&goredis.Options{
		Addr:     addr,
		Password: password,
		DB:       db,
	})

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		l.Error().Err(err).Msg("failed to connect to Redis")
		return nil, err
	}

	l.Info().Str("addr", addr).Msg("connected to Redis")

	return &CacheService{
		client:  client,
		log:     l,
		metrics: m,
	}, nil
}

func (c *CacheService) Get(ctx context.Context, key string) (string, error) {
	val, err := c.client.Get(ctx, key).Result()
	if err == goredis.Nil {
		c.metrics.CacheMisses.WithLabelValues("redis").Inc()
		return "", err
	}
	if err != nil {
		return "", err
	}
	c.metrics.CacheHits.WithLabelValues("redis").Inc()
	return val, nil
}

func (c *CacheService) Set(ctx context.Context, key string, value interface{}, ttlSeconds int) error {
	var data string
	switch v := value.(type) {
	case string:
		data = v
	default:
		bytes, err := json.Marshal(value)
		if err != nil {
			return err
		}
		data = string(bytes)
	}

	return c.client.Set(ctx, key, data, time.Duration(ttlSeconds)*time.Second).Err()
}

func (c *CacheService) Delete(ctx context.Context, key string) error {
	return c.client.Del(ctx, key).Err()
}

func (c *CacheService) Exists(ctx context.Context, key string) (bool, error) {
	n, err := c.client.Exists(ctx, key).Result()
	return n > 0, err
}

func (c *CacheService) Close() error {
	return c.client.Close()
}

var _ port.CacheService = (*CacheService)(nil)
