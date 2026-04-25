import { Task } from '../models/Task';
import type { PriorityLevel } from '../models/Task';

export interface IPriorityStrategy {
  calculateScore(task: Task): number;
}

/** Priority weight map — single source of truth for level → numeric weight. */
const PRIORITY_WEIGHTS: Record<PriorityLevel, number> = {
  Critical: 100,
  High: 50,
  Medium: 20,
  Low: 5,
};

/**
 * DeadlineBasedStrategy — scores tasks by how soon their deadline arrives.
 * Tasks due sooner get a higher urgency multiplier on top of their priority weight.
 *
 * SOLID: Open/Closed — new strategies can be added without modifying existing ones.
 */
export class DeadlineBasedStrategy implements IPriorityStrategy {
  calculateScore(task: Task): number {
    const priorityWeight = PRIORITY_WEIGHTS[task.priorityLevel] ?? 20;
    const now = new Date();
    const daysUntilDeadline = Math.max(
      1,
      Math.ceil((task.deadline.getTime() - now.getTime()) / (1000 * 3600 * 24))
    );
    // Urgency: closer deadlines → higher score.
    const urgency = 100 / daysUntilDeadline;
    return Math.round(priorityWeight + urgency);
  }
}

/**
 * WorkloadBasedStrategy — scores tasks by effort hours × priority weight.
 * Heavier tasks with high priority rise to the top.
 */
export class WorkloadBasedStrategy implements IPriorityStrategy {
  calculateScore(task: Task): number {
    const priorityWeight = PRIORITY_WEIGHTS[task.priorityLevel] ?? 20;
    return Math.round(task.workload * 5 + priorityWeight);
  }
}
