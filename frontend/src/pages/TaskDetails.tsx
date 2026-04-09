import { Component } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TaskService } from '../core/services/TaskService';
import { Task } from '../core/models/Task';
import UserMenu from '../components/UserMenu';
import CreateTaskModal from '../components/CreateTaskModal';

interface TaskDetailsState {
    task: Task | null;
    isLoading: boolean;
    isEditModalOpen: boolean;
}

interface TaskDetailsProps {
    taskId: string;
    navigate: (path: string) => void;
}

class TaskDetailsComponent extends Component<TaskDetailsProps, TaskDetailsState> {
    private taskService = TaskService.getInstance();

    state: TaskDetailsState = {
        task: null,
        isLoading: true,
        isEditModalOpen: false
    };

    componentDidMount() {
        const { taskId } = this.props;
        const task = this.taskService.getTasks().find(t => t.id === taskId);

        // Simulating a minor delay for "premium" feel
        setTimeout(() => {
            this.setState({ task: task || null, isLoading: false });
        }, 300);
    }

    handleBack = () => {
        this.props.navigate('/dashboard');
    };

    handleDelete = () => {
        const { task } = this.state;
        if (task && window.confirm("Are you sure you want to archive (delete) this task?")) {
            this.taskService.deleteTask(task.id);
            this.handleBack();
        }
    };

    handleUpdate = (updatedTask: Task) => {
        this.taskService.updateTask(updatedTask);
        this.setState({ task: updatedTask, isEditModalOpen: false });
    };

