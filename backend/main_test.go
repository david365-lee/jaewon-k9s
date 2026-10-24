package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

const validKubeconfig = `{"apiVersion":"v1","kind":"Config","current-context":"local","contexts":[{"name":"local","context":{"cluster":"local","user":"local"}}]}`

func TestHealthz(t *testing.T) {
	response := httptest.NewRecorder()
	newHandler(filepath.Join(t.TempDir(), "config")).
		ServeHTTP(response, httptest.NewRequest(http.MethodGet, "/healthz", nil))

	if response.Code != http.StatusNoContent {
		t.Fatalf("expected 204, got %d", response.Code)
	}
}

func TestStoreConfigWritesProtectedFile(t *testing.T) {
	path := filepath.Join(t.TempDir(), ".kube", "config")
	body, err := json.Marshal(configPayload{Data: validKubeconfig})
	if err != nil {
		t.Fatal(err)
	}

	response := httptest.NewRecorder()
	newHandler(path).ServeHTTP(response, httptest.NewRequest(http.MethodPost, "/store-kube-config", bytes.NewReader(body)))

	if response.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d: %s", response.Code, response.Body.String())
	}
	stored, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	if string(stored) != validKubeconfig {
		t.Fatal("stored kubeconfig differs from the submitted configuration")
	}
	if mode := (mustStat(t, path).Mode().Perm()); mode != 0o600 {
		t.Fatalf("expected permissions 0600, got %04o", mode)
	}
}

func TestStoreConfigRejectsInvalidPayloadWithoutReplacingFile(t *testing.T) {
	path := filepath.Join(t.TempDir(), "config")
	if err := os.WriteFile(path, []byte(validKubeconfig), 0o600); err != nil {
		t.Fatal(err)
	}

	body, err := json.Marshal(configPayload{Data: `{"kind":"Pod"}`})
	if err != nil {
		t.Fatal(err)
	}
	response := httptest.NewRecorder()
	newHandler(path).ServeHTTP(response, httptest.NewRequest(http.MethodPost, "/store-kube-config", bytes.NewReader(body)))

	if response.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", response.Code)
	}
	stored, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	if string(stored) != validKubeconfig {
		t.Fatal("invalid payload replaced the existing kubeconfig")
	}
}

func TestStoreConfigRejectsOversizedPayload(t *testing.T) {
	body, err := json.Marshal(configPayload{Data: strings.Repeat("x", maxRequestBytes+1)})
	if err != nil {
		t.Fatal(err)
	}
	response := httptest.NewRecorder()
	newHandler(filepath.Join(t.TempDir(), "config")).
		ServeHTTP(response, httptest.NewRequest(http.MethodPost, "/store-kube-config", bytes.NewReader(body)))

	if response.Code != http.StatusRequestEntityTooLarge {
		t.Fatalf("expected 413, got %d", response.Code)
	}
}

func mustStat(t *testing.T, path string) os.FileInfo {
	t.Helper()
	info, err := os.Stat(path)
	if err != nil {
		t.Fatal(err)
	}
	return info
}
