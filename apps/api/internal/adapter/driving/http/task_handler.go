package http

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/neurodynecorp/api/internal/domain/entity"
	"github.com/neurodynecorp/api/internal/domain/port"
)

type TaskHandler struct {
	taskRepo   port.TaskRepository
	sprintRepo port.SprintRepository
}

func NewTaskHandler(taskRepo port.TaskRepository, sprintRepo port.SprintRepository) *TaskHandler {
	return &TaskHandler{taskRepo: taskRepo, sprintRepo: sprintRepo}
}

func (h *TaskHandler) Create(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}
	var req struct {
		ProjectID   string `json:"project_id"`
		Title       string `json:"title"`
		Description string `json:"description"`
		Priority    string `json:"priority"`
		AssigneeID  string `json:"assignee_id"`
		SprintID    string `json:"sprint_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
		return
	}
	task := entity.NewTask(req.ProjectID, req.Title, entity.TaskPriority(req.Priority))
	task.Description = req.Description
	task.AssigneeID = req.AssigneeID
	task.SprintID = req.SprintID
	if err := h.taskRepo.Create(r.Context(), task); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to create task"})
		return
	}
	writeJSON(w, http.StatusCreated, task)
}

func (h *TaskHandler) List(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}
	projectID := r.URL.Query().Get("project_id")
	if projectID == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "project_id required"})
		return
	}
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	pageSize, _ := strconv.Atoi(r.URL.Query().Get("page_size"))
	filter := port.TaskFilter{
		Status:     entity.TaskStatus(r.URL.Query().Get("status")),
		AssigneeID: r.URL.Query().Get("assignee_id"),
		Priority:   entity.TaskPriority(r.URL.Query().Get("priority")),
		Page:       page,
		PageSize:   pageSize,
	}
	tasks, total, err := h.taskRepo.ListByProject(r.Context(), projectID, filter)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to list tasks"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]interface{}{"items": tasks, "total": total})
}

func (h *TaskHandler) Update(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}
	id := strings.TrimPrefix(r.URL.Path, "/api/v1/tasks/")
	task, err := h.taskRepo.GetByID(r.Context(), id)
	if err != nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "task not found"})
		return
	}
	var req struct {
		Title       *string `json:"title"`
		Description *string `json:"description"`
		Status      *string `json:"status"`
		Priority    *string `json:"priority"`
		AssigneeID  *string `json:"assignee_id"`
		SprintID    *string `json:"sprint_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
		return
	}
	if req.Title != nil {
		task.Title = *req.Title
	}
	if req.Description != nil {
		task.Description = *req.Description
	}
	if req.Status != nil {
		task.Status = entity.TaskStatus(*req.Status)
	}
	if req.Priority != nil {
		task.Priority = entity.TaskPriority(*req.Priority)
	}
	if req.AssigneeID != nil {
		task.AssigneeID = *req.AssigneeID
	}
	if req.SprintID != nil {
		task.SprintID = *req.SprintID
	}
	if err := h.taskRepo.Update(r.Context(), task); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to update task"})
		return
	}
	writeJSON(w, http.StatusOK, task)
}

func (h *TaskHandler) Delete(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}
	id := strings.TrimPrefix(r.URL.Path, "/api/v1/tasks/")
	if err := h.taskRepo.Delete(r.Context(), id); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to delete task"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "deleted"})
}
