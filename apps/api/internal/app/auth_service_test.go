package app

import (
	"context"
	"errors"
	"testing"

	"github.com/neurodynecorp/api/internal/domain/entity"
	"github.com/neurodynecorp/api/internal/domain/port"
	"github.com/neurodynecorp/api/pkg/logger"
)

// --- Mock UserRepository ---

type mockUserRepo struct {
	users map[string]*entity.User // keyed by email
}

func newMockUserRepo() *mockUserRepo {
	return &mockUserRepo{users: make(map[string]*entity.User)}
}

func (m *mockUserRepo) Create(_ context.Context, user *entity.User) error {
	m.users[user.Email] = user
	return nil
}

func (m *mockUserRepo) GetByID(_ context.Context, id string) (*entity.User, error) {
	for _, u := range m.users {
		if u.ID == id {
			return u, nil
		}
	}
	return nil, errors.New("user not found")
}

func (m *mockUserRepo) GetByEmail(_ context.Context, email string) (*entity.User, error) {
	u, ok := m.users[email]
	if !ok {
		return nil, errors.New("user not found")
	}
	return u, nil
}

func (m *mockUserRepo) Update(_ context.Context, user *entity.User) error {
	m.users[user.Email] = user
	return nil
}

func (m *mockUserRepo) Delete(_ context.Context, id string) error {
	for email, u := range m.users {
		if u.ID == id {
			delete(m.users, email)
			return nil
		}
	}
	return errors.New("user not found")
}

func (m *mockUserRepo) List(_ context.Context, _ port.UserFilter) ([]*entity.User, int64, error) {
	var result []*entity.User
	for _, u := range m.users {
		result = append(result, u)
	}
	return result, int64(len(result)), nil
}

// --- Mock PasswordHasher ---

type mockPasswordHasher struct{}

func (m *mockPasswordHasher) Hash(password string) (string, error) {
	return "hashed_" + password, nil
}

func (m *mockPasswordHasher) Compare(hashedPassword, password string) error {
	if hashedPassword == "hashed_"+password {
		return nil
	}
	return errors.New("password mismatch")
}

// --- Mock TokenService ---

type mockTokenService struct{}

func (m *mockTokenService) GenerateAccessToken(userID string, role string) (string, error) {
	return "access_" + userID, nil
}

func (m *mockTokenService) GenerateRefreshToken(userID string) (string, error) {
	return "refresh_" + userID, nil
}

func (m *mockTokenService) ValidateAccessToken(token string) (*port.TokenClaims, error) {
	if len(token) > 7 && token[:7] == "access_" {
		return &port.TokenClaims{UserID: token[7:], Role: "client"}, nil
	}
	return nil, errors.New("invalid token")
}

func (m *mockTokenService) ValidateRefreshToken(token string) (*port.TokenClaims, error) {
	if len(token) > 8 && token[:8] == "refresh_" {
		return &port.TokenClaims{UserID: token[8:]}, nil
	}
	return nil, errors.New("invalid token")
}

// --- Mock EmailService ---

type mockEmailService struct{}

func (m *mockEmailService) SendEmail(_ context.Context, _, _, _ string) error {
	return nil
}

func (m *mockEmailService) SendTemplateEmail(_ context.Context, _, _, _ string, _ map[string]interface{}) error {
	return nil
}

// --- Mock CacheService ---

type mockCacheService struct {
	store map[string]string
}

func newMockCache() *mockCacheService {
	return &mockCacheService{store: make(map[string]string)}
}

func (m *mockCacheService) Get(_ context.Context, key string) (string, error) {
	v, ok := m.store[key]
	if !ok {
		return "", errors.New("key not found")
	}
	return v, nil
}

func (m *mockCacheService) Set(_ context.Context, key string, value interface{}, _ int) error {
	m.store[key] = value.(string)
	return nil
}

func (m *mockCacheService) Delete(_ context.Context, key string) error {
	delete(m.store, key)
	return nil
}

func (m *mockCacheService) Exists(_ context.Context, key string) (bool, error) {
	_, ok := m.store[key]
	return ok, nil
}

// --- Mock EventPublisher ---

type mockEventPublisher struct{}

func (m *mockEventPublisher) Publish(_ context.Context, _, _ string, _ []byte) error {
	return nil
}

// --- Helper ---

func newTestAuthService() (*AuthService, *mockUserRepo) {
	repo := newMockUserRepo()
	svc := NewAuthService(
		repo,
		&mockPasswordHasher{},
		&mockTokenService{},
		&mockEmailService{},
		newMockCache(),
		&mockEventPublisher{},
		logger.New("test"),
	)
	return svc, repo
}

// --- Tests ---

