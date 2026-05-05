import client from "prom-client";

export const register = client.register;

// --- HTTP metrics ---

export const httpRequestsTotal = new client.Counter({
  name: "neurodyne_http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"] as const,
});

export const httpRequestDuration = new client.Histogram({
  name: "neurodyne_http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "route", "status_code"] as const,
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});

export const activeConnections = new client.Gauge({
  name: "neurodyne_active_connections",
  help: "Number of active connections",
});

// --- MongoDB metrics ---

export const mongoOperations = new client.Counter({
  name: "neurodyne_mongo_operations_total",
  help: "Total number of MongoDB operations",
  labelNames: ["operation", "collection"] as const,
});

export const mongoLatency = new client.Histogram({
  name: "neurodyne_mongo_operation_duration_seconds",
  help: "MongoDB operation duration in seconds",
  labelNames: ["operation", "collection"] as const,
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1],
});

// --- Kafka metrics ---

export const kafkaMessages = new client.Counter({
  name: "neurodyne_kafka_messages_total",
  help: "Total number of Kafka messages produced/consumed",
  labelNames: ["topic", "direction"] as const,
});

// --- Cache metrics ---

export const cacheHits = new client.Counter({
  name: "neurodyne_cache_hits_total",
  help: "Total number of cache hits",
  labelNames: ["cache"] as const,
});

export const cacheMisses = new client.Counter({
  name: "neurodyne_cache_misses_total",
  help: "Total number of cache misses",
  labelNames: ["cache"] as const,
});

// Collect default Node.js metrics
client.collectDefaultMetrics({ prefix: "neurodyne_" });
