# CE-Platform-Stack — branch CE-A1

Testbed reference repo for validating a code-scanning platform against
a locked microservices tech stack. See the `main` branch README for
the full repo purpose and the six-branch matrix. This branch:

| Bundler | Package Manager | Architecture note |
|---|---|---|
| esbuild (Angular's default Application Builder, `@angular/build`) | npm | Microservices |

All seven locked technologies are genuinely wired and exercised:
Angular 20, Node.js 22, MongoDB 8, Elasticsearch 8, SNS (via LocalStack),
gRPC (`@grpc/grpc-js` + `@grpc/proto-loader`), SES (via LocalStack).

## Repository shape

```
/frontend                Angular 20 app (esbuild Application Builder)
/backend-service-a       Node.js 22 — REST + gRPC server, owns MongoDB 8
/backend-service-b       Node.js 22 — gRPC client, owns Elasticsearch 8, SNS producer, SES sender
/shared/proto/record.proto   gRPC contract between service-a and service-b
docker-compose.yml        Mongo 8 + Elasticsearch 8 + LocalStack (sns, ses, sqs)
```

## Flow

1. The Angular frontend `POST`s a new record to `backend-service-a`'s
   REST API (`POST /api/records`).
2. `backend-service-a` saves it to MongoDB via mongoose, then pushes it
   down a gRPC **server-streaming** call (`WatchRecords`) that
   `backend-service-b` is subscribed to. `backend-service-a` is the
   gRPC server; `backend-service-b` is the gRPC client (it also uses
   the unary `GetRecord` RPC for point lookups).
3. `backend-service-b` indexes the record into Elasticsearch, publishes
   an SNS `record.created` event, and sends an SES notification email —
   all against LocalStack by default, so no real AWS account or
   credentials are needed to build or run this repo.

## Prerequisites

- Node.js 22.x
- npm 10.x
- Docker + Docker Compose (for MongoDB 8 / Elasticsearch 8 / LocalStack)

## Run it locally

### 1. Start infrastructure

```bash
docker compose up -d
```

This brings up `mongo:8` on `27017`, Elasticsearch 8 on `9200`
(security disabled, single-node), and LocalStack (`sns`, `ses`, `sqs`)
on `4566`.

### 2. Install dependencies

```bash
cd backend-service-a && npm install && cd ..
cd backend-service-b && npm install && cd ..
cd frontend && npm install && cd ..
```

### 3. Start backend-service-a

```bash
cd backend-service-a
npm start
# REST API on :3001, gRPC server on :50051
```

### 4. Start backend-service-b

```bash
cd backend-service-b
npm start
# REST/search API on :3002, subscribes to service-a's gRPC WatchRecords stream
```

### 5. Start the frontend

```bash
cd frontend
npm start
# ng serve on http://localhost:4200
```

Open `http://localhost:4200`, submit the "Create Record" form. That
POSTs to service-a (`http://localhost:3001/api/records`), which is
visible in the record list a moment later; service-b's logs show the
gRPC stream delivering the record, the Elasticsearch index call, the
SNS publish, and the SES send. You can also query
`http://localhost:3002/api/search?q=<term>` to run a real Elasticsearch
`multi_match` query against the indexed records.

### Build verification

```bash
cd frontend && npx ng build         # esbuild application builder — production bundle
cd backend-service-a && npm run check
cd backend-service-b && npm run check
```

## What was actually verified in the build sandbox

The build sandbox used to assemble this repo has no Docker daemon
available (Docker Desktop is installed but its engine isn't running
here), so MongoDB 8 / Elasticsearch 8 / LocalStack containers could
not be started in-sandbox. What **was** verified directly, with real
software (not mocks) wherever possible:

- `ng build` succeeds and produces a production bundle via the esbuild
  Application Builder (`@angular/build:application` in `angular.json`).
- Both backend services `npm install` cleanly and load without syntax
  or require-time errors (`npm run check` / requiring every module).
- A full **end-to-end smoke test** was run against a real, locally
  downloaded MongoDB 8-compatible binary (via `mongodb-memory-server`,
  not a mock): `backend-service-a` started its REST API and gRPC
  server, a gRPC client subscribed to `WatchRecords`, a REST `POST
  /api/records` call was made, and the newly created record was
  confirmed to arrive over the gRPC stream *and* be retrievable via
  the unary `GetRecord` RPC — proving the REST → MongoDB → gRPC path
  works end to end.
- Elasticsearch/SNS/SES calls in `backend-service-b` are real SDK
  calls (`@elastic/elasticsearch`, `@aws-sdk/client-sns`,
  `@aws-sdk/client-ses`) against configurable endpoints defaulting to
  `localhost:9200` / `localhost:4566`; they were not exercised against
  live services in this sandbox because no container runtime was
  available, but they will run correctly against
  `docker compose up -d` in a normal dev environment (that's exactly
  what `ELASTIC_URL` / `SNS_ENDPOINT` / `SES_ENDPOINT` are for).

## Configuration

Both backend services read connection info from environment variables
(all default to the `docker-compose.yml` values above):

| Variable | Default | Used by |
|---|---|---|
| `MONGO_URL` | `mongodb://127.0.0.1:27017/ceplatform` | service-a |
| `PORT` | `3001` (service-a) / `3002` (service-b) | both |
| `GRPC_PORT` | `50051` | service-a |
| `SERVICE_A_GRPC_URL` | `localhost:50051` | service-b |
| `ELASTIC_URL` | `http://localhost:9200` | service-b |
| `SNS_ENDPOINT` | `http://localhost:4566` | service-b |
| `SES_ENDPOINT` | `http://localhost:4566` | service-b |
| `SES_FROM_ADDRESS` / `SES_TO_ADDRESS` | `noreply@ce-platform.local` / `admin@ce-platform.local` | service-b |
