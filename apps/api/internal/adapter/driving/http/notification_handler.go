package http

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/neurodynecorp/api/internal/domain/port"
)

type NotificationHandler struct {
	repo port.NotificationRepository
}

func NewNotificationHandler(repo port.NotificationRepository) *NotificationHandler {
	return &NotificationHandler{repo: repo}
}

func (h *NotificationHandler) List(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}
	userID := GetUserID(r.Context())
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	pageSize, _ := strconv.Atoi(r.URL.Query().Get("page_size"))
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 20
	}
	notifs, total, err := h.repo.GetByUser(r.Context(), userID, page, pageSize)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to get notifications"})
		return
	}
	unread, _ := h.repo.CountUnread(r.Context(), userID)
	writeJSON(w, http.StatusOK, map[string]interface{}{
		"items":    notifs,
		"total":    total,
		"unread":   unread,
		"page":     page,
		"page_size": pageSize,
	})
}

func (h *NotificationHandler) MarkRead(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPatch {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}
	id := strings.TrimPrefix(r.URL.Path, "/api/v1/notifications/")
	id = strings.TrimSuffix(id, "/read")
	if err := h.repo.MarkAsRead(r.Context(), id); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to mark as read"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "marked as read"})
}

func (h *NotificationHandler) MarkAllRead(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}
	userID := GetUserID(r.Context())
	if err := h.repo.MarkAllAsRead(r.Context(), userID); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to mark all as read"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "all marked as read"})
}
