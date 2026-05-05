package entity

import (
	"testing"
)

func TestNewUser(t *testing.T) {
	tests := []struct {
		name      string
		email     string
		firstName string
		lastName  string
		role      Role
	}{
		{
			name:      "create client user",
			email:     "alice@example.com",
			firstName: "Alice",
			lastName:  "Smith",
			role:      RoleClient,
		},
		{
			name:      "create admin user",
			email:     "bob@neurodyne.com",
			firstName: "Bob",
			lastName:  "Jones",
			role:      RoleAdmin,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			user := NewUser(tt.email, tt.firstName, tt.lastName, tt.role)

			if user.ID == "" {
				t.Error("expected non-empty ID")
			}
			if user.Email != tt.email {
				t.Errorf("expected email %q, got %q", tt.email, user.Email)
			}
			if user.FirstName != tt.firstName {
				t.Errorf("expected first name %q, got %q", tt.firstName, user.FirstName)
			}
			if user.LastName != tt.lastName {
				t.Errorf("expected last name %q, got %q", tt.lastName, user.LastName)
			}
			if user.Role != tt.role {
				t.Errorf("expected role %q, got %q", tt.role, user.Role)
			}
			if !user.IsActive {
				t.Error("expected user to be active by default")
			}
			if user.CreatedAt.IsZero() {
				t.Error("expected non-zero CreatedAt")
			}
			if user.UpdatedAt.IsZero() {
				t.Error("expected non-zero UpdatedAt")
			}
			if user.PasswordHash != "" {
				t.Error("expected empty password hash for new user")
			}
		})
	}
}

func TestUser_FullName(t *testing.T) {
	tests := []struct {
		name      string
		firstName string
		lastName  string
		want      string
	}{
		{"normal name", "Alice", "Smith", "Alice Smith"},
		{"single char", "A", "B", "A B"},
		{"empty first", "", "Smith", " Smith"},
		{"empty last", "Alice", "", "Alice "},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			user := &User{FirstName: tt.firstName, LastName: tt.lastName}
			got := user.FullName()
			if got != tt.want {
				t.Errorf("FullName() = %q, want %q", got, tt.want)
			}
		})
	}
}

func TestUser_IsInternal(t *testing.T) {
	tests := []struct {
		name string
		role Role
		want bool
	}{
		{"admin is internal", RoleAdmin, true},
		{"project_manager is internal", RoleProjectManager, true},
		{"developer is internal", RoleDeveloper, true},
		{"qa is internal", RoleQA, true},
		{"client is not internal", RoleClient, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			user := &User{Role: tt.role}
			got := user.IsInternal()
			if got != tt.want {
				t.Errorf("IsInternal() = %v, want %v", got, tt.want)
			}
		})
	}
}