    render() {
        const { task, isLoading, isEditModalOpen } = this.state;

        if (isLoading) {
            return (
                <div className="min-h-screen bg-[#000000] flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                </div>
            );
        }

        if (!task) {
            return (
                <div className="min-h-screen bg-[#000000] text-gray-300 flex flex-col items-center justify-center p-6 text-center">
                    <h1 className="text-4xl font-bold mb-4">Task Not Found</h1>
                    <p className="text-gray-500 mb-8">The task you are looking for doesn't exist or has been deleted.</p>
                    <button onClick={this.handleBack} className="px-6 py-2 bg-indigo-600 rounded-lg text-white font-medium">
                        Back to Workspace
                    </button>
                </div>
            );
        }

        const formattedDate = new Date(task.deadline).toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });

        return (
            <div className="min-h-screen bg-[#000000] text-gray-300 font-sans selection:bg-indigo-500/30 flex flex-col">
                {/* Navbar */}
                <nav className="sticky top-0 z-40 bg-[#070707]/95 backdrop-blur-xl border-b border-[#1a1a1a] px-8 py-4 flex justify-between items-center shadow-2xl">
                    <div className="flex items-center gap-4 group cursor-pointer" onClick={this.handleBack}>
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-white font-black text-base shadow-[0_0_20px_rgba(79,70,229,0.3)] group-hover:scale-110 transition-transform duration-300">
                            SF
                        </div>
                        <div>
                            <h1 className="text-base font-bold text-white tracking-tighter leading-none mb-0.5">SmartFlow</h1>
                            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.1em] opacity-80">Workspace</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <button onClick={this.handleBack} className="text-gray-400 hover:text-gray-100 text-[13px] font-medium transition-colors">
                            Back to Board
                        </button>
                        <div className="w-px h-6 bg-[#222]"></div>
                        <UserMenu />
                    </div>
                </nav>

                <main className="flex-1 max-w-5xl mx-auto w-full p-8 animate-slide-up">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${task.status === 'DONE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                            task.status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                                'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                                        }`}>
                                        {task.status.replace('_', ' ')}
                                    </span>
                                    <span className="text-gray-600">•</span>
                                    <span className="text-[12px] font-medium text-gray-500">ID: {task.id.substring(0, 8)}</span>
                                </div>
                                <h2 className="text-4xl font-extrabold text-white tracking-tight mb-6 leading-tight">
                                    {task.title}
                                </h2>
                                <div className="prose prose-invert max-w-none">
                                    <p className="text-gray-400 text-lg leading-relaxed whitespace-pre-wrap">
                                        {task.description || "No description provided for this task."}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-[#1a1a1a]">
                                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-8">Task Activity</h3>
                                <div className="relative pl-8 space-y-10">
                                    {/* Vertical Timeline Line */}
                                    <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500/50 via-[#1a1a1a] to-transparent"></div>

                                    {/* Entry 1: Status */}
                                    <div className="relative">
                                        <div className="absolute -left-10 w-4 h-4 rounded-full bg-[#000] border-2 border-indigo-500 z-10"></div>
                                        <div>
                                            <p className="text-[14px] text-gray-200 font-medium">
                                                Task moved to <span className="text-white font-bold">{task.status.replace('_', ' ')}</span>
                                            </p>
                                            <p className="text-[11px] text-gray-500 mt-1">Updated by System • Just now</p>
                                        </div>
                                    </div>

                                    {/* Entry 2: Priority */}
                                    <div className="relative">
                                        <div className="absolute -left-10 w-4 h-4 rounded-full bg-[#000] border-2 border-purple-500 z-10 text-[8px] flex items-center justify-center font-bold text-purple-500">P</div>
                                        <div>
                                            <p className="text-[14px] text-gray-200 font-medium">
                                                Set priority to <span className="text-white font-bold">{task.priorityLevel}</span>
                                            </p>
                                            <p className="text-[11px] text-gray-500 mt-1">Priority Strategy calculated score: {task.priorityScore.toFixed(2)}</p>
                                        </div>
                                    </div>

                                    {/* Entry 3: Creation */}
                                    <div className="relative">
                                        <div className="absolute -left-10 w-4 h-4 rounded-full bg-[#000] border-2 border-gray-700 z-10 flex items-center justify-center">
                                            <div className="w-1.5 h-1.5 rounded-full bg-gray-500"></div>
                                        </div>
                                        <div>
                                            <p className="text-[14px] text-gray-400 font-medium">Task initialized in Workspace</p>
                                            <p className="text-[11px] text-gray-500 mt-1">Automatic entry from SmartFlow Engine</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Details */}
                        <div className="space-y-6">
                            <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-6 space-y-6">
                                <div>
                                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">Properties</p>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[13px] text-gray-400">Priority</span>
                                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${task.priorityLevel === 'Critical' ? 'text-red-400 bg-red-400/10' :
                                                    task.priorityLevel === 'High' ? 'text-amber-400 bg-amber-400/10' :
                                                        'text-blue-400 bg-blue-400/10'
                                                }`}>
                                                {task.priorityLevel}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[13px] text-gray-400">Effort Score</span>
                                            <span className="text-[13px] text-white font-medium">{task.priorityScore.toFixed(1)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[13px] text-gray-400">Due Date</span>
                                            <span className="text-[13px] text-white font-medium">{new Date(task.deadline).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[13px] text-gray-400">Workload</span>
                                            <span className="text-[13px] text-white font-medium">{task.workload} hours</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-[#1a1a1a]">
                                    <button
                                        onClick={() => this.setState({ isEditModalOpen: true })}
                                        className="w-full py-2.5 bg-[#1a1a1a] hover:bg-[#222] text-white rounded-xl text-[13px] font-bold transition-all border border-[#222] mb-3"
                                    >
                                        Edit Details
                                    </button>
                                    <button
                                        onClick={this.handleDelete}
                                        className="w-full py-2.5 border border-red-900/30 text-red-500/80 hover:bg-red-500/5 hover:text-red-500 rounded-xl text-[13px] font-bold transition-all"
                                    >
                                        Delete Task
                                    </button>
                                </div>
                            </div>

                            {/* Deadline Card */}
                            <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 rounded-2xl p-6">
                                <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest mb-2">Deadline Status</p>
                                <h4 className="text-white font-bold text-sm mb-1">{formattedDate}</h4>
                                <p className="text-[12px] text-indigo-300 opacity-60">Remaining time is calculated based on your local timezone.</p>
                            </div>
                        </div>
                    </div>
                </main>

                {isEditModalOpen && (
                    <CreateTaskModal
                        initialTask={task}
                        onClose={() => this.setState({ isEditModalOpen: false })}
                        onSave={this.handleUpdate}
                    />
                )}
            </div>
        );
    }
}

const TaskDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    return <TaskDetailsComponent taskId={id || ''} navigate={navigate} />;
};

export default TaskDetails;
