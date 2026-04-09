import { Router } from "express";
import { TaskController } from "../controllers/task.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const taskRouter = Router();

// All task routes require authentication
taskRouter.use(authMiddleware);

taskRouter.get("/", TaskController.getAllTasks);
taskRouter.post("/", TaskController.createTask);
taskRouter.put("/:id", TaskController.updateTask);
taskRouter.delete("/:id", TaskController.deleteTask);

export default taskRouter;
