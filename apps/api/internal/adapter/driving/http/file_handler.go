package http

import (
	"net/http"

	"github.com/neurodynecorp/api/internal/domain/port"
	"github.com/neurodynecorp/api/pkg/logger"
)

type FileHandler struct {
	storage port.FileStorage
	log     *logger.Logger
}

func NewFileHandler(storage port.FileStorage, log *logger.Logger) *FileHandler {
	return &FileHandler{storage: storage, log: log.WithComponent("file_handler")}
}

func (h *FileHandler) Upload(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}
	if err := r.ParseMultipartForm(32 << 20); err != nil { // 32MB max
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "file too large or invalid form"})
		return
	}
	file, header, err := r.FormFile("file")
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "file required"})
		return
	}
	defer file.Close()

	folder := r.FormValue("folder")
	if folder == "" {
		folder = "uploads"
	}

	url, err := h.storage.Upload(r.Context(), file, header.Filename, folder)
	if err != nil {
		h.log.Error().Err(err).Str("filename", header.Filename).Msg("upload failed")
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "upload failed"})
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"url":      url,
		"filename": header.Filename,
		"size":     header.Size,
	})
}
