package entity

import (
	"time"

	"github.com/google/uuid"
)

type NotificationType string

const (
	NotificationTypeProjectUpdate NotificationType = "project_update"
	NotificationTypeStatusChange  NotificationType = "status_change"
	NotificationTypeNewMessage    NotificationType = "new_message"
	NotificationTypeInvoice       NotificationType = "invoice"
	NotificationTypeApproval      NotificationType = "approval"
	NotificationTypeSystem        NotificationType = "system"
)

type Notification struct {
	ID        string           `bson:"_id" json:"id"`
	UserID    string           `bson:"user_id" json:"user_id"`
	Type      NotificationType `bson:"type" json:"type"`
	Title     string           `bson:"title" json:"title"`
	Body      string           `bson:"body" json:"body"`
	Data      map[string]string `bson:"data,omitempty" json:"data,omitempty"`
	Read      bool             `bson:"read" json:"read"`
	ReadAt    time.Time        `bson:"read_at,omitempty" json:"read_at,omitempty"`
	CreatedAt time.Time        `bson:"created_at" json:"created_at"`
}

func NewNotification(userID string, nType NotificationType, title, body string) *Notification {
	return &Notification{
		ID:        uuid.New().String(),
		UserID:    userID,
		Type:      nType,
		Title:     title,
		Body:      body,
		Read:      false,
		CreatedAt: time.Now(),
	}
}
