/**
 * WorkspaceList Page
 * 
 * Displays all workspaces for the authenticated user.
 * Fetches from Cloud SQL via /api/workspaces.
 */

import React, { useState, useEffect } from 'react';
import {
    Search,
    ChevronDown,
    LayoutGrid,
    List,
    Plus,
    MoreHorizontal,
    FolderOpen,
    Loader2,
    AlertCircle,
    RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/PageLayout';
import './Apps.css';

interface Workspace {
    id: string;
    name: string;
    description: string | null;
    visibility: string;
    owner_id: string;
    created_at: string | null;
    updated_at: string | null;
    workflow_count: number;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

export const WorkspaceList: React.FC = () => {
    const navigate = useNavigate();
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [creating, setCreating] = useState(false);

    const fetchWorkspaces = async () => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Not authenticated');
            }

            const response = await fetch(`${BACKEND_URL}/api/workspaces`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch workspaces');
            }

            const data = await response.json();
            setWorkspaces(data);
        } catch (err) {
            console.error('Error fetching workspaces:', err);
            setError(err instanceof Error ? err.message : 'Failed to load workspaces');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkspaces();
    }, []);

    const handleCreateWorkspace = async () => {
        setCreating(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`${BACKEND_URL}/api/workspaces`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: 'New Workspace',
                    description: '',
                    visibility: 'private'
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create workspace');
            }

            const newWorkspace = await response.json();
            // Navigate to the new workspace
            navigate(`/workspace/${newWorkspace.id}`);
        } catch (err) {
            console.error('Error creating workspace:', err);
            setError(err instanceof Error ? err.message : 'Failed to create workspace');
        } finally {
            setCreating(false);
        }
    };

    const formatTimeAgo = (dateStr: string | null) => {
        if (!dateStr) return 'Never';
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `Edited ${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;

        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `Edited ${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

        const diffDays = Math.floor(diffHours / 24);
        return `Edited ${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    };

    const getAvatarColor = (name: string) => {
        const colors = ['#db2777', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    return (
        <PageLayout
            title="Workspaces"
            actions={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div className="title-dots">
                        <MoreHorizontal size={16} />
                    </div>
                </div>
            }
        >
            <div className="controls-row">
                <div className="search-wrapper">
                    <Search className="search-icon" size={16} />
                    <input
                        type="text"
                        className="apps-search"
                        placeholder="Search workspaces..."
                    />
                </div>

                <div className="filters-group">
                    <button className="filter-pill">
                        Last edited <ChevronDown size={14} />
                    </button>
                    <button className="filter-pill">
                        Any visibility <ChevronDown size={14} />
                    </button>

                    <div className="view-toggle">
                        <button className="toggle-btn active">
                            <LayoutGrid size={16} />
                        </button>
                        <button className="toggle-btn">
                            <List size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="loading-state">
                    <Loader2 size={32} className="spin" />
                    <span>Loading workspaces...</span>
                </div>
            ) : error ? (
                <div className="error-state">
                    <AlertCircle size={32} />
                    <span>{error}</span>
                    <button onClick={fetchWorkspaces} className="retry-btn">
                        <RefreshCw size={16} /> Retry
                    </button>
                </div>
            ) : (
                <div className="apps-grid">
                    {/* Create New Card */}
                    <div
                        className="app-card create-card"
                        onClick={handleCreateWorkspace}
                        style={{ cursor: creating ? 'wait' : 'pointer' }}
                    >
                        <div className="card-thumbnail">
                            {creating ? (
                                <Loader2 size={32} className="spin" color="var(--text-tertiary)" />
                            ) : (
                                <Plus size={32} color="var(--text-tertiary)" />
                            )}
                        </div>
                        <div className="card-info">
                            <div className="app-details">
                                <span className="app-name">
                                    {creating ? 'Creating...' : 'Create new workspace'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Workspace Cards from API */}
                    {workspaces.map((workspace) => (
                        <div
                            key={workspace.id}
                            className="app-card"
                            onClick={() => navigate(`/workspace/${workspace.id}`)}
                        >
                            <div className="card-thumbnail">
                                <FolderOpen size={48} style={{ opacity: 0.2 }} />
                            </div>
                            <div className="card-info">
                                <div
                                    className="app-avatar"
                                    style={{ background: getAvatarColor(workspace.name) }}
                                >
                                    {workspace.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="app-details">
                                    <span className="app-name">{workspace.name}</span>
                                    <span className="app-meta">
                                        {formatTimeAgo(workspace.updated_at)} • {workspace.workflow_count} workflow{workspace.workflow_count !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Empty state */}
                    {workspaces.length === 0 && !loading && (
                        <div className="empty-state" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px' }}>
                            <FolderOpen size={64} style={{ opacity: 0.3, marginBottom: 16 }} />
                            <h3 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>No workspaces yet</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                Create your first workspace to start building workflows.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </PageLayout>
    );
};

// Keep Apps as an alias for backward compatibility
export const Apps = WorkspaceList;
