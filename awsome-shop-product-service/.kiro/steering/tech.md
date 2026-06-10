# Tech Stack & Build

## Runtime & Language
- Java 21
- Spring Boot 3.4.1
- Spring Cloud 2025.0.0

## Build System
- Maven (multi-module POM)
- Lombok 1.18.36 (annotation processor)
- JaCoCo for code coverage

## ORM & Database
- MyBatis-Plus 3.5.7 (Spring Boot 3 starter)
- MySQL 8.4 with Druid connection pool
- Flyway for schema migrations (scripts in `bootstrap/src/main/resources/db/migration/`)
- Migration naming: `V{number}__{description}.sql`

## Caching
- Spring Data Redis with Lettuce client

## Messaging
- AWS SQS (SDK 2.20.0)

## Security
- JJWT 0.12.6 (JWT creation/validation)
- Authentication handled at gateway level

## API Documentation
- SpringDoc OpenAPI (Swagger UI at `/swagger-ui.html`)

## Observability
- Micrometer Tracing 1.3.5
- Logstash Logback Encoder 7.4
- Actuator endpoints: health, info, prometheus

## Common Commands

```bash
# Full build (skip tests)
mvn clean install -DskipTests

# Run tests
mvn test

# Start the application (local profile)
mvn spring-boot:run -pl bootstrap

# Start with a specific profile
mvn spring-boot:run -pl bootstrap -Dspring-boot.run.profiles=dev

# Build a single module
mvn clean install -pl domain/domain-model -am
```

## Profiles
- `local` (default) — local development
- `dev` — development environment
- `docker` — Docker deployment
- `staging` — staging environment
- `prod` — production
- `test` — test environment
