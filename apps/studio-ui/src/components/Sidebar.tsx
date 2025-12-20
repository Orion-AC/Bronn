import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    FolderOpen,
    Bot,
    Workflow,
    LayoutTemplate,
    BookOpen,
    Compass,
    Settings,
    User,
    Hexagon,
    Rocket,
    LogOut
} from 'lucide-react';
import './Sidebar.css';

interface SidebarProps {
    user?: { email: string; first_name: string; last_name: string } | null;
    onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ user, onLogout }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <aside className="sidebar">
            <div className="brand-section">
                <div className="brand-logo">
                    <Hexagon size={20} fill="#5B5FFF" color="#5B5FFF" />
                    Bronn
                </div>
                <div className="brand-workspace">
                    {user ? `${user.first_name} ${user.last_name}` : 'Workspace'}
                </div>
            </div>

            <nav className="nav-group">
                <div
                    className={`nav-item ${isActive('/') ? 'active' : ''}`}
                    onClick={() => navigate('/')}
                >
                    <LayoutDashboard size={18} />
                    <span>Dashboard</span>
                </div>
                <div
                    className={`nav-item ${isActive('/apps') ? 'active' : ''}`}
                    onClick={() => navigate('/apps')}
                >
                    <FolderOpen size={18} />
                    <span>Apps</span>
                </div>
                <div
                    className={`nav-item ${isActive('/agents') ? 'active' : ''}`}
                    onClick={() => navigate('/agents')}
                >
                    <Bot size={18} />
                    <span>Agents</span>
                </div>
                <div
                    className={`nav-item ${isActive('/workflows') ? 'active' : ''}`}
                    onClick={() => navigate('/workflows')}
                >
                    <Workflow size={18} />
                    <span>Workflows</span>
                </div>
                <div
                    className={`nav-item ${isActive('/deployments') ? 'active' : ''}`}
                    onClick={() => navigate('/deployments')}
                >
                    <Rocket size={18} />
                    <span>Deployments</span>
                </div>
            </nav>

            <div className="divider" />

            <nav className="nav-group">
                <div
                    className={`nav-item ${isActive('/templates') ? 'active' : ''}`}
                    onClick={() => navigate('/templates')}
                >
                    <LayoutTemplate size={18} />
                    <span>Templates</span>
                </div>
                <div className="nav-item">
                    <BookOpen size={18} />
                    <span>Learn</span>
                </div>
                <div
                    className={`nav-item ${isActive('/discover') ? 'active' : ''}`}
                    onClick={() => navigate('/discover')}
                >
                    <Compass size={18} />
                    <span>Discover</span>
                </div>
            </nav>

            {/* Spacer to push footer to bottom */}
            <div style={{ flex: 1 }} />

            <div className="sidebar-footer">
                <div className="divider" />
                <div className="nav-item">
                    <Settings size={18} />
                    <span>Settings</span>
                </div>
                <div className="nav-item">
                    <User size={18} />
                    <span>{user?.email || 'Profile'}</span>
                </div>
                {onLogout && (
                    <div className="nav-item logout" onClick={onLogout}>
                        <LogOut size={18} />
                        <span>Sign Out</span>
                    </div>
                )}
            </div>
        </aside>
    );
};
