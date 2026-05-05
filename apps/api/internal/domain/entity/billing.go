package entity

import (
	"time"

	"github.com/google/uuid"
)

type InvoiceStatus string

const (
	InvoiceStatusDraft   InvoiceStatus = "draft"
	InvoiceStatusSent    InvoiceStatus = "sent"
	InvoiceStatusPaid    InvoiceStatus = "paid"
	InvoiceStatusOverdue InvoiceStatus = "overdue"
)

type Invoice struct {
	ID            string        `bson:"_id" json:"id"`
	ProjectID     string        `bson:"project_id" json:"project_id"`
	ClientID      string        `bson:"client_id" json:"client_id"`
	InvoiceNumber string        `bson:"invoice_number" json:"invoice_number"`
	Status        InvoiceStatus `bson:"status" json:"status"`
	Items         []LineItem    `bson:"items" json:"items"`
	Subtotal      float64       `bson:"subtotal" json:"subtotal"`
	Tax           float64       `bson:"tax" json:"tax"`
	Total         float64       `bson:"total" json:"total"`
	Currency      string        `bson:"currency" json:"currency"`
	DueDate       time.Time     `bson:"due_date" json:"due_date"`
	PaidAt        time.Time     `bson:"paid_at,omitempty" json:"paid_at,omitempty"`
	PaymentID     string        `bson:"payment_id,omitempty" json:"payment_id,omitempty"`
	CreatedAt     time.Time     `bson:"created_at" json:"created_at"`
	UpdatedAt     time.Time     `bson:"updated_at" json:"updated_at"`
}

type LineItem struct {
	Description string  `bson:"description" json:"description"`
	Quantity    float64 `bson:"quantity" json:"quantity"`
	UnitPrice   float64 `bson:"unit_price" json:"unit_price"`
	Amount      float64 `bson:"amount" json:"amount"`
}

func NewInvoice(projectID, clientID, invoiceNumber string) *Invoice {
	now := time.Now()
	return &Invoice{
		ID:            uuid.New().String(),
		ProjectID:     projectID,
		ClientID:      clientID,
		InvoiceNumber: invoiceNumber,
		Status:        InvoiceStatusDraft,
		Currency:      "USD",
		CreatedAt:     now,
		UpdatedAt:     now,
	}
}
