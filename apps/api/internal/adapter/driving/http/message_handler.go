package http

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/neurodynecorp/api/internal/domain/entity"
	"github.com/neurodynecorp/api/internal/domain/port"
)

type MessageHandler struct {
	messageRepo port.MessageRepository
	threadRepo  port.ThreadRepository
}

func NewMessageHandler(messageRepo port.MessageRepository, threadRepo port.ThreadRepository) *MessageHandler {
	return &MessageHandler{messageRepo: messageRepo, threadRepo: threadRepo}
}

func (h *MessageHandler) ListThreads(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}
	projectID := r.URL.Query().Get("project_id")
	if projectID == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "project_id required"})
		return
	}
	threads, err := h.threadRepo.ListByProject(r.Context(), projectID)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to list threads"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]interface{}{"threads": threads})
}

func (h *MessageHandler) CreateThread(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}
	var req struct {
		ProjectID    string   `json:"project_id"`
		Subject      string   `json:"subject"`
		Participants []string `json:"participants"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
		return
	}
	userID := GetUserID(r.Context())
	participants := append(req.Participants, userID)
	thread := entity.NewThread(req.ProjectID, req.Subject, participants)
	if err := h.threadRepo.Create(r.Context(), thread); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to create thread"})
		return
	}
	writeJSON(w, http.StatusCreated, thread)
}

func (h *MessageHandler) GetMessages(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}
	threadID := strings.TrimPrefix(r.URL.Path, "/api/v1/threads/")
	threadID = strings.TrimSuffix(threadID, "/messages")
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	pageSize, _ := strconv.Atoi(r.URL.Query().Get("page_size"))
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 50
	}
	messages, total, err := h.messageRepo.GetByThread(r.Context(), threadID, page, pageSize)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to get messages"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]interface{}{
		"items":     messages,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func (h *MessageHandler) SendMessage(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}
	var req struct {
		ProjectID string   `json:"project_id"`
		ThreadID  string   `json:"thread_id"`
		Content   string   `json:"content"`
		FileURLs  []string `json:"file_urls"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
		return
	}
	senderID := GetUserID(r.Context())
	msg := entity.NewMessage(req.ProjectID, senderID, req.Content)
	msg.ThreadID = req.ThreadID
	msg.FileURLs = req.FileURLs
	if err := h.messageRepo.Create(r.Context(), msg); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to send message"})
		return
	}
	writeJSON(w, http.StatusCreated, msg)
}
