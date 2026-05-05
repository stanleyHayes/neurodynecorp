package kafka

import (
	"context"
	"time"

	"github.com/neurodynecorp/api/internal/domain/port"
	"github.com/neurodynecorp/api/pkg/logger"
	"github.com/neurodynecorp/api/pkg/metrics"
	"github.com/segmentio/kafka-go"
)

type Publisher struct {
	writers map[string]*kafka.Writer
	brokers []string
	log     *logger.Logger
	metrics *metrics.Metrics
}

func NewPublisher(brokers []string, log *logger.Logger, m *metrics.Metrics) *Publisher {
	return &Publisher{
		writers: make(map[string]*kafka.Writer),
		brokers: brokers,
		log:     log.WithComponent("kafka_publisher"),
		metrics: m,
	}
}

func (p *Publisher) getWriter(topic string) *kafka.Writer {
	if w, ok := p.writers[topic]; ok {
		return w
	}

	w := &kafka.Writer{
		Addr:         kafka.TCP(p.brokers...),
		Topic:        topic,
		Balancer:     &kafka.LeastBytes{},
		BatchTimeout: 10 * time.Millisecond,
		RequiredAcks: kafka.RequireOne,
	}
	p.writers[topic] = w
	return w
}

func (p *Publisher) Publish(ctx context.Context, topic string, key string, payload []byte) error {
	writer := p.getWriter(topic)

	err := writer.WriteMessages(ctx, kafka.Message{
		Key:   []byte(key),
		Value: payload,
		Time:  time.Now(),
	})
	if err != nil {
		p.log.Error().Err(err).Str("topic", topic).Str("key", key).Msg("failed to publish message")
		return err
	}

	p.metrics.KafkaMessagesTotal.WithLabelValues(topic, "published").Inc()
	p.log.Debug().Str("topic", topic).Str("key", key).Msg("message published")

	return nil
}

func (p *Publisher) Close() error {
	for topic, w := range p.writers {
		if err := w.Close(); err != nil {
			p.log.Error().Err(err).Str("topic", topic).Msg("failed to close writer")
		}
	}
	return nil
}

var _ port.EventPublisher = (*Publisher)(nil)
