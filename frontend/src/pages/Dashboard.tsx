import React, { Component } from "react";
import { useNavigate } from "react-router-dom";
import { Task } from "../core/models/Task";
import KanbanBoard from "../components/KanbanBoard";
import AnalyticsPanel from "../components/AnalyticsPanel";
import CreateTaskModal from "../components/CreateTaskModal";
import { TaskService } from "../core/services/TaskService";
import type { IObserver } from "../core/observers/NotificationObserver";
import { DeadlineBasedStrategy, WorkloadBasedStrategy } from "../core/strategies/PriorityStrategy";

export interface AppNotification {
  id: number;
  message: string;
  highlight: string;
}

// --- Interface Definitions for Type Safety ---
interface DashboardProps {
    navigate: (path: string) => void;
}

interface DashboardState {
    tasks: Task[];
    analytics: { total: number, completionRate: number, inProgress: number, todo: number, done: number };
    notifications: AppNotification[];
    isCreateOpen: boolean;
    editingTask: Task | null;
    activeStrategy: 'deadline' | 'workload';
}

/**
 * Dashboard Component Class
 * Implements IObserver to reactively listen to TaskService model updates.
 */
class DashboardComponent extends Component<DashboardProps, DashboardState> implements IObserver {
    private taskService = TaskService.getInstance();

    state: DashboardState = {
        tasks: [...this.taskService.getTasks()],
        analytics: this.taskService.getAnalytics(),
        notifications: [],
        isCreateOpen: false,
        editingTask: null,
        activeStrategy: 'deadline'
    };

    componentDidMount() {
        this.taskService.getEventManager().addObserver(this);
    }

    componentWillUnmount() {
        this.taskService.getEventManager().removeObserver(this);
    }

    /**
     * Observer Pattern Implementation
     * Automatically triggers re-renders when the TaskService engine publishes events
     */
    update(event: string, task: Task): void {
        switch (event) {
            case 'TASK_ADDED':
            case 'TASK_UPDATED':
            case 'TASK_DELETED':
            case 'PRIORITIES_RECALCULATED':
                this.setState({
                    tasks: [...this.taskService.getTasks()],
                    analytics: this.taskService.getAnalytics()
                });
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

                this.setState(prevState => {
                    const msg = `Warning: Task "${task.title}" is nearing its deadline!`;
                    if (!prevState.notifications.find(n => n.message === msg)) {
                        return {
                            notifications: [...prevState.notifications, { id: Date.now() + Math.random(), message: msg, highlight: timeStr }]
                        };
                    }
                    return null;
                });
                break;
            }
        }
    }

    handleLogout = () => {
        this.props.navigate("/");
    };

    handleStrategyChange = (type: 'deadline' | 'workload') => {
        this.setState({ activeStrategy: type });
        if (type === 'deadline') this.taskService.setPriorityStrategy(new DeadlineBasedStrategy());
        if (type === 'workload') this.taskService.setPriorityStrategy(new WorkloadBasedStrategy());
    };

    handleDismissNotification = (id: number) => {
        this.setState(prevState => ({
            notifications: prevState.notifications.filter(n => n.id !== id)
        }));
    };

    render() {
        const { tasks, analytics, notifications, isCreateOpen, editingTask, activeStrategy } = this.state;

        return (
            <div className="min-h-screen bg-[#000000] text-gray-300 font-sans selection:bg-indigo-500/30 text-left">
                {/* Top Navigation */}
                <nav className="sticky top-0 z-40 bg-[#000000]/90 backdrop-blur-md border-b border-[#222] px-6 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            SF
                        </div>
                        <div>
                            <h1 className="text-sm font-semibold text-gray-100 tracking-tight">SmartFlow</h1>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                         <button onClick={() => this.setState({ isCreateOpen: true })} className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-md font-medium text-[13px] transition-all duration-200 shadow-sm hover:shadow-indigo-500/20">
                            New Task
                        </button>
                        <div className="w-px h-4 bg-[#333] mx-1"></div>
                        <button onClick={this.handleLogout} className="text-gray-400 hover:text-gray-100 text-[13px] font-medium transition-colors">
                            Sign out
                        </button>
                    </div>
                </nav>

                <main className="max-w-[1400px] mx-auto px-8 py-8 w-full text-left">
                    
                    {/* Notifications Area */}
                    {notifications.length > 0 && (
                        <div className="mb-6 flex flex-col gap-2">
                            {notifications.map((note) => (
                                <div key={note.id} className="bg-orange-500/10 border border-orange-500/30 text-orange-400 px-4 py-3 rounded-lg flex justify-between items-center animate-slide-down transform-gpu shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                                    <span className="font-medium text-[13px] flex items-center gap-2.5">
                                        {note.message} 
                                        <span className="font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-widest flex items-center gap-1 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            {note.highlight}
                                        </span>
                                    </span>
                                    <button onClick={() => this.handleDismissNotification(note.id)} className="text-orange-400 hover:text-orange-300 transition-colors p-1">&times;</button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Header & Controls */}
                    <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8 mt-2 text-left">
                        <div className="flex-1 w-full relative">
                            <AnalyticsPanel data={analytics} />
                        </div>
                    </div>

                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <div className="flex bg-[#111] p-1 rounded-md border border-[#222]">
                                <button 
                                    onClick={() => this.handleStrategyChange('deadline')}
                                    className={`px-3 py-1.5 rounded text-[12px] font-medium transition-all ${activeStrategy === 'deadline' ? 'bg-[#2a2a2a] text-gray-100 shadow-sm border border-[#333]' : 'text-gray-500 hover:text-gray-300 border border-transparent'}`}>
                                    Deadline Priority
                                </button>
                                <button 
                                    onClick={() => this.handleStrategyChange('workload')}
                                    className={`px-3 py-1.5 rounded text-[12px] font-medium transition-all ${activeStrategy === 'workload' ? 'bg-[#2a2a2a] text-gray-100 shadow-sm border border-[#333]' : 'text-gray-500 hover:text-gray-300 border border-transparent'}`}>
                                    Workload Score
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Kanban Board */}
                    <KanbanBoard 
                        tasks={tasks} 
                        onMoveTask={(id, status) => this.taskService.updateTaskStatus(id, status)} 
                        onEditTask={(t) => this.setState({ editingTask: t })} 
                    />
                </main>

                {/* Modals */}
                {(isCreateOpen || editingTask) && (
                    <CreateTaskModal 
                        initialTask={editingTask}
                        onClose={() => this.setState({ isCreateOpen: false, editingTask: null })} 
                        onSave={(t) => {
                            if (editingTask) this.taskService.updateTask(t);
                            else this.taskService.addTask(t);
                        }} 
                    />
                )}
            </div>
        );
    }
}

// Wrapper to inject React Router hooks into Class Components
const Dashboard = () => {
    const navigate = useNavigate();
    return <DashboardComponent navigate={navigate} />;
};

export default Dashboard;
