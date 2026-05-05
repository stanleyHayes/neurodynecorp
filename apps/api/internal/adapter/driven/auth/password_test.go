package auth

import (
	"testing"
)

func TestBcryptHasher_Hash(t *testing.T) {
	hasher := NewBcryptHasher()

	hash, err := hasher.Hash("mypassword")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if hash == "" {
		t.Error("expected non-empty hash")
	}
	if hash == "mypassword" {
		t.Error("hash should not equal plaintext password")
	}
}

func TestBcryptHasher_Compare(t *testing.T) {
	hasher := NewBcryptHasher()

	t.Run("success", func(t *testing.T) {
		hash, _ := hasher.Hash("mypassword")

		err := hasher.Compare(hash, "mypassword")
		if err != nil {
			t.Errorf("expected nil error for correct password, got %v", err)
		}
	})

	t.Run("failure - wrong password", func(t *testing.T) {
		hash, _ := hasher.Hash("mypassword")

		err := hasher.Compare(hash, "wrongpassword")
		if err == nil {
			t.Error("expected error for wrong password, got nil")
		}
	})

	t.Run("failure - invalid hash", func(t *testing.T) {
		err := hasher.Compare("not-a-valid-hash", "mypassword")
		if err == nil {
			t.Error("expected error for invalid hash, got nil")
		}
	})
}

func TestBcryptHasher_DifferentHashes(t *testing.T) {
	hasher := NewBcryptHasher()

	hash1, _ := hasher.Hash("mypassword")
	hash2, _ := hasher.Hash("mypassword")

	if hash1 == hash2 {
		t.Error("expected different hashes for same password (bcrypt uses random salt)")
	}
}
