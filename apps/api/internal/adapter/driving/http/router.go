package http

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/neurodynecorp/api/internal/domain/port"
	"github.com/neurodynecorp/api/pkg/logger"
	"github.com/neurodynecorp/api/pkg/metrics"
)

type Router struct {
	mux          *http.ServeMux
	port         int
	log          *logger.Logger
	metrics      *metrics.Metrics
	tokenService port.TokenService

	// WebSocket hub
	WSHub *Hub

	// Handlers
	Auth          *AuthHandler
	Project       *ProjectHandler
	Spec          *SpecHandler
	Questionnaire *QuestionnaireHandler
	Notification  *NotificationHandler
	Message       *MessageHandler
	Task          *TaskHandler
	Invoice       *InvoiceHandler
	File          *FileHandler
	User          *UserHandler
	PDF           *PDFHandler
}

type RouterConfig struct {
	Port         int
	Log          *logger.Logger
	Metrics      *metrics.Metrics
	TokenService port.TokenService
}

func NewRouter(cfg RouterConfig) *Router {
	hub := NewHub(cfg.Log)
	go hub.Run()

	return &Router{
		mux:          http.NewServeMux(),
		port:         cfg.Port,
		log:          cfg.Log.WithComponent("http_router"),
		metrics:      cfg.Metrics,
		tokenService: cfg.TokenService,
		WSHub:        hub,
	}
}

