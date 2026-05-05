package logger

import (
	"io"
	"os"
	"time"

	"github.com/rs/zerolog"
)

type Logger struct {
	zl zerolog.Logger
}

func New(environment string) *Logger {
	var output io.Writer

	if environment == "development" {
		output = zerolog.ConsoleWriter{
			Out:        os.Stdout,
			TimeFormat: time.RFC3339,
		}
	} else {
		output = os.Stdout
	}

	zl := zerolog.New(output).
		With().
		Timestamp().
		Caller().
		Str("service", "neurodyne-api").
		Logger()

	if environment == "development" {
		zl = zl.Level(zerolog.DebugLevel)
	} else {
		zl = zl.Level(zerolog.InfoLevel)
	}

	return &Logger{zl: zl}
}

func (l *Logger) Info() *zerolog.Event {
	return l.zl.Info()
}

func (l *Logger) Debug() *zerolog.Event {
	return l.zl.Debug()
}

func (l *Logger) Warn() *zerolog.Event {
	return l.zl.Warn()
}

func (l *Logger) Error() *zerolog.Event {
	return l.zl.Error()
}

func (l *Logger) Fatal() *zerolog.Event {
	return l.zl.Fatal()
}

func (l *Logger) With() zerolog.Context {
	return l.zl.With()
}

func (l *Logger) WithComponent(component string) *Logger {
	return &Logger{
		zl: l.zl.With().Str("component", component).Logger(),
	}
}

func (l *Logger) WithRequestID(requestID string) *Logger {
	return &Logger{
		zl: l.zl.With().Str("request_id", requestID).Logger(),
	}
}
