import { Component } from 'react';
import { useNavigate } from 'react-router-dom';

interface UserMenuState {
    isHovered: boolean;
    userName: string;
    userEmail: string;
}

class UserMenuComponent extends Component<{ navigate: (path: string) => void }, UserMenuState> {
    state: UserMenuState = {
        isHovered: false,
        userName: localStorage.getItem("userName") || "Smart User",
        userEmail: localStorage.getItem("userEmail") || "user@example.com"
    };

    handleLogout = () => {
        localStorage.removeItem("accessToken");
        this.props.navigate("/");
    };

    getInitials = (name: string) => {
        if (!name || name === "Smart User") return "SF"; // Fallback to SmartFlow
        if (!name) return "SF";
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    render() {
        const { isHovered, userName, userEmail } = this.state;
        const initials = this.getInitials(userName);

        return (
            <div 
                className="relative"
                onMouseEnter={() => this.setState({ isHovered: true })}
                onMouseLeave={() => this.setState({ isHovered: false })}
            >
                {/* Avatar Trigger */}
                <div 
                    onClick={() => this.props.navigate("/profile")}
                    className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xs cursor-pointer border-2 border-[#222] hover:border-indigo-500 transition-all duration-300 shadow-lg shadow-indigo-500/10"
                >
                    {initials}
                </div>

                {/* Hover Card */}
                {isHovered && (
                    <div className="absolute right-0 top-full pt-2 w-64 z-50 animate-scale-up origin-top-right">
                        <div className="bg-[#111] border border-[#222] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] p-5">
                        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-[#222]">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white font-black text-base">
                                {initials}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-[14px] font-bold text-white truncate">{userName}</p>
                                <p className="text-[11px] text-gray-500 truncate">{userEmail}</p>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <button 
                                onClick={() => this.props.navigate("/profile")}
                                className="w-full text-left px-3 py-2 rounded-lg text-[13px] font-medium text-gray-400 hover:bg-[#1a1a1a] hover:text-white transition-all flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                Full Profile
                            </button>
                            <div className="h-px bg-[#222] my-2"></div>
                            <button 
                                onClick={this.handleLogout}
                                className="w-full text-left px-3 py-2 rounded-lg text-[13px] font-medium text-red-500 hover:bg-red-500/10 transition-all flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                Sign out
                            </button>
                        </div>
                    </div>
                </div>
                )}
            </div>
        );
    }
}

const UserMenu = () => {
    const navigate = useNavigate();
    return <UserMenuComponent navigate={navigate} />;
};

export default UserMenu;
