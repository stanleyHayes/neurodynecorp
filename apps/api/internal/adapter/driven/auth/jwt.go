package auth

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/neurodynecorp/api/internal/domain/port"
)

type JWTService struct {
	secret          []byte
	expirationHours int
	refreshHours    int
}

func NewJWTService(secret string, expirationHours, refreshHours int) *JWTService {
	return &JWTService{
		secret:          []byte(secret),
		expirationHours: expirationHours,
		refreshHours:    refreshHours,
	}
}

type Claims struct {
	UserID string `json:"user_id"`
	Role   string `json:"role,omitempty"`
	Type   string `json:"type"`
	jwt.RegisteredClaims
}

func (s *JWTService) GenerateAccessToken(userID string, role string) (string, error) {
	claims := Claims{
		UserID: userID,
		Role:   role,
		Type:   "access",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Duration(s.expirationHours) * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "neurodynecorp",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.secret)
}

func (s *JWTService) GenerateRefreshToken(userID string) (string, error) {
	claims := Claims{
		UserID: userID,
		Type:   "refresh",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Duration(s.refreshHours) * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "neurodynecorp",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.secret)
}

func (s *JWTService) ValidateAccessToken(tokenStr string) (*port.TokenClaims, error) {
	return s.validateToken(tokenStr, "access")
}

func (s *JWTService) ValidateRefreshToken(tokenStr string) (*port.TokenClaims, error) {
	return s.validateToken(tokenStr, "refresh")
}

func (s *JWTService) validateToken(tokenStr string, expectedType string) (*port.TokenClaims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return s.secret, nil
	})
	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token")
	}

	if claims.Type != expectedType {
		return nil, errors.New("invalid token type")
	}

	return &port.TokenClaims{
		UserID: claims.UserID,
		Role:   claims.Role,
	}, nil
}

var _ port.TokenService = (*JWTService)(nil)
