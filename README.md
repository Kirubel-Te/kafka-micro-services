# Microservices E-Commerce Demo

This project is a small event-driven microservice architecture built with Node.js, TypeScript, Kafka, and a Next.js storefront. It demonstrates how separate services can communicate asynchronously through Kafka topics rather than direct HTTP calls between every service.

## Project Overview

The system simulates a basic e-commerce checkout flow:

1. A user opens the storefront and submits a cart.
2. The payment service receives the checkout request and publishes a `payment-successful` event.
3. The order service listens for that event, creates a mock order, and publishes an `order-successful` event.
4. The email service listens for order events and emits a mock `email-successful` notification.
5. The analytics service subscribes to all three events and logs relevant metrics.

This setup is intentionally simple and uses in-memory mock data for each service, making it ideal for learning how asynchronous messaging works in a distributed system.

## Architecture

```text
Client (Next.js)
   |
   v
Payment Service (Express + Kafka producer)
   |
   +------> payment-successful ----------------------+
                                                     |
                                                     v
                                             Order Service
                                             (Kafka consumer/producer)
                                                     |
                                                     +------> order-successful ----+
                                                                                   |
                                                                                   v
                                                                              Email Service
                                                                              (Kafka consumer/producer)
                                                                                   |
                                                                                   +------> email-successful
                                                                                   |
                                                                                   v
                                                                            Analytics Service
                                                                            (Kafka consumer)
```

## Services

### 1. Client
- Frontend application built with Next.js
- Displays a cart and allows checkout
- Sends a POST request to the payment service
- Runs on port `3000`

### 2. Payment Service
- Express API service
- Exposes endpoint: `POST /payment-service`
- Produces the Kafka event: `payment-successful`
- Runs on port `8003`

### 3. Order Service
- Kafka consumer for `payment-successful`
- Creates a mock order ID
- Produces `order-successful`

### 4. Email Service
- Kafka consumer for `order-successful`
- Simulates sending an email
- Produces `email-successful`

### 5. Analytics Service
- Kafka consumer subscribed to:
  - `payment-successful`
  - `order-successful`
  - `email-successful`
- Logs totals and the lifecycle of the purchase process

### 6. Kafka Cluster
- A 3-node Kafka broker setup with Kafka UI
- Docker Compose config is located in `kafka/docker-compose.yml`
- Kafka UI is exposed on `http://localhost:8080`

## Tech Stack

- Node.js
- TypeScript
- Express
- Next.js
- KafkaJS
- Docker Compose
- pnpm

## Folder Structure

```text
services/
├── README.md
├── analytic-service/
│   ├── package.json
│   ├── src/
│   │   └── index.ts
├── client/
│   ├── package.json
│   ├── public/
│   └── src/
├── email-service/
│   ├── package.json
│   └── src/
├── kafka/
│   ├── admin.ts
│   ├── docker-compose.yml
│   └── package.json
├── order-service/
│   ├── package.json
│   └── src/
├── payment-service/
│   ├── package.json
│   └── src/
└── ...
```

## Prerequisites

Before starting the project, make sure you have installed:

- Node.js (18+ recommended)
- pnpm
- Docker Desktop or Docker Engine

## Setup

From the workspace root:

```bash
cd services
```

Install dependencies for each service:

```bash
cd kafka && pnpm install
cd ../payment-service && pnpm install
cd ../order-service && pnpm install
cd ../email-service && pnpm install
cd ../analytic-service && pnpm install
cd ../client && pnpm install
```

## Start Kafka

Start the Kafka and Kafka UI containers:

```bash
cd services/kafka
docker compose up -d
```

You can then open Kafka UI here:

```text
http://localhost:8080
```

## Start the Services

Run each service in a separate terminal:

```bash
cd services/payment-service
pnpm dev
```

```bash
cd services/order-service
pnpm dev
```

```bash
cd services/email-service
pnpm dev
```

```bash
cd services/analytic-service
pnpm dev
```

Start the frontend:

```bash
cd services/client
pnpm dev
```

The client app should be available at:

```text
http://localhost:3000
```

## Important Notes

- The project currently uses mock order IDs and mock email IDs.
- There is no real database or persistent storage in this demo.
- Kafka topics are created via the Kafka admin script in `kafka/admin.ts`.
- The payment endpoint currently posts directly to the broker and is a simplified example for demonstration purposes.

## Event Flow Example

When the checkout button is pressed:

- frontend sends cart data to `http://localhost:8003/payment-service`
- `payment-service` emits:

```json
{
  "userId": "123",
  "cart": [
    { "id": 1, "name": "Nike Air Max", "price": 129.9 },
    { "id": 2, "name": "Adidas Superstar Cap", "price": 29.9 }
  ]
}
```

Then the services react asynchronously:

- order service consumes `payment-successful`
- email service consumes `order-successful`
- analytics service consumes all messages and logs them

## Default Topics

```text
payment-successful
order-successful
email-successful
```

## Development Tips

- Use Kafka UI to inspect messages flowing between services.
- Watch server logs from each service to understand the event chain.
- If Kafka is not ready yet, restart the producer/consumer services after the Docker cluster is up.

## Summary

This project is a practical introduction to event-driven microservices with Kafka. It demonstrates how autonomous services can communicate through events, keep their responsibilities separate, and process actions asynchronously without tightly coupling each service together.

---

This README is written for onboarding and local development. It is intentionally simple and focused on the actual workflow implemented in the codebase.
