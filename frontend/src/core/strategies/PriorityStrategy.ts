import { Task } from '../models/Task';

export interface IPriorityStrategy {
  calculateScore(task: Task): number;
}

export class DeadlineBasedStrategy implements IPriorityStrategy {
  calculateScore(task: Task): number {
    let score = 0;
    if (task.priorityLevel === 'Critical') score += 100;
    else if (task.priorityLevel === 'High') score += 50;
    else score += 10;
    
    return score;
  }
}

export class WorkloadBasedStrategy implements IPriorityStrategy {
  calculateScore(task: Task): number {
    let score = 0;
    if (task.priorityLevel === 'Critical') score += 100;
    else if (task.priorityLevel === 'High') score += 50;
    else score += 10;

    return (task.workload * 5) + score;
  }
}
