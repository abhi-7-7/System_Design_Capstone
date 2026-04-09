import dotenv from "dotenv";
dotenv.config();
import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import taskRoutes from "./routes/task.routes";

const setupApp = (): Application => {
  const app = express();

  const envOrigins = (process.env.FRONTEND_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    ...envOrigins,
  ];

  // ✅ Middleware

  app.use(cors({
    origin: allowedOrigins,
    credentials: true,
  }));
  app.use(express.json());
  app.use(cookieParser()); //

  app.get("/", (req, res) => {
    res.send("Backend is running ✅ Visit /api/auth/ping for auth health.");
  });

  // ✅ Debug
  app.get("/test", (req, res) => {
    res.send("Server working ✅");
  });

  // ✅ Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/user", userRoutes);
  app.use("/api/tasks", taskRoutes);

  // ✅ Error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
};

const startServer = async () => {
  const app = setupApp();
  const PORT = 3000;

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

startServer();