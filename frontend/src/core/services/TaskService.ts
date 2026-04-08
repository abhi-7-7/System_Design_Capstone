import { Task, TaskBuilder } from '../models/Task';
import type { PriorityLevel } from '../models/Task';
import type { IPriorityStrategy } from '../strategies/PriorityStrategy';
import { DeadlineBasedStrategy } from '../strategies/PriorityStrategy';
import { TaskEventManager } from '../observers/NotificationObserver';

export class TaskService {
  private static instance: TaskService;
  private tasks: Task[] = [];
  private eventManager: TaskEventManager;
  private priorityStrategy: IPriorityStrategy;

  private constructor() {
    this.eventManager = new TaskEventManager();
    this.priorityStrategy = new DeadlineBasedStrategy();
    this.initializeMockData();
  }

  public static getInstance(): TaskService {
    if (!TaskService.instance) {
      TaskService.instance = new TaskService();
    }
    return TaskService.instance;
  }

  private initializeMockData() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const past = new Date();
    past.setDate(past.getDate() - 1);

    const task1 = new TaskBuilder("Design System Documentation")
      .setDescription("Complete the documentation for design patterns")
      .setStatus('DONE')
      .setDeadline(past)
      .setPriorityLevel('Critical')
      .setWorkload(4)
      .build();

    const task2 = new TaskBuilder("Build Kanban Board UI")
      .setDescription("Implement drag and drop functionality")
      .setStatus('IN_PROGRESS')
      .setDeadline(tomorrow)
      .setPriorityLevel('High')
      .setWorkload(8)
      .build();

    const task3 = new TaskBuilder("Implement API Integration")
      .setDescription("Connect frontend to backend services")
      .setStatus('TODO')
      .setDeadline(nextWeek)
      .setPriorityLevel('Normal')
      .setWorkload(12)
      .build();

    this.addTask(task1);
    this.addTask(task2);
    this.addTask(task3);
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

  public addTask(task: Task) {
    task.priorityScore = this.priorityStrategy.calculateScore(task);
    this.tasks.push(task);
    this.notifyIfDeadlineClose(task);
    this.eventManager.notifyObservers("TASK_ADDED", task);
  }

  public updateTask(updatedTask: Task) {
    const index = this.tasks.findIndex(t => t.id === updatedTask.id);
    if (index !== -1) {
      updatedTask.priorityScore = this.priorityStrategy.calculateScore(updatedTask);
      this.tasks[index] = updatedTask;
      this.notifyIfDeadlineClose(updatedTask);
      this.eventManager.notifyObservers("TASK_UPDATED", updatedTask);
    }
  }

  public updateTaskStatus(id: string, status: 'TODO' | 'IN_PROGRESS' | 'DONE') {
      const task = this.tasks.find(t => t.id === id);
      if(task) {
          task.status = status;
          this.updateTask(task);
      }
  }

  public updateTaskPriority(id: string, newPriority: PriorityLevel) {
      const task = this.tasks.find(t => t.id === id);
      if(task) {
          task.priorityLevel = newPriority;
          this.updateTask(task);
      }
  }

  public deleteTask(id: string) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.eventManager.notifyObservers("TASK_DELETED", task);
    }
  }

  public recalculateAllPriorities() {
    this.tasks.forEach(task => {
      task.priorityScore = this.priorityStrategy.calculateScore(task);
    });
    // Just notify with a dummy task to trigger re-render
    if (this.tasks.length > 0) {
        this.eventManager.notifyObservers("PRIORITIES_RECALCULATED", this.tasks[0]);
    }
  }

  private notifyIfDeadlineClose(task: Task) {
      if (task.status === 'DONE') return;
      
      const now = new Date();
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
