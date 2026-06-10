# syntax=docker/dockerfile:1
# Multi-stage build for awsome-shop-auth-service (Maven multi-module, JDK 21)

# ---- Build stage ----
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build

# Copy the whole reactor (common/domain/application/infrastructure/interface/bootstrap)
# and build the bootstrap fat jar.
COPY . .
RUN --mount=type=cache,target=/root/.m2 \
    mvn -B -DskipTests clean package

# ---- Runtime stage ----
FROM eclipse-temurin:21-jre
WORKDIR /app

# bootstrap module produces the executable (repackaged) Spring Boot jar.
COPY --from=build /build/bootstrap/target/awsome-shop-auth-service-1.0.0-SNAPSHOT.jar app.jar

EXPOSE 8081
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
