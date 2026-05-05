package grpc

import (
	"context"
	"fmt"
	"net"
	"time"

	"github.com/neurodynecorp/api/internal/domain/port"
	"github.com/neurodynecorp/api/pkg/logger"
	"github.com/neurodynecorp/api/pkg/metrics"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
)

type Server struct {
	grpcServer   *grpc.Server
	port         int
	log          *logger.Logger
	metrics      *metrics.Metrics
	tokenService port.TokenService
}

func NewServer(port int, log *logger.Logger, m *metrics.Metrics, tokenService port.TokenService) *Server {
	s := &Server{
		port:         port,
		log:          log.WithComponent("grpc_server"),
		metrics:      m,
		tokenService: tokenService,
	}

	grpcServer := grpc.NewServer(
		grpc.ChainUnaryInterceptor(
			s.loggingInterceptor,
			s.metricsInterceptor,
			s.authInterceptor,
		),
	)

	s.grpcServer = grpcServer
	return s
}

func (s *Server) GRPCServer() *grpc.Server {
	return s.grpcServer
}

func (s *Server) Start() error {
	lis, err := net.Listen("tcp", fmt.Sprintf(":%d", s.port))
	if err != nil {
		s.log.Fatal().Err(err).Int("port", s.port).Msg("failed to listen")
		return err
	}

	s.log.Info().Int("port", s.port).Msg("gRPC server starting")
	return s.grpcServer.Serve(lis)
}

func (s *Server) Stop() {
	s.log.Info().Msg("gRPC server stopping gracefully")
	s.grpcServer.GracefulStop()
}

// loggingInterceptor logs every gRPC request.
func (s *Server) loggingInterceptor(
	ctx context.Context,
	req interface{},
	info *grpc.UnaryServerInfo,
	handler grpc.UnaryHandler,
) (interface{}, error) {
	start := time.Now()

	resp, err := handler(ctx, req)

	duration := time.Since(start)
	st, _ := status.FromError(err)

	s.log.Info().
		Str("method", info.FullMethod).
		Str("code", st.Code().String()).
		Dur("duration", duration).
		Msg("grpc request")

	return resp, err
}

// metricsInterceptor records Prometheus metrics for each gRPC call.
func (s *Server) metricsInterceptor(
	ctx context.Context,
	req interface{},
	info *grpc.UnaryServerInfo,
	handler grpc.UnaryHandler,
) (interface{}, error) {
	start := time.Now()

	resp, err := handler(ctx, req)

	duration := time.Since(start)
	st, _ := status.FromError(err)

	s.metrics.GRPCRequestsTotal.WithLabelValues(info.FullMethod, st.Code().String()).Inc()
	s.metrics.GRPCRequestDuration.WithLabelValues(info.FullMethod).Observe(duration.Seconds())

	return resp, err
}

// publicMethods are gRPC methods that don't require authentication.
var publicMethods = map[string]bool{
	"/neurodyne.v1.AuthService/Register":                    true,
	"/neurodyne.v1.AuthService/Login":                       true,
	"/neurodyne.v1.AuthService/RefreshToken":                true,
	"/neurodyne.v1.QuestionnaireService/GetQuestions":        true,
	"/neurodyne.v1.QuestionnaireService/GetAdaptiveQuestions": true,
}

// authInterceptor validates JWT tokens for protected routes.
func (s *Server) authInterceptor(
	ctx context.Context,
	req interface{},
	info *grpc.UnaryServerInfo,
	handler grpc.UnaryHandler,
) (interface{}, error) {
	if publicMethods[info.FullMethod] {
		return handler(ctx, req)
	}

	md, ok := metadata.FromIncomingContext(ctx)
	if !ok {
		return nil, status.Error(codes.Unauthenticated, "missing metadata")
	}

	authHeader := md.Get("authorization")
	if len(authHeader) == 0 {
		return nil, status.Error(codes.Unauthenticated, "missing authorization header")
	}

	token := authHeader[0]
	if len(token) > 7 && token[:7] == "Bearer " {
		token = token[7:]
	}

	claims, err := s.tokenService.ValidateAccessToken(token)
	if err != nil {
		return nil, status.Error(codes.Unauthenticated, "invalid token")
	}

	// Add claims to context
	ctx = context.WithValue(ctx, contextKeyUserID, claims.UserID)
	ctx = context.WithValue(ctx, contextKeyRole, claims.Role)

	return handler(ctx, req)
}

type contextKey string

const (
	contextKeyUserID contextKey = "user_id"
	contextKeyRole   contextKey = "role"
)

func GetUserID(ctx context.Context) string {
	if v, ok := ctx.Value(contextKeyUserID).(string); ok {
		return v
	}
	return ""
}

func GetUserRole(ctx context.Context) string {
	if v, ok := ctx.Value(contextKeyRole).(string); ok {
		return v
	}
	return ""
}
