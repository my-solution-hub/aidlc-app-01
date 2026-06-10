# Project Structure

DDD + Hexagonal Architecture organized as a Maven multi-module project. Each layer is split into API (interface) and impl (implementation) sub-modules to enforce dependency inversion.

## Module Layout

```
├── common/                              # Shared utilities (exceptions, error codes, DTOs, annotations)
├── domain/
│   ├── domain-model/                    # Domain entities (pure POJOs, no framework deps)
│   ├── domain-api/                      # Domain service interfaces
│   ├── domain-impl/                     # Domain service implementations (@Service)
│   ├── repository-api/                  # Repository port interfaces
│   ├── cache-api/                       # Cache port interfaces
│   ├── mq-api/                          # Message queue port interfaces
│   └── security-api/                    # Security port interfaces
├── infrastructure/
│   ├── repository/
│   │   └── mysql-impl/                  # MySQL adapter (@Repository) — PO, Mapper, Impl
│   ├── cache/
│   │   └── redis-impl/                  # Redis adapter
│   ├── mq/
│   │   └── sqs-impl/                    # SQS adapter
│   └── security/
│       └── jwt-impl/                    # JWT adapter
├── application/
│   ├── application-api/                 # Application service interfaces + DTOs + request objects
│   └── application-impl/               # Application service implementations (@Service)
├── interface/
│   ├── interface-http/                  # REST controllers (@RestController), exception handlers, response wrappers (包名使用 facade)
│   └── interface-consumer/              # SQS message consumers (包名使用 facade)
└── bootstrap/                           # Spring Boot entry point, configs, application.yml, Flyway migrations
```

## Dependency Rules (strict)
- `interface` → `application-api` only (never application-impl, never common directly)
- `application-impl` → `domain-api` only (never repository or infrastructure)
- `domain-impl` → port interfaces (`repository-api`, `cache-api`, `mq-api`, `security-api`)
- `infrastructure/*-impl` → implements port interfaces
- `bootstrap` aggregates all impl modules for Spring DI wiring
- **禁止修改 pom.xml**：任何模块的 pom.xml 文件（依赖声明、模块结构、groupId、artifactId 等）未经确认不得修改。新增依赖或调整模块关系必须先说明理由并获得确认

## Package Conventions
Base package: `com.awsome.shop.product`

| Layer | Package pattern |
|---|---|
| Domain model | `domain.model.{aggregate}` |
| Domain service API | `domain.service.{aggregate}` |
| Domain service impl | `domain.impl.service.{aggregate}` |
| Repository port | `repository.{aggregate}` |
| Repository MySQL impl | `repository.mysql.impl.{aggregate}` |
| Persistence objects | `repository.mysql.po.{aggregate}` |
| MyBatis mappers | `repository.mysql.mapper.{aggregate}` |
| Application service API | `application.api.service.{aggregate}` |
| Application DTOs | `application.api.dto.{aggregate}` |
| Application request DTOs | `application.api.dto.{aggregate}.request` |
| Application service impl | `application.impl.service.{aggregate}` |
| HTTP controllers | `facade.http.controller` |
| HTTP exception handlers | `facade.http.exception` |
| HTTP response wrappers | `facade.http.response` |

## Key Patterns per Layer

### Domain Model (`domain-model`)
- Pure Java POJOs with `@Data` (Lombok), no Spring annotations
- Entity classes named `{Name}Entity`
- Business methods live on the entity (e.g. `updateInfo()`)

### Domain Service (`domain-api` / `domain-impl`)
- Interface in `domain-api`, impl in `domain-impl` with `@Service`
- Constructor injection via `@RequiredArgsConstructor`
- Depends only on port interfaces (repository-api, cache-api, etc.)
- Throws `BusinessException` with `ErrorCode` enums for domain violations

### Repository (`repository-api` / `mysql-impl`)
- Port interface in `domain/repository-api` — returns domain entities
- MySQL adapter in `infrastructure/repository/mysql-impl` with `@Repository`
- Persistence objects (PO) named `{Name}PO` with `@TableName`, `@TableId(type = IdType.AUTO)`
- Standard audit fields on every PO: `createdAt`, `updatedAt`, `createdBy`, `updatedBy` (auto-filled)
- Soft delete via `@TableLogic` on `deleted` field
- Optimistic locking via `@Version` on `version` field
- MyBatis-Plus `BaseMapper<PO>` for mappers, annotated with `@Mapper`
- Manual `toEntity()` / `toPO()` conversion methods in the repository impl

### Application Service (`application-api` / `application-impl`)
- Interface in `application-api`, impl in `application-impl` with `@Service`
- Request DTOs in `application.api.dto.{aggregate}.request` — use Jakarta Validation (`@NotBlank`, `@Size`, etc.)
- Response DTOs named `{Name}DTO` with `@Data`
- Manual `toDTO()` conversion in the service impl
- Never depends on repository directly — only calls domain service

### HTTP Controller (`interface-http`)
- `@RestController` + `@RequestMapping("/api/v1")` + `@RequiredArgsConstructor`
- All endpoints are POST (including reads like get/list)
- URL pattern: `/api/v1/{scope}/{module}/{action}`，版本号之后固定三段
  - `{scope}`: `public`（经 API Gateway 对前端暴露）/ `private`（微服务间内部调用）
  - `{module}`: 业务模块名（如 `product`、`test`）
  - `{action}`: 具体操作（`get`、`list`、`create`、`update`、`delete`）
- 类上 `@RequestMapping("/api/v1")`，方法上 `@PostMapping("/{scope}/{module}/{action}")`
- Request bodies validated with `@Valid`
- Returns `Result<T>` wrapper (from `common.result.Result`)
- Swagger annotations: `@Tag` on class, `@Operation` on methods

### Error Handling
- Exception hierarchy: `BaseException` → `BusinessException` / `ParameterException` / `SystemException`
- Error codes implement `ErrorCode` interface, grouped in enums per domain (e.g. `SampleErrorCode`)
- Error code format: `{CATEGORY}_{SEQ}` (e.g. `NOT_FOUND_001`, `AUTH_001`, `CONFLICT_001`)
- `GlobalExceptionHandler` maps error code prefix to HTTP status automatically

### Database Migrations
- Flyway scripts in `bootstrap/src/main/resources/db/migration/`
- Tables use `utf8mb4` charset, `InnoDB` engine
- Every table includes: `id` (BIGINT AUTO_INCREMENT), `created_at`, `updated_at`, `created_by`, `updated_by`, `deleted`, `version`