func (r *Router) Setup() {
	auth := authMiddleware(r.tokenService)
	adminOnly := requireRole("admin", "project_manager")
	logging := loggingMiddleware(r.log)
	met := metricsMiddleware(r.metrics)

	// Public routes
	r.mux.HandleFunc("/health", func(w http.ResponseWriter, req *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{"status": "ok", "time": time.Now().UTC().Format(time.RFC3339)})
	})
	r.mux.HandleFunc("/api/v1/contact", r.contactHandler)

	// Auth (public)
	if r.Auth != nil {
		r.mux.HandleFunc("/api/v1/auth/register", r.Auth.Register)
		r.mux.HandleFunc("/api/v1/auth/login", r.Auth.Login)
		r.mux.HandleFunc("/api/v1/auth/refresh", r.Auth.RefreshToken)
		r.mux.Handle("/api/v1/auth/profile", chain(http.HandlerFunc(r.Auth.GetProfile), auth))
	}

	// Questionnaire (public for getting questions)
	if r.Questionnaire != nil {
		r.mux.HandleFunc("/api/v1/questionnaire/questions", r.Questionnaire.GetQuestions)
		r.mux.HandleFunc("/api/v1/questionnaire/adaptive", r.Questionnaire.GetAdaptive)
		r.mux.HandleFunc("/api/v1/questionnaire/responses", r.Questionnaire.SaveResponse)
		r.mux.HandleFunc("/api/v1/questionnaire/complete", r.Questionnaire.Complete)
	}

	// Projects (authenticated)
	if r.Project != nil {
		r.mux.Handle("/api/v1/projects", chain(http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
			switch req.Method {
			case http.MethodGet:
				r.Project.List(w, req)
			case http.MethodPost:
				r.Project.Create(w, req)
			default:
				writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
			}
		}), auth))
		r.mux.Handle("/api/v1/projects/", chain(http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
			path := req.URL.Path
			switch {
			case endsWith(path, "/status"):
				r.Project.UpdateStatus(w, req)
			case endsWith(path, "/team"):
				r.Project.AssignTeam(w, req)
			case endsWith(path, "/progress"):
				r.Project.UpdateProgress(w, req)
			default:
				r.Project.Get(w, req)
			}
		}), auth))
	}

	// Specifications (authenticated)
	if r.Spec != nil {
		r.mux.Handle("/api/v1/specifications", chain(http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
			switch req.Method {
			case http.MethodGet:
				r.Spec.GetByProject(w, req)
			case http.MethodPost:
				r.Spec.Generate(w, req)
			default:
				writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
			}
		}), auth))
		r.mux.Handle("/api/v1/specifications/", chain(http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
			path := req.URL.Path
			switch {
			case endsWith(path, "/approve"):
				r.Spec.Approve(w, req)
			case endsWith(path, "/reject"):
				r.Spec.Reject(w, req)
			case endsWith(path, "/notes"):
				r.Spec.AddNote(w, req)
			default:
				r.Spec.Get(w, req)
			}
		}), auth))
	}

	// Notifications (authenticated)
	if r.Notification != nil {
		r.mux.Handle("/api/v1/notifications", chain(http.HandlerFunc(r.Notification.List), auth))
		r.mux.Handle("/api/v1/notifications/read-all", chain(http.HandlerFunc(r.Notification.MarkAllRead), auth))
		r.mux.Handle("/api/v1/notifications/", chain(http.HandlerFunc(r.Notification.MarkRead), auth))
	}

	// Messages (authenticated)
	if r.Message != nil {
		r.mux.Handle("/api/v1/threads", chain(http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
			switch req.Method {
			case http.MethodGet:
				r.Message.ListThreads(w, req)
			case http.MethodPost:
				r.Message.CreateThread(w, req)
			default:
				writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
			}
		}), auth))
		r.mux.Handle("/api/v1/threads/", chain(http.HandlerFunc(r.Message.GetMessages), auth))
		r.mux.Handle("/api/v1/messages", chain(http.HandlerFunc(r.Message.SendMessage), auth))
	}

	// Tasks (authenticated, admin/PM only for create)
	if r.Task != nil {
		r.mux.Handle("/api/v1/tasks", chain(http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
			switch req.Method {
			case http.MethodGet:
				r.Task.List(w, req)
			case http.MethodPost:
				chain(http.HandlerFunc(r.Task.Create), adminOnly).ServeHTTP(w, req)
			default:
				writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
			}
		}), auth))
		r.mux.Handle("/api/v1/tasks/", chain(http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
			switch req.Method {
			case http.MethodPut:
				r.Task.Update(w, req)
			case http.MethodDelete:
				r.Task.Delete(w, req)
			default:
				writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
			}
		}), auth))
	}

	// Invoices (authenticated)
	if r.Invoice != nil {
		r.mux.Handle("/api/v1/invoices", chain(http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
			switch req.Method {
			case http.MethodGet:
				r.Invoice.ListByClient(w, req)
			case http.MethodPost:
				chain(http.HandlerFunc(r.Invoice.Create), adminOnly).ServeHTTP(w, req)
			default:
				writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
			}
		}), auth))
		r.mux.Handle("/api/v1/invoices/", chain(http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
			path := req.URL.Path
			if endsWith(path, "/pay") {
				r.Invoice.MarkPaid(w, req)
			} else {
				r.Invoice.Get(w, req)
			}
		}), auth))
	}

	// Users (authenticated, admin only for list/delete)
	if r.User != nil {
		r.mux.Handle("/api/v1/users", chain(http.HandlerFunc(r.User.List), auth, adminOnly))
		r.mux.Handle("/api/v1/users/", chain(http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
			switch req.Method {
			case http.MethodGet:
				r.User.Get(w, req)
			case http.MethodPut:
				r.User.Update(w, req)
			case http.MethodDelete:
				chain(http.HandlerFunc(r.User.Delete), adminOnly).ServeHTTP(w, req)
			default:
				writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
			}
		}), auth))
	}

	// File upload (authenticated)
	if r.File != nil {
		r.mux.Handle("/api/v1/upload", chain(http.HandlerFunc(r.File.Upload), auth))
	}

	// PDF spec download (authenticated)
	if r.PDF != nil {
		r.mux.Handle("/api/v1/specifications/", chain(http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
			path := req.URL.Path
			if endsWith(path, "/pdf") {
				r.PDF.GenerateSpecPDF(w, req)
				return
			}
			// Fall through to spec handler
			if r.Spec != nil {
				switch {
				case endsWith(path, "/approve"):
					r.Spec.Approve(w, req)
				case endsWith(path, "/reject"):
					r.Spec.Reject(w, req)
				case endsWith(path, "/notes"):
					r.Spec.AddNote(w, req)
				default:
					r.Spec.Get(w, req)
				}
			}
		}), auth))
	}

	// WebSocket (authenticated via query-string token)
	r.mux.HandleFunc("/ws", func(w http.ResponseWriter, req *http.Request) {
		ServeWS(r.WSHub, r.tokenService, w, req)
	})

	// Wrap everything in logging + metrics + CORS
	_ = logging
	_ = met
}

func (r *Router) Start() error {
	r.Setup()
	r.log.Info().Int("port", r.port).Msg("HTTP server starting")
	handler := chain(r.mux, corsMiddleware, loggingMiddleware(r.log), metricsMiddleware(r.metrics))
	return http.ListenAndServe(fmt.Sprintf(":%d", r.port), handler)
}

func (r *Router) contactHandler(w http.ResponseWriter, req *http.Request) {
	if req.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}
	var body struct {
		Name    string `json:"name"`
		Email   string `json:"email"`
		Message string `json:"message"`
		Phone   string `json:"phone"`
	}
	if err := json.NewDecoder(req.Body).Decode(&body); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
		return
	}
	r.log.Info().Str("name", body.Name).Str("email", body.Email).Msg("contact form submission")
	writeJSON(w, http.StatusOK, map[string]string{"status": "received", "message": "We'll get back to you shortly!"})
}

func endsWith(path, suffix string) bool {
	return len(path) >= len(suffix) && path[len(path)-len(suffix):] == suffix
}
