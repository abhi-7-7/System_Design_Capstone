import { useState, useEffect, useCallback } from 'react';
import { TaskService } from '../core/services/TaskService';
import { Task } from '../core/models/Task';
import type { PriorityLevel } from '../core/models/Task';
import type { IObserver } from '../core/observers/NotificationObserver';
import { DeadlineBasedStrategy, WorkloadBasedStrategy } from '../core/strategies/PriorityStrategy';
import type { AppNotification } from '../pages/Dashboard';

/**
 * useSmartFlowController — functional hook alternative to the class-based Dashboard.
 *
 * Implements the Observer pattern via a stable observer object.
 * The hook wires the TaskService singleton to React state so components
 * re-render reactively when tasks change.
 *
 * Note: The class-based Dashboard currently uses this pattern directly.
 * This hook is available for refactoring individual parts of the UI to functions.
 */
export const useSmartFlowController = () => {
  const taskService = TaskService.getInstance();

  const [tasks, setTasks] = useState<Task[]>([...taskService.getTasks()]);
  const [analytics, setAnalytics] = useState(taskService.getAnalytics());
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activeStrategy, setActiveStrategy] = useState<'deadline' | 'workload'>('deadline');

  // Stable observer — created once, never recreated on re-render.
  const observer: IObserver = useCallback(
    {
      update(event: string, task: Task) {
        switch (event) {
          case 'TASK_ADDED':
          case 'TASK_UPDATED':
          case 'TASK_DELETED':
          case 'PRIORITIES_RECALCULATED':
            setTasks([...taskService.getTasks()]);
            setAnalytics(taskService.getAnalytics());
            break;
          case 'DEADLINE_WARNING': {
            const now = new Date();
            const diffHours = Math.round(
              (new Date(task.deadline).getTime() - now.getTime()) / (1000 * 3600)
            );
            const timeStr =
              diffHours < 0
                ? `Overdue by ${Math.abs(diffHours)}h`
                : diffHours < 24
                ? `${diffHours}h left`
                : '1d left';

            setNotifications((prev) => {
              const alreadyExists = prev.some(
                (n) => n.message === `Warning: Task "${task.title}" is nearing its deadline!`
              );
              if (alreadyExists) return prev;
              return [
                ...prev,
                { id: Date.now(), message: `Warning: Task "${task.title}" is nearing its deadline!`, highlight: timeStr },
              ];
            });
            break;
          }
        }
      },
    } as IObserver,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  ) as IObserver;

  useEffect(() => {
    taskService.getEventManager().addObserver(observer);
    taskService.fetchTasks().catch((err) => {
      console.error('Failed to load tasks:', err);
    });
    return () => {
      taskService.getEventManager().removeObserver(observer);
    };
  }, [observer, taskService]);

  const handleStrategyChange = (type: 'deadline' | 'workload') => {
    setActiveStrategy(type);
    if (type === 'deadline') taskService.setPriorityStrategy(new DeadlineBasedStrategy());
    else taskService.setPriorityStrategy(new WorkloadBasedStrategy());
  };

  const handleDismissNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const updateTaskPriority = async (id: string, priority: PriorityLevel) => {
    await taskService.updateTaskPriority(id, priority);
  };

  return {
    tasks,
    analytics,
    notifications,
    activeStrategy,
    handleStrategyChange,
    handleDismissNotification,
    updateTaskPriority,
    taskService,
  };
};
