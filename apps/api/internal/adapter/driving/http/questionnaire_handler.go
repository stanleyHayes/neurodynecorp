package http

import (
	"encoding/json"
	"net/http"

	"github.com/neurodynecorp/api/internal/app"
	"github.com/neurodynecorp/api/internal/domain/entity"
)

type QuestionnaireHandler struct {
	service *app.QuestionnaireService
}

func NewQuestionnaireHandler(service *app.QuestionnaireService) *QuestionnaireHandler {
	return &QuestionnaireHandler{service: service}
}

func (h *QuestionnaireHandler) GetQuestions(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}
	category := r.URL.Query().Get("category")
	questions, err := h.service.GetQuestions(r.Context(), category)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to get questions"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]interface{}{"questions": questions})
}

func (h *QuestionnaireHandler) GetAdaptive(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}
	var req struct {
		Answers []answerInput `json:"answers"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
		return
	}
	var answers []entity.Answer
	for _, a := range req.Answers {
		answers = append(answers, entity.Answer{
			QuestionID: a.QuestionID,
			Value:      a.Value,
			Values:     a.Values,
		})
	}
	questions, err := h.service.GetAdaptiveQuestions(r.Context(), answers)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to get adaptive questions"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]interface{}{"questions": questions})
}

type answerInput struct {
	QuestionID string   `json:"question_id"`
	Value      string   `json:"value"`
	Values     []string `json:"values"`
}

func (h *QuestionnaireHandler) SaveResponse(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}
	var req struct {
		ProjectID string        `json:"project_id"`
		Answers   []answerInput `json:"answers"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
		return
	}
	clientID := GetUserID(r.Context())
	if clientID == "" {
		clientID = "anonymous"
	}
	var answers []entity.Answer
	for _, a := range req.Answers {
		answers = append(answers, entity.Answer{
			QuestionID: a.QuestionID,
			Value:      a.Value,
			Values:     a.Values,
		})
	}
	response, err := h.service.SaveResponse(r.Context(), req.ProjectID, clientID, answers)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to save response"})
		return
	}
	writeJSON(w, http.StatusOK, response)
}

func (h *QuestionnaireHandler) Complete(w http.ResponseWriter, r *http.Request) {
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
	response, err := h.service.CompleteQuestionnaire(r.Context(), req.ProjectID)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to complete questionnaire"})
		return
	}
	writeJSON(w, http.StatusOK, response)
}
