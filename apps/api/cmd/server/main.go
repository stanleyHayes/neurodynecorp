package main

import (
	"context"
	"os"
	"os/signal"
	"syscall"

	"github.com/neurodynecorp/api/internal/adapter/driven/auth"
	"github.com/neurodynecorp/api/internal/adapter/driven/cloudinary"
	"github.com/neurodynecorp/api/internal/adapter/driven/email"
	kafkaAdapter "github.com/neurodynecorp/api/internal/adapter/driven/kafka"
	mongoAdapter "github.com/neurodynecorp/api/internal/adapter/driven/mongodb"
	redisAdapter "github.com/neurodynecorp/api/internal/adapter/driven/redis"
	httpServer "github.com/neurodynecorp/api/internal/adapter/driving/http"
	"github.com/neurodynecorp/api/internal/app"
	"github.com/neurodynecorp/api/pkg/config"
	"github.com/neurodynecorp/api/pkg/logger"
	"github.com/neurodynecorp/api/pkg/metrics"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		panic("failed to load config: " + err.Error())
	}

	log := logger.New(cfg.Server.Environment)
	log.Info().
		Str("environment", cfg.Server.Environment).
		Int("http_port", cfg.Server.HTTPPort).
		Msg("starting NeuroDyne Corp API")

	m := metrics.New()
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// --- Driven Adapters ---

	// MongoDB
	mongoClient, err := mongoAdapter.NewClient(ctx, cfg.MongoDB.URI, cfg.MongoDB.Database, log)
	if err != nil {
		log.Fatal().Err(err).Msg("failed to connect to MongoDB")
	}
	defer mongoClient.Close(ctx)

	// Redis
	cache, err := redisAdapter.NewCacheService(cfg.Redis.Addr, cfg.Redis.Password, cfg.Redis.DB, log, m)
	if err != nil {
		log.Warn().Err(err).Msg("Redis not available, continuing without cache")
	}
	_ = cache

	// Kafka
	publisher := kafkaAdapter.NewPublisher(cfg.Kafka.Brokers, log, m)
	defer publisher.Close()

	// Cloudinary
	var fileStorage *cloudinary.Storage
	if cfg.Cloud.CloudinaryURL != "" {
		fileStorage, err = cloudinary.NewStorage(cfg.Cloud.CloudinaryURL, log)
		if err != nil {
			log.Warn().Err(err).Msg("Cloudinary not configured")
		}
	}

	// Email
	emailService := email.NewResendService(cfg.Email.ResendAPIKey, cfg.Email.FromAddress, log)

	// Auth
	passwordHasher := auth.NewBcryptHasher()
	tokenService := auth.NewJWTService(cfg.JWT.Secret, cfg.JWT.ExpirationHours, cfg.JWT.RefreshHours)

	// --- Repositories ---
	userRepo := mongoAdapter.NewUserRepository(mongoClient, m)
	projectRepo := mongoAdapter.NewProjectRepository(mongoClient, m)
	specRepo := mongoAdapter.NewSpecificationRepository(mongoClient, m)
	questionRepo := mongoAdapter.NewQuestionRepository(mongoClient, m)
	responseRepo := mongoAdapter.NewQuestionnaireResponseRepository(mongoClient, m)
	invoiceRepo := mongoAdapter.NewInvoiceRepository(mongoClient, m)
	taskRepo := mongoAdapter.NewTaskRepository(mongoClient, m)
	sprintRepo := mongoAdapter.NewSprintRepository(mongoClient, m)
	notifRepo := mongoAdapter.NewNotificationRepository(mongoClient, m)
	messageRepo := mongoAdapter.NewMessageRepository(mongoClient, m)
	threadRepo := mongoAdapter.NewThreadRepository(mongoClient, m)

	// Seed questionnaire data
	if err := mongoAdapter.SeedQuestions(ctx, questionRepo, log); err != nil {
		log.Warn().Err(err).Msg("failed to seed questions")
	}

	// --- Application Services ---
	authService := app.NewAuthService(userRepo, passwordHasher, tokenService, emailService, cache, publisher, log)
	projectService := app.NewProjectService(projectRepo, specRepo, publisher, cache, log)
	questionnaireService := app.NewQuestionnaireService(questionRepo, responseRepo, projectRepo, publisher, log)
	specService := app.NewSpecService(specRepo, responseRepo, projectRepo, publisher, log)

	// --- HTTP Router ---
	router := httpServer.NewRouter(httpServer.RouterConfig{
		Port:         cfg.Server.HTTPPort,
		Log:          log,
		Metrics:      m,
		TokenService: tokenService,
	})

	// Wire handlers
	router.Auth = httpServer.NewAuthHandler(authService)
	router.Project = httpServer.NewProjectHandler(projectService)
	router.Spec = httpServer.NewSpecHandler(specService)
	router.Questionnaire = httpServer.NewQuestionnaireHandler(questionnaireService)
	router.Notification = httpServer.NewNotificationHandler(notifRepo)
	router.Message = httpServer.NewMessageHandler(messageRepo, threadRepo)
	router.Task = httpServer.NewTaskHandler(taskRepo, sprintRepo)
	router.Invoice = httpServer.NewInvoiceHandler(invoiceRepo)
	router.User = httpServer.NewUserHandler(userRepo)

	// WebSocket Hub
	wsHub := httpServer.NewHub(log)
	go wsHub.Run()
	router.WSHub = wsHub
	if fileStorage != nil {
		router.File = httpServer.NewFileHandler(fileStorage, log)
	}
	router.PDF = httpServer.NewPDFHandler(specService)

	// --- Workflow Engine ---
	subscriber := kafkaAdapter.NewSubscriber(cfg.Kafka.Brokers, cfg.Kafka.GroupID, log, m)
	workflowEngine := app.NewWorkflowEngine(projectRepo, notifRepo, emailService, publisher, subscriber, log)
	if err := workflowEngine.Start(ctx); err != nil {
		log.Warn().Err(err).Msg("workflow engine failed to start (Kafka may not be available)")
	}
	defer workflowEngine.Stop()

	// --- Start Services ---

	// Metrics server
	if cfg.Metrics.Enabled {
		go func() {
			log.Info().Int("port", cfg.Metrics.Port).Msg("metrics server starting")
			if err := m.StartServer(cfg.Metrics.Port); err != nil {
				log.Error().Err(err).Msg("metrics server failed")
			}
		}()
	}

	// HTTP API
	go func() {
		if err := router.Start(); err != nil {
			log.Fatal().Err(err).Msg("HTTP server failed")
		}
	}()

	// --- Graceful Shutdown ---
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Info().Msg("shutting down...")
	cancel()
	log.Info().Msg("server stopped")
}
