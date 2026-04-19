# System Design Capstone

A full-stack web application built as a capstone project focusing on system design principles. Features JWT-based authentication, class-based React architecture, Prisma ORM with Neon PostgreSQL, and deployment on Vercel.

**Live Demo:** [system-design-capstone.vercel.app](https://system-design-capstone.vercel.app/)

## Features

- Google OAuth + JWT authentication with automatic token refresh
- Protected routes and role-based navigation
- Class-based React components (App, Register, NotFoundPage, ProtectedRoute)
- Functional components for Login and Dashboard with custom hooks
- REST API backend with Express.js
- Prisma ORM connected to Neon PostgreSQL (serverless)
- Full TypeScript on both frontend and backend
- Deployed to Vercel with CI/CD

## Tech Stack

**Frontend:** React, TypeScript, React Router  
**Backend:** Node.js, Express.js, TypeScript  
**Database:** PostgreSQL (Neon DB) via Prisma ORM  
**Auth:** JWT (access + refresh tokens), Google OAuth  
**Deployment:** Vercel  

## Project Structure

```
System_Design_Capstone/
├── frontend/        # React + TypeScript frontend
├── backend/         # Express.js + TypeScript API
├── prisma.config.ts # Prisma configuration
└── vercel.json      # Vercel deployment config
```

## Getting Started

```bash
# Clone the repo
git clone https://github.com/abhi-7-7/System_Design_Capstone.git
cd System_Design_Capstone

# Install and run backend
cd backend && npm install && npm run dev

# Install and run frontend
cd frontend && npm install && npm start
```

## Architecture Decisions

- **Monorepo** structure with shared TypeScript config
- **Class-based components** used for stateful views to demonstrate OOP design
- **Prisma** as ORM for type-safe DB queries
- **Neon DB** for serverless PostgreSQL (zero cold start)
- **JWT refresh token** pattern for persistent sessions

## Author

**Aarsh Bhatnagar** – [GitHub](https://github.com/abhi-7-7)
