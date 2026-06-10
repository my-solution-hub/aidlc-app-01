# Product Overview

Awsome Shop Product Service — an e-commerce product microservice built with Domain-Driven Design (DDD) and Hexagonal Architecture.

## Purpose
Manages product-related domain logic for the Awsome Shop platform. Exposes HTTP APIs and consumes messages from SQS queues.

## Key Characteristics
- Multi-tenant architecture with gateway-injected tenant/user context
- POST-only API design (all endpoints use POST, including reads)
- Unified JSON response envelope: `{ code, message, data }`
- Soft-delete and optimistic locking on all persistent entities
- Flyway-managed database migrations
- JWT-based security handled at the gateway level
- Chinese-language comments and error messages throughout the codebase

## Base Package
`com.awsome.shop.product`
