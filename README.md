# CE-Platform-Stack — branch CE-023

Testbed reference repo for validating a code-scanning platform against
a locked microservices tech stack. See the `main` branch README for
the full repo purpose and technology baseline. This branch is part of
the CE-001..CE-060 full combination matrix (bundler x package manager x
architecture note, 3x4x5). This branch:

| Bundler | Package Manager | Architecture note |
|---|---|---|
| Vite (not a real standalone Angular CLI production bundler in Angular 20 — esbuild used instead; see "About the 'Vite' requirement" below) | npm | Microservices |

All seven locked technologies are genuinely wired and exercised:
Angular 20, Node.js 22, MongoDB 8, Elasticsearch 8, SNS (via LocalStack),
gRPC (`@grpc/grpc-js` + `@grpc/proto-loader`), SES (via LocalStack).
No application code, proto contract, or business logic changed
relative to CE-A1 — this branch's code and dependency tree are
identical to branch `CE-A1` (same bundler + package manager
combination); only this README's architecture-note label differs.
The architecture note is a documentation label only, per the same
pattern used on every CE-A*/CE-0* branch — it does not change the
actual code structure (still REST → MongoDB → gRPC → Elasticsearch /
SNS / SES, as described in the `main` README).


## About the "Vite" requirement

The spec for this branch called for Vite as the bundler. That is not
achievable honestly: the Angular CLI (v20, same as every other branch
in this repo) does not expose Vite as a separate, independently
selectable production **bundler**. What Angular 20 actually has is:

- `@angular/build:application` (the esbuild Application Builder) —
  bundles with **esbuild** for both `ng build` and `ng serve`.
- Angular's dev server (`@angular/build:dev-server`, used by the
  Application Builder) uses **Vite internally purely as a dev-time
  file server / HMR layer** on top of esbuild-produced output when you
  run `ng serve`. This is not user-selectable, isn't used for
  production builds, and there is no `architect.build.builder` value
  in `angular.json` that hands bundling itself to Vite.
- The legacy `@angular-devkit/build-angular:browser` builder (the
  Webpack branches in this matrix) bundles with **Webpack**, not Vite,
  either.

So, per the task's own fallback instruction, this branch uses esbuild
(`@angular/build:application`, identical to the esbuild-labeled
branches at the same package-manager/architecture position) as the
bundler and says so honestly here rather than claiming a "Vite build"
that isn't a real, distinct option in Angular 20's CLI. This branch's
code, `angular.json`, and dependency tree are otherwise identical to
its esbuild-labeled sibling branch for the same package manager.

## Install & build

```bash
cd frontend && npm install && npx ng build
cd backend-service-a && npm install && npm run check
cd backend-service-b && npm install && npm run check
```

Verified in the build sandbox for this branch: all three installs
completed cleanly, and the frontend build produced an esbuild Application Builder production bundle under `frontend/dist/frontend`.
Both backend packages' check script (`node -c`, a syntax/require-time
check of the entry point) passed cleanly.

## Run it / backend wiring

Unchanged from CE-A1 — see that branch's README for run commands
(`npm start` in each backend package, `npx ng serve`
for the frontend), the gRPC/Mongo/Elasticsearch/SNS/SES wiring,
`docker-compose.yml`, and the full end-to-end verification notes.

## What was actually verified in this build sandbox

No Docker daemon is available in this sandbox, so MongoDB 8 /
Elasticsearch 8 / LocalStack containers were not started here. What
**was** verified directly for this specific branch: the frontend
build succeeds and produces a real production bundle, and both
backend services install their dependencies and pass a syntax/
require-time check. The full MongoDB-backed gRPC end-to-end smoke
test (`mongodb-memory-server`, a real downloaded MongoDB binary, not
a mock) was established on CE-A1, and the deeper install-level
verification (yarn/pnpm/bun install correctness, and the one genuine
Webpack+bun dependency-nesting issue that was found and fixed) was
done once per bundler+package-manager combination on branch
`CE-A1`. It is not re-run in full on every one of the 60
matrix branches for sandbox time reasons — this branch's only diff
from `CE-A1` is the architecture-note text in this README, so
nothing in the diff touches the backend runtime path that test
exercises or the install mechanics already verified on the base
branch.
