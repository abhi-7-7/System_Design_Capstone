import React, { Component } from 'react';
import TaskCard from './TaskCard';
import { Task } from '../core/models/Task';

// --- Interface Definitions ---
interface KanbanBoardProps {
  tasks: Task[];
  onMoveTask: (id: string, status: 'TODO' | 'IN_PROGRESS' | 'DONE') => void;
  onEditTask: (task: Task) => void;
}

/**
 * KanbanBoard Component Class
 * Responsible for rendering the three swimlanes and sorting tasks.
 */
class KanbanBoard extends Component<KanbanBoardProps> {
  
  /**
   * Helper method to filter and properly sort tasks by Priority Score
   */
  getTasksByStatus = (status: string) => {
      const { tasks } = this.props;
      return tasks.filter(t => t.status === status).sort((a, b) => b.priorityScore - a.priorityScore);
  };

  render() {
    const { onMoveTask, onEditTask } = this.props;

    const columns = [
      { title: 'To Do', status: 'TODO', dotColor: 'bg-gray-500' },
      { title: 'In Progress', status: 'IN_PROGRESS', dotColor: 'bg-blue-500' },
      { title: 'Done', status: 'DONE', dotColor: 'bg-emerald-500' }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map(col => (
          <div key={col.status} className="flex flex-col h-[700px] bg-[#0d0d0d] rounded-xl border border-[#1a1a1a]">
            <div className="flex justify-between items-center px-4 py-3 border-b border-[#1a1a1a]">
                <div className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full ${col.dotColor}`}></div>
                    <h3 className="font-semibold text-[13px] text-gray-300 uppercase tracking-wide">{col.title}</h3>
                </div>
                <span className="text-[11px] font-semibold text-gray-500 bg-[#1a1a1a] px-2 py-0.5 rounded-full">
                    {this.getTasksByStatus(col.status).length}
                </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
              {this.getTasksByStatus(col.status).map(task => (
                <TaskCard key={task.id} task={task} onMove={onMoveTask} onEdit={onEditTask} />
              ))}
              
              {this.getTasksByStatus(col.status).length === 0 && (
                  <div className="h-24 flex items-center justify-center border border-dashed border-[#222] rounded-lg mt-1">
                      <p className="text-gray-600 text-[13px]">No tasks</p>
                  </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }
}

export default KanbanBoard;
