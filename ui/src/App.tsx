import { createDockerDesktopClient } from "@docker/extension-api-client";
import { useEffect, useMemo, useState } from "react";
import { clampZoom, listContexts, parseKubeconfig, prepareKubeconfig, type KubeContext } from "./kubeconfig";

const client = createDockerDesktopClient();
const terminalUrl = "http://localhost:35782";
const contextStorageKey = "jaewon-k9s.connected-context";
const zoomStorageKey = "jaewon-k9s.terminal-zoom";
type ConnectionMode = "local" | "remote";

async function runHostKubectl(args: string[]): Promise<string> {
  const result = await client.extension.host?.cli.exec("kubectl", args);
  if (!result) {
    throw new Error("Docker Desktop did not provide the host kubectl command.");
  }
  if (result.stderr?.trim()) {
    throw new Error(result.stderr.trim());
  }
  return result.stdout ?? "";
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

function displayEndpoint(server: string): string {
  if (!server) {
    return "API endpoint unavailable";
  }
  try {
    return new URL(server).host;
  } catch {
    return "invalid API endpoint";
  }
}

export function App() {
  const [contexts, setContexts] = useState<KubeContext[]>([]);
  const [mode, setMode] = useState<ConnectionMode>("local");
  const [showAllContexts, setShowAllContexts] = useState(false);
  const [selectedContext, setSelectedContext] = useState(() => window.localStorage.getItem(contextStorageKey) ?? "");
  const [connectedContext, setConnectedContext] = useState(() => window.localStorage.getItem(contextStorageKey) ?? "");
  const [zoom, setZoom] = useState(() => clampZoom(Number(window.localStorage.getItem(zoomStorageKey) ?? 1)));
  const [loadingContexts, setLoadingContexts] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);

  const availableContexts = useMemo(
    () => showAllContexts ? contexts : contexts.filter((context) => context.local === (mode === "local")),
    [contexts, mode, showAllContexts],
  );

  useEffect(() => {
    if (loadingContexts) {
      return;
    }
    if (availableContexts.some((context) => context.name === selectedContext)) {
      return;
    }
    const preferred = availableContexts.find((context) => context.name === "docker-desktop") ?? availableContexts[0];
    setSelectedContext(preferred?.name ?? "");
  }, [availableContexts, loadingContexts, selectedContext]);

  useEffect(() => {
    void refreshContexts();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.altKey) {
        return;
      }
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, select, textarea, button")) {
        return;
      }
      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        updateZoom(zoom + 0.1);
      } else if (event.key === "-") {
        event.preventDefault();
        updateZoom(zoom - 0.1);
      } else if (event.key === "0") {
        event.preventDefault();
        updateZoom(1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [zoom]);

  async function refreshContexts() {
    setLoadingContexts(true);
    setError("");
    try {
      const output = await runHostKubectl(["config", "view", "-o", "json"]);
      const config = parseKubeconfig(output);
      const available = listContexts(config);
      setContexts(available);
      if (available.length === 0) {
        setMode("remote");
        setError("No Kubernetes contexts were found in the host kubeconfig.");
        return;
      }
      const savedContext = window.localStorage.getItem(contextStorageKey);
      const preferred = available.find((context) => context.name === config["current-context"])
        ?? available.find((context) => context.name === savedContext)
        ?? available.find((context) => context.name === "docker-desktop")
        ?? available[0];
      setMode(preferred.local ? "local" : "remote");
      setSelectedContext(preferred.name);
    } catch (caught) {
      setContexts([]);
      setError(`Unable to read host Kubernetes contexts: ${errorMessage(caught)}`);
    } finally {
      setLoadingContexts(false);
    }
  }

  async function connect() {
    if (!selectedContext) {
      setError("Select a Kubernetes context before connecting.");
      return;
    }
    setConnecting(true);
    setError("");
    setNotice("");
    setWarnings([]);
    try {
      const output = await runHostKubectl([
        "config",
        "view",
        "--raw",
        "--flatten",
        "--minify",
        `--context=${selectedContext}`,
        "-o",
        "json",
      ]);
      const prepared = prepareKubeconfig(output, selectedContext);
      const response = await client.extension.vm?.service?.post("/store-kube-config", { data: prepared.data });
      if (!response) {
        throw new Error("Docker Desktop did not provide the extension configuration service.");
      }
      window.localStorage.setItem(contextStorageKey, selectedContext);
      setConnectedContext(selectedContext);
      setWarnings(prepared.warnings);
      setNotice(
        prepared.rewroteLoopback
          ? "Connected. The loopback API address was routed through host.docker.internal with TLS verification preserved."
          : "Connected. K9s now uses the selected host kubeconfig context.",
      );
    } catch (caught) {
      setError(`Unable to connect to "${selectedContext}": ${errorMessage(caught)}`);
    } finally {
      setConnecting(false);
    }
  }

  function updateZoom(value: number) {
    const nextZoom = clampZoom(value);
    setZoom(nextZoom);
    window.localStorage.setItem(zoomStorageKey, String(nextZoom));
  }

  const scale = zoom;
  const iframeStyle = {
    width: `${100 / scale}%`,
    height: `${100 / scale}%`,
    transform: `scale(${scale})`,
  };

  return (
    <main className="app">
      <header className="topbar">
        <div className="brand">
          <img src="./jaewon-k9s.svg" alt="" />
          <div>
            <h1>Jaewon K9s</h1>
            <p>Free Kubernetes terminal for Docker Desktop</p>
          </div>
        </div>
        <div className="zoom-controls" aria-label="Terminal zoom controls">
          <span>Terminal zoom</span>
          <button type="button" onClick={() => updateZoom(zoom - 0.1)} aria-label="Zoom out">−</button>
          <output aria-live="polite">{Math.round(zoom * 100)}%</output>
          <button type="button" onClick={() => updateZoom(zoom + 0.1)} aria-label="Zoom in">+</button>
          <button type="button" className="reset-button" onClick={() => updateZoom(1)}>Reset</button>
        </div>
      </header>

      <section className="connection-panel" aria-label="Kubernetes connection">
        <div className="connection-fields">
          <label className="field">
            <span>Connection type</span>
            <select value={mode} onChange={(event) => setMode(event.target.value as ConnectionMode)}>
              <option value="local">Local cluster</option>
              <option value="remote">Remote / other context</option>
            </select>
          </label>
          <label className="field context-field">
            <span>Kubernetes context</span>
            <select
              value={selectedContext}
              onChange={(event) => setSelectedContext(event.target.value)}
              disabled={loadingContexts || availableContexts.length === 0}
            >
              {availableContexts.length === 0 && <option value="">No matching contexts</option>}
              {availableContexts.map((context) => (
                <option key={context.name} value={context.name}>
                  {context.name} — {displayEndpoint(context.server)}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="secondary-button" onClick={() => void refreshContexts()} disabled={loadingContexts}>
            {loadingContexts ? "Loading..." : "Refresh contexts"}
          </button>
          <button type="button" className="connect-button" onClick={() => void connect()} disabled={connecting || !selectedContext}>
            {connecting ? "Connecting..." : "Connect"}
          </button>
        </div>
        <label className="show-all">
          <input type="checkbox" checked={showAllContexts} onChange={(event) => setShowAllContexts(event.target.checked)} />
          Show contexts from both groups
        </label>
        {availableContexts.length === 0 && !loadingContexts && contexts.length > 0 && (
          <p className="hint">No contexts were classified as {mode === "local" ? "local" : "remote"}. Enable “Show contexts from both groups” to choose manually.</p>
        )}
        {connectedContext && (
          <p className="status-line">Connected context: <strong>{connectedContext}</strong></p>
        )}
        {notice && <p className="notice" role="status">{notice}</p>}
        {warnings.map((warning) => <p className="warning" role="status" key={warning}>{warning}</p>)}
        {error && <p className="error" role="alert">{error}</p>}
      </section>

      <section className="terminal-panel" aria-label="K9s terminal">
        {connectedContext ? (
          <iframe
            key={connectedContext}
            title={`K9s terminal for ${connectedContext}`}
            src={terminalUrl}
            style={iframeStyle}
          />
        ) : (
          <div className="empty-state">
            <h2>Choose a cluster to start K9s</h2>
            <p>Select the Docker Desktop cluster or a context from your host kubeconfig, then connect.</p>
          </div>
        )}
      </section>

      <footer>Zoom: use − / + / Reset, or Ctrl/Cmd + +, −, and 0. Some terminal content may require a refresh after resizing.</footer>
    </main>
  );
}
