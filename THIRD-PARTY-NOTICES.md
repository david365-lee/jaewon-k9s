# Third-party notices

Jaewon K9s includes these independently maintained components in its extension image:

- [K9s v0.51.0](https://github.com/derailed/k9s), Apache License 2.0. The release archive's `LICENSE` is copied to `/licenses/k9s-LICENSE` in the image. The downloaded amd64 and arm64 archives are checked against their published SHA-256 digests in the Dockerfile.
- [ttyd v1.7.7](https://github.com/tsl0922/ttyd), MIT License. The license is included at `third-party/ttyd-LICENSE` and copied to `/licenses/ttyd-LICENSE` in the image.
- [kubectl v1.36.1](https://kubernetes.io/docs/reference/kubectl/), Apache License 2.0. The matching Kubernetes license is copied to `/licenses/kubectl-LICENSE` in the image. Platform-specific kubectl binaries are downloaded during image build.
- React, Vite, Vitest, TypeScript, and Docker Extension API client dependencies are listed with their exact versions in `ui/package.json` and `ui/package-lock.json`; their package licenses are distributed with the npm packages used to build the UI.

Jaewon K9s source is MIT-licensed separately. The trademarks and copyrights of these projects remain with their respective maintainers.
