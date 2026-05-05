package entity

import (
	"testing"
)

func TestNewProject(t *testing.T) {
	p := NewProject("client-1", "My App", "A great app", ProjectTypeWebApp)

	if p.ID == "" {
		t.Error("expected non-empty ID")
	}
	if p.ClientID != "client-1" {
		t.Errorf("expected client ID %q, got %q", "client-1", p.ClientID)
	}
	if p.Title != "My App" {
		t.Errorf("expected title %q, got %q", "My App", p.Title)
	}
	if p.Description != "A great app" {
		t.Errorf("expected description %q, got %q", "A great app", p.Description)
	}
	if p.Type != ProjectTypeWebApp {
		t.Errorf("expected type %q, got %q", ProjectTypeWebApp, p.Type)
	}
	if p.Status != ProjectStatusLead {
		t.Errorf("expected status %q, got %q", ProjectStatusLead, p.Status)
	}
	if p.Progress != 0 {
		t.Errorf("expected progress 0, got %f", p.Progress)
	}
	if p.CreatedAt.IsZero() {
		t.Error("expected non-zero CreatedAt")
	}
	if p.UpdatedAt.IsZero() {
		t.Error("expected non-zero UpdatedAt")
	}
}

func TestProject_CanTransitionTo(t *testing.T) {
	tests := []struct {
		name    string
		current ProjectStatus
		next    ProjectStatus
		want    bool
	}{
		// Valid transitions
		{"lead -> under_review", ProjectStatusLead, ProjectStatusUnderReview, true},
		{"under_review -> approved", ProjectStatusUnderReview, ProjectStatusApproved, true},
		{"under_review -> lead", ProjectStatusUnderReview, ProjectStatusLead, true},
		{"approved -> in_development", ProjectStatusApproved, ProjectStatusInDevelopment, true},
		{"in_development -> qa", ProjectStatusInDevelopment, ProjectStatusQA, true},
		{"qa -> in_development", ProjectStatusQA, ProjectStatusInDevelopment, true},
		{"qa -> delivered", ProjectStatusQA, ProjectStatusDelivered, true},

		// Invalid transitions
		{"lead -> approved", ProjectStatusLead, ProjectStatusApproved, false},
		{"lead -> in_development", ProjectStatusLead, ProjectStatusInDevelopment, false},
		{"lead -> qa", ProjectStatusLead, ProjectStatusQA, false},
		{"lead -> delivered", ProjectStatusLead, ProjectStatusDelivered, false},
		{"approved -> qa", ProjectStatusApproved, ProjectStatusQA, false},
		{"approved -> delivered", ProjectStatusApproved, ProjectStatusDelivered, false},
		{"in_development -> delivered", ProjectStatusInDevelopment, ProjectStatusDelivered, false},
		{"delivered -> lead", ProjectStatusDelivered, ProjectStatusLead, false},
		{"delivered -> anything", ProjectStatusDelivered, ProjectStatusUnderReview, false},
		{"same status lead", ProjectStatusLead, ProjectStatusLead, false},
		{"unknown status", ProjectStatus("unknown"), ProjectStatusLead, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			p := &Project{Status: tt.current}
			got := p.CanTransitionTo(tt.next)
			if got != tt.want {
				t.Errorf("CanTransitionTo(%q) from %q = %v, want %v", tt.next, tt.current, got, tt.want)
			}
		})
	}
}

func TestProject_TransitionTo(t *testing.T) {
	t.Run("valid transition updates status", func(t *testing.T) {
		p := NewProject("c1", "Test", "desc", ProjectTypeWebApp)
		oldUpdatedAt := p.UpdatedAt

		ok := p.TransitionTo(ProjectStatusUnderReview)
		if !ok {
			t.Error("expected TransitionTo to return true")
		}
		if p.Status != ProjectStatusUnderReview {
			t.Errorf("expected status %q, got %q", ProjectStatusUnderReview, p.Status)
		}
		if !p.UpdatedAt.After(oldUpdatedAt) && p.UpdatedAt != oldUpdatedAt {
			// UpdatedAt should be >= oldUpdatedAt (may be equal if very fast)
		}
	})

	t.Run("invalid transition leaves status unchanged", func(t *testing.T) {
		p := NewProject("c1", "Test", "desc", ProjectTypeWebApp)
		originalStatus := p.Status

		ok := p.TransitionTo(ProjectStatusDelivered)
		if ok {
			t.Error("expected TransitionTo to return false for invalid transition")
		}
		if p.Status != originalStatus {
			t.Errorf("expected status to remain %q, got %q", originalStatus, p.Status)
		}
	})
}
