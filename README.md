# SmartFlow — Intelligent Task Management System

> A full-stack task management platform built as a **System Design Capstone** project. Demonstrates production-grade architecture with JWT authentication, design patterns (Strategy, Observer, Builder), and a modern React + Express stack.

**Live Demo:** [system-design-capstone.vercel.app](https://system-design-capstone.vercel.app/)

---

## ✨ Features

| Category | Details |
|----------|---------|
| **Auth** | Google OAuth + JWT with silent token refresh, secure logout |
| **Tasks** | Full CRUD with Kanban board, status tracking, priority scoring |
| **Priority Engine** | Strategy Pattern — pluggable `WorkloadBased` and `DeadlineBased` scoring |
| **Notifications** | Observer Pattern — real-time task event notifications |
| **Profiles** | User profile management with session persistence |
| **Design** | Responsive glassmorphism UI with micro-animations |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│  Presentation Layer  (React + TypeScript)            │
│  Pages · Components · Hooks                         │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│  Core Domain Layer                                   │
│  Models · Strategies · Observers · Services          │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│  API Layer  (Express.js + TypeScript)                │
│  Controllers · Services · Middleware · Routes        │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│  Data Layer  (Prisma ORM → Neon PostgreSQL)          │
└─────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, TypeScript, React Router v7, Tailwind CSS |
| **Backend** | Node.js, Express.js, TypeScript |
| **Database** | PostgreSQL (Neon DB — serverless) via Prisma ORM |
| **Auth** | JWT (access + refresh tokens), Google OAuth 2.0 |
| **Validation** | Zod schema validation |
| **Deployment** | Vercel (frontend + serverless API) |

---

## 📂 Project Structure

```
System_Design_Capstone/
├── frontend/
│   └── src/
│       ├── pages/            # Login, Register, Dashboard, Profile, TaskDetails
│       ├── components/       # TaskCard, KanbanBoard, CreateTaskModal, UserMenu, ...
│       ├── core/
│       │   ├── models/       # Task model (Builder pattern)
│       │   ├── strategies/   # PriorityStrategy (Strategy pattern)
│       │   └── observers/    # NotificationObserver (Observer pattern)
│       ├── hooks/            # useSmartFlowController, custom React hooks
│       ├── services/         # UserApiService
│       └── api/              # Axios client with interceptors
│
├── backend/
│   └── src/
│       ├── controllers/      # AuthController, TaskController
│       ├── services/         # AuthService
│       ├── middleware/        # JWT auth middleware
│       ├── routes/           # API route definitions
│       └── lib/              # Prisma client, utilities
│
├── images/                   # UML diagrams (Use Case, ER, Class, Sequence)
├── prisma.config.ts          # Prisma configuration
├── vercel.json               # Vercel deployment config
└── tsconfig.base.json        # Shared TypeScript config
```

---

## 🎨 Design Patterns

### Strategy Pattern — Priority Scoring
Pluggable priority calculation algorithms. Easily swap between workload-based and deadline-based scoring without modifying task logic.

### Observer Pattern — Event Notifications
Task lifecycle events (creation, status change) are broadcast to observers, enabling decoupled notification delivery.

### Builder Pattern — Task Construction
Fluent API for constructing complex `Task` objects with validation, avoiding telescoping constructors.

### Interceptor Pattern — API Client
Centralized request/response handling with automatic token injection and transparent 401 → refresh → retry flow.

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- PostgreSQL (or a [Neon](https://neon.tech) account)

### Setup

```bash
# Clone
git clone https://github.com/abhi-7-7/System_Design_Capstone.git
cd System_Design_Capstone

# Install dependencies
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Configure environment
cp backend/.env.example backend/.env
# Fill in DATABASE_URL, JWT_SECRET, GOOGLE_CLIENT_ID, etc.

# Run database migrations
npm run db:migrate

# Start development servers
npm run dev:backend   # Express API on :5000
npm run dev:frontend  # Vite dev server on :5173
```

---

## 📊 UML Diagrams

All architecture diagrams live in the [`images/`](./images) directory:

| Diagram | Description |
|---------|-------------|
| **Use Case** | Actor interactions — User & Admin flows |
| **ER Diagram** | Database schema — User, Task, RefreshToken entities |
| **Class Diagram** | OOP design — Controllers, Services, Strategy & Observer patterns |
| **Sequence Diagram** | Runtime flows — Auth, Task CRUD, Notifications, Caching |

---

## 🔐 Auth Flow

```
Login → JWT Access Token (15 min) + Refresh Token (HTTP-only cookie)
  ↓
API Request → Interceptor adds Bearer token
  ↓
Token Expired (401) → Auto-refresh → Retry original request
  ↓
Refresh Fails → Clear session → Redirect to login
```

---

## 📜 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/register` | ✗ | Create account |
| `POST` | `/auth/login` | ✗ | Login & receive tokens |
| `POST` | `/auth/refresh` | ✗ | Refresh access token |
| `DELETE` | `/auth/logout` | ✓ | Invalidate session |
| `GET` | `/user/me` | ✓ | Get user profile |
| `GET` | `/tasks` | ✓ | List user tasks |
| `POST` | `/tasks` | ✓ | Create task |
| `PATCH` | `/tasks/:id` | ✓ | Update task |
| `DELETE` | `/tasks/:id` | ✓ | Delete task |

---

## 👤 Author

**Aarsh Bhatnagar** — [GitHub](https://github.com/abhi-7-7)

---

## 📄 License

This project is for academic/educational purposes as part of a System Design Capstone.
