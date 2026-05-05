package email

import (
	"context"
	"fmt"

	"github.com/neurodynecorp/api/internal/domain/port"
	"github.com/neurodynecorp/api/pkg/logger"
	"github.com/resend/resend-go/v2"
)

type ResendService struct {
	client      *resend.Client
	fromAddress string
	log         *logger.Logger
}

func NewResendService(apiKey, fromAddress string, log *logger.Logger) *ResendService {
	return &ResendService{
		client:      resend.NewClient(apiKey),
		fromAddress: fromAddress,
		log:         log.WithComponent("email"),
	}
}

func (s *ResendService) SendEmail(ctx context.Context, to, subject, htmlBody string) error {
	params := &resend.SendEmailRequest{
		From:    s.fromAddress,
		To:      []string{to},
		Subject: subject,
		Html:    htmlBody,
	}

	sent, err := s.client.Emails.Send(params)
	if err != nil {
		s.log.Error().Err(err).Str("to", to).Str("subject", subject).Msg("failed to send email")
		return err
	}

	s.log.Info().Str("id", sent.Id).Str("to", to).Msg("email sent")
	return nil
}

func (s *ResendService) SendTemplateEmail(ctx context.Context, to, subject, templateID string, data map[string]interface{}) error {
	// For now, render a simple template. In production, use a proper template engine.
	html := fmt.Sprintf("<html><body><h1>%s</h1></body></html>", subject)
	return s.SendEmail(ctx, to, subject, html)
}

var _ port.EmailService = (*ResendService)(nil)
