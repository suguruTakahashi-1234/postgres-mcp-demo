# PostgreSQL RESTful API Demo

## Project Overview

A minimalist RESTful API that demonstrates PostgreSQL capabilities with the following tech stack:

- **Language:** TypeScript
- **Framework:** Hono
- **Package Manager:** pnpm
- **Database:** PostgreSQL
- **ORM/Migration:** Prisma
- **API Documentation:** OpenAPI (Swagger UI)
- **Containerization:** Docker / Docker Compose
- **Infrastructure:** Terraform
- **Deployment:** Fly.io
- **CI/CD:** GitHub Actions

## Getting Started

### Prerequisites

- Node.js (v18+)
- pnpm
- Docker and Docker Compose
- PostgreSQL (or use the Docker container)

### Development Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start the development environment:
   ```bash
   pnpm dev
   ```

3. For database with Docker:
   ```bash
   docker-compose up -d
   ```

### API Documentation

Swagger UI is available at `/docs` when the server is running.

## Deployment

This project is configured for deployment to Fly.io using GitHub Actions.
