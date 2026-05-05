package http

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/neurodynecorp/api/internal/app"
	"github.com/neurodynecorp/api/internal/domain/entity"
	"github.com/neurodynecorp/api/internal/domain/port"
)

type ProjectHandler struct {
	projectService *app.ProjectService
}

func NewProjectHandler(projectService *app.ProjectService) *ProjectHandler {
	return &ProjectHandler{projectService: projectService}
}

type createProjectRequest struct {
	Title        string            `json:"title"`
	Description  string            `json:"description"`
	Type         string            `json:"type"`
	Features     []featureInput    `json:"features"`
	UserRoles    []string          `json:"user_roles"`
	Integrations []string          `json:"integrations"`
	DesignNotes  string            `json:"design_notes"`
	BudgetRange  budgetRangeInput  `json:"budget_range"`
	Timeline     timelineInput     `json:"timeline"`
}

type featureInput struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Priority    string `json:"priority"`
	Complexity  string `json:"complexity"`
}

type budgetRangeInput struct {
	Min      float64 `json:"min"`
	Max      float64 `json:"max"`
	Currency string  `json:"currency"`
}

type timelineInput struct {
	DurationWeeks    int    `json:"duration_weeks"`
	PreferredUrgency string `json:"preferred_urgency"`
}

type updateStatusRequest struct {
	Status string `json:"status"`
}

type assignTeamRequest struct {
	TeamMemberIDs []string `json:"team_member_ids"`
}

type updateProgressRequest struct {
	Progress float64 `json:"progress"`
}

func (h *ProjectHandler) Create(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}
	var req createProjectRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
		return
	}
	if req.Title == "" || req.Description == "" || req.Type == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "title, description, and type are required"})
		return
	}
	clientID := GetUserID(r.Context())
	var features []entity.Feature
	for _, f := range req.Features {
		features = append(features, entity.Feature{
			Name:        f.Name,
			Description: f.Description,
			Priority:    f.Priority,
			Complexity:  f.Complexity,
		})
	}
	currency := req.BudgetRange.Currency
	if currency == "" {
		currency = "USD"
	}
	project, err := h.projectService.CreateProject(r.Context(), app.CreateProjectInput{
		ClientID:    clientID,
		Title:       req.Title,
		Description: req.Description,
		Type:        entity.ProjectType(req.Type),
		Features:    features,
		UserRoles:   req.UserRoles,
		BudgetRange: entity.BudgetRange{Min: req.BudgetRange.Min, Max: req.BudgetRange.Max, Currency: currency},
		Timeline:    entity.Timeline{DurationWeeks: req.Timeline.DurationWeeks, PreferredUrgency: req.Timeline.PreferredUrgency},
	})
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to create project"})
		return
	}
	writeJSON(w, http.StatusCreated, project)
}

func (h *ProjectHandler) Get(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}
	id := strings.TrimPrefix(r.URL.Path, "/api/v1/projects/")
	if id == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "project id required"})
		return
	}
	project, err := h.projectService.GetProject(r.Context(), id)
	if err != nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "project not found"})
		return
	}
	writeJSON(w, http.StatusOK, project)
}

func (h *ProjectHandler) List(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}
	q := r.URL.Query()
	page, _ := strconv.Atoi(q.Get("page"))
	pageSize, _ := strconv.Atoi(q.Get("page_size"))
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 20
	}
	filter := port.ProjectFilter{
		ClientID: q.Get("client_id"),
		Status:   entity.ProjectStatus(q.Get("status")),
		Type:     entity.ProjectType(q.Get("type")),
		Search:   q.Get("search"),
		Page:     page,
		PageSize: pageSize,
	}
	// If the user is a client, only show their projects
	role := GetUserRole(r.Context())
	if role == "client" {
		filter.ClientID = GetUserID(r.Context())
	}
	projects, total, err := h.projectService.ListProjects(r.Context(), filter)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to list projects"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]interface{}{
		"items":     projects,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func (h *ProjectHandler) UpdateStatus(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPatch {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}
	id := extractID(r.URL.Path, "/api/v1/projects/", "/status")
	var req updateStatusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
		return
	}
	project, err := h.projectService.UpdateStatus(r.Context(), id, entity.ProjectStatus(req.Status))
	if err != nil {
		switch err {
		case app.ErrProjectNotFound:
			writeJSON(w, http.StatusNotFound, map[string]string{"error": "project not found"})
		case app.ErrInvalidTransition:
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid status transition"})
		default:
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to update status"})
		}
		return
	}
	writeJSON(w, http.StatusOK, project)
}

func (h *ProjectHandler) AssignTeam(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}
	id := extractID(r.URL.Path, "/api/v1/projects/", "/team")
	var req assignTeamRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
		return
	}
	if err := h.projectService.AssignTeam(r.Context(), id, req.TeamMemberIDs); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to assign team"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "team assigned"})
}

func (h *ProjectHandler) UpdateProgress(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPatch {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}
	id := extractID(r.URL.Path, "/api/v1/projects/", "/progress")
	var req updateProgressRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
		return
	}
	if err := h.projectService.UpdateProgress(r.Context(), id, req.Progress); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to update progress"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "progress updated"})
}

func extractID(path, prefix, suffix string) string {
	s := strings.TrimPrefix(path, prefix)
	if suffix != "" {
		s = strings.TrimSuffix(s, suffix)
	}
	return s
}
