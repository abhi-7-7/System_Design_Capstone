import React, { Component } from "react";
import { useNavigate } from "react-router-dom";
import UserMenu from "../components/UserMenu";
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
    searchQuery: string;
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
        activeStrategy: 'deadline',
        searchQuery: ''
    };

    componentDidMount() {
        this.taskService.getEventManager().addObserver(this);
        // Initial Fetch from Backend
        this.taskService.fetchTasks().catch(err => {
            console.error("Dashboard failed to load initial data:", err);
        });
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

                if (!this.state.notifications.find(n => n.message === `Warning: Task "${task.title}" is nearing its deadline!`)) {
                    this.setState(prevState => ({
                        notifications: [...prevState.notifications, { id: Date.now() + Math.random(), message: `Warning: Task "${task.title}" is nearing its deadline!`, highlight: timeStr }]
                    }));
                }
                break;
            }
        }
    }

    handleLogout = () => {
        localStorage.removeItem("accessToken");
        this.props.navigate("/");
    };

    handleProfile = () => {
        this.props.navigate("/profile");
    }

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

    handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ searchQuery: e.target.value });
    };

    render() {
        const { tasks, analytics, notifications, isCreateOpen, editingTask, activeStrategy, searchQuery } = this.state;
        
        const filteredTasks = tasks.filter(task => 
            task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.description.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return (
            <div className="min-h-screen bg-[#000000] text-gray-300 font-sans selection:bg-indigo-500/30 text-left">
                {/* Top Navigation */}
                <nav className="sticky top-0 z-40 bg-[#070707]/95 backdrop-blur-xl border-b border-[#1a1a1a] px-8 py-4 flex justify-between items-center shadow-2xl">
                    <div className="flex items-center gap-4 group cursor-pointer" onClick={() => this.props.navigate("/dashboard")}>
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-white font-black text-base shadow-[0_0_20px_rgba(79,70,229,0.3)] group-hover:scale-110 transition-transform duration-300">
                            SF
                        </div>
                        <div>
                            <h1 className="text-base font-bold text-white tracking-tighter leading-none mb-0.5">SmartFlow</h1>
                            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.1em] opacity-80">Workspace</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                         <button 
                            onClick={() => this.setState({ isCreateOpen: true })} 
                            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-xl font-bold text-[13px] transition-all duration-300 shadow-[0_4px_15px_rgba(79,70,229,0.3)] hover:shadow-indigo-500/40 flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                            Explore Tasks
                        </button>
                        
                        <div className="w-px h-6 bg-[#222]"></div>
                        
                        <UserMenu />
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

                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 mt-2 text-left">
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

                        {/* Search Bar */}
                        <div className="flex-1 max-w-sm">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-500 group-focus-within:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input 
                                    type="text"
                                    placeholder="Search tasks..."
                                    value={searchQuery}
                                    onChange={this.handleSearchChange}
                                    className="w-full bg-[#111] border border-[#222] rounded-lg pl-10 pr-4 py-2 text-[13px] text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Kanban Board */}
                    <KanbanBoard 
                        tasks={filteredTasks} 
                        onMoveTask={(id, status) => this.taskService.updateTaskStatus(id, status)} 
                        onEditTask={(t) => this.setState({ editingTask: t })} 
                        onViewTask={(id) => this.props.navigate(`/task/${id}`)}
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
