import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, GitBranch, Terminal, Globe, Zap } from 'lucide-react';
import { PageLayout } from '../components/PageLayout';
import './Workflows.css';

interface Workflow {
    id: number;
    name: string;
    description: string;
    status: string;
    duration: string;
    last_run: string;
}

export const Workflows: React.FC = () => {
    const navigate = useNavigate();
    const [workflows, setWorkflows] = React.useState<Workflow[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        fetch('/api/workflows')
            .then(res => res.json())
            .then(data => {
                setWorkflows(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch workflows", err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <PageLayout title="Workflows" subtitle="Automate your development, testing, and deployment pipelines">
                <div style={{ color: 'var(--text-secondary)', padding: 40 }}>Loading Workflows...</div>
            </PageLayout>
        );
    }

    return (
        <PageLayout
            title="Workflows"
            subtitle="Automate your development, testing, and deployment pipelines"
        >
            <div className="workflow-actions" style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <button className="create-workflow-btn">
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


            <div className="workflows-list">
                {workflows.map((wf) => (
                    <div key={wf.id} className="workflow-item">
                        <div className="workflow-left">
                            <div className="workflow-icon">
                                {wf.name.includes('CI/CD') ? <GitBranch size={20} /> : wf.name.includes('Data') ? <Terminal size={20} /> : <Globe size={20} />}
                            </div>
                            <div className="workflow-details">
                                <span className="workflow-name">{wf.name}</span>
                                <span className="workflow-desc">{wf.description}</span>
                            </div>
                        </div>
                        <div className="workflow-meta">
                            <div className="meta-item">
                                <span className="meta-label">Last Run</span>
                                <span className="meta-value">{new Date(wf.last_run).toLocaleTimeString()}</span>
                            </div>
                            <div className="meta-item">
                                <span className="meta-label">Duration</span>
                                <span className="meta-value">{wf.duration}</span>
                            </div>
                            <div
                                className={`status-badge ${wf.status}`}
                                style={wf.status === 'failed' ? {
                                    color: 'var(--status-error)',
                                    background: 'var(--status-error-bg)',
                                    borderColor: 'var(--status-error-bg)'
                                } : {}}
                            >
                                {wf.status.charAt(0).toUpperCase() + wf.status.slice(1)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </PageLayout>
    );
};
