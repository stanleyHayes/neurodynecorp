package port

import (
	"context"
	"io"
)

// CacheService defines the driven port for caching.
type CacheService interface {
	Get(ctx context.Context, key string) (string, error)
	Set(ctx context.Context, key string, value interface{}, ttlSeconds int) error
	Delete(ctx context.Context, key string) error
	Exists(ctx context.Context, key string) (bool, error)
}

// EventPublisher defines the driven port for event publishing.
type EventPublisher interface {
	Publish(ctx context.Context, topic string, key string, payload []byte) error
}

// EventSubscriber defines the driven port for event subscribing.
type EventSubscriber interface {
	Subscribe(ctx context.Context, topic string, handler func(key string, payload []byte) error) error
	Close() error
}

// FileStorage defines the driven port for file storage.
type FileStorage interface {
	Upload(ctx context.Context, file io.Reader, filename string, folder string) (string, error)
	Delete(ctx context.Context, publicID string) error
	GetURL(publicID string) string
}

// EmailService defines the driven port for sending emails.
type EmailService interface {
	SendEmail(ctx context.Context, to, subject, htmlBody string) error
	SendTemplateEmail(ctx context.Context, to, subject, templateID string, data map[string]interface{}) error
}

// PasswordHasher defines the driven port for password hashing.
type PasswordHasher interface {
	Hash(password string) (string, error)
	Compare(hashedPassword, password string) error
}

// TokenService defines the driven port for JWT token management.
type TokenService interface {
	GenerateAccessToken(userID string, role string) (string, error)
	GenerateRefreshToken(userID string) (string, error)
	ValidateAccessToken(token string) (*TokenClaims, error)
	ValidateRefreshToken(token string) (*TokenClaims, error)
}

type TokenClaims struct {
	UserID string
	Role   string
}

// PaymentGateway defines the driven port for payment processing.
type PaymentGateway interface {
	CreatePaymentIntent(ctx context.Context, amount float64, currency string, metadata map[string]string) (string, error)
	ConfirmPayment(ctx context.Context, paymentID string) error
	GetPaymentStatus(ctx context.Context, paymentID string) (string, error)
}
