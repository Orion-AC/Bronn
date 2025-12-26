/**
 * Workflows Page
 * 
 * Global workflow index - displays all workflows across all workspaces.
 * Fetches from Cloud SQL via /api/workflows.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Zap,
    FolderOpen,
    Loader2,
    AlertCircle,
    RefreshCw,
    Clock,
    CheckCircle2,
    Archive
} from 'lucide-react';
import { PageLayout } from '../components/PageLayout';
import './Workflows.css';

interface Workflow {
    id: string;
    workspace_id: string;
    name: string;
    description: string | null;
    status: string;
    created_by: string;
    created_at: string | null;
    updated_at: string | null;
    workspace?: {
        id: string;
        name: string;
    };
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

export const Workflows: React.FC = () => {
    const navigate = useNavigate();
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchWorkflows = async () => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Not authenticated');
            }

            const response = await fetch(`${BACKEND_URL}/api/workflows`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch workflows');
            }

            const data = await response.json();
            setWorkflows(data);
        } catch (err: any) {
            console.error('Error fetching workflows:', err);
            setError(err.message || 'Failed to load workflows');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkflows();
    }, []);

    const formatTimeAgo = (dateStr: string | null) => {
        if (!dateStr) return 'Never';
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;

        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;

        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active':
                return <CheckCircle2 size={14} className="status-icon success" />;
            case 'archived':
                return <Archive size={14} className="status-icon archived" />;
            case 'draft':
            default:
                return <Clock size={14} className="status-icon draft" />;
        }
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'active': return 'status-badge active';
            case 'archived': return 'status-badge archived';
            default: return 'status-badge draft';
        }
    };

    if (loading) {
        return (
            <PageLayout title="Workflows" subtitle="All workflows across your workspaces">
                <div className="loading-state">
                    <Loader2 size={32} className="spin" />
                    <span>Loading workflows...</span>
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout
            title="Workflows"
            subtitle="All workflows across your workspaces"
        >
            <div className="workflow-actions" style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <button
                    className="create-workflow-btn"
                    onClick={() => navigate('/workspaces')}
                    title="Select a workspace to create a workflow"
                >
                    <Plus size={18} />
                    New Workflow
                </button>
                <button
                    className="create-workflow-btn activepieces-btn"
                    onClick={() => navigate('/workflows/editor')}
                    style={{
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        border: 'none',
                    }}
                >
                    <Zap size={18} />
                    Activepieces Editor
                </button>
            </div>

            {error ? (
                <div className="error-state">
                    <AlertCircle size={32} />
                    <span>{error}</span>
                    <button onClick={fetchWorkflows} className="retry-btn">
                        <RefreshCw size={16} /> Retry
                    </button>
                </div>
            ) : workflows.length === 0 ? (
                <div className="empty-state" style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <Zap size={64} style={{ opacity: 0.3, marginBottom: 16 }} />
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>No workflows yet</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
                        Create your first workflow inside a workspace.
                    </p>
                    <button
                        className="create-workflow-btn"
                        onClick={() => navigate('/workspaces')}
                    >
                        <FolderOpen size={18} />
                        Go to Workspaces
                    </button>
                </div>
            ) : (
                <div className="workflows-list">
                    {workflows.map((wf) => (
                        <div
                            key={wf.id}
                            className="workflow-item"
                            onClick={() => navigate(`/workspace/${wf.workspace_id}`)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="workflow-left">
                                <div className="workflow-icon">
                                    <Zap size={20} />
                                </div>
                                <div className="workflow-details">
                                    <span className="workflow-name">{wf.name}</span>
                                    <span className="workflow-desc">
                                        {wf.workspace?.name && (
                                            <span className="workspace-badge">
                                                <FolderOpen size={12} />
                                                {wf.workspace.name}
                                            </span>
                                        )}
                                        {wf.description || 'No description'}
                                    </span>
                                </div>
                            </div>
                            <div className="workflow-meta">
                                <div className="meta-item">
                                    <span className="meta-label">Updated</span>
                                    <span className="meta-value">{formatTimeAgo(wf.updated_at)}</span>
                                </div>
                                <div className={getStatusBadgeClass(wf.status)}>
                                    {getStatusIcon(wf.status)}
                                    {wf.status.charAt(0).toUpperCase() + wf.status.slice(1)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </PageLayout>
    );
};
