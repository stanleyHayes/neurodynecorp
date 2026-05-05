package entity

import (
	"testing"
)

func TestNewSpecification(t *testing.T) {
	spec := NewSpecification("project-123")

	if spec.ID == "" {
		t.Error("expected non-empty ID")
	}
	if spec.ProjectID != "project-123" {
		t.Errorf("expected project ID %q, got %q", "project-123", spec.ProjectID)
	}
	if spec.Version != 1 {
		t.Errorf("expected version 1, got %d", spec.Version)
	}
	if spec.Status != SpecStatusDraft {
		t.Errorf("expected status %q, got %q", SpecStatusDraft, spec.Status)
	}
	if spec.CreatedAt.IsZero() {
		t.Error("expected non-zero CreatedAt")
	}
	if spec.UpdatedAt.IsZero() {
		t.Error("expected non-zero UpdatedAt")
	}
}

func TestNewSpecification_UniqueIDs(t *testing.T) {
	s1 := NewSpecification("proj-1")
	s2 := NewSpecification("proj-1")

	if s1.ID == s2.ID {
		t.Error("expected different IDs for different specifications")
	}
}
