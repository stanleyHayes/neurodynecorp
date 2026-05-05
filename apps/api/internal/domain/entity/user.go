package entity

import (
	"time"

	"github.com/google/uuid"
)

type Role string

const (
	RoleAdmin          Role = "admin"
	RoleProjectManager Role = "project_manager"
	RoleDeveloper      Role = "developer"
	RoleQA             Role = "qa"
	RoleClient         Role = "client"
)

type User struct {
	ID           string    `bson:"_id" json:"id"`
	Email        string    `bson:"email" json:"email"`
	PasswordHash string    `bson:"password_hash" json:"-"`
	FirstName    string    `bson:"first_name" json:"first_name"`
	LastName     string    `bson:"last_name" json:"last_name"`
	Role         Role      `bson:"role" json:"role"`
	Avatar       string    `bson:"avatar,omitempty" json:"avatar,omitempty"`
	Phone        string    `bson:"phone,omitempty" json:"phone,omitempty"`
	Company      string    `bson:"company,omitempty" json:"company,omitempty"`
	IsActive     bool      `bson:"is_active" json:"is_active"`
	LastLoginAt  time.Time `bson:"last_login_at,omitempty" json:"last_login_at,omitempty"`
	CreatedAt    time.Time `bson:"created_at" json:"created_at"`
	UpdatedAt    time.Time `bson:"updated_at" json:"updated_at"`
}

func NewUser(email, firstName, lastName string, role Role) *User {
	now := time.Now()
	return &User{
		ID:        uuid.New().String(),
		Email:     email,
		FirstName: firstName,
		LastName:  lastName,
		Role:      role,
		IsActive:  true,
		CreatedAt: now,
		UpdatedAt: now,
	}
}

func (u *User) FullName() string {
	return u.FirstName + " " + u.LastName
}

func (u *User) IsInternal() bool {
	return u.Role != RoleClient
}
