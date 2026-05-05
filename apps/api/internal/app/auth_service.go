package app

import (
	"context"
	"errors"
	"time"

	"github.com/neurodynecorp/api/internal/domain/entity"
	"github.com/neurodynecorp/api/internal/domain/port"
	"github.com/neurodynecorp/api/pkg/logger"
)

var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrUserNotFound       = errors.New("user not found")
	ErrUserExists         = errors.New("user already exists")
	ErrUserInactive       = errors.New("user account is inactive")
	ErrInvalidToken       = errors.New("invalid token")
)

type AuthService struct {
	userRepo       port.UserRepository
	passwordHasher port.PasswordHasher
	tokenService   port.TokenService
	emailService   port.EmailService
	cache          port.CacheService
	events         port.EventPublisher
	log            *logger.Logger
}

func NewAuthService(
	userRepo port.UserRepository,
	passwordHasher port.PasswordHasher,
	tokenService port.TokenService,
	emailService port.EmailService,
	cache port.CacheService,
	events port.EventPublisher,
	log *logger.Logger,
) *AuthService {
	return &AuthService{
		userRepo:       userRepo,
		passwordHasher: passwordHasher,
		tokenService:   tokenService,
		emailService:   emailService,
		cache:          cache,
		events:         events,
		log:            log.WithComponent("auth_service"),
	}
}

type RegisterInput struct {
	Email     string
	Password  string
	FirstName string
	LastName  string
	Role      entity.Role
	Company   string
	Phone     string
}

type AuthTokens struct {
	AccessToken  string
	RefreshToken string
}

func (s *AuthService) Register(ctx context.Context, input RegisterInput) (*entity.User, *AuthTokens, error) {
	existing, _ := s.userRepo.GetByEmail(ctx, input.Email)
	if existing != nil {
		return nil, nil, ErrUserExists
	}

	hash, err := s.passwordHasher.Hash(input.Password)
	if err != nil {
		s.log.Error().Err(err).Msg("failed to hash password")
		return nil, nil, err
	}

	user := entity.NewUser(input.Email, input.FirstName, input.LastName, input.Role)
	user.PasswordHash = hash
	user.Company = input.Company
	user.Phone = input.Phone

	if err := s.userRepo.Create(ctx, user); err != nil {
		s.log.Error().Err(err).Str("email", input.Email).Msg("failed to create user")
		return nil, nil, err
	}

	tokens, err := s.generateTokens(user)
	if err != nil {
		return nil, nil, err
	}

	s.log.Info().Str("user_id", user.ID).Str("role", string(user.Role)).Msg("user registered")

	return user, tokens, nil
}

func (s *AuthService) Login(ctx context.Context, email, password string) (*entity.User, *AuthTokens, error) {
	user, err := s.userRepo.GetByEmail(ctx, email)
	if err != nil {
		return nil, nil, ErrInvalidCredentials
	}

	if !user.IsActive {
		return nil, nil, ErrUserInactive
	}

	if err := s.passwordHasher.Compare(user.PasswordHash, password); err != nil {
		return nil, nil, ErrInvalidCredentials
	}

	user.LastLoginAt = time.Now()
	_ = s.userRepo.Update(ctx, user)

	tokens, err := s.generateTokens(user)
	if err != nil {
		return nil, nil, err
	}

	s.log.Info().Str("user_id", user.ID).Msg("user logged in")

	return user, tokens, nil
}

func (s *AuthService) RefreshToken(ctx context.Context, refreshToken string) (*AuthTokens, error) {
	claims, err := s.tokenService.ValidateRefreshToken(refreshToken)
	if err != nil {
		return nil, ErrInvalidToken
	}

	user, err := s.userRepo.GetByID(ctx, claims.UserID)
	if err != nil {
		return nil, ErrUserNotFound
	}

	if !user.IsActive {
		return nil, ErrUserInactive
	}

	tokens, err := s.generateTokens(user)
	if err != nil {
		return nil, err
	}

	return tokens, nil
}

func (s *AuthService) generateTokens(user *entity.User) (*AuthTokens, error) {
	accessToken, err := s.tokenService.GenerateAccessToken(user.ID, string(user.Role))
	if err != nil {
		s.log.Error().Err(err).Msg("failed to generate access token")
		return nil, err
	}

	refreshToken, err := s.tokenService.GenerateRefreshToken(user.ID)
	if err != nil {
		s.log.Error().Err(err).Msg("failed to generate refresh token")
		return nil, err
	}

	return &AuthTokens{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil
}
