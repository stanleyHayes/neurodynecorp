package metrics

import (
	"fmt"
	"net/http"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

type Metrics struct {
	GRPCRequestsTotal    *prometheus.CounterVec
	GRPCRequestDuration  *prometheus.HistogramVec
	HTTPRequestsTotal    *prometheus.CounterVec
	HTTPRequestDuration  *prometheus.HistogramVec
	ActiveConnections    prometheus.Gauge
	MongoOperations      *prometheus.CounterVec
	MongoLatency         *prometheus.HistogramVec
	KafkaMessagesTotal   *prometheus.CounterVec
	CacheHits            *prometheus.CounterVec
	CacheMisses          *prometheus.CounterVec
}

func New() *Metrics {
	return &Metrics{
		GRPCRequestsTotal: promauto.NewCounterVec(
			prometheus.CounterOpts{
				Name: "neurodyne_grpc_requests_total",
				Help: "Total number of gRPC requests",
			},
			[]string{"method", "status"},
		),
		GRPCRequestDuration: promauto.NewHistogramVec(
			prometheus.HistogramOpts{
				Name:    "neurodyne_grpc_request_duration_seconds",
				Help:    "Duration of gRPC requests in seconds",
				Buckets: prometheus.DefBuckets,
			},
			[]string{"method"},
		),
		HTTPRequestsTotal: promauto.NewCounterVec(
			prometheus.CounterOpts{
				Name: "neurodyne_http_requests_total",
				Help: "Total number of HTTP requests",
			},
			[]string{"method", "path", "status"},
		),
		HTTPRequestDuration: promauto.NewHistogramVec(
			prometheus.HistogramOpts{
				Name:    "neurodyne_http_request_duration_seconds",
				Help:    "Duration of HTTP requests in seconds",
				Buckets: prometheus.DefBuckets,
			},
			[]string{"method", "path"},
		),
		ActiveConnections: promauto.NewGauge(
			prometheus.GaugeOpts{
				Name: "neurodyne_active_connections",
				Help: "Number of active connections",
			},
		),
		MongoOperations: promauto.NewCounterVec(
			prometheus.CounterOpts{
				Name: "neurodyne_mongo_operations_total",
				Help: "Total number of MongoDB operations",
			},
			[]string{"collection", "operation"},
		),
		MongoLatency: promauto.NewHistogramVec(
			prometheus.HistogramOpts{
				Name:    "neurodyne_mongo_operation_duration_seconds",
				Help:    "Duration of MongoDB operations in seconds",
				Buckets: prometheus.DefBuckets,
			},
			[]string{"collection", "operation"},
		),
		KafkaMessagesTotal: promauto.NewCounterVec(
			prometheus.CounterOpts{
				Name: "neurodyne_kafka_messages_total",
				Help: "Total number of Kafka messages",
			},
			[]string{"topic", "direction"},
		),
		CacheHits: promauto.NewCounterVec(
			prometheus.CounterOpts{
				Name: "neurodyne_cache_hits_total",
				Help: "Total number of cache hits",
			},
			[]string{"cache"},
		),
		CacheMisses: promauto.NewCounterVec(
			prometheus.CounterOpts{
				Name: "neurodyne_cache_misses_total",
				Help: "Total number of cache misses",
			},
			[]string{"cache"},
		),
	}
}

func (m *Metrics) StartServer(port int) error {
	mux := http.NewServeMux()
	mux.Handle("/metrics", promhttp.Handler())
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok"}`))
	})

	return http.ListenAndServe(fmt.Sprintf(":%d", port), mux)
}
