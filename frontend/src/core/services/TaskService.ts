import { Task, TaskBuilder } from '../models/Task';
import type { TaskStatus } from '../models/Task';
import type { PriorityLevel } from '../models/Task';
import type { IPriorityStrategy } from '../strategies/PriorityStrategy';
import { DeadlineBasedStrategy } from '../strategies/PriorityStrategy';
import { TaskEventManager } from '../observers/NotificationObserver';
import api from '../../api/axios'; // Use our configured axios instance

interface TaskApiResponse {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  deadline: string;
  priorityLevel: PriorityLevel;
  workload: number;
  priorityScore: number;
  createdAt: string;
}

export class TaskService {
  private static instance: TaskService;
  private tasks: Task[] = [];
  private eventManager: TaskEventManager;
  private priorityStrategy: IPriorityStrategy;

  private constructor() {
    this.eventManager = new TaskEventManager();
    this.priorityStrategy = new DeadlineBasedStrategy();
    // No mock data here - we wait for the fetchTasks() call from the UI
  }

  public static getInstance(): TaskService {
    if (!TaskService.instance) {
      TaskService.instance = new TaskService();
    }
    return TaskService.instance;
  }

  /**
   * Fetches all tasks from the backend and updates the local state.
   */
  public async fetchTasks(): Promise<Task[]> {
    try {
      const response = await api.get<TaskApiResponse[]>('/tasks');
      const rawTasks = response.data;
      
      this.tasks = rawTasks.map((t) => 
        new TaskBuilder(t.title)
          .setId(t.id)
          .setDescription(t.description ?? '')
          .setStatus(t.status)
          .setDeadline(new Date(t.deadline))
          .setPriorityLevel(t.priorityLevel)
          .setPriorityScore(t.priorityScore)
          .setWorkload(t.workload)
          .setCreatedAt(new Date(t.createdAt))
          .build()
      );
      
      this.eventManager.notifyObservers("TASK_UPDATED", this.tasks[0]); // Trigger UI refresh
      return this.tasks;
    } catch (error) {
      console.error("Failed to fetch tasks from API:", error);
      throw error;
    }
  }

  public getEventManager(): TaskEventManager {
    return this.eventManager;
  }

  public setPriorityStrategy(strategy: IPriorityStrategy) {
    this.priorityStrategy = strategy;
    this.recalculateAllPriorities();
  }

  public getTasks(): Task[] {
    return this.tasks;
  }

  public async addTask(task: Task) {
    try {
      // Calculate priority locally first
      task.priorityScore = this.priorityStrategy.calculateScore(task);
      
      const response = await api.post('/tasks', {
        title: task.title,
        description: task.description,
        status: task.status,
        priorityLevel: task.priorityLevel,
        priorityScore: task.priorityScore,
        deadline: task.deadline.toISOString(),
        workload: task.workload
      });

      const newTask = new TaskBuilder(response.data.title)
        .setId(response.data.id)
        .setDescription(response.data.description)
        .setStatus(response.data.status)
        .setDeadline(new Date(response.data.deadline))
        .setPriorityLevel(response.data.priorityLevel)
        .setPriorityScore(response.data.priorityScore)
        .setWorkload(response.data.workload)
        .setCreatedAt(new Date(response.data.createdAt))
        .build();

      this.tasks.push(newTask);
      this.notifyIfDeadlineClose(newTask);
      this.eventManager.notifyObservers("TASK_ADDED", newTask);
    } catch (error) {
      console.error("Failed to add task via API:", error);
    }
  }

  public async updateTask(updatedTask: Task) {
    try {
      updatedTask.priorityScore = this.priorityStrategy.calculateScore(updatedTask);
      
      await api.put(`/tasks/${updatedTask.id}`, {
        title: updatedTask.title,
        description: updatedTask.description,
        status: updatedTask.status,
        priorityLevel: updatedTask.priorityLevel,
        priorityScore: updatedTask.priorityScore,
        deadline: updatedTask.deadline.toISOString(),
        workload: updatedTask.workload
      });

      const index = this.tasks.findIndex(t => t.id === updatedTask.id);
      if (index !== -1) {
        this.tasks[index] = updatedTask;
        this.notifyIfDeadlineClose(updatedTask);
        this.eventManager.notifyObservers("TASK_UPDATED", updatedTask);
      }
    } catch (error) {
      console.error("Failed to update task via API:", error);
    }
  }

  public async updateTaskStatus(id: string, status: 'TODO' | 'IN_PROGRESS' | 'DONE') {
      const task = this.tasks.find(t => t.id === id);
      if(task) {
          task.status = status;
          await this.updateTask(task);
      }
  }

  public async updateTaskPriority(id: string, newPriority: PriorityLevel) {
      const task = this.tasks.find(t => t.id === id);
      if(task) {
          task.priorityLevel = newPriority;
          await this.updateTask(task);
      }
  }

  public async deleteTask(id: string) {
    try {
      await api.delete(`/tasks/${id}`);
      
      const task = this.tasks.find(t => t.id === id);
      if (task) {
          this.tasks = this.tasks.filter(t => t.id !== id);
          this.eventManager.notifyObservers("TASK_DELETED", task);
      }
    } catch (error) {
      console.error("Failed to delete task via API:", error);
    }
  }

  public recalculateAllPriorities() {
    this.tasks.forEach(async (task) => {
      task.priorityScore = this.priorityStrategy.calculateScore(task);
      await this.updateTask(task); // Persist recalculated priorities
    });
  }

  private notifyIfDeadlineClose(task: Task) {
      if (task.status === 'DONE') return;
      
      const now = new Date();
      
      // Grace period: Don't notify if the task was created in the last 5 minutes
      const ageInMinutes = (now.getTime() - task.createdAt.getTime()) / (1000 * 60);
      if (ageInMinutes < 5) return;

      const daysUntilDeadline = Math.ceil((task.deadline.getTime() - now.getTime()) / (1000 * 3600 * 24));
      if (daysUntilDeadline <= 1) {
          this.eventManager.notifyObservers("DEADLINE_WARNING", task);
      }
  }

  public getAnalytics() {
      const total = this.tasks.length;
      const done = this.tasks.filter(t => t.status === 'DONE').length;
      const inProgress = this.tasks.filter(t => t.status === 'IN_PROGRESS').length;
      const todo = this.tasks.filter(t => t.status === 'TODO').length;
      
      return {
          total,
          completionRate: total === 0 ? 0 : Math.round((done / total) * 100),
          inProgress,
          todo,
          done
      }
  }
}
