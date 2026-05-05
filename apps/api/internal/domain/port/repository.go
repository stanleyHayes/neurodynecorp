package port

import (
	"context"

	"github.com/neurodynecorp/api/internal/domain/entity"
)

// UserRepository defines the driven port for user persistence.
type UserRepository interface {
	Create(ctx context.Context, user *entity.User) error
	GetByID(ctx context.Context, id string) (*entity.User, error)
	GetByEmail(ctx context.Context, email string) (*entity.User, error)
	Update(ctx context.Context, user *entity.User) error
	Delete(ctx context.Context, id string) error
	List(ctx context.Context, filter UserFilter) ([]*entity.User, int64, error)
}

type UserFilter struct {
	Role     entity.Role
	IsActive *bool
	Search   string
	Page     int
	PageSize int
}

// ProjectRepository defines the driven port for project persistence.
type ProjectRepository interface {
	Create(ctx context.Context, project *entity.Project) error
	GetByID(ctx context.Context, id string) (*entity.Project, error)
	Update(ctx context.Context, project *entity.Project) error
	Delete(ctx context.Context, id string) error
	ListByClient(ctx context.Context, clientID string, page, pageSize int) ([]*entity.Project, int64, error)
	ListByStatus(ctx context.Context, status entity.ProjectStatus, page, pageSize int) ([]*entity.Project, int64, error)
	List(ctx context.Context, filter ProjectFilter) ([]*entity.Project, int64, error)
}

type ProjectFilter struct {
	ClientID string
	Status   entity.ProjectStatus
	Type     entity.ProjectType
	Search   string
	Page     int
	PageSize int
}

// SpecificationRepository defines the driven port for specification persistence.
type SpecificationRepository interface {
	Create(ctx context.Context, spec *entity.Specification) error
	GetByID(ctx context.Context, id string) (*entity.Specification, error)
	GetByProjectID(ctx context.Context, projectID string) (*entity.Specification, error)
	Update(ctx context.Context, spec *entity.Specification) error
	ListVersions(ctx context.Context, projectID string) ([]*entity.Specification, error)
}

// QuestionRepository defines the driven port for questionnaire persistence.
type QuestionRepository interface {
	GetAll(ctx context.Context) ([]*entity.Question, error)
	GetByCategory(ctx context.Context, category string) ([]*entity.Question, error)
	GetByID(ctx context.Context, id string) (*entity.Question, error)
	Upsert(ctx context.Context, question *entity.Question) error
}

// QuestionnaireResponseRepository defines the driven port for questionnaire responses.
type QuestionnaireResponseRepository interface {
	Create(ctx context.Context, response *entity.QuestionnaireResponse) error
	GetByID(ctx context.Context, id string) (*entity.QuestionnaireResponse, error)
	GetByProjectID(ctx context.Context, projectID string) (*entity.QuestionnaireResponse, error)
	Update(ctx context.Context, response *entity.QuestionnaireResponse) error
}

// InvoiceRepository defines the driven port for invoice persistence.
type InvoiceRepository interface {
	Create(ctx context.Context, invoice *entity.Invoice) error
	GetByID(ctx context.Context, id string) (*entity.Invoice, error)
	ListByClient(ctx context.Context, clientID string, page, pageSize int) ([]*entity.Invoice, int64, error)
	ListByProject(ctx context.Context, projectID string) ([]*entity.Invoice, error)
	Update(ctx context.Context, invoice *entity.Invoice) error
}

// TaskRepository defines the driven port for task persistence.
type TaskRepository interface {
	Create(ctx context.Context, task *entity.Task) error
	GetByID(ctx context.Context, id string) (*entity.Task, error)
	Update(ctx context.Context, task *entity.Task) error
	Delete(ctx context.Context, id string) error
	ListByProject(ctx context.Context, projectID string, filter TaskFilter) ([]*entity.Task, int64, error)
	ListBySprint(ctx context.Context, sprintID string) ([]*entity.Task, error)
}

type TaskFilter struct {
	Status     entity.TaskStatus
	AssigneeID string
	Priority   entity.TaskPriority
	Page       int
	PageSize   int
}

// SprintRepository defines the driven port for sprint persistence.
type SprintRepository interface {
	Create(ctx context.Context, sprint *entity.Sprint) error
	GetByID(ctx context.Context, id string) (*entity.Sprint, error)
	Update(ctx context.Context, sprint *entity.Sprint) error
	ListByProject(ctx context.Context, projectID string) ([]*entity.Sprint, error)
	GetActive(ctx context.Context, projectID string) (*entity.Sprint, error)
}

// NotificationRepository defines the driven port for notification persistence.
type NotificationRepository interface {
	Create(ctx context.Context, notification *entity.Notification) error
	GetByUser(ctx context.Context, userID string, page, pageSize int) ([]*entity.Notification, int64, error)
	MarkAsRead(ctx context.Context, id string) error
	MarkAllAsRead(ctx context.Context, userID string) error
	CountUnread(ctx context.Context, userID string) (int64, error)
}

// MessageRepository defines the driven port for message persistence.
type MessageRepository interface {
	Create(ctx context.Context, message *entity.Message) error
	GetByThread(ctx context.Context, threadID string, page, pageSize int) ([]*entity.Message, int64, error)
	ListByProject(ctx context.Context, projectID string, page, pageSize int) ([]*entity.Message, int64, error)
}

// ThreadRepository defines the driven port for thread persistence.
type ThreadRepository interface {
	Create(ctx context.Context, thread *entity.Thread) error
	GetByID(ctx context.Context, id string) (*entity.Thread, error)
	ListByProject(ctx context.Context, projectID string) ([]*entity.Thread, error)
}
