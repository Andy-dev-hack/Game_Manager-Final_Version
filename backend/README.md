# 🎮 Game Manager Backend

> **Professional RESTful API for video game catalog and user collection management.** > _Robust security, scalable architecture, and comprehensive documentation._

![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-v5+-blue.svg?style=flat-square)

![Express](https://img.shields.io/badge/Express-v5.0-lightgrey.svg?style=flat-square)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green.svg?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)

---

## 📖 Comprehensive Documentation

This project is not just code; it's an educational resource. We have prepared three detailed guides:

| Guide                                                                 | Description                                         |
| :-------------------------------------------------------------------- | :-------------------------------------------------- |
| **🏗️ [Architecture](docs/principal/architecture.md)**                 | Understand the MVC design, data flow, and security. |
| **📘 [Master Manual](docs/principal/tutorial.md)**                    | Learn how to build this backend file by file.       |
| **🧪 [Testing Strategy](docs/principal/tests-guide.md)**              | VDD Guide, Unit & Integration Tests.                |
| **🎓 [Academic Explanation](docs/principal/explicacion_proyecto.md)** | Executive Engineering Summary.                      |

---

## ✨ Key Features

### 🔐 Enterprise-Grade Security

- **State-of-the-Art Security**: Implementation of **Helmet** (Secure HTTP Headers) and global **Rate Limiting** (DDOS protection).
- **JWT Access Tokens**: Short duration (15 min) to minimize risks.
- **Refresh Tokens with Rotation**: Automatic token theft detection and cascading revocation.
- **RBAC (Role-Based Access Control)**: Strict middleware to differentiate between `Admin` and `User`.
- **Cascade Delete**: Intelligent data deletion. If a user is deleted, their sessions, orders, and library are wiped.

### 🛠️ Software Engineering

- **TypeScript**: Typed, safe, and maintainable code.
- **Layered Architecture**: Clear separation between Routes, Controllers, Services, and Models.
- **Strict Validation**: **Zod** ensures no corrupt data ever enters ("Fail-Fast").
- **Centralized Error Handling**: Global middleware to capture and format exceptions.
- **Fail-Fast**: Strict environment variable validation at startup.
- **Professional Logging**: Structured logs with Winston for maximum observability.
- **Decoupling**: Infrastructure-agnostic services (e.g., `FileService`).

### 🤖 Advanced Features

- **Hybrid Catalog**: Supports games imported from RAWG/Steam and manually created games with image uploads.
- **Personal Collection**: State management (Playing, Completed), scores, and reviews.
- **Pagination and Filters**: Advanced search by genre, platform, and status.
- **Mock Payments**: Complete checkout system with order history and **Email Notifications**.
- **External Integrations**: Automatic synchronization with **RAWG** (Metadata) and **Steam** (Prices).
- **Cron Jobs**: Automatic Steam price updates every night.
- **Bulk Management**: Admin endpoint to list and manage all system users.
- **Automation & VDD**: Integrity scripts (`npm run validate`) and seeding (`npm run seed`) for superior DX.
- **Living Documentation**: Automatically generated Swagger UI (`/api-docs`).
- **Compression**: Gzip enabled for 70% lighter responses.

---

## 🚀 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB (Atlas or Local) + Mongoose ODM
- **Testing**: Jest + Supertest
- **Documentation**: Swagger (OpenAPI 3.0)
- **Utilities**: `bcrypt`, `multer`, `dotenv`, `cors`, `helmet`, `node-cron`, `nodemailer`, `zod`

---

---

## ⚡️ Quick Start

### 1. Prerequisites

- Node.js v18+
- MongoDB URI (Local or Atlas)

### 2. Installation

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root (you can copy `.env.example` if it exists):

```env
PORT=3500
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/db
JWT_SECRET=your_super_secure_secret_key
RAWG_API_KEY=your_rawg_api_key
NODE_ENV=development
```

### 4. Execution

| Command         | Description                                              |
| :-------------- | :------------------------------------------------------- |
| `npm run dev`   | Starts the server in development mode (with hot-reload). |
| `npm run build` | Compiles TypeScript code to JavaScript (`dist/`).        |
| `npm start`     | Starts the compiled server (Production).                 |
| `npm test`      | Runs the full test suite.                                |
| `npm run seed`  | Populates the database with initial games.               |

---

## 📂 Project Structure

```text
src/
├── config/         # DB, Swagger, and Env Configuration
├── controllers/    # HTTP Request Handling (Req -> Res)
├── dtos/           # Input Type Definitions (Data Transfer Objects)
├── middleware/     # Auth, Roles, Uploads, Validations, Errors
├── models/         # Database Schemas (Mongoose)
├── routes/         # Endpoint Definitions
├── services/       # Pure Business Logic (incl. Cron and Payments)
├── scripts/        # Automation Tasks (Import, Seed)
├── utils/          # Helpers (Logger, Password hashing)
├── validators/     # Validation Rules (Zod)
└── server.ts       # Application Entry Point
```

---

## 🧪 API & Testing

### Swagger UI

Once the server is started, visit:
👉 **[http://localhost:3500/api-docs](http://localhost:3500/api-docs)**

### Automated Tests

The project includes critical integration test coverage.

```bash
npm test
```

> The suite includes **85+ tests** covering authentication, payments, catalog, and collections, with **Global Setup** for efficient connection management.

---

## 👤 Author

Developed with ❤️ by **AndyDev**.

---

# game_manager_api

## 📊 Architecture Diagram

```mermaid
flowchart TD
    %% External Nodes
    Client([👤 Client / Frontend])
    DB[(🗄️ MongoDB)]
    ExternalAPIs[☁️ External APIs<br/>RAWG / Steam]
    FileSystem[💾 File System<br/>uploads/]

    %% Backend Layers
    Routes["📍 Routes<br/>/api/games, /public, /orders"]
    Docs["📘 Swagger UI<br/>/api-docs"]

    %% Middlewares (Pipeline)
    AuthMW["🔑 Auth Middleware"]
    RoleMW["👮 Role Middleware"]
    UploadMW["📤 Upload Middleware<br/>(Multer)"]
    ValidMW["✅ Validator Middleware"]
    ErrorMW["🚨 Error Middleware"]

    %% Main Components
    Controller["🤵 Controller<br/>(Auth/Game/Collection/Payment/User/Order)"]
    DTO["📦 DTOs<br/>(Type Validation)"]

    %% Core Services
    AuthService["🔐 Auth Service<br/>(Login/Register/Tokens)"]
    GameService["🎮 Game Service<br/>(Catalog CRUD)"]
    CollectionService["📚 Collection Service<br/>(UserGame CRUD)"]
    PaymentService["💳 Payment Service<br/>(Mock Checkout)"]

    %% Integration Services
    IntegrationService["🔌 Integration Services<br/>(RAWG/Steam + Cache)"]
    AggregatorService["🎯 Aggregator Service<br/>(Combines RAWG+Steam)"]

    %% Auxiliary Services
    FileService["📁 File Service<br/>(File Management)"]
    CronService["⏱️ Cron Service<br/>(Price Updates)"]
    MailService["📧 Mail Service<br/>(Nodemailer)"]

    %% Models (Database)
    UserModel["👤 User Model"]
    GameModel["🎮 Game Model"]
    UserGameModel["📚 UserGame Model<br/>(Collection)"]
    OrderModel["🧾 Order Model"]
    RefreshTokenModel["🔑 RefreshToken Model"]

    %% Main Flow
    Client -->|1. Request| Routes
    Client -.->|View Docs| Docs

    %% Branching: Public vs Private
    Routes -->|Private Route| AuthMW
    Routes -->|Public Route<br/>/api/public| Controller

    %% Middleware Pipeline (Sequential Order)
    AuthMW --> RoleMW
    RoleMW --> UploadMW
    UploadMW --> ValidMW
    ValidMW --> Controller

    %% DTO Validations
    ValidMW -.->|Validates against| DTO
    Controller -.->|Uses| DTO

    %% Controller calls Services
    Controller -->|2. Calls| AuthService
    Controller -->|2. Calls| GameService
    Controller -->|2. Calls| CollectionService
    Controller -->|2. Calls| PaymentService

    %% Core Services interact with Models
    AuthService -->|CRUD| UserModel
    AuthService -->|Manages| RefreshTokenModel
    AuthService -.->|Cascade Delete| UserGameModel
    AuthService -.->|Cascade Delete| OrderModel

    GameService -->|CRUD| GameModel
    GameService -.->|Cascade Delete| UserGameModel

    CollectionService -->|CRUD| UserGameModel
    CollectionService -->|Reads| GameModel

    PaymentService -->|Creates| OrderModel
    PaymentService -->|Updates| UserGameModel
    PaymentService -->|Notifies| MailService

    %% Services use FileService
    AuthService -.->|Deletes images| FileService
    FileService -->|Operations| FileSystem

    %% Integration Services
    Controller -->|2. Calls| AggregatorService
    AggregatorService -->|Queries| IntegrationService
    IntegrationService -->|API Calls| ExternalAPIs
    AggregatorService -->|Saves| GameModel

    %% Cron Service (Automation)
    CronService -.->|Updates Prices<br/>Daily 03:00| GameModel

    %% Models persist in DB
    UserModel <-->|5. DB Ops| DB
    GameModel <-->|5. DB Ops| DB
    UserGameModel <-->|5. DB Ops| DB
    OrderModel <-->|5. DB Ops| DB
    RefreshTokenModel <-->|5. DB Ops| DB

    %% Return to Client
    AuthService -->|6. Returns| Controller
    GameService -->|6. Returns| Controller
    CollectionService -->|6. Returns| Controller
    PaymentService -->|6. Returns| Controller
    AggregatorService -->|6. Returns| Controller

    Controller -->|7. Response JSON| Client

    %% Error Handling (Global)
    Controller -.->|If fails| ErrorMW
    ErrorMW -.->|Error Response| Client

    %% Styles - External
    style Client fill:#FFF9C4,stroke:#FBC02D,stroke-width:2px,color:#000
    style DB fill:#C8E6C9,stroke:#388E3C,stroke-width:2px,color:#000
    style ExternalAPIs fill:#E1BEE7,stroke:#8E24AA,stroke-width:2px,color:#000
    style FileSystem fill:#FFE0B2,stroke:#F57C00,stroke-width:2px,color:#000

    %% Styles - Infrastructure
    style Routes fill:#FFFFFF,stroke:#333,stroke-width:2px,color:#000
    style Docs fill:#E3F2FD,stroke:#2196F3,stroke-width:2px,color:#000

    %% Styles - Middlewares
    style AuthMW fill:#FFEBEE,stroke:#C62828,stroke-width:2px,color:#000
    style RoleMW fill:#FFEBEE,stroke:#C62828,stroke-width:2px,color:#000
    style UploadMW fill:#F3E5F5,stroke:#6A1B9A,stroke-width:2px,color:#000
    style ValidMW fill:#E8F5E9,stroke:#2E7D32,stroke-width:2px,color:#000
    style ErrorMW fill:#FFCDD2,stroke:#D32F2F,stroke-width:2px,color:#000

    %% Styles - Controller and DTOs
    style Controller fill:#E3F2FD,stroke:#1565C0,stroke-width:3px,color:#000
    style DTO fill:#FFF9C4,stroke:#F9A825,stroke-width:2px,color:#000

    %% Styles - Core Services
    style AuthService fill:#E1F5FE,stroke:#0277BD,stroke-width:2px,color:#000
    style GameService fill:#E1F5FE,stroke:#0277BD,stroke-width:2px,color:#000
    style CollectionService fill:#E1F5FE,stroke:#0277BD,stroke-width:2px,color:#000
    style PaymentService fill:#E1F5FE,stroke:#0277BD,stroke-width:2px,color:#000

    %% Styles - Integration Services
    style IntegrationService fill:#F3E5F5,stroke:#7B1FA2,stroke-width:2px,color:#000
    style AggregatorService fill:#F3E5F5,stroke:#7B1FA2,stroke-width:2px,color:#000

    %% Styles - Auxiliary Services
    style FileService fill:#FFF3E0,stroke:#EF6C00,stroke-width:2px,color:#000
    style CronService fill:#FFECB3,stroke:#FFA000,stroke-width:2px,color:#000
    style MailService fill:#FFECB3,stroke:#FFA000,stroke-width:2px,color:#000

    %% Styles - Models
    style UserModel fill:#E8F5E9,stroke:#2E7D32,stroke-width:2px,color:#000
    style GameModel fill:#E8F5E9,stroke:#2E7D32,stroke-width:2px,color:#000
    style UserGameModel fill:#E8F5E9,stroke:#2E7D32,stroke-width:2px,color:#000
    style OrderModel fill:#E8F5E9,stroke:#2E7D32,stroke-width:2px,color:#000
    style RefreshTokenModel fill:#E8F5E9,stroke:#2E7D32,stroke-width:2px,color:#000
```
