# REA analysis and implementation notes

## Scope and evidence

- Target: the supplied extracted UI at `.tools/k9s-dd-extension-source/ui`.
- REA operation: `analyze_javascript_application`.
- Evidence ID: `ev_f67e7a2c06c254bf32e88864d148a0046e785171d40ab5542425a90ac6b15780`.
- Target SHA-256: `b7f527364ea712385c3601bc6ace37b9d88b7164cdc5b0b2bb006dc1f1f0a413`.
- Selected source paths: `package.json`, `src/App.tsx`, `src/index.tsx`, `src/k8s/K8S.tsx`, `src/helper/cli.ts`, and `src/helper/constants.ts`.
- REA parsed 5 JavaScript/TypeScript files and reported 49 findings, 492 graph nodes, 356 relationships, and 182 unknown records. The application inventory contained 11 relevant files; 5 were outside the requested source selection.

## Observed in source

1. The UI creates a Docker Desktop extension client and calls `host.cli.exec` to run the host `kubectl`.
2. The selected context is fixed to the literal `docker-desktop`; the UI requests a raw, minified kubeconfig for that context.
3. The UI posts kubeconfig text to the extension VM service at `/store-kube-config`.
4. The UI considers Kubernetes available after a `kubectl cluster-info` call and renders `http://localhost:35781` in an iframe.
5. The UI retries context setup on a five-second interval. The UI has no context picker or terminal zoom controls in the selected source.
6. The original extension README describes the terminal as a separate container and says it is preconfigured for the Docker Desktop context.
7. A read-only check of the currently installed terminal reported K9s `v0.26.3` (dated 2022-08-04). This runtime observation is separate from REA's static-source findings.

These are static-source observations, not proof that every path executes at runtime. REA did not execute the application or the Kubernetes commands.

## Improvements implemented in Jaewon K9s

- Lists host kubeconfig contexts and separates recognized local contexts from other contexts, with an override to show all contexts.
- Connects only after an explicit user action. It flattens the selected context's credentials for container use and reports host-only authentication dependencies.
- Rewrites loopback API endpoints only in the extension's copied kubeconfig, using `host.docker.internal` and retaining the original TLS server name. It never disables TLS verification or edits the host kubeconfig.
- Stores kubeconfig atomically with mode `0600`, validates the JSON shape, rejects payloads over 4 MiB, and does not log kubeconfig contents.
- Provides terminal zoom buttons, a reset control, and Ctrl/Cmd keyboard shortcuts. The K9s terminal is cross-origin in an iframe, so parent-page wheel events cannot reliably control it; toolbar controls are the supported equivalent.
- Packages K9s `v0.51.0` and ttyd `v1.7.7`, with the K9s release archive verified against its published SHA-256. The installed baseline K9s is dated 2022, so the new image avoids that older terminal dependency.
- Uses a different local host port (`35782`) from the existing extension's `35781`.

The new UI and backend are independently authored. No original source files or image assets are included. The public upstream extension repository did not expose a `LICENSE` file at analysis time; this project therefore does not redistribute its source. The K9s and ttyd binaries are separate third-party components with notices documented in `THIRD-PARTY-NOTICES.md`.

## Coverage limits

The REA source selection deliberately excluded 5 inventoried files and the analysis reported incomplete graph coverage with 182 unknown records. Static findings cannot establish Docker Desktop runtime behavior, image contents, remote network reachability, plugin availability, or authentication success. Those require building and testing the extension in Docker Desktop with the user's intended cluster.
