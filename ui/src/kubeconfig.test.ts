import { describe, expect, it } from "vitest";
import { clampZoom, isLocalContext, listContexts, prepareKubeconfig } from "./kubeconfig";

describe("Kubernetes context selection", () => {
  it("classifies Docker Desktop, loopback, and remote contexts", () => {
    expect(isLocalContext("docker-desktop", "https://kubernetes.docker.internal:6443")).toBe(true);
    expect(isLocalContext("home-kind", "https://127.0.0.1:53421")).toBe(true);
    expect(isLocalContext("prod", "https://api.example.net:6443")).toBe(false);
  });

  it("lists contexts with their cluster endpoint and local status", () => {
    const contexts = listContexts({
      clusters: [{ name: "local-cluster", cluster: { server: "https://localhost:6443" } }],
      contexts: [{ name: "kind-dev", context: { cluster: "local-cluster" } }],
    });
    expect(contexts).toEqual([
      { name: "kind-dev", cluster: "local-cluster", server: "https://localhost:6443", local: true },
    ]);
  });
});

describe("kubeconfig preparation", () => {
  it("rewrites loopback endpoints without disabling TLS validation", () => {
    const input = JSON.stringify({
      apiVersion: "v1",
      kind: "Config",
      "current-context": "kind-dev",
      clusters: [{ name: "local", cluster: { server: "https://127.0.0.1:53421" } }],
      contexts: [{ name: "kind-dev", context: { cluster: "local", user: "dev" } }],
      users: [{ name: "dev", user: { token: "secret" } }],
    });

    const result = prepareKubeconfig(input, "kind-dev");
    const output = JSON.parse(result.data);
    expect(output.clusters[0].cluster.server).toBe("https://host.docker.internal:53421/");
    expect(output.clusters[0].cluster["tls-server-name"]).toBe("127.0.0.1");
    expect(result.rewroteLoopback).toBe(true);
    expect(result.warnings).toEqual([]);
  });

  it("warns when selected credentials depend on a host-only plugin", () => {
    const input = JSON.stringify({
      apiVersion: "v1",
      kind: "Config",
      "current-context": "prod",
      clusters: [{ name: "remote", cluster: { server: "https://api.example.net" } }],
      contexts: [{ name: "prod", context: { cluster: "remote", user: "cloud" } }],
      users: [{ name: "cloud", user: { exec: { command: "cloud-login" } } }],
    });

    expect(prepareKubeconfig(input, "prod").warnings[0]).toContain("exec credential plugin");
  });
});

describe("terminal zoom", () => {
  it("rounds and clamps zoom between the supported limits", () => {
    expect(clampZoom(0.66)).toBe(0.7);
    expect(clampZoom(1.04)).toBe(1);
    expect(clampZoom(1.54)).toBe(1.5);
    expect(clampZoom(Number.NaN)).toBe(1);
  });
});
