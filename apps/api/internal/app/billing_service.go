package app

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/neurodynecorp/api/internal/domain/entity"
	"github.com/neurodynecorp/api/internal/domain/port"
	"github.com/neurodynecorp/api/pkg/logger"
)

var (
	ErrInvoiceNotFound = errors.New("invoice not found")
)

type BillingService struct {
	invoiceRepo port.InvoiceRepository
	events      port.EventPublisher
	log         *logger.Logger
}

func NewBillingService(
	invoiceRepo port.InvoiceRepository,
	events port.EventPublisher,
	log *logger.Logger,
) *BillingService {
	return &BillingService{
		invoiceRepo: invoiceRepo,
		events:      events,
		log:         log.WithComponent("billing_service"),
	}
}

func (s *BillingService) CreateInvoice(ctx context.Context, projectID, clientID string, items []entity.LineItem, tax float64, currency string, dueDate time.Time) (*entity.Invoice, error) {
	number := fmt.Sprintf("INV-%d", time.Now().UnixMilli())
	invoice := entity.NewInvoice(projectID, clientID, number)
	invoice.Items = items
	invoice.Tax = tax
	if currency != "" {
		invoice.Currency = currency
	}
	invoice.DueDate = dueDate

	var subtotal float64
	for _, item := range items {
		subtotal += item.Amount
	}
	invoice.Subtotal = subtotal
	invoice.Total = subtotal + tax
	invoice.Status = entity.InvoiceStatusSent

	if err := s.invoiceRepo.Create(ctx, invoice); err != nil {
		s.log.Error().Err(err).Msg("failed to create invoice")
		return nil, err
	}

	s.log.Info().Str("invoice_id", invoice.ID).Str("number", number).Float64("total", invoice.Total).Msg("invoice created")
	return invoice, nil
}

func (s *BillingService) MarkPaid(ctx context.Context, invoiceID, paymentID string) error {
	invoice, err := s.invoiceRepo.GetByID(ctx, invoiceID)
	if err != nil {
		return ErrInvoiceNotFound
	}
	invoice.Status = entity.InvoiceStatusPaid
	invoice.PaidAt = time.Now()
	invoice.PaymentID = paymentID
	return s.invoiceRepo.Update(ctx, invoice)
}

func (s *BillingService) ListByClient(ctx context.Context, clientID string, page, pageSize int) ([]*entity.Invoice, int64, error) {
	return s.invoiceRepo.ListByClient(ctx, clientID, page, pageSize)
}
