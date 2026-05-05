package app

import (
	"context"
	"errors"
	"fmt"

	"github.com/neurodynecorp/api/internal/domain/entity"
	"github.com/neurodynecorp/api/internal/domain/port"
	"github.com/neurodynecorp/api/pkg/logger"
)

var (
	ErrInvitationFailed = errors.New("failed to send invitation")
	ErrSetupTokenInvalid = errors.New("setup token is invalid or expired")
)

// OnboardingService handles client onboarding: invitations and account setup.
type OnboardingService struct {
	userRepo     port.UserRepository
	emailSvc     port.EmailService
	tokenService port.TokenService
	log          *logger.Logger
}

// NewOnboardingService creates a new OnboardingService with the required dependencies.
func NewOnboardingService(
	userRepo port.UserRepository,
	emailSvc port.EmailService,
	tokenService port.TokenService,
	log *logger.Logger,
) *OnboardingService {
	return &OnboardingService{
		userRepo:     userRepo,
		emailSvc:     emailSvc,
		tokenService: tokenService,
		log:          log.WithComponent("onboarding_service"),
	}
}

// SendInvitation generates a setup token for the given email and sends an
// invitation email with a link to complete account setup for the specified project.
func (s *OnboardingService) SendInvitation(ctx context.Context, email string, projectID string) error {
	// Check if the user already has an account.
	existing, _ := s.userRepo.GetByEmail(ctx, email)
	if existing != nil {
		s.log.Warn().Str("email", email).Msg("user already exists, skipping invitation")
		return ErrUserExists
	}

	// Generate a setup token scoped to this email. We use the token service's
	// access-token generator with the email as the subject and a special role
	// marker so CompleteSetup can validate it later.
	token, err := s.tokenService.GenerateAccessToken(email, "setup")
	if err != nil {
		s.log.Error().Err(err).Str("email", email).Msg("failed to generate setup token")
		return fmt.Errorf("%w: %v", ErrInvitationFailed, err)
	}

	setupLink := fmt.Sprintf("https://neurodynecorp.com/setup?token=%s&project=%s", token, projectID)

	subject := "You're Invited to NeuroDyne Corp"
	body := fmt.Sprintf(
		`<h2>Welcome to NeuroDyne Corp</h2>
<p>You've been invited to collaborate on a project. Click the link below to set up your account:</p>
<p><a href="%s">Complete Account Setup</a></p>
<p>This link will expire in 72 hours.</p>`,
		setupLink,
	)

	if err := s.emailSvc.SendEmail(ctx, email, subject, body); err != nil {
		s.log.Error().Err(err).Str("email", email).Msg("failed to send invitation email")
		return fmt.Errorf("%w: %v", ErrInvitationFailed, err)
	}

	s.log.Info().
		Str("email", email).
		Str("project_id", projectID).
		Msg("invitation sent successfully")

	return nil
}

// CompleteSetup validates the setup token and creates a new user account with
// the "client" role. It returns the newly created user.
func (s *OnboardingService) CompleteSetup(
	ctx context.Context,
	token string,
	password string,
	firstName string,
	lastName string,
) (*entity.User, error) {
	// Validate the setup token.
	claims, err := s.tokenService.ValidateAccessToken(token)
	if err != nil {
		s.log.Warn().Err(err).Msg("invalid setup token presented")
		return nil, ErrSetupTokenInvalid
	}

	// The token's UserID field holds the email for setup tokens, and the Role
	// field should be "setup" to confirm this is an onboarding token.
	if claims.Role != "setup" {
		s.log.Warn().Str("role", claims.Role).Msg("token is not a setup token")
		return nil, ErrSetupTokenInvalid
	}

	email := claims.UserID

	// Ensure the user hasn't already completed setup.
	existing, _ := s.userRepo.GetByEmail(ctx, email)
	if existing != nil {
		s.log.Warn().Str("email", email).Msg("user already exists during setup completion")
		return nil, ErrUserExists
	}

	// Create the new client user.
	user := entity.NewUser(email, firstName, lastName, entity.RoleClient)
	user.PasswordHash = password // caller should pre-hash via PasswordHasher

	if err := s.userRepo.Create(ctx, user); err != nil {
		s.log.Error().Err(err).Str("email", email).Msg("failed to create user during setup")
		return nil, err
	}

	s.log.Info().
		Str("user_id", user.ID).
		Str("email", email).
		Msg("client account setup completed")

	return user, nil
}
