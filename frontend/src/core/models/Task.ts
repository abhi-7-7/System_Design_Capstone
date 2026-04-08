export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type PriorityLevel = 'Normal' | 'High' | 'Critical';

export interface ITask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  deadline: Date;
  priorityLevel: PriorityLevel;
  workload: number; // estimated hours
  priorityScore: number;
  tags: string[];
}

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

  constructor(builder: TaskBuilder) {
    this.id = builder.id || crypto.randomUUID();
    this.title = builder.title;
    this.description = builder.description || '';
    this.status = builder.status || 'TODO';
    this.deadline = builder.deadline || new Date();
    this.priorityLevel = builder.priorityLevel || 'Normal';
    this.workload = builder.workload || 1;
    this.priorityScore = builder.priorityScore || 0;
    this.tags = builder.tags || [];
  }
}

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

  constructor(title: string) {
    this.title = title;
  }

  public setId(id: string): TaskBuilder {
    this.id = id;
    return this;
  }

  public setDescription(description: string): TaskBuilder {
    this.description = description;
    return this;
  }

  public setStatus(status: TaskStatus): TaskBuilder {
    this.status = status;
    return this;
  }

  public setDeadline(deadline: Date): TaskBuilder {
    this.deadline = deadline;
    return this;
  }

  public setPriorityLevel(level: PriorityLevel): TaskBuilder {
    this.priorityLevel = level;
    return this;
  }

  public setWorkload(workload: number): TaskBuilder {
    this.workload = workload;
    return this;
  }

  public setPriorityScore(score: number): TaskBuilder {
    this.priorityScore = score;
    return this;
  }

  public setTags(tags: string[]): TaskBuilder {
    this.tags = tags;
    return this;
  }

  public build(): Task {
    // Basic validation
    if (!this.title) throw new Error("Task title is required");
    return new Task(this);
  }
}
