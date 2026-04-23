/**
 * Task domain model — canonical type definitions.
 *
 * Fix: Unified PriorityLevel to use 'Low' | 'Medium' | 'High' | 'Critical'
 * consistently across frontend and backend.
 * Previously 'Normal' was used in some places and 'Medium' in others, causing
 * silent type mismatches between the DB values and frontend rendering logic.
 */

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface ITask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  deadline: Date;
  priorityLevel: PriorityLevel;
  workload: number;
  priorityScore: number;
  tags: string[];
  createdAt: Date;
}

/**
 * Task — immutable value object constructed via TaskBuilder.
 * Implements the Builder pattern for safe, validated construction.
 */
export class Task implements ITask {
  public id: string;
  public title: string;
  public description: string;
  public status: TaskStatus;
  public deadline: Date;
  public priorityLevel: PriorityLevel;
  public workload: number;
  public priorityScore: number;
  public tags: string[];
  public createdAt: Date;

  constructor(builder: TaskBuilder) {
    this.id = builder.id || crypto.randomUUID();
    this.title = builder.title;
    this.description = builder.description || '';
    this.status = builder.status || 'TODO';
    this.deadline = builder.deadline || new Date();
    this.priorityLevel = builder.priorityLevel || 'Medium';
    this.workload = builder.workload ?? 1;
    this.priorityScore = builder.priorityScore ?? 0;
    this.tags = builder.tags || [];
    this.createdAt = builder.createdAt || new Date();
  }
}

/**
 * TaskBuilder — fluent interface for constructing Task instances.
 * Enforces required fields (title) at build time.
 */
export class TaskBuilder {
  public id?: string;
  public title!: string;
  public description?: string;
  public status?: TaskStatus;
  public deadline?: Date;
  public priorityLevel?: PriorityLevel;
  public workload?: number;
  public priorityScore?: number;
  public tags?: string[];
  public createdAt?: Date;

  constructor(title: string) {
    if (!title || !title.trim()) throw new Error('Task title is required.');
    this.title = title.trim();
  }

  public setId(id: string): this { this.id = id; return this; }
  public setDescription(description: string): this { this.description = description; return this; }
  public setStatus(status: TaskStatus): this { this.status = status; return this; }
  public setDeadline(deadline: Date): this { this.deadline = deadline; return this; }
  public setPriorityLevel(level: PriorityLevel): this { this.priorityLevel = level; return this; }
  public setWorkload(workload: number): this { this.workload = workload; return this; }
  public setPriorityScore(score: number): this { this.priorityScore = score; return this; }
  public setTags(tags: string[]): this { this.tags = tags; return this; }
  public setCreatedAt(createdAt: Date): this { this.createdAt = createdAt; return this; }

  public build(): Task {
    return new Task(this);
  }
}
