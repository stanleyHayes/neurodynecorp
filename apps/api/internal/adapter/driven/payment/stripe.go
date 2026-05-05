package payment

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/neurodynecorp/api/internal/domain/port"
	"github.com/neurodynecorp/api/pkg/logger"
)

const stripeBaseURL = "https://api.stripe.com/v1"

// Compile-time interface check.
var _ port.PaymentGateway = (*StripeGateway)(nil)

// StripeGateway implements port.PaymentGateway using direct HTTP calls
// to the Stripe API, avoiding a full stripe-go SDK dependency.
type StripeGateway struct {
	secretKey  string
	httpClient *http.Client
	log        *logger.Logger
}

// NewStripeGateway creates a new Stripe payment gateway adapter.
func NewStripeGateway(secretKey string, log *logger.Logger) *StripeGateway {
	return &StripeGateway{
		secretKey: secretKey,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
		log: log.WithComponent("stripe_gateway"),
	}
}

// stripePaymentIntent represents the relevant fields from a Stripe PaymentIntent response.
type stripePaymentIntent struct {
	ID           string `json:"id"`
	Status       string `json:"status"`
	Amount       int64  `json:"amount"`
	Currency     string `json:"currency"`
	ClientSecret string `json:"client_secret"`
}

// stripeError represents a Stripe API error response.
type stripeError struct {
	Error struct {
		Type    string `json:"type"`
		Message string `json:"message"`
		Code    string `json:"code"`
	} `json:"error"`
}

// CreatePaymentIntent creates a new Stripe PaymentIntent and returns the PaymentIntent ID.
// The amount is provided in the major currency unit (e.g. dollars) and converted
// to the minor unit (e.g. cents) before sending to Stripe.
func (g *StripeGateway) CreatePaymentIntent(ctx context.Context, amount float64, currency string, metadata map[string]string) (string, error) {
	// Stripe expects amounts in the smallest currency unit (cents for USD).
	amountCents := int64(amount * 100)

	form := url.Values{}
	form.Set("amount", strconv.FormatInt(amountCents, 10))
	form.Set("currency", strings.ToLower(currency))
	form.Set("payment_method_types[]", "card")

	for k, v := range metadata {
		form.Set(fmt.Sprintf("metadata[%s]", k), v)
	}

	body, err := g.doRequest(ctx, http.MethodPost, "/payment_intents", form)
	if err != nil {
		g.log.Error().Err(err).Float64("amount", amount).Str("currency", currency).Msg("failed to create payment intent")
		return "", fmt.Errorf("stripe: create payment intent: %w", err)
	}

	var pi stripePaymentIntent
	if err := json.Unmarshal(body, &pi); err != nil {
		g.log.Error().Err(err).Msg("failed to decode stripe response")
		return "", fmt.Errorf("stripe: decode response: %w", err)
	}

	g.log.Info().
		Str("payment_intent_id", pi.ID).
		Int64("amount_cents", amountCents).
		Str("currency", currency).
		Msg("payment intent created")

	return pi.ID, nil
}

// ConfirmPayment confirms a PaymentIntent by its ID.
func (g *StripeGateway) ConfirmPayment(ctx context.Context, paymentID string) error {
	endpoint := fmt.Sprintf("/payment_intents/%s/confirm", paymentID)

	form := url.Values{}
	form.Set("payment_method", "pm_card_visa") // Default for server-side confirmation.

	body, err := g.doRequest(ctx, http.MethodPost, endpoint, form)
	if err != nil {
		g.log.Error().Err(err).Str("payment_id", paymentID).Msg("failed to confirm payment")
		return fmt.Errorf("stripe: confirm payment: %w", err)
	}

	var pi stripePaymentIntent
	if err := json.Unmarshal(body, &pi); err != nil {
		g.log.Error().Err(err).Msg("failed to decode stripe response")
		return fmt.Errorf("stripe: decode response: %w", err)
	}

	g.log.Info().
		Str("payment_intent_id", pi.ID).
		Str("status", pi.Status).
		Msg("payment confirmed")

	return nil
}

// GetPaymentStatus retrieves the current status of a PaymentIntent.
func (g *StripeGateway) GetPaymentStatus(ctx context.Context, paymentID string) (string, error) {
	endpoint := fmt.Sprintf("/payment_intents/%s", paymentID)

	body, err := g.doRequest(ctx, http.MethodGet, endpoint, nil)
	if err != nil {
		g.log.Error().Err(err).Str("payment_id", paymentID).Msg("failed to get payment status")
		return "", fmt.Errorf("stripe: get payment status: %w", err)
	}

	var pi stripePaymentIntent
	if err := json.Unmarshal(body, &pi); err != nil {
		g.log.Error().Err(err).Msg("failed to decode stripe response")
		return "", fmt.Errorf("stripe: decode response: %w", err)
	}

	g.log.Debug().
		Str("payment_intent_id", pi.ID).
		Str("status", pi.Status).
		Msg("payment status retrieved")

	return pi.Status, nil
}

// doRequest performs an authenticated HTTP request to the Stripe API.
func (g *StripeGateway) doRequest(ctx context.Context, method, endpoint string, form url.Values) ([]byte, error) {
	fullURL := stripeBaseURL + endpoint

	var reqBody io.Reader
	if form != nil {
		reqBody = strings.NewReader(form.Encode())
	}

	req, err := http.NewRequestWithContext(ctx, method, fullURL, reqBody)
	if err != nil {
		return nil, fmt.Errorf("build request: %w", err)
	}

	req.SetBasicAuth(g.secretKey, "")
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Stripe-Version", "2024-06-20")

	resp, err := g.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("http request: %w", err)
	}
	defer resp.Body.Close()

	var buf bytes.Buffer
	if _, err := io.Copy(&buf, resp.Body); err != nil {
		return nil, fmt.Errorf("read response body: %w", err)
	}

	if resp.StatusCode >= 400 {
		var se stripeError
		if err := json.Unmarshal(buf.Bytes(), &se); err == nil && se.Error.Message != "" {
			return nil, fmt.Errorf("stripe api error (%s): %s", se.Error.Type, se.Error.Message)
		}
		return nil, fmt.Errorf("stripe api returned status %d: %s", resp.StatusCode, buf.String())
	}

	return buf.Bytes(), nil
}
