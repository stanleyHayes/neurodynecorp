package http

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/neurodynecorp/api/internal/domain/entity"
	"github.com/neurodynecorp/api/internal/domain/port"
)

type InvoiceHandler struct {
	repo port.InvoiceRepository
}

func NewInvoiceHandler(repo port.InvoiceRepository) *InvoiceHandler {
	return &InvoiceHandler{repo: repo}
}

func (h *InvoiceHandler) Create(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}
	var req struct {
		ProjectID     string     `json:"project_id"`
		ClientID      string     `json:"client_id"`
		InvoiceNumber string     `json:"invoice_number"`
		Items         []lineItem `json:"items"`
		Tax           float64    `json:"tax"`
		Currency      string     `json:"currency"`
		DueDate       string     `json:"due_date"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
		return
	}
	invoice := entity.NewInvoice(req.ProjectID, req.ClientID, req.InvoiceNumber)
	invoice.Tax = req.Tax
	if req.Currency != "" {
		invoice.Currency = req.Currency
	}
	if req.DueDate != "" {
		if t, err := time.Parse("2006-01-02", req.DueDate); err == nil {
			invoice.DueDate = t
		}
	}
	var subtotal float64
	for _, item := range req.Items {
		amount := item.Quantity * item.UnitPrice
		subtotal += amount
		invoice.Items = append(invoice.Items, entity.LineItem{
			Description: item.Description,
			Quantity:    item.Quantity,
			UnitPrice:   item.UnitPrice,
			Amount:      amount,
		})
	}
	invoice.Subtotal = subtotal
	invoice.Total = subtotal + req.Tax
	if err := h.repo.Create(r.Context(), invoice); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to create invoice"})
		return
	}
	writeJSON(w, http.StatusCreated, invoice)
}

type lineItem struct {
	Description string  `json:"description"`
	Quantity    float64 `json:"quantity"`
	UnitPrice   float64 `json:"unit_price"`
}

func (h *InvoiceHandler) Get(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}
	id := strings.TrimPrefix(r.URL.Path, "/api/v1/invoices/")
	invoice, err := h.repo.GetByID(r.Context(), id)
	if err != nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "invoice not found"})
		return
	}
	writeJSON(w, http.StatusOK, invoice)
}

func (h *InvoiceHandler) ListByClient(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}
	clientID := r.URL.Query().Get("client_id")
	if clientID == "" {
		clientID = GetUserID(r.Context())
	}
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	pageSize, _ := strconv.Atoi(r.URL.Query().Get("page_size"))
	invoices, total, err := h.repo.ListByClient(r.Context(), clientID, page, pageSize)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to list invoices"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]interface{}{"items": invoices, "total": total})
}

func (h *InvoiceHandler) MarkPaid(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}
	id := extractID(r.URL.Path, "/api/v1/invoices/", "/pay")
	invoice, err := h.repo.GetByID(r.Context(), id)
	if err != nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "invoice not found"})
		return
	}
	var req struct {
		PaymentID string `json:"payment_id"`
	}
	json.NewDecoder(r.Body).Decode(&req)
	invoice.Status = entity.InvoiceStatusPaid
	invoice.PaidAt = time.Now()
	invoice.PaymentID = req.PaymentID
	if err := h.repo.Update(r.Context(), invoice); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to update invoice"})
		return
	}
	writeJSON(w, http.StatusOK, invoice)
}