func TestAuthService_Register(t *testing.T) {
	t.Run("success", func(t *testing.T) {
		svc, _ := newTestAuthService()
		ctx := context.Background()

		user, tokens, err := svc.Register(ctx, RegisterInput{
			Email:     "alice@example.com",
			Password:  "secret123",
			FirstName: "Alice",
			LastName:  "Smith",
			Role:      entity.RoleClient,
			Company:   "ACME",
			Phone:     "555-1234",
		})

		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if user == nil {
			t.Fatal("expected user, got nil")
		}
		if user.Email != "alice@example.com" {
			t.Errorf("expected email %q, got %q", "alice@example.com", user.Email)
		}
		if user.PasswordHash != "hashed_secret123" {
			t.Errorf("expected hashed password, got %q", user.PasswordHash)
		}
		if user.Company != "ACME" {
			t.Errorf("expected company %q, got %q", "ACME", user.Company)
		}
		if tokens == nil {
			t.Fatal("expected tokens, got nil")
		}
		if tokens.AccessToken == "" {
			t.Error("expected non-empty access token")
		}
		if tokens.RefreshToken == "" {
			t.Error("expected non-empty refresh token")
		}
	})

	t.Run("duplicate user", func(t *testing.T) {
		svc, _ := newTestAuthService()
		ctx := context.Background()

		input := RegisterInput{
			Email:     "alice@example.com",
			Password:  "secret123",
			FirstName: "Alice",
			LastName:  "Smith",
			Role:      entity.RoleClient,
		}

		_, _, err := svc.Register(ctx, input)
		if err != nil {
			t.Fatalf("first registration failed: %v", err)
		}

		_, _, err = svc.Register(ctx, input)
		if !errors.Is(err, ErrUserExists) {
			t.Errorf("expected ErrUserExists, got %v", err)
		}
	})
}

func TestAuthService_Login(t *testing.T) {
	t.Run("success", func(t *testing.T) {
		svc, _ := newTestAuthService()
		ctx := context.Background()

		_, _, err := svc.Register(ctx, RegisterInput{
			Email:     "alice@example.com",
			Password:  "secret123",
			FirstName: "Alice",
			LastName:  "Smith",
			Role:      entity.RoleClient,
		})
		if err != nil {
			t.Fatalf("registration failed: %v", err)
		}

		user, tokens, err := svc.Login(ctx, "alice@example.com", "secret123")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if user == nil {
			t.Fatal("expected user, got nil")
		}
		if tokens == nil {
			t.Fatal("expected tokens, got nil")
		}
		if user.LastLoginAt.IsZero() {
			t.Error("expected LastLoginAt to be set")
		}
	})

	t.Run("invalid credentials - wrong email", func(t *testing.T) {
		svc, _ := newTestAuthService()
		ctx := context.Background()

		_, _, err := svc.Login(ctx, "nonexistent@example.com", "secret123")
		if !errors.Is(err, ErrInvalidCredentials) {
			t.Errorf("expected ErrInvalidCredentials, got %v", err)
		}
	})

	t.Run("invalid credentials - wrong password", func(t *testing.T) {
		svc, _ := newTestAuthService()
		ctx := context.Background()

		_, _, _ = svc.Register(ctx, RegisterInput{
			Email:     "alice@example.com",
			Password:  "secret123",
			FirstName: "Alice",
			LastName:  "Smith",
			Role:      entity.RoleClient,
		})

		_, _, err := svc.Login(ctx, "alice@example.com", "wrongpassword")
		if !errors.Is(err, ErrInvalidCredentials) {
			t.Errorf("expected ErrInvalidCredentials, got %v", err)
		}
	})

	t.Run("inactive user", func(t *testing.T) {
		svc, repo := newTestAuthService()
		ctx := context.Background()

		_, _, _ = svc.Register(ctx, RegisterInput{
			Email:     "alice@example.com",
			Password:  "secret123",
			FirstName: "Alice",
			LastName:  "Smith",
			Role:      entity.RoleClient,
		})

		// Deactivate the user
		repo.users["alice@example.com"].IsActive = false

		_, _, err := svc.Login(ctx, "alice@example.com", "secret123")
		if !errors.Is(err, ErrUserInactive) {
			t.Errorf("expected ErrUserInactive, got %v", err)
		}
	})
}

func TestAuthService_RefreshToken(t *testing.T) {
	t.Run("success", func(t *testing.T) {
		svc, _ := newTestAuthService()
		ctx := context.Background()

		user, _, err := svc.Register(ctx, RegisterInput{
			Email:     "alice@example.com",
			Password:  "secret123",
			FirstName: "Alice",
			LastName:  "Smith",
			Role:      entity.RoleClient,
		})
		if err != nil {
			t.Fatalf("registration failed: %v", err)
		}

		tokens, err := svc.RefreshToken(ctx, "refresh_"+user.ID)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if tokens == nil {
			t.Fatal("expected tokens, got nil")
		}
		if tokens.AccessToken == "" {
			t.Error("expected non-empty access token")
		}
		if tokens.RefreshToken == "" {
			t.Error("expected non-empty refresh token")
		}
	})

	t.Run("invalid token", func(t *testing.T) {
		svc, _ := newTestAuthService()
		ctx := context.Background()

		_, err := svc.RefreshToken(ctx, "invalid_token")
		if !errors.Is(err, ErrInvalidToken) {
			t.Errorf("expected ErrInvalidToken, got %v", err)
		}
	})

	t.Run("inactive user", func(t *testing.T) {
		svc, repo := newTestAuthService()
		ctx := context.Background()

		user, _, _ := svc.Register(ctx, RegisterInput{
			Email:     "alice@example.com",
			Password:  "secret123",
			FirstName: "Alice",
			LastName:  "Smith",
			Role:      entity.RoleClient,
		})

		repo.users["alice@example.com"].IsActive = false

		_, err := svc.RefreshToken(ctx, "refresh_"+user.ID)
		if !errors.Is(err, ErrUserInactive) {
			t.Errorf("expected ErrUserInactive, got %v", err)
		}
	})
}
