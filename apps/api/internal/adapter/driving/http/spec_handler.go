package http

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/neurodynecorp/api/internal/app"
)

type SpecHandler struct {
	specService *app.SpecService
}

func NewSpecHandler(specService *app.SpecService) *SpecHandler {
	return &SpecHandler{specService: specService}
}

func (h *SpecHandler) Generate(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}
	var req struct {
		ProjectID string `json:"project_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
		return
	}
	spec, err := h.specService.GenerateSpec(r.Context(), req.ProjectID)
	if err != nil {
		switch err {
		case app.ErrProjectNotFound:
			writeJSON(w, http.StatusNotFound, map[string]string{"error": "project not found"})
		case app.ErrQuestionnaireNotFound:
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "questionnaire not completed"})
		default:
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to generate spec"})
		}
		return
	}
	writeJSON(w, http.StatusCreated, spec)
}

func (h *SpecHandler) Get(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}
	id := strings.TrimPrefix(r.URL.Path, "/api/v1/specifications/")
	spec, err := h.specService.GetSpec(r.Context(), id)
	if err != nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "specification not found"})
		return
	}
	writeJSON(w, http.StatusOK, spec)
}

func (h *SpecHandler) GetByProject(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}
	projectID := r.URL.Query().Get("project_id")
	if projectID == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "project_id required"})
		return
	}
	spec, err := h.specService.GetByProject(r.Context(), projectID)
	if err != nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "specification not found"})
		return
	}
	writeJSON(w, http.StatusOK, spec)
}

func (h *SpecHandler) Approve(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}
	id := extractID(r.URL.Path, "/api/v1/specifications/", "/approve")
	approverID := GetUserID(r.Context())
	if err := h.specService.ApproveSpec(r.Context(), id, approverID); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to approve spec"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "approved"})
}

func (h *SpecHandler) Reject(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}
	id := extractID(r.URL.Path, "/api/v1/specifications/", "/reject")
	if err := h.specService.RejectSpec(r.Context(), id); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to reject spec"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "rejected"})
}

func (h *SpecHandler) AddNote(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}
	id := extractID(r.URL.Path, "/api/v1/specifications/", "/notes")
	var req struct {
		Content string `json:"content"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
		return
	}
	authorID := GetUserID(r.Context())
	if err := h.specService.AddInternalNote(r.Context(), id, authorID, req.Content); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to add note"})
		return
	}
	writeJSON(w, http.StatusCreated, map[string]string{"status": "note added"})
}
