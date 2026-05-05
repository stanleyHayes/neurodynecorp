package config

import (
	"testing"
)

func TestLoad_Defaults(t *testing.T) {
	cfg, err := Load()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if cfg.Server.HTTPPort != 8080 {
		t.Errorf("expected HTTP port 8080, got %d", cfg.Server.HTTPPort)
	}
	if cfg.Server.GRPCPort != 50051 {
		t.Errorf("expected gRPC port 50051, got %d", cfg.Server.GRPCPort)
	}
	if cfg.Server.Environment != "development" {
		t.Errorf("expected environment %q, got %q", "development", cfg.Server.Environment)
	}
	if cfg.MongoDB.URI != "mongodb://localhost:27017" {
		t.Errorf("expected MongoDB URI %q, got %q", "mongodb://localhost:27017", cfg.MongoDB.URI)
	}
	if cfg.MongoDB.Database != "neurodynecorp" {
		t.Errorf("expected MongoDB database %q, got %q", "neurodynecorp", cfg.MongoDB.Database)
	}
	if cfg.Redis.Addr != "localhost:6379" {
		t.Errorf("expected Redis addr %q, got %q", "localhost:6379", cfg.Redis.Addr)
	}
	if cfg.Redis.DB != 0 {
		t.Errorf("expected Redis DB 0, got %d", cfg.Redis.DB)
	}
	if len(cfg.Kafka.Brokers) != 1 || cfg.Kafka.Brokers[0] != "localhost:9092" {
		t.Errorf("expected Kafka brokers [localhost:9092], got %v", cfg.Kafka.Brokers)
	}
	if cfg.Kafka.GroupID != "neurodyne-api" {
		t.Errorf("expected Kafka group ID %q, got %q", "neurodyne-api", cfg.Kafka.GroupID)
	}
	if cfg.JWT.ExpirationHours != 24 {
		t.Errorf("expected JWT expiration 24h, got %d", cfg.JWT.ExpirationHours)
	}
	if cfg.JWT.RefreshHours != 168 {
		t.Errorf("expected JWT refresh 168h, got %d", cfg.JWT.RefreshHours)
	}
	if !cfg.Metrics.Enabled {
		t.Error("expected metrics to be enabled by default")
	}
	if cfg.Metrics.Port != 9090 {
		t.Errorf("expected metrics port 9090, got %d", cfg.Metrics.Port)
	}
	if cfg.Email.FromAddress != "noreply@neurodynecorp.com" {
		t.Errorf("expected email from %q, got %q", "noreply@neurodynecorp.com", cfg.Email.FromAddress)
	}
}
