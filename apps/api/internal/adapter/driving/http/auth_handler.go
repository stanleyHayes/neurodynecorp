package http

import (
	"encoding/json"
	"net/http"

	"github.com/neurodynecorp/api/internal/app"
	"github.com/neurodynecorp/api/internal/domain/entity"
)

type AuthHandler struct {
	authService *app.AuthService
}

func NewAuthHandler(authService *app.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

type registerRequest struct {
	Email     string `json:"email"`
	Password  string `json:"password"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Role      string `json:"role"`
	Company   string `json:"company"`
	Phone     string `json:"phone"`
}

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type refreshRequest struct {
	RefreshToken string `json:"refresh_token"`
}

type authResponse struct {
	User         userResponse `json:"user"`
	AccessToken  string       `json:"access_token"`
	RefreshToken string       `json:"refresh_token"`
}

type userResponse struct {
	ID        string `json:"id"`
	Email     string `json:"email"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Role      string `json:"role"`
	Avatar    string `json:"avatar,omitempty"`
	Phone     string `json:"phone,omitempty"`
	Company   string `json:"company,omitempty"`
	IsActive  bool   `json:"is_active"`
	CreatedAt string `json:"created_at"`
}

func toUserResponse(u *entity.User) userResponse {
	return userResponse{
		ID:        u.ID,
		Email:     u.Email,
		FirstName: u.FirstName,
		LastName:  u.LastName,
		Role:      string(u.Role),
		Avatar:    u.Avatar,
		Phone:     u.Phone,
		Company:   u.Company,
		IsActive:  u.IsActive,
		CreatedAt: u.CreatedAt.Format("2006-01-02T15:04:05Z"),
	}
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}
	var req registerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
		return
	}
	if req.Email == "" || req.Password == "" || req.FirstName == "" || req.LastName == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "email, password, first_name, and last_name are required"})
		return
	}
	role := entity.Role(req.Role)
	if role == "" {
		role = entity.RoleClient
	}
	user, tokens, err := h.authService.Register(r.Context(), app.RegisterInput{
		Email:     req.Email,
		Password:  req.Password,
		FirstName: req.FirstName,
		LastName:  req.LastName,
		Role:      role,
		Company:   req.Company,
		Phone:     req.Phone,
	})
	if err != nil {
		switch err {
		case app.ErrUserExists:
			writeJSON(w, http.StatusConflict, map[string]string{"error": "user already exists"})
		default:
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "registration failed"})
		}
		return
	}
	writeJSON(w, http.StatusCreated, authResponse{
		User:         toUserResponse(user),
		AccessToken:  tokens.AccessToken,
		RefreshToken: tokens.RefreshToken,
	})
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}
	var req loginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
		return
	}
	if req.Email == "" || req.Password == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "email and password are required"})
		return
	}
	user, tokens, err := h.authService.Login(r.Context(), req.Email, req.Password)
	if err != nil {
		switch err {
		case app.ErrInvalidCredentials:
			writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "invalid credentials"})
		case app.ErrUserInactive:
			writeJSON(w, http.StatusForbidden, map[string]string{"error": "account inactive"})
		default:
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "login failed"})
		}
		return
	}
	writeJSON(w, http.StatusOK, authResponse{
		User:         toUserResponse(user),
		AccessToken:  tokens.AccessToken,
		RefreshToken: tokens.RefreshToken,
	})
}

func (h *AuthHandler) RefreshToken(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}
	var req refreshRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
		return
	}
	tokens, err := h.authService.RefreshToken(r.Context(), req.RefreshToken)
	if err != nil {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "invalid refresh token"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{
		"access_token":  tokens.AccessToken,
		"refresh_token": tokens.RefreshToken,
	})
}

func (h *AuthHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}
	userID := GetUserID(r.Context())
	user, tokens, err := h.authService.Login(r.Context(), "", "")
	_ = tokens
	_ = user
	_ = userID
	_ = err
	// Will be properly implemented via user service
	writeJSON(w, http.StatusOK, map[string]string{"user_id": userID})
}
