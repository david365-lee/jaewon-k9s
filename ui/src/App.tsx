import { createDockerDesktopClient } from "@docker/extension-api-client";
import { useEffect, useMemo, useState } from "react";
import { clampZoom, filterContexts, listContexts, parseKubeconfig, prepareKubeconfig, type KubeContext } from "./kubeconfig";

const client = createDockerDesktopClient();
const terminalUrl = "http://localhost:35782";
const contextStorageKey = "jaewon-k9s.connected-context";
const zoomStorageKey = "jaewon-k9s.terminal-zoom";

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
  const [selectedContext, setSelectedContext] = useState(() => window.localStorage.getItem(contextStorageKey) ?? "");
  const [contextQuery, setContextQuery] = useState("");
  const [connectedContext, setConnectedContext] = useState(() => window.localStorage.getItem(contextStorageKey) ?? "");
  const [terminalSession, setTerminalSession] = useState(0);
  const [zoom, setZoom] = useState(() => clampZoom(Number(window.localStorage.getItem(zoomStorageKey) ?? 1)));
  const [loadingContexts, setLoadingContexts] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);

  useEffect(() => {
    if (loadingContexts) {
      return;
    }
    if (contexts.some((context) => context.name === selectedContext)) {
      return;
    }
    setSelectedContext(contexts[0]?.name ?? "");
  }, [contexts, loadingContexts, selectedContext]);

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
        setError("No Kubernetes contexts were found in the host kubeconfig.");
        return;
      }
      const savedContext = window.localStorage.getItem(contextStorageKey);
      const preferred = available.find((context) => context.name === savedContext)
        ?? available.find((context) => context.name === config["current-context"])
        ?? available.find((context) => context.name === "docker-desktop")
        ?? available[0];
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
      setTerminalSession((session) => session + 1);
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
  const visibleContexts = useMemo(() => filterContexts(contexts, contextQuery), [contexts, contextQuery]);
  const selectedContextDetails = contexts.find((context) => context.name === selectedContext);
  const selectedContextVisible = visibleContexts.some((context) => context.name === selectedContext);

  return (
    <main className="app">
      <header className="topbar">
        <div className="brand">
          <img src="./jaewon-k9s.svg" alt="" />
          <div>
            <p className="eyebrow">KUBERNETES FOR DOCKER DESKTOP</p>
            <h1>Jaewon <span>K9s</span></h1>
          </div>
        </div>
        <div className="zoom-controls" aria-label="Terminal zoom controls">
          <span>Zoom</span>
          <button type="button" onClick={() => updateZoom(zoom - 0.1)} aria-label="Zoom out">−</button>
          <output aria-live="polite">{Math.round(zoom * 100)}%</output>
          <button type="button" onClick={() => updateZoom(zoom + 0.1)} aria-label="Zoom in">+</button>
          <button type="button" className="reset-button" onClick={() => updateZoom(1)} aria-label="Reset zoom">↺</button>
        </div>
      </header>

      <section className="connection-panel" aria-label="Choose a Kubernetes context">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">YOUR CLUSTER</p>
            <h2>Where should we connect?</h2>
          </div>
          <button
            type="button"
            className="refresh-button"
            onClick={() => void refreshContexts()}
            disabled={loadingContexts}
            aria-label="Refresh Kubernetes contexts"
            title="Refresh contexts"
          >
            <span aria-hidden="true">{loadingContexts ? "…" : "↻"}</span>
          </button>
        </div>
        <div className="connection-fields">
          <div className="context-picker">
            <label className="search-field">
              <span className="search-icon" aria-hidden="true">⌕</span>
              <input
                type="search"
                value={contextQuery}
                onChange={(event) => {
                  const query = event.target.value;
                  const matches = filterContexts(contexts, query);
                  setContextQuery(query);
                  if (matches.length > 0 && !matches.some((context) => context.name === selectedContext)) {
                    setSelectedContext(matches[0].name);
                  }
                }}
                placeholder="Search clusters or endpoints"
                aria-label="Search Kubernetes contexts"
                disabled={loadingContexts || contexts.length === 0}
              />
              <span className="context-count">{visibleContexts.length}</span>
            </label>
            <select
              className="context-select"
              value={selectedContext}
              onChange={(event) => setSelectedContext(event.target.value)}
              disabled={loadingContexts || visibleContexts.length === 0}
              aria-label="Kubernetes context"
            >
              {visibleContexts.length === 0 && <option value="">No matching contexts</option>}
              {visibleContexts.map((context) => (
                <option key={context.name} value={context.name}>
                  {context.local ? "LOCAL" : "REMOTE"}  ·  {context.name}  ·  {displayEndpoint(context.server)}
                </option>
              ))}
            </select>
          </div>
          <button type="button" className="connect-button" onClick={() => void connect()} disabled={connecting || loadingContexts || !selectedContext || !selectedContextVisible}>
            <span>{connecting ? "Opening K9s..." : connectedContext === selectedContext ? "Reconnect to K9s" : "Open K9s"}</span>
            <span className="button-arrow" aria-hidden="true">↗</span>
          </button>
        </div>
        {contexts.length > 0 && !loadingContexts && visibleContexts.length === 0 && (
          <p className="hint">No matching contexts. Try another search.</p>
        )}
        {contexts.length === 0 && !loadingContexts && !error && (
          <p className="hint">No contexts found. Check that Kubernetes is enabled and kubectl can read your kubeconfig.</p>
        )}
        {selectedContextDetails && selectedContextVisible && (
          <div className="selected-context">
            <span className={`context-dot ${selectedContextDetails.local ? "local" : "remote"}`} />
            <span className={`context-type ${selectedContextDetails.local ? "local" : "remote"}`}>
              {selectedContextDetails.local ? "LOCAL" : "REMOTE"}
            </span>
            <strong title={selectedContextDetails.name}>{selectedContextDetails.name}</strong>
            <span className="endpoint">{displayEndpoint(selectedContextDetails.server)}</span>
          </div>
        )}
        {connectedContext && (
          <p className="status-line"><span className="live-dot" /> K9s session · <strong>{connectedContext}</strong></p>
        )}
        {notice && <p className="notice" role="status">{notice}</p>}
        {warnings.map((warning) => <p className="warning" role="status" key={warning}>{warning}</p>)}
        {error && <p className="error" role="alert">{error}</p>}
      </section>

      <section className="terminal-panel" aria-label="K9s terminal">
        {connectedContext ? (
          <iframe
            key={`${connectedContext}:${terminalSession}`}
            title={`K9s terminal for ${connectedContext}`}
            src={terminalUrl}
            style={iframeStyle}
          />
        ) : (
          <div className="empty-state">
            <div className="terminal-mark" aria-hidden="true"><span>k9s</span><i>_</i></div>
            <h2>Your terminal is ready</h2>
            <p>Select a cluster above and open K9s to get started.</p>
          </div>
        )}
      </section>

      <footer><span>JAEWON K9S</span><span>Zoom with Ctrl/Cmd + +, −, or 0</span></footer>
    </main>
  );
}
