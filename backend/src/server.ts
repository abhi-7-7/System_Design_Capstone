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

  // ✅ Middleware

  app.use(cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
    ],
    credentials: true,
  }));
  app.use(express.json());
  app.use(cookieParser()); // ✅ MUST be before routes

  // ✅ Root route so browser visits to http://localhost:3000/ don't show "Cannot GET /"
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