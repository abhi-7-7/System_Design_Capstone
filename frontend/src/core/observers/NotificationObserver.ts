import { Task } from '../models/Task';

export interface IObserver {
  update(event: string, task: Task): void;
}

export interface ISubject {
  addObserver(observer: IObserver): void;
  removeObserver(observer: IObserver): void;
  notifyObservers(event: string, task: Task): void;
}

export class TaskEventManager implements ISubject {
  private observers: IObserver[] = [];

  public addObserver(observer: IObserver): void {
    const index = this.observers.indexOf(observer);
    if (index === -1) {
      this.observers.push(observer);
    }
  }

  public removeObserver(observer: IObserver): void {
    const index = this.observers.indexOf(observer);
    if (index !== -1) {
      this.observers.splice(index, 1);
    }
  }

  public notifyObservers(event: string, task: Task): void {
    for (const observer of this.observers) {
      observer.update(event, task);
    }
  }
}
