package kafka

import (
	"context"

	"github.com/neurodynecorp/api/internal/domain/port"
	"github.com/neurodynecorp/api/pkg/logger"
	"github.com/neurodynecorp/api/pkg/metrics"
	"github.com/segmentio/kafka-go"
)

type Subscriber struct {
	readers map[string]*kafka.Reader
	brokers []string
	groupID string
	log     *logger.Logger
	metrics *metrics.Metrics
}

func NewSubscriber(brokers []string, groupID string, log *logger.Logger, m *metrics.Metrics) *Subscriber {
	return &Subscriber{
		readers: make(map[string]*kafka.Reader),
		brokers: brokers,
		groupID: groupID,
		log:     log.WithComponent("kafka_subscriber"),
		metrics: m,
	}
}

func (s *Subscriber) Subscribe(ctx context.Context, topic string, handler func(key string, payload []byte) error) error {
	reader := kafka.NewReader(kafka.ReaderConfig{
		Brokers:  s.brokers,
		Topic:    topic,
		GroupID:  s.groupID,
		MinBytes: 1,
		MaxBytes: 10e6,
	})
	s.readers[topic] = reader

	go func() {
		for {
			msg, err := reader.ReadMessage(ctx)
			if err != nil {
				if ctx.Err() != nil {
					return
				}
				s.log.Error().Err(err).Str("topic", topic).Msg("failed to read message")
				continue
			}

			s.metrics.KafkaMessagesTotal.WithLabelValues(topic, "consumed").Inc()

			if err := handler(string(msg.Key), msg.Value); err != nil {
				s.log.Error().Err(err).
					Str("topic", topic).
					Str("key", string(msg.Key)).
					Msg("failed to handle message")
			}
		}
	}()

	s.log.Info().Str("topic", topic).Msg("subscribed to topic")
	return nil
}

func (s *Subscriber) Close() error {
	for topic, r := range s.readers {
		if err := r.Close(); err != nil {
			s.log.Error().Err(err).Str("topic", topic).Msg("failed to close reader")
		}
	}
	return nil
}

var _ port.EventSubscriber = (*Subscriber)(nil)
