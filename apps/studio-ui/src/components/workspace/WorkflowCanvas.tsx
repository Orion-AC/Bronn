import React, { useEffect, useState } from 'react';
import { Zap, Play, Clock, CheckCircle2, XCircle, Plus } from 'lucide-react';
import './WorkflowCanvas.css';

interface Flow {
    id: string;
    version: {
        displayName: string;
    };
    status: 'ENABLED' | 'DISABLED';
    updated: string;
}

interface FlowsResponse {
    data: Flow[];
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';
// Activepieces Project ID - should be set per-user or per-workspace in production
const ACTIVEPIECES_PROJECT_ID = import.meta.env.VITE_ACTIVEPIECES_PROJECT_ID || '';

export const WorkflowCanvas: React.FC = () => {
    const [flows, setFlows] = useState<Flow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFlows = async () => {
            try {
                if (!ACTIVEPIECES_PROJECT_ID) {
                    throw new Error('VITE_ACTIVEPIECES_PROJECT_ID not configured');
                }
                const response = await fetch(`${BACKEND_URL}/api/flows-proxy/flows?project_id=${ACTIVEPIECES_PROJECT_ID}`);
                if (!response.ok) throw new Error('Failed to fetch flows');
                const data: FlowsResponse = await response.json();
                setFlows(data.data || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch flows');
            } finally {
                setLoading(false);
            }
        };
        fetchFlows();
    }, []);

    const handleTrigger = async (flowId: string) => {
        try {
            await fetch(`${BACKEND_URL}/api/flows-proxy/flows/${flowId}/run`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });
            alert('Flow triggered successfully!');
        } catch (err) {
            alert('Failed to trigger flow.');
        }
    };

    if (loading) {
        return (
            <div className="workflow-canvas-loading">
                <Zap size={32} className="spin" />
                <span>Loading workflows...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="workflow-canvas-error">
                <XCircle size={32} />
                <span>Error: {error}</span>
                <p>Ensure the backend and Activepieces are running.</p>
            </div>
        );
    }

    return (
        <div className="workflow-canvas">
            <div className="canvas-header">
                <h2>Workflows</h2>
                <button className="btn-new-flow">
                    <Plus size={16} /> New Flow
                </button>
            </div>

            {flows.length === 0 ? (
                <div className="empty-state">
                    <Zap size={48} />
                    <h3>No workflows yet</h3>
                    <p>Create your first workflow to get started.</p>
                </div>
            ) : (
                <div className="flows-list">
                    {flows.map(flow => (
                        <div key={flow.id} className="flow-card">
                            <div className="flow-icon">
                                <Zap size={20} />
                            </div>
                            <div className="flow-info">
                                <span className="flow-name">{flow.version?.displayName || 'Untitled Flow'}</span>
                                <span className="flow-meta">
                                    <Clock size={12} /> Updated {new Date(flow.updated).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flow-status">
                                {flow.status === 'ENABLED' ? (
                                    <span className="status-enabled"><CheckCircle2 size={14} /> Enabled</span>
                                ) : (
                                    <span className="status-disabled"><XCircle size={14} /> Disabled</span>
                                )}
                            </div>
                            <div className="flow-actions">
                                <button className="btn-trigger" onClick={() => handleTrigger(flow.id)}>
                                    <Play size={14} fill="currentColor" /> Run
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
