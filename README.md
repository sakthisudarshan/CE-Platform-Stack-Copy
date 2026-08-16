# CE-Platform-Stack — branch CE-A5

Testbed reference repo for validating a code-scanning platform against
a locked microservices tech stack. See the `main` branch README for
the full repo purpose and the six-branch matrix. This branch:

| Bundler | Package Manager | Architecture note |
|---|---|---|
| Webpack (`@angular-devkit/build-angular:browser`, the legacy builder) | npm | Microservices |

Only the bundler changed relative to CE-A1: `frontend/angular.json`
now points `architect.build` / `architect.serve` /
`architect.extract-i18n` at `@angular-devkit/build-angular`'s legacy
Webpack-based builders (`browser`, `dev-server`, `extract-i18n`)
instead of the esbuild `@angular/build:application` builder, and
`@angular-devkit/build-angular` was added as a devDependency. No
backend code, proto contract, or business logic changed — everything
in `/backend-service-a`, `/backend-service-b`, and `/shared/proto` is
identical to CE-A1. See CE-A1's README for the full technology list,
run instructions, and configuration reference; only the frontend build
step differs here.

## Frontend build (Webpack)

```bash
cd frontend
npm install
npx ng build          # @angular-devkit/build-angular:browser (Webpack)
npx ng serve           # dev server on http://localhost:4200
```

Verified in the build sandbox: `npx ng build` completes successfully
and produces a hashed Webpack bundle (`main.<hash>.js`,
`polyfills.<hash>.js`, `runtime.<hash>.js`, `styles.<hash>.css`) under
`frontend/dist/frontend`.

## Backend services

Unchanged from CE-A1 — see that branch's README for run commands,
the gRPC/Mongo/Elasticsearch/SNS/SES wiring, `docker-compose.yml`, and
the honest note about which parts were verified against real infra in
the build sandbox (no Docker daemon was available there, so
Elasticsearch/SNS/SES were verified as real, correctly-wired SDK calls
rather than exercised against live containers; the REST → MongoDB →
gRPC path was verified fully end-to-end against a real MongoDB binary).
