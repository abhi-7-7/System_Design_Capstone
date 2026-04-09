import { Component } from "react";
import { useNavigate } from "react-router-dom";
import { UserApiService } from "../services/userApiService";
import UserMenu from "../components/UserMenu";

interface ProfileState {
    userName: string;
    userEmail: string;
    isEditing: boolean;
    isLoading: boolean;
    error: string | null;
}

interface ProfileProps {
    navigate: (path: string) => void;
}

class ProfileComponent extends Component<ProfileProps, ProfileState> {
    private userApiService = new UserApiService();

    state: ProfileState = {
        userName: localStorage.getItem("userName") || "Smart User",
        userEmail: localStorage.getItem("userEmail") || "user@example.com",
        isEditing: false,
        isLoading: true,
        error: null
    };

    async componentDidMount() {
        try {
            const message = await this.userApiService.getProfile();
            const fetchedName = message.includes("Hello") ? message.split("Hello ")[1] || "Smart User" : "Smart User";
            
            this.setState({ 
                userName: localStorage.getItem("userName") || fetchedName,
                userEmail: localStorage.getItem("userEmail") || "user@example.com",
                isLoading: false 
            });
        } catch (err: unknown) {
            this.setState({ 
                error: err instanceof Error ? err.message : "Failed to load profile",
                isLoading: false 
            });
        }
    }

    handleBack = () => {
        this.props.navigate("/dashboard");
    };

    handleToggleEdit = () => {
        this.setState(prev => ({ isEditing: !prev.isEditing }));
    };

    handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'userName' | 'userEmail') => {
        this.setState({ [field]: e.target.value } as any);
    };

    handleSave = () => {
        localStorage.setItem("userName", this.state.userName);
        localStorage.setItem("userEmail", this.state.userEmail);
        this.setState({ isEditing: false });
        alert("Profile updated successfully!");
    };

    render() {
        const { userName, userEmail, isEditing, error } = this.state;

        return (
            <div className="min-h-screen bg-[#000000] text-gray-300 font-sans selection:bg-indigo-500/30 flex flex-col">
                {/* Top Navigation */}
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

                <main className="flex-1 flex items-center justify-center p-6">
                    <div className="w-full max-w-lg bg-[#111] border border-[#222] rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] p-10 relative overflow-hidden animate-scale-up">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
                        
                        <div className="text-center mb-10">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-3xl shadow-xl shadow-indigo-500/20 mx-auto mb-6 border-4 border-[#1a1a1a]">
                                {userName.charAt(0).toUpperCase()}
                            </div>
                            <h2 className="text-3xl font-bold text-gray-100 tracking-tight mb-2">{userName}</h2>
                            <p className="text-indigo-400 font-medium tracking-wide text-sm">SmartFlow Gold Member</p>
                        </div>

                        {error && (
                            <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg flex items-center gap-2.5">
                                <p className="text-[13px] font-medium">{error}</p>
                            </div>
                        )}

                        <div className="space-y-6">
                            <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-5 flex items-center gap-4 transition-all hover:border-indigo-500/50">
                                <div className="w-10 h-10 rounded-lg bg-[#222] flex items-center justify-center text-indigo-400">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                </div>
                                <div className="flex-1">
                                    <p className="text-[11px] text-gray-500 uppercase font-bold tracking-wider mb-0.5">Full Name</p>
                                    {isEditing ? (
                                        <input 
                                            value={userName} 
                                            onChange={(e) => this.handleInputChange(e, 'userName')}
                                            className="w-full bg-[#222] border border-[#333] rounded px-2 py-1 text-gray-100 text-sm focus:outline-none focus:border-indigo-500"
                                        />
                                    ) : (
                                        <p className="text-gray-200 font-medium">{userName}</p>
                                    )}
                                </div>
                            </div>

                            <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-5 flex items-center gap-4 transition-all hover:border-indigo-500/50">
                                <div className="w-10 h-10 rounded-lg bg-[#222] flex items-center justify-center text-indigo-400">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                </div>
                                <div className="flex-1">
                                    <p className="text-[11px] text-gray-500 uppercase font-bold tracking-wider mb-0.5">Email Address</p>
                                    {isEditing ? (
                                        <input 
                                            value={userEmail} 
                                            onChange={(e) => this.handleInputChange(e, 'userEmail')}
                                            className="w-full bg-[#222] border border-[#333] rounded px-2 py-1 text-gray-100 text-sm focus:outline-none focus:border-indigo-500"
                                        />
                                    ) : (
                                        <p className="text-gray-200 font-medium">{userEmail}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 pt-8 border-t border-[#222] flex justify-between items-center">
                            <div>
                                <p className="text-[13px] text-gray-400">Account status</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                    <span className="text-[13px] text-gray-200 font-medium">Active</span>
                                </div>
                            </div>
                            
                            <div className="flex gap-3">
                                {isEditing ? (
                                    <>
                                        <button onClick={this.handleToggleEdit} className="px-4 py-2 text-gray-400 hover:text-white text-sm font-medium transition-colors">
                                            Cancel
                                        </button>
                                        <button onClick={this.handleSave} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all">
                                            Save Changes
                                        </button>
                                    </>
                                ) : (
                                    <button onClick={this.handleToggleEdit} className="px-5 py-2 bg-[#222] hover:bg-[#2a2a2a] text-gray-200 rounded-lg text-sm font-medium border border-[#333] transition-all">
                                        Edit Profile
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }
}

const Profile = () => {
    const navigate = useNavigate();
    return <ProfileComponent navigate={navigate} />;
};

export default Profile;
