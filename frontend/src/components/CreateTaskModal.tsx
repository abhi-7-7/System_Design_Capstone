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
  error: string | null;
}

/**
 * CreateTaskModal — form for creating and editing tasks.
 *
 * Fixes:
 * - 'Normal' priority replaced with 'Medium' to match the unified PriorityLevel type.
 * - Added inline validation error display instead of silently doing nothing.
 * - Removed direct mutation of initialTask props; builds a clean updated Task instead.
 */
class CreateTaskModal extends Component<CreateTaskModalProps, CreateTaskModalState> {
  constructor(props: CreateTaskModalProps) {
    super(props);

    // Default deadline: today in local timezone.
    const tzOffset = new Date().getTimezoneOffset() * 60000;
    const defaultDate = new Date(Date.now() - tzOffset).toISOString().split('T')[0];

    const { initialTask } = props;

    this.state = initialTask
      ? {
          title: initialTask.title,
          description: initialTask.description,
          deadlineString: initialTask.deadline.toISOString().split('T')[0],
          priorityLevel: initialTask.priorityLevel,
          workload: initialTask.workload,
          error: null,
        }
      : {
          title: '',
          description: '',
          deadlineString: defaultDate,
          priorityLevel: 'Medium',
          workload: 1,
          error: null,
        };
  }

  handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    field: keyof CreateTaskModalState
  ) => {
    this.setState({ [field]: e.target.value, error: null } as Pick<CreateTaskModalState, typeof field>);
  };

  handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { title, description, deadlineString, priorityLevel, workload } = this.state;
    const { initialTask, onSave, onClose } = this.props;

    if (!title.trim()) {
      this.setState({ error: 'Title is required.' });
      return;
    }

    if (!deadlineString) {
      this.setState({ error: 'Deadline is required.' });
      return;
    }

    try {
      let taskToSave: Task;

      if (initialTask) {
        // Build an updated copy — never mutate props directly.
        taskToSave = new TaskBuilder(title.trim())
          .setId(initialTask.id)
          .setDescription(description)
          .setStatus(initialTask.status)
          .setDeadline(new Date(deadlineString))
          .setPriorityLevel(priorityLevel)
          .setPriorityScore(initialTask.priorityScore)
          .setWorkload(Number(workload))
          .setCreatedAt(initialTask.createdAt)
          .build();
      } else {
        taskToSave = new TaskBuilder(title.trim())
          .setDescription(description)
          .setDeadline(new Date(deadlineString))
          .setPriorityLevel(priorityLevel)
          .setWorkload(Number(workload))
          .build();
      }

      onSave(taskToSave);
      onClose();
    } catch (err) {
      this.setState({ error: err instanceof Error ? err.message : 'Failed to save task.' });
    }
  };

  render() {
    const { onClose, initialTask } = this.props;
    const { title, description, deadlineString, priorityLevel, workload, error } = this.state;
    const isEditing = Boolean(initialTask);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-scale-up">
        <div className="bg-[#111] border border-[#333] rounded-xl w-full max-w-md shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="px-6 py-4 border-b border-[#222] flex justify-between items-center bg-[#0a0a0a]">
            <h2 className="text-[15px] font-semibold text-gray-100">
              {isEditing ? 'Edit Task' : 'Create New Task'}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors text-2xl font-light leading-none">&times;</button>
          </div>

          <form onSubmit={this.handleSubmit} className="p-6">

            {error && (
              <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-2.5 rounded-lg text-[13px] font-medium">
                {error}
              </div>
            )}

            {/* Title */}
            <div className="mb-4">
              <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => this.handleChange(e, 'title')}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-md px-3 py-2 text-[14px] text-gray-100 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                placeholder="e.g., Implement authentication flow"
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Description</label>
              <textarea
                value={description}
                onChange={(e) => this.handleChange(e, 'description')}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-md px-3 py-2 text-[14px] text-gray-100 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors custom-scrollbar resize-none"
                placeholder="Details about this task…"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Deadline */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Deadline *</label>
                <input
                  type="date"
                  value={deadlineString}
                  onChange={(e) => this.handleChange(e, 'deadlineString')}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-md px-3 py-2 text-[14px] text-gray-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 [color-scheme:dark]"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Priority</label>
                <select
                  value={priorityLevel}
                  onChange={(e) => this.handleChange(e, 'priorityLevel')}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-md px-3 py-2 text-[14px] text-gray-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              {/* Workload */}
              <div className="col-span-2">
                <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Estimated Effort (Hours)</label>
                <input
                  type="number"
                  min="1"
                  max="200"
                  value={workload}
                  onChange={(e) => this.handleChange(e, 'workload')}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-md px-3 py-2 text-[14px] text-gray-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-[#222]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-400 hover:text-white border border-[#333] hover:border-[#444] rounded-md text-[13px] font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-[13px] font-semibold shadow-sm shadow-indigo-500/20 transition-colors"
              >
                {isEditing ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default CreateTaskModal;
