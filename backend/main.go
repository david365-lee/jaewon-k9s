package main

import (
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

const (
	defaultSocketPath = "/run/guest-services/jaewon-k9s.sock"
	kubeconfigPath    = "/root/.kube/config"
	maxRequestBytes   = 4 << 20
)

type configPayload struct {
	Data string `json:"data"`
}

func main() {
	socketPath := flag.String("socket", defaultSocketPath, "Unix domain socket path")
	flag.Parse()

	listener, err := listen(*socketPath)
	if err != nil {
		log.Fatal(err)
	}
	defer listener.Close()

	server := &http.Server{Handler: newHandler(kubeconfigPath)}
	log.Printf("Jaewon K9s service listening on %s", *socketPath)
	if err := server.Serve(listener); err != nil && !errors.Is(err, http.ErrServerClosed) {
		log.Fatal(err)
	}
}

func listen(path string) (net.Listener, error) {
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return nil, fmt.Errorf("create socket directory: %w", err)
	}

	info, err := os.Lstat(path)
	if err == nil {
		if info.Mode()&os.ModeSocket == 0 {
			return nil, fmt.Errorf("refusing to replace non-socket path %q", path)
		}
		if err := os.Remove(path); err != nil {
			return nil, fmt.Errorf("remove stale socket: %w", err)
		}
	} else if !errors.Is(err, os.ErrNotExist) {
		return nil, fmt.Errorf("inspect socket path: %w", err)
	}

	listener, err := net.Listen("unix", path)
	if err != nil {
		return nil, fmt.Errorf("listen on Unix socket: %w", err)
	}
	if err := os.Chmod(path, 0o660); err != nil {
		listener.Close()
		return nil, fmt.Errorf("set socket permissions: %w", err)
	}
	return listener, nil
}

func newHandler(path string) http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusNoContent)
	})
	mux.HandleFunc("POST /store-kube-config", storeConfigHandler(path))
	return mux
}

func storeConfigHandler(path string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		r.Body = http.MaxBytesReader(w, r.Body, maxRequestBytes)
		decoder := json.NewDecoder(r.Body)
		decoder.DisallowUnknownFields()

		var payload configPayload
		if err := decoder.Decode(&payload); err != nil {
			var maxBytesError *http.MaxBytesError
			if errors.As(err, &maxBytesError) {
				http.Error(w, "kubeconfig payload exceeds the size limit", http.StatusRequestEntityTooLarge)
				return
			}
			http.Error(w, "invalid request body", http.StatusBadRequest)
			return
		}
		if err := decoder.Decode(&struct{}{}); !errors.Is(err, io.EOF) {
			http.Error(w, "request body must contain one JSON object", http.StatusBadRequest)
			return
		}
		if err := validateKubeconfig(payload.Data); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		if err := writeConfig(path, payload.Data); err != nil {
			log.Printf("Unable to store selected kubeconfig: %v", err)
			http.Error(w, "unable to store kubeconfig", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		_, _ = io.WriteString(w, `{"ok":true}`+"\n")
	}
}

func validateKubeconfig(data string) error {
	if strings.TrimSpace(data) == "" {
		return errors.New("kubeconfig is empty")
	}
	if len(data) > maxRequestBytes {
		return errors.New("kubeconfig exceeds the size limit")
	}

	var config struct {
		APIVersion    string            `json:"apiVersion"`
		Kind          string            `json:"kind"`
		Current       string            `json:"current-context"`
		Contexts      []json.RawMessage `json:"contexts"`
	}
	if err := json.Unmarshal([]byte(data), &config); err != nil {
		return errors.New("kubeconfig must be valid JSON")
	}
	if config.Kind != "Config" || config.APIVersion == "" || config.Current == "" || len(config.Contexts) == 0 {
		return errors.New("kubeconfig must include apiVersion, kind, current-context, and contexts")
	}
	return nil
}

func writeConfig(path, data string) error {
	dir := filepath.Dir(path)
	if err := os.MkdirAll(dir, 0o700); err != nil {
		return fmt.Errorf("create kubeconfig directory: %w", err)
	}

	file, err := os.CreateTemp(dir, ".config-*")
	if err != nil {
		return fmt.Errorf("create temporary kubeconfig: %w", err)
	}
	tempPath := file.Name()
	defer os.Remove(tempPath)

	if err := file.Chmod(0o600); err != nil {
		file.Close()
		return fmt.Errorf("protect temporary kubeconfig: %w", err)
	}
	if _, err := io.WriteString(file, data); err != nil {
		file.Close()
		return fmt.Errorf("write temporary kubeconfig: %w", err)
	}
	if err := file.Sync(); err != nil {
		file.Close()
		return fmt.Errorf("flush temporary kubeconfig: %w", err)
	}
	if err := file.Close(); err != nil {
		return fmt.Errorf("close temporary kubeconfig: %w", err)
	}
	if err := os.Rename(tempPath, path); err != nil {
		return fmt.Errorf("replace kubeconfig: %w", err)
	}
	return nil
}
