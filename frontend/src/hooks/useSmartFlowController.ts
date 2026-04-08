import { useState, useEffect, useCallback } from 'react';
import { TaskService } from '../core/services/TaskService';
import { Task } from '../core/models/Task';
import type { PriorityLevel } from '../core/models/Task';
import type { IObserver } from '../core/observers/NotificationObserver';
import { DeadlineBasedStrategy, WorkloadBasedStrategy } from '../core/strategies/PriorityStrategy';

export interface AppNotification {
  id: number;
  message: string;
  highlight: string;
}

export const useSmartFlowController = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [analytics, setAnalytics] = useState(TaskService.getInstance().getAnalytics());
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  
  useEffect(() => {
    const service = TaskService.getInstance();
    setTasks([...service.getTasks()]); // Initial load
    setAnalytics(service.getAnalytics());

    class ControllerObserver implements IObserver {
      update(event: string, task: Task): void {
        console.log(`[SmartFlow Controller Event]: ${event}`, task);
        
        switch (event) {
          case 'TASK_ADDED':
          case 'TASK_UPDATED':
          case 'TASK_DELETED':
          case 'PRIORITIES_RECALCULATED':
            setTasks([...service.getTasks()]);
            setAnalytics(service.getAnalytics());
            break;
          case 'DEADLINE_WARNING': {
            const now = new Date();
            const taskDeadline = new Date(task.deadline);
            const diffHours = Math.round((taskDeadline.getTime() - now.getTime()) / (1000 * 3600));
            
            let timeStr = "";
            if (diffHours < 0) {
                timeStr = `Overdue by ${Math.abs(diffHours)}h`;
            } else if (diffHours < 24) {
                timeStr = `${diffHours}h left`;
            } else {
                timeStr = `1d left`;
            }

            setNotifications(prev => {
                const msg = `Warning: Task "${task.title}" is nearing its deadline!`;
                // prevent duplicates safely by checking message
                if (!prev.find(n => n.message === msg)) {
                    return [...prev, { id: Date.now() + Math.random(), message: msg, highlight: timeStr }];
                }
                return prev;
            });
            break;
          }
        }
      }
    }

    const observer = new ControllerObserver();
    service.getEventManager().addObserver(observer);

    return () => {
      service.getEventManager().removeObserver(observer);
    };
  }, []);

  const moveTask = useCallback((id: string, newStatus: 'TODO' | 'IN_PROGRESS' | 'DONE') => {
    TaskService.getInstance().updateTaskStatus(id, newStatus);
  }, []);

  const setPriorityLevel = useCallback((id: string, priority: PriorityLevel) => {
    TaskService.getInstance().updateTaskPriority(id, priority);
  }, []);

  const addTask = useCallback((task: Task) => {
    TaskService.getInstance().addTask(task);
  }, []);

  const editTask = useCallback((updatedTask: Task) => {
    TaskService.getInstance().updateTask(updatedTask);
  }, []);

  const setStrategy = useCallback((type: 'deadline' | 'workload') => {
      const service = TaskService.getInstance();
      if (type === 'deadline') service.setPriorityStrategy(new DeadlineBasedStrategy());
      if (type === 'workload') service.setPriorityStrategy(new WorkloadBasedStrategy());
  }, []);

  const dismissNotification = useCallback((id: number) => {
      setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return {
    tasks,
    analytics,
    notifications,
    moveTask,
    addTask,
    editTask,
    setStrategy,
    setPriorityLevel,
    dismissNotification
  };
};
