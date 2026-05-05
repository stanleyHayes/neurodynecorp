package logger

import (
	"testing"
)

func TestNew(t *testing.T) {
	tests := []struct {
		name        string
		environment string
	}{
		{"development logger", "development"},
		{"production logger", "production"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			log := New(tt.environment)
			if log == nil {
				t.Fatal("expected non-nil logger")
			}
		})
	}
}

func TestLogger_WithComponent(t *testing.T) {
	log := New("test")

	componentLog := log.WithComponent("auth_service")
	if componentLog == nil {
		t.Fatal("expected non-nil logger")
	}

	// Verify it is a different logger instance
	if componentLog == log {
		t.Error("expected a new logger instance from WithComponent")
	}
}

func TestLogger_WithRequestID(t *testing.T) {
	log := New("test")

	reqLog := log.WithRequestID("req-abc-123")
	if reqLog == nil {
		t.Fatal("expected non-nil logger")
	}

	// Verify it is a different logger instance
	if reqLog == log {
		t.Error("expected a new logger instance from WithRequestID")
	}
}

func TestLogger_LogLevels(t *testing.T) {
	log := New("test")

	// These should not panic
	log.Info().Msg("info message")
	log.Debug().Msg("debug message")
	log.Warn().Msg("warn message")
	log.Error().Msg("error message")
}

func TestLogger_Chaining(t *testing.T) {
	log := New("test")

	chained := log.WithComponent("svc").WithRequestID("req-1")
	if chained == nil {
		t.Fatal("expected non-nil logger after chaining")
	}

	// Should not panic
	chained.Info().Str("key", "value").Msg("chained log")
}
