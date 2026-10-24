export interface KubeContext {
  name: string;
  cluster: string;
  server: string;
  local: boolean;
}

interface KubeCluster {
  name: string;
  cluster?: {
    server?: string;
    "tls-server-name"?: string;
    "certificate-authority"?: string;
    "certificate-authority-data"?: string;
    "proxy-url"?: string;
  };
}

interface KubeContextEntry {
  name: string;
  context?: {
    cluster?: string;
    user?: string;
  };
}

interface KubeUser {
  name: string;
  user?: {
    exec?: unknown;
    tokenFile?: string;
    "auth-provider"?: unknown;
  };
}

interface KubeConfig {
  apiVersion?: string;
  kind?: string;
  "current-context"?: string;
  clusters?: KubeCluster[];
  contexts?: KubeContextEntry[];
  users?: KubeUser[];
}

const localContextName = /^(docker-desktop|docker-for-desktop|minikube|rancher-desktop|orbstack|colima|microk8s|kind(?:-|$))/i;

export function parseKubeconfig(data: string): KubeConfig {
  let config: KubeConfig;
  try {
    config = JSON.parse(data) as KubeConfig;
  } catch {
    throw new Error("kubectl returned an unreadable kubeconfig.");
  }
  if (!config || !Array.isArray(config.contexts) || !Array.isArray(config.clusters)) {
    throw new Error("kubectl returned a kubeconfig without contexts or clusters.");
  }
  return config;
}

export function listContexts(config: KubeConfig): KubeContext[] {
  const clusters = new Map((config.clusters ?? []).map((entry) => [entry.name, entry.cluster]));
  return (config.contexts ?? [])
    .filter((entry) => Boolean(entry.name))
    .map((entry) => {
      const clusterName = entry.context?.cluster ?? "";
      const server = clusters.get(clusterName)?.server ?? "";
      return {
        name: entry.name,
        cluster: clusterName,
        server,
        local: isLocalContext(entry.name, server),
      };
    });
}

export function isLocalContext(name: string, server: string): boolean {
  if (localContextName.test(name)) {
    return true;
  }
  try {
    const hostname = new URL(server).hostname.toLowerCase().replace(/^\[|\]$/g, "");
    return (
      hostname === "localhost" ||
      hostname === "::1" ||
      hostname === "kubernetes.docker.internal" ||
      hostname === "host.docker.internal" ||
      /^127(?:\.\d{1,3}){3}$/.test(hostname)
    );
  } catch {
    return false;
  }
}

export function prepareKubeconfig(data: string, contextName: string): { data: string; warnings: string[]; rewroteLoopback: boolean } {
  const config = parseKubeconfig(data);
  const selectedContext = config.contexts?.find((entry) => entry.name === contextName);
  if (!selectedContext?.context?.cluster) {
    throw new Error(`The selected context "${contextName}" is not present in the kubeconfig.`);
  }

  const selectedCluster = config.clusters?.find((entry) => entry.name === selectedContext.context?.cluster);
  if (!selectedCluster?.cluster?.server) {
    throw new Error(`The selected context "${contextName}" has no API server address.`);
  }

  let rewroteLoopback = false;
  try {
    const server = new URL(selectedCluster.cluster.server);
    const hostname = server.hostname.toLowerCase().replace(/^\[|\]$/g, "");
    if (hostname === "localhost" || hostname === "::1" || /^127(?:\.\d{1,3}){3}$/.test(hostname)) {
      if (server.protocol === "https:" && !selectedCluster.cluster["tls-server-name"]) {
        selectedCluster.cluster["tls-server-name"] = hostname;
      }
      server.hostname = "host.docker.internal";
      selectedCluster.cluster.server = server.toString();
      rewroteLoopback = true;
    }
  } catch {
    throw new Error(`The selected context "${contextName}" has an invalid API server URL.`);
  }

  config["current-context"] = contextName;
  const selectedUserName = selectedContext.context.user;
  const selectedUser = config.users?.find((entry) => entry.name === selectedUserName)?.user;
  const warnings: string[] = [];
  if (selectedUser?.exec) {
    warnings.push("This context uses an exec credential plugin; install that plugin and its login prerequisites inside the K9s terminal image to authenticate.");
  }
  if (selectedUser?.tokenFile) {
    warnings.push("This context refers to a host token file; the file is not copied into the extension container.");
  }
  if (selectedUser?.["auth-provider"]) {
    warnings.push("This context uses a legacy auth-provider; confirm the provider is available in the K9s terminal image.");
  }
  if (selectedCluster.cluster["proxy-url"]) {
    warnings.push("This context uses a proxy URL; confirm the proxy is reachable from the Docker Desktop extension container.");
  }

  return { data: JSON.stringify(config), warnings, rewroteLoopback };
}

export function clampZoom(value: number): number {
  if (!Number.isFinite(value)) {
    return 1;
  }
  return Math.min(1.5, Math.max(0.7, Math.round(value * 10) / 10));
}
