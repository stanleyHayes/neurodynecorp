package auth

import (
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func newTestJWTService() *JWTService {
	return NewJWTService("test-secret-key-for-unit-tests", 1, 24)
}

func TestJWTService_GenerateAccessToken(t *testing.T) {
	svc := newTestJWTService()

	token, err := svc.GenerateAccessToken("user-123", "admin")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if token == "" {
		t.Error("expected non-empty token")
	}
}

func TestJWTService_ValidateAccessToken(t *testing.T) {
	svc := newTestJWTService()

	token, _ := svc.GenerateAccessToken("user-123", "admin")

	claims, err := svc.ValidateAccessToken(token)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if claims.UserID != "user-123" {
		t.Errorf("expected user ID %q, got %q", "user-123", claims.UserID)
	}
	if claims.Role != "admin" {
		t.Errorf("expected role %q, got %q", "admin", claims.Role)
	}
}

func TestJWTService_GenerateRefreshToken(t *testing.T) {
	svc := newTestJWTService()

	token, err := svc.GenerateRefreshToken("user-456")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if token == "" {
		t.Error("expected non-empty token")
	}
}

func TestJWTService_ValidateRefreshToken(t *testing.T) {
	svc := newTestJWTService()

	token, _ := svc.GenerateRefreshToken("user-456")

	claims, err := svc.ValidateRefreshToken(token)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if claims.UserID != "user-456" {
		t.Errorf("expected user ID %q, got %q", "user-456", claims.UserID)
	}
}

func TestJWTService_ExpiredToken(t *testing.T) {
	// Create a service with 0 hour expiration to force expired tokens
	svc := NewJWTService("test-secret", 0, 0)

	// Manually create an expired token
	claims := Claims{
		UserID: "user-789",
		Role:   "client",
		Type:   "access",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(-1 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now().Add(-2 * time.Hour)),
			Issuer:    "neurodynecorp",
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenStr, _ := token.SignedString([]byte("test-secret"))

	_, err := svc.ValidateAccessToken(tokenStr)
	if err == nil {
		t.Error("expected error for expired token, got nil")
	}
}

func TestJWTService_WrongTypeToken(t *testing.T) {
	svc := newTestJWTService()

	t.Run("access token validated as refresh", func(t *testing.T) {
		accessToken, _ := svc.GenerateAccessToken("user-123", "admin")

		_, err := svc.ValidateRefreshToken(accessToken)
		if err == nil {
			t.Error("expected error when validating access token as refresh token")
		}
	})

	t.Run("refresh token validated as access", func(t *testing.T) {
		refreshToken, _ := svc.GenerateRefreshToken("user-123")

		_, err := svc.ValidateAccessToken(refreshToken)
		if err == nil {
			t.Error("expected error when validating refresh token as access token")
		}
	})
}

func TestJWTService_InvalidSecret(t *testing.T) {
	svc1 := NewJWTService("secret-one", 1, 24)
	svc2 := NewJWTService("secret-two", 1, 24)

	token, _ := svc1.GenerateAccessToken("user-123", "admin")

	_, err := svc2.ValidateAccessToken(token)
	if err == nil {
		t.Error("expected error when validating with wrong secret")
	}
}
