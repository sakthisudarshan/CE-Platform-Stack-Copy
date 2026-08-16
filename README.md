# CE-Platform-Stack

CE-Platform-Stack is a testbed reference repository used to validate a
code-scanning platform (Testable) against a specific microservices
technology stack. It is not a production product — the business domain
(a generic "record" entity) is intentionally trivial. What matters is
that every listed technology is genuinely present and functional: real
dependencies, real working code that actually runs end to end, not
stubs that merely claim to use a technology.

## Locked technology baseline

The same seven technologies are wired into every branch, unchanged:

- **Frontend**: Angular 20
- **Backend runtime**: Node.js 22
- **Database**: MongoDB 8
- **Search**: Elasticsearch 8
- **Queue**: SNS (`@aws-sdk/client-sns`, pointed at LocalStack — no real AWS credentials required to build or run)
- **Inter-service communication**: gRPC (`@grpc/grpc-js` + `@grpc/proto-loader`)
- **Email**: SES (`@aws-sdk/client-ses`, same LocalStack-mockable approach as SNS)

## Repository shape

Identical on every branch:

```
/frontend                Angular 20 app — pages/components that call the backend over HTTP/REST
/backend-service-a       Node.js 22 — gRPC server, owns MongoDB 8 (CRUD via mongoose)
/backend-service-b       Node.js 22 — gRPC client of service-a, owns Elasticsearch 8, SNS producer, SES sender
/shared/proto            .proto contract defining the gRPC service between service-a and service-b
docker-compose.yml       Mongo 8 + Elasticsearch 8 + LocalStack (SNS/SES/SQS)
```

**Flow**: the Angular frontend creates a "record" via service-a's REST
endpoint → service-a writes it to MongoDB and pushes it down a gRPC
server-streaming call (`WatchRecords`) that service-b is subscribed to
→ service-b indexes the record into Elasticsearch, publishes an SNS
`record.created` event, and sends an SES notification email. gRPC also
exposes a unary `GetRecord` call, used by service-b for point lookups.

## Branches

Every branch below ships the exact same code and functionality. They
differ **only** in bundler, package manager, and a target-architecture
note in that branch's own README.

| Branch | Bundler | Package Manager | Architecture note |
|---|---|---|---|
| CE-A1 | esbuild (Angular's default Application Builder, `@angular/build`) | npm | Microservices |
| CE-A2 | esbuild | yarn (Berry, `yarn set version berry`) | Microservices |
| CE-A3 | esbuild | pnpm | Event-driven |
| CE-A4 | Vite (not a real standalone Angular CLI builder — esbuild used instead; see that branch's README) | bun | Microservices |
| CE-A5 | Webpack (`@angular-devkit/build-angular:browser`, the legacy builder) | npm | Microservices |
| CE-A6 | Webpack | pnpm | Distributed System |

`main` holds only this README. All runnable code lives on the six
`CE-A*` branches — check out the branch you need and read its README
for exact run commands and any caveats specific to that combination.
