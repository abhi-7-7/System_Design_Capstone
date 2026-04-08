import React, { Component } from 'react';
import { Task } from '../core/models/Task';
import type { PriorityLevel } from '../core/models/Task';

// --- Interface Definitions ---
interface TaskCardProps {
  task: Task;
  onMove: (id: string, status: 'TODO' | 'IN_PROGRESS' | 'DONE') => void;
  onSetPriorityLevel?: (id: string, priority: PriorityLevel) => void;
  onEdit: (task: Task) => void;
}

/**
 * TaskCard Component Class
 * Responsible for rendering individual tasks and managing hover physics.
 */
class TaskCard extends Component<TaskCardProps> {
  
  getBorderStyle = () => {
    const { task } = this.props;
    if (task.status === 'DONE') return 'border-l-emerald-500';
    if (task.priorityLevel === 'Critical') return 'border-l-red-500';
    if (task.priorityLevel === 'High') return 'border-l-amber-500';
    return 'border-l-blue-500';
  };

  getGlowStyle = () => {
    const { task } = this.props;
    if (task.status === 'DONE') return 'hover:shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:border-emerald-500/50 hover:border-l-emerald-400';
    if (task.priorityLevel === 'Critical') return 'hover:shadow-[0_0_20px_rgba(239,68,68,0.25)] hover:border-red-500/50 hover:border-l-red-400';
    if (task.priorityLevel === 'High') return 'hover:shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:border-amber-500/50 hover:border-l-amber-400';
    return 'hover:shadow-[0_0_20px_rgba(59,130,246,0.25)] hover:border-blue-500/50 hover:border-l-blue-400';
  };

  render() {
    const { task, onMove, onEdit } = this.props;
    const formattedDate = new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return (
      <div className={`group bg-[#151515] border border-[#2A2A2A] rounded-lg p-4 mb-3 transition-all duration-300 ease-out hover:bg-[#1c1c1c] hover:-translate-y-1 hover:rounded-xl border-l-4 ${this.getBorderStyle()} ${this.getGlowStyle()} animate-slide-down`}>
        <div className="flex justify-between items-start mb-2.5">
          <h3 className="font-medium text-[15px] text-gray-200 leading-snug group-hover:text-white transition-colors">{task.title}</h3>
          <div className="flex items-center gap-2">
              <button 
                onClick={() => onEdit(task)} 
                className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-gray-300 transition-opacity" 
                title="Edit Task"
              >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </button>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${task.status === 'DONE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : task.priorityLevel === 'Critical' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : task.priorityLevel === 'High' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                {task.priorityLevel}
              </span>
          </div>
        </div>
        
        <p className="text-[13px] text-gray-500 mb-4 line-clamp-2 leading-relaxed">{task.description}</p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-4">
              <div className="flex items-center gap-1.5 text-[12px] text-gray-500 font-medium">
                 <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                 {formattedDate}
              </div>
              <div className="flex items-center gap-1.5 text-[12px] text-gray-500 font-medium">
                 <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 {task.workload}h
              </div>
          </div>
        </div>

        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {task.status !== 'TODO' && (
            <button onClick={() => onMove(task.id, 'TODO')} className="flex-1 text-[11px] font-medium py-1.5 rounded bg-[#222] hover:bg-[#333] text-gray-400 transition-colors border border-[#333]">
               &larr; Todo
            </button>
          )}
          {task.status !== 'IN_PROGRESS' && (
            <button onClick={() => onMove(task.id, 'IN_PROGRESS')} className="flex-1 text-[11px] font-medium py-1.5 rounded bg-[#222] hover:bg-[#333] text-gray-400 transition-colors border border-[#333]">
              {task.status === 'TODO' ? 'Start \u2192' : '\u2190 Active'}
            </button>
          )}
          {task.status !== 'DONE' && (
            <button onClick={() => onMove(task.id, 'DONE')} className="flex-1 text-[11px] font-medium py-1.5 rounded bg-[#222] hover:bg-[#333] text-gray-400 transition-colors border border-[#333]">
              Done &rarr;
            </button>
          )}
        </div>
      </div>
    );
  }
}

export default TaskCard;
