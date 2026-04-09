import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

/**
 * Controller for handling all Task-related business logic.
 * Implements CRUD operations with strict user isolation.
 */
export const TaskController = {
  /**
   * Fetches all tasks associated with the authenticated user.
   */
  async getAllTasks(req: AuthRequest, res: Response) {
    try {
      const tasks = await prisma.task.findMany({
        where: { userId: req.userId },
        orderBy: { createdAt: "desc" },
      });
      return res.status(200).json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      return res.status(500).json({ error: "Failed to fetch tasks." });
    }
  },

  /**
   * Creates a new task for the authenticated user.
   */
  async createTask(req: AuthRequest, res: Response) {
    try {
      const { title, description, status, priorityLevel, priorityScore, deadline, workload } = req.body;

      const task = await prisma.task.create({
        data: {
          title,
          description,
          status,
          priorityLevel,
          priorityScore: parseFloat(priorityScore) || 0,
          deadline: new Date(deadline),
          workload: parseInt(workload) || 0,
          userId: req.userId!,
        },
      });
      return res.status(201).json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      return res.status(500).json({ error: "Failed to create task." });
    }
  },

  /**
   * Updates an existing task's properties.
   */
  async updateTask(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params as { id: string };
      const { title, description, status, priorityLevel, priorityScore, deadline, workload } = req.body;

      const task = await prisma.task.update({
        where: { id, userId: req.userId },
        data: {
          title,
          description,
          status,
          priorityLevel,
          priorityScore: parseFloat(priorityScore),
          deadline: deadline ? new Date(deadline) : undefined,
          workload: workload ? parseInt(workload) : undefined,
        },
      });
      return res.status(200).json(task);
    } catch (error) {
      console.error("Error updating task:", error);
      return res.status(500).json({ error: "Failed to update task." });
    }
  },

  /**
   * Deletes a task from the system.
   */
  async deleteTask(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params as { id: string };
      await prisma.task.delete({
        where: { id, userId: req.userId },
      });
      return res.status(200).json({ message: "Task deleted successfully." });
    } catch (error) {
      console.error("Error deleting task:", error);
      return res.status(500).json({ error: "Failed to delete task." });
    }
  },
};
