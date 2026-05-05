package entity

import (
	"time"

	"github.com/google/uuid"
)

type Message struct {
	ID        string    `bson:"_id" json:"id"`
	ProjectID string    `bson:"project_id" json:"project_id"`
	ThreadID  string    `bson:"thread_id,omitempty" json:"thread_id,omitempty"`
	SenderID  string    `bson:"sender_id" json:"sender_id"`
	Content   string    `bson:"content" json:"content"`
	FileURLs  []string  `bson:"file_urls,omitempty" json:"file_urls,omitempty"`
	CreatedAt time.Time `bson:"created_at" json:"created_at"`
	UpdatedAt time.Time `bson:"updated_at" json:"updated_at"`
}

type Thread struct {
	ID           string    `bson:"_id" json:"id"`
	ProjectID    string    `bson:"project_id" json:"project_id"`
	Subject      string    `bson:"subject" json:"subject"`
	Participants []string  `bson:"participants" json:"participants"`
	LastMessage  time.Time `bson:"last_message" json:"last_message"`
	CreatedAt    time.Time `bson:"created_at" json:"created_at"`
}

func NewMessage(projectID, senderID, content string) *Message {
	now := time.Now()
	return &Message{
		ID:        uuid.New().String(),
		ProjectID: projectID,
		SenderID:  senderID,
		Content:   content,
		CreatedAt: now,
		UpdatedAt: now,
	}
}

func NewThread(projectID, subject string, participants []string) *Thread {
	now := time.Now()
	return &Thread{
		ID:           uuid.New().String(),
		ProjectID:    projectID,
		Subject:      subject,
		Participants: participants,
		LastMessage:  now,
		CreatedAt:    now,
	}
}
