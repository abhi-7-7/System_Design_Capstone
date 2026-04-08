import React, { Component } from 'react';
import type { ChangeEvent } from 'react';
import { Task, TaskBuilder } from '../core/models/Task';
import type { PriorityLevel } from '../core/models/Task';

interface CreateTaskModalProps {
  onClose: () => void;
  onSave: (task: Task) => void;
  initialTask?: Task | null;
}

interface CreateTaskModalState {
  title: string;
  description: string;
  deadlineString: string;
  priorityLevel: PriorityLevel;
  workload: number;
}

/**
 * CreateTaskModal Component Class
 * Form component using ES6 local state instead of hooks.
 */
class CreateTaskModal extends Component<CreateTaskModalProps, CreateTaskModalState> {
  constructor(props: CreateTaskModalProps) {
    super(props);
    const tzOffset = (new Date()).getTimezoneOffset() * 60000;
    const defaultDateStr = (new Date(Date.now() - tzOffset)).toISOString().split('T')[0];
    
    if (props.initialTask) {
        this.state = {
            title: props.initialTask.title,
            description: props.initialTask.description,
            deadlineString: props.initialTask.deadline.toISOString().split('T')[0],
            priorityLevel: props.initialTask.priorityLevel,
            workload: props.initialTask.workload
        };
    } else {
        this.state = {
            title: '',
            description: '',
            deadlineString: defaultDateStr,
            priorityLevel: 'Normal',
            workload: 1
        };
    }
  }

  handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, field: keyof CreateTaskModalState) => {
      this.setState({ [field]: e.target.value } as unknown as Pick<CreateTaskModalState, keyof CreateTaskModalState>);
  };

  handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { title, description, deadlineString, priorityLevel, workload } = this.state;
    const { initialTask, onSave, onClose } = this.props;

    if (!title.trim()) return;

    if (initialTask) {
        initialTask.title = title;
        initialTask.description = description;
        initialTask.deadline = new Date(deadlineString);
        initialTask.priorityLevel = priorityLevel;
        initialTask.workload = Number(workload);
        onSave(initialTask);
    } else {
        const newTask = new TaskBuilder(title)
            .setDescription(description)
            .setDeadline(new Date(deadlineString))
            .setPriorityLevel(priorityLevel)
            .setWorkload(Number(workload))
            .build();
        onSave(newTask);
    }

    onClose();
  };

  render() {
    const { onClose, initialTask } = this.props;
    const { title, description, deadlineString, priorityLevel, workload } = this.state;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 text-left transition-all duration-300">
        <div className="bg-[#111] border border-[#333] rounded-xl w-full max-w-md shadow-2xl relative overflow-hidden animate-scale-up">
          
          <div className="px-6 py-4 border-b border-[#222] flex justify-between items-center bg-[#0a0a0a]">
              <h2 className="text-[15px] font-semibold text-gray-100">{initialTask ? 'Edit Task' : 'Create New Task'}</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors text-xl font-light">&times;</button>
          </div>

          <form onSubmit={this.handleSubmit} className="p-6">
            <div className="mb-4">
              <label className="block text-[12px] font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Title</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => this.handleInputChange(e, 'title')}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-md px-3 py-2 text-[14px] text-gray-100 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                placeholder="e.g., Update Database Schema"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-[12px] font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Description</label>
              <textarea 
                value={description} 
                onChange={(e) => this.handleInputChange(e, 'description')}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-md px-3 py-2 text-[14px] text-gray-100 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors custom-scrollbar"
                placeholder="Details about the task..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="block text-[12px] font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Deadline</label>
                    <input 
                        type="date" 
                        value={deadlineString} 
                        onChange={(e) => this.handleInputChange(e, 'deadlineString')}
                        className="w-full bg-[#1a1a1a] border border-[#333] rounded-md px-3 py-2 text-[14px] text-gray-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 [color-scheme:dark]"
                        required
                    />
                </div>
                <div>
                     <label className="block text-[12px] font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Priority</label>
                     <select 
                        value={priorityLevel} 
                        onChange={(e) => this.handleInputChange(e, 'priorityLevel')}
                        className="w-full bg-[#1a1a1a] border border-[#333] rounded-md px-3 py-2 text-[14px] text-gray-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none"
                     >
                        <option value="Normal">Normal</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                    </select>
                </div>
                <div className="col-span-2">
                     <label className="block text-[12px] font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Estimated Effort (Hours)</label>
                     <input 
                        type="number" 
                        min="1"
                        max="100"
                        value={workload} 
                        onChange={(e) => this.handleInputChange(e, 'workload')}
                        className="w-full bg-[#1a1a1a] border border-[#333] rounded-md px-3 py-2 text-[14px] text-gray-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        required
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#222]">
              <button 
                type="button" 
                onClick={onClose}
                className="px-4 py-2 bg-transparent hover:bg-[#1a1a1a] text-gray-400 border border-[#333] rounded-md font-medium text-[13px] transition-colors"
                >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md font-medium text-[13px] shadow-sm shadow-indigo-500/20 transition-colors"
                >
                {initialTask ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default CreateTaskModal;
